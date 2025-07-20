const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const roomRoutes = require('./routes/roomRoutes');
const socketHandler = require('./socket/socketHandler'); 

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB error:', err));

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/api/rooms', roomRoutes);


socketHandler(server); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
