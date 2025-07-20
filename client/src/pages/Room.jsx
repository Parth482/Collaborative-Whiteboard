// Room.jsx
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Pencil, Paintbrush, Trash2, ZoomIn, ZoomOut, Maximize2, Save } from 'lucide-react';
import { FaMousePointer } from 'react-icons/fa';

const socket = io('http://localhost:5000');

const COLORS = ['black', 'red', 'blue', 'green', 'orange', 'purple', 'teal', 'brown'];

const Room = () => {
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawing = useRef(false);
  const stroke = useRef([]);
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
  

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    socket.emit('joinRoom', roomId);

    socket.on('yourId', (id) => {
      setMyId(id);
    });

    socket.on('drawing', (data) => drawStroke(data, false));

    socket.on('syncCanvas', (history) => {
      clearCanvas();
      history.forEach(stroke => drawStroke(stroke, false));
    });

    socket.on('cursorMove', ({ userId, position, color }) => {
      
      setUserColors(prev => ({
        ...prev,
        [userId]: color
      }));

      setCursors(prev => ({
        ...prev,
        [userId]: {
          x: position.x,
          y: position.y
        }
      }));
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

    return () => {
      socket.off();
    };
  }, [roomId]);

  const drawStroke = (stroke, save = true) => {
    const ctx = ctxRef.current;
    if (!ctx || stroke.points.length < 2) return;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.closePath();
    if (save) socket.emit('drawing', { roomId, data: stroke });
  };

  const handleMouseDown = (e) => {
    drawing.current = true;
    const point = { x: e.clientX / scale, y: e.clientY / scale };
    stroke.current = [point];
  };

  const handleMouseMove = (e) => {
    const point = { x: e.clientX / scale, y: e.clientY / scale };
    socket.emit('cursorMove', { roomId, position: point });

    if (!drawing.current) return;
    stroke.current.push(point);
    if (stroke.current.length > 1) {
      const partialStroke = {
        points: [stroke.current[stroke.current.length - 2], point],
        color,
        lineWidth
      };
      drawStroke(partialStroke, true);
    }
  };

  const handleMouseUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    stroke.current = [];
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleClear = () => {
    clearCanvas();
    socket.emit('clearCanvas', roomId);
  };

  useEffect(() => {
    socket.on('syncCanvas', (history) => {
      clearCanvas();
      history.forEach(stroke => drawStroke(stroke, false));
    });
  }, []);

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

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: 'crosshair', transform: `scale(${scale})`, transformOrigin: '0 0' }}
      />

      {/* Left Toolbar */}
      <div style={{ position: 'fixed', top: '50%', left: 10, transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, background: '#f8f9fa', padding: 10, borderRadius: 8, boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <button style={{ background: 'none', border: 'none' }} onClick={() => setShowStrokeSlider(!showStrokeSlider)}><Pencil /></button>
        {showStrokeSlider && <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))} />}

        <button style={{ background: 'none', border: 'none' }} onClick={() => setShowColorPalette(!showColorPalette)}><Paintbrush /></button>
        {showColorPalette && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{ backgroundColor: c, width: 20, height: 20, borderRadius: '50%', border: color === c ? '2px solid black' : 'none' }}
              />
            ))}
          </div>
        )}

        <button style={{ background: 'none', border: 'none' }} onClick={handleClear}><Trash2 /></button>
        <button style={{ background: 'none', border: 'none' }} onClick={() => setScale(prev => Math.min(prev + 0.1, 3))}><ZoomIn /></button>
        <button style={{ background: 'none', border: 'none' }} onClick={() => setScale(prev => Math.max(prev - 0.1, 0.5))}><ZoomOut /></button>
        <button style={{ background: 'none', border: 'none' }} onClick={toggleFullscreen}><Maximize2 /></button>
        <button style={{ background: 'none', border: 'none' }} onClick={exportAsImage}><Save /></button>
      </div>

      {/* Top Right User Count */}
      <div style={{ position: 'fixed', top: 10, right: 10, background: '#fff', padding: '5px 10px', borderRadius: 6, boxShadow: '0 0 5px rgba(0,0,0,0.1)' }}>
        👥 {userCount}
      </div>

      {/* Remote Cursors */}
      {Object.entries(cursors).map(([id, cursor]) => id !== myId && (
        <div
          key={id}
          style={{
            position: 'absolute',
            left: cursor.x * scale + 5,
            top: cursor.y * scale + 5,
            color: userColors[id] || 'black',
            fontSize: 20,
            pointerEvents: 'none'
          }}
        >
          <FaMousePointer />
        </div>
      ))}
    </div>
  );
};

export default Room;
