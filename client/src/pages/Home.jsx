import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    const trimmedRoomId = roomId.trim();
    if (!trimmedRoomId) return alert('Please enter a room ID.');

    try {
      const res = await axios.get(`http://localhost:5000/api/rooms/${trimmedRoomId}`);
      if (res.data?.roomId === trimmedRoomId) {
        navigate(`/room/${trimmedRoomId}`);
      } else {
        alert('Unexpected error. Try again.');
      }
    } catch {
      const shouldCreate = window.confirm(`Room "${trimmedRoomId}" doesn't exist. Create it?`);
      if (shouldCreate) {
        try {
          await axios.post('http://localhost:5000/api/rooms/join', { roomId: trimmedRoomId });
          navigate(`/room/${trimmedRoomId}`);
        } catch {
          alert('Error creating room.');
        }
      }
    }
  };

  const handleCreate = async () => {
    if (!roomId.trim()) return alert('Please enter a Room ID to create.');
    try {
      await axios.post('http://localhost:5000/api/rooms/join', { roomId: roomId.trim() });
      navigate(`/room/${roomId.trim()}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating room.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      background: 'linear-gradient(to right, #eef2ff, #f9fafb)',
      fontFamily: 'Inter, sans-serif',
      overflowX: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: '60px',
        maxWidth: '1300px',
        width: '100%',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* LEFT SIDE */}
        <div style={{
          flex: '1 1 480px',
          minWidth: '320px',
          maxWidth: '600px'
        }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 800,
            marginBottom: '24px',
            color: '#1f2937',
            textShadow: '1px 1px 0px #7c3aed',
            lineHeight: 1.2
          }}>
            Draw ideas,<br /> together!
          </h1>
          <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '36px' }}>
            Join or create a real-time whiteboard room. No login needed.
          </p>
          <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{
                padding: '16px 20px',
                fontSize: '17px',
                borderRadius: '12px',
                border: '1px solid #d1d5db',
                outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button type="submit" style={buttonStyle('#6366f1')}>Join Room</button>
              <button type="button" onClick={handleCreate} style={buttonStyle('#10b981')}>Create Room</button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div style={{
          flex: '1 1 500px',
          minWidth: '320px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: '#fff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.05)',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            border: '1px solid #e5e7eb',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#1f2937' }}>
              🧠 Live Collaboration Space
            </h2>
            <div style={{
              fontSize: '16px',
              color: '#4b5563',
              minHeight: '24px',
              fontStyle: 'italic'
            }}>
              <Typewriter messages={[
                "Syncing ideas in real-time...",
                "No signups. No friction.",
                "Built for brainstorming."
              ]} />
            </div>
            <ActivityCard icon="🎨" title="UI Design Started" color="#6366f1" />
            <ActivityCard icon="📎" title="Notes Synced" color="#10b981" />
            <ActivityCard icon="🚀" title="Prototype Launching..." color="#f97316" />
          </div>
        </div>
      </div>
    </div>
  );
}

const buttonStyle = (bgColor) => ({
  padding: '14px 24px',
  backgroundColor: bgColor,
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: '0.3s',
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
});

const Typewriter = ({ messages = [] }) => {
  const [text, setText] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (charIndex < messages[msgIndex].length) {
        setText((prev) => prev + messages[msgIndex][charIndex]);
        setCharIndex(charIndex + 1);
      } else {
        setTimeout(() => {
          setText('');
          setCharIndex(0);
          setMsgIndex((msgIndex + 1) % messages.length);
        }, 2000);
      }
    }, 50);
    return () => clearTimeout(timeout);
  }, [charIndex, msgIndex]);

  return <span>{text}</span>;
};

const ActivityCard = ({ icon, title, color }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    borderLeft: `4px solid ${color}`,
    fontSize: '16px',
    fontWeight: 500,
    color: '#374151'
  }}>
    <span style={{ fontSize: '20px' }}>{icon}</span>
    {title}
  </div>
);

export default Home;
