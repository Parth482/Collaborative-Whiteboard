# 🧑‍🤝‍🧑 Collaborative Whiteboard App

A real-time collaborative whiteboard built using the **MERN stack** with **Socket.io** support for live drawing and cursor tracking.

---

## 🚀 Features

- 🔒 Join or create rooms using simple alphanumeric codes (no login required)
- ✏️ Smooth pencil tool with:
  - Adjustable stroke width
  - Color selection: Black, Red, Blue, Green
- 🔁 Real-time drawing synchronization across all users
- 👆 Real-time cursor tracking for connected users
- 👥 Displays number of active users in each room
- 🗑️ Clear canvas for all users
- 💾 Canvas data is stored persistently in MongoDB

---

## 🧱 Tech Stack

| Technology     | Usage                       |
|----------------|-----------------------------|
| React.js       | Frontend                    |
| Node.js        | Backend                     |
| Express.js     | API layer                   |
| MongoDB        | Database                    |
| Socket.io      | Real-time communication     |
| HTML5 Canvas   | Drawing surface             |

---

## 📁 Folder Structure

project-root/
├── client/ # React frontend
│ ├── src/
│ ├── public/
│ └── package.json
├── server/ # Node.js backend
│ ├── models/
│ ├── routes/
│ ├── socket/
│ └── server.js
├── README.md
└── package.json


---

## 🧪 How to Run Locally OR Deployed to Live Hosting

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Collaborative-Whiteboard.git
cd Collaborative-Whiteboard

2. Start the Server

cd ../server
npm install
npm start

3. Start the Client

cd ../client
npm install
npm start

🧠 API & Socket Events
REST Endpoints
Method	   Endpoint	        Description
POST	/api/rooms/join	Join or create a room
GET	/api/rooms/:roomId	Fetch room information

Socket Events
Event	Purpose
join-room	Join a room
leave-room	Leave a room
cursor-move	Update cursor position
draw-start	Start drawing a stroke
draw-move	Continue drawing a stroke
draw-end	Finish drawing a stroke
clear-canvas	Clear the entire canvas

🧱 Database Schema
Room Schema
{
  roomId: String,
  createdAt: Date,
  lastActivity: Date,
  drawingData: Array
}
Drawing Command Schema
{
  type: String, // 'stroke' or 'clear'
  data: Object, // path data, color, width, etc.
  timestamp: Date
}

🚀 Deployment Guide

📦 Backend Deployment (Node.js + Socket.IO)
We’ll use Render to host the Node.js server.

1. Create a new Web Service on Render
Go to https://render.com

Click "New + > Web Service"

Connect your GitHub and select the server folder repo

Fill the settings:

Name: whiteboard-backend

Runtime: Node

Build Command: npm install

Start Command: node index.js (or your entry file like server.js)

Set the environment variable:

PORT=10000 or leave it blank if dynamic

Deploy

⚠️ Make sure to allow WebSocket connections. Render supports them by default.

2. Get the backend URL
After deployment, note the https://your-backend-url.onrender.com — you’ll need this in the frontend.


🌐 Frontend Deployment (React App)
You can deploy using Vercel or Netlify:

Option A: Vercel
Go to https://vercel.com

Import your GitHub repo

Select the client folder as the project root

Set build settings:

Build Command: npm run build

Output Directory: build

Set Environment Variable:

REACT_APP_BACKEND_URL=https://your-backend-url.onrender.com

Deploy

Option B: Netlify
Go to https://netlify.com

Drag & drop the client/build folder

Or connect GitHub and configure:

Build Command: npm run build

Publish directory: build

Add REACT_APP_BACKEND_URL as an environment variable

Deploy

