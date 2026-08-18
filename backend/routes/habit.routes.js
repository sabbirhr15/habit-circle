const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth.middleware');


// Create a new habit (must belong to a circle)
router.post('/', verifyToken, (req, res) => {
  const { title, circleId } = req.body;

  if (!title || !circleId) {
    return res.status(400).json({ message: 'Habit title and circleId are required' });
  }

  const sql = 'INSERT INTO habits (user_id, title, circle_id) VALUES (?, ?, ?)';
  db.query(sql, [req.userId, title, circleId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.status(201).json({ message: 'Habit created', habitId: result.insertId });
  });
});


// Get all habits of the logged-in user, along with their circle name
router.get('/mine', verifyToken, (req, res) => {
  const sql = `
    SELECT h.id, h.title, h.circle_id, c.name AS circle_name
    FROM habits h
    JOIN circles c ON h.circle_id = c.id
    WHERE h.user_id = ?
  `;
  db.query(sql, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;