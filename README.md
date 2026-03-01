# 🧑‍🤝‍🧑 Collaborative Whiteboard

A real-time collaborative whiteboard built using the **MERN stack** with **Socket.IO** for live drawing and cursor tracking. Fully responsive with mobile touch support.

---

## 🚀 Features

- 🔒 Join or create rooms using alphanumeric codes (6–8 characters, no login required)
- ✏️ Smooth drawing with adjustable stroke width and 8 color options
- 📱 **Mobile optimized** — full touch support (`touchstart`, `touchmove`, `touchend`)
- ⚡ **Performance optimized** — throttled cursor emissions (~30fps) on both client and server
- 🔁 Real-time drawing sync across all connected users
- 👆 Live cursor tracking with assigned user colors
- 👥 Active user count displayed per room
- 🗑️ Clear canvas for all users
- 🔍 Zoom in/out and fullscreen support
- 💾 Export canvas as PNG
- 🧹 Automatic cleanup of inactive rooms (24h)

---

## 🧱 Tech Stack

| Technology   | Usage                   |
|--------------|-------------------------|
| React.js     | Frontend                |
| Node.js      | Backend                 |
| Express.js   | API layer               |
| MongoDB      | Database                |
| Socket.IO    | Real-time communication |
| HTML5 Canvas | Drawing surface         |

---

## 📁 Folder Structure

```
project-root/
├── client/                # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx   # Landing page
│   │   │   └── Room.jsx   # Whiteboard canvas
│   │   ├── App.js
│   │   └── index.css
│   └── package.json
├── server/                # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── socket/
│   │   └── socketHandler.js
│   ├── server.js
│   └── package.json
└── README.md
```

---

## 🧪 Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Parth482/Collaborative-Whiteboard.git
cd Collaborative-Whiteboard
```

### 2. Start the Server

```bash
cd server
npm install
npm start
```

### 3. Start the Client

```bash
cd client
npm install
npm start
```

The client runs on `http://localhost:3000` and connects to the server at `http://localhost:5000` by default.

---

## 🔌 Environment Variables

### Client (`client/.env`)

| Variable               | Description                      | Default                  |
|------------------------|----------------------------------|--------------------------|
| `REACT_APP_API_URL`    | Backend server URL               | `http://localhost:5000`  |

### Server (`server/.env`)

| Variable    | Description              | Example                                      |
|-------------|--------------------------|----------------------------------------------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net` |
| `PORT`      | Server port               | `5000`                                       |

---

## 🧠 API & Socket Events

### REST Endpoints

| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/api/rooms/join`    | Join or create a room    |
| GET    | `/api/rooms/:roomId` | Fetch room information   |

### Socket Events

| Event          | Direction       | Purpose                        |
|----------------|-----------------|--------------------------------|
| `joinRoom`     | Client → Server | Join a room                    |
| `drawing`      | Bidirectional   | Send/receive stroke data       |
| `cursorMove`   | Bidirectional   | Update cursor position         |
| `syncCanvas`   | Server → Client | Sync full canvas history       |
| `clearCanvas`  | Bidirectional   | Clear the entire canvas        |
| `userCount`    | Server → Client | Update active user count       |
| `removeCursor` | Server → Client | Remove disconnected user cursor|
| `yourId`       | Server → Client | Send socket ID to client       |
| `undo`         | Client → Server | Undo last stroke               |
| `redo`         | Client → Server | Redo last undone stroke        |

---

## 🚀 Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New + → Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables: `MONGO_URI`
5. Deploy — note the URL (e.g. `https://your-app.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Import Project**
2. Select your GitHub repo
3. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-app.onrender.com`
5. Deploy

---

## 📄 License

MIT
