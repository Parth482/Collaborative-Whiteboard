// Room.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Pencil, Paintbrush, Trash2, ZoomIn, ZoomOut, Maximize2, Save } from 'lucide-react';
import { FaMousePointer } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const COLORS = ['black', 'red', 'blue', 'green', 'orange', 'purple', 'teal', 'brown'];
const CURSOR_THROTTLE_MS = 30;
const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;

const Room = () => {
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const strokeRef = useRef([]);
  const lastCursorEmit = useRef(0);
  const [color, setColor] = useState('black');
  const [lineWidth, setLineWidth] = useState(2);
  const [userCount, setUserCount] = useState(1);
  const [cursors, setCursors] = useState({});
  const [userColors, setUserColors] = useState({});
  const [myId, setMyId] = useState(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStrokeSlider, setShowStrokeSlider] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isMobile, setIsMobile] = useState(IS_MOBILE);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = 'round';

    ctx.putImageData(imageData, 0, 0);

    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeCanvas]);

  const drawStroke = useCallback((strokeData, save = true) => {
    const ctx = ctxRef.current;
    if (!ctx || strokeData.points.length < 2) return;
    ctx.strokeStyle = strokeData.color;
    ctx.lineWidth = strokeData.lineWidth;
    ctx.beginPath();
    ctx.moveTo(strokeData.points[0].x, strokeData.points[0].y);
    for (let i = 1; i < strokeData.points.length; i++) {
      ctx.lineTo(strokeData.points[i].x, strokeData.points[i].y);
    }
    ctx.stroke();
    ctx.closePath();
    if (save) socket.emit('drawing', { roomId, data: strokeData });
  }, [roomId]);

  const clearCanvas = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, []);

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('yourId', (id) => setMyId(id));

    socket.on('drawing', (data) => drawStroke(data, false));

    socket.on('syncCanvas', (history) => {
      clearCanvas();
      history.forEach(s => drawStroke(s, false));
    });

    socket.on('cursorMove', ({ userId, position, color: cursorColor }) => {
      setUserColors(prev => ({ ...prev, [userId]: cursorColor }));
      setCursors(prev => ({ ...prev, [userId]: { x: position.x, y: position.y } }));
    });

    socket.on('removeCursor', (userId) => {
      setCursors(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
      setUserColors(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    socket.on('userCount', (count) => setUserCount(count));

    return () => { socket.off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, drawStroke, clearCanvas]);

  const getPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return { x: (e.touches[0].clientX - rect.left) / scale, y: (e.touches[0].clientY - rect.top) / scale };
    }
    return { x: (e.clientX - rect.left) / scale, y: (e.clientY - rect.top) / scale };
  };

  const emitCursorThrottled = (point) => {
    const now = Date.now();
    if (now - lastCursorEmit.current >= CURSOR_THROTTLE_MS) {
      lastCursorEmit.current = now;
      socket.emit('cursorMove', { roomId, position: point });
    }
  };

  const handlePointerDown = (e) => {
    if (e.touches) e.preventDefault();
    drawing.current = true;
    const point = getPoint(e);
    strokeRef.current = [point];
  };

  const handlePointerMove = (e) => {
    if (e.touches) e.preventDefault();
    const point = getPoint(e);
    emitCursorThrottled(point);

    if (!drawing.current) return;
    strokeRef.current.push(point);
    if (strokeRef.current.length > 1) {
      const partialStroke = {
        points: [strokeRef.current[strokeRef.current.length - 2], point],
        color,
        lineWidth
      };
      drawStroke(partialStroke, true);
    }
  };

  const handlePointerUp = (e) => {
    if (e && e.touches) e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    strokeRef.current = [];
  };

  const handleClear = () => {
    clearCanvas();
    socket.emit('clearCanvas', roomId);
  };

  const toggleFullscreen = () => {
    const canvas = canvasRef.current;
    if (!isFullscreen) canvas.requestFullscreen();
    else document.exitFullscreen();
    setIsFullscreen(!isFullscreen);
  };

  const exportAsImage = () => {
    const dataURL = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}.png`;
    link.href = dataURL;
    link.click();
  };

  const toolbarStyle = isMobile
    ? {
      position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'row', gap: 6,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
      padding: '8px 12px', borderRadius: 16,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      zIndex: 100
    }
    : {
      position: 'fixed', top: '50%', left: 10, transform: 'translateY(-50%)',
      display: 'flex', flexDirection: 'column', gap: 10,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
      padding: 10, borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      zIndex: 100
    };

  const toolBtnStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    padding: isMobile ? 10 : 6,
    minWidth: isMobile ? 44 : 'auto',
    minHeight: isMobile ? 44 : 'auto',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  };

  const colorPaletteStyle = isMobile
    ? {
      position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
      display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
      padding: 10, borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      zIndex: 101
    }
    : {
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4
    };

  const strokeSliderStyle = isMobile
    ? {
      position: 'fixed', bottom: 72, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
      padding: '10px 16px', borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      zIndex: 101
    }
    : {};

  return (
    <div style={{ overflow: 'hidden', width: '100vw', height: '100vh', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
        style={{
          cursor: 'crosshair',
          transform: `scale(${scale})`,
          transformOrigin: '0 0',
          touchAction: 'none',
          display: 'block'
        }}
      />

      <div style={toolbarStyle}>
        <button style={toolBtnStyle} onClick={() => { setShowStrokeSlider(!showStrokeSlider); setShowColorPalette(false); }}><Pencil size={isMobile ? 22 : 24} /></button>
        <button style={toolBtnStyle} onClick={() => { setShowColorPalette(!showColorPalette); setShowStrokeSlider(false); }}><Paintbrush size={isMobile ? 22 : 24} /></button>
        <button style={toolBtnStyle} onClick={handleClear}><Trash2 size={isMobile ? 22 : 24} /></button>
        <button style={toolBtnStyle} onClick={() => setScale(prev => Math.min(prev + 0.1, 3))}><ZoomIn size={isMobile ? 22 : 24} /></button>
        <button style={toolBtnStyle} onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}><ZoomOut size={isMobile ? 22 : 24} /></button>
        {!isMobile && <button style={toolBtnStyle} onClick={toggleFullscreen}><Maximize2 size={24} /></button>}
        <button style={toolBtnStyle} onClick={exportAsImage}><Save size={isMobile ? 22 : 24} /></button>
      </div>

      {showStrokeSlider && (
        <div style={strokeSliderStyle}>
          <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} style={{ width: isMobile ? 200 : 'auto' }} />
        </div>
      )}

      {showColorPalette && (
        <div style={colorPaletteStyle}>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setShowColorPalette(false); }}
              style={{
                backgroundColor: c,
                width: isMobile ? 36 : 20,
                height: isMobile ? 36 : 20,
                borderRadius: '50%',
                border: color === c ? '3px solid #333' : '2px solid #ddd',
                cursor: 'pointer',
                minWidth: isMobile ? 44 : 'auto',
                minHeight: isMobile ? 44 : 'auto',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            />
          ))}
        </div>
      )}

      <div style={{
        position: 'fixed', top: 10, right: 10,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        padding: '6px 14px', borderRadius: 20,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        fontSize: 14, fontWeight: 600, zIndex: 100
      }}>
        👥 {userCount}
      </div>

      {Object.entries(cursors).map(([id, cursor]) => id !== myId && (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: cursor.x * scale + 5,
            top: cursor.y * scale + 5,
            color: userColors[id] || 'black',
            fontSize: 20,
            pointerEvents: 'none',
            zIndex: 50
          }}
        >
          <FaMousePointer />
        </div>
      ))}
    </div>
  );
};

export default Room;
