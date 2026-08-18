const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./db');
const authRoutes = require('./routes/auth.routes');
const habitRoutes = require('./routes/habit.routes');
const checkinRoutes = require('./routes/checkin.routes');
const circleRoutes = require('./routes/circle.routes');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/circles', circleRoutes);

const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});