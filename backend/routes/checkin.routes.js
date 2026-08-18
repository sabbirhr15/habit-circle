const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth.middleware');

// Helper: get date in YYYY-MM-DD format, using local time (not UTC)
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check in for a habit (mark today as done)
router.post('/', verifyToken, (req, res) => {
  const { habitId } = req.body;

  if (!habitId) {
    return res.status(400).json({ message: 'habitId is required' });
  }

  const today = formatDate(new Date());

  const sql = 'INSERT INTO checkins (habit_id, checkin_date) VALUES (?, ?)';
  db.query(sql, [habitId, today], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Already checked in today' });
      }
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.status(201).json({ message: 'Checked in successfully', checkinId: result.insertId });
  });
});

// Get streak for a specific habit
router.get('/streak/:habitId', verifyToken, (req, res) => {
  const { habitId } = req.params;

  const sql = 'SELECT checkin_date FROM checkins WHERE habit_id = ? ORDER BY checkin_date DESC';
  db.query(sql, [habitId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    if (results.length === 0) {
      return res.json({ streak: 0 });
    }

    let streak = 0;
    let expectedDate = new Date(); // starts at today, local time

    for (let row of results) {
      const expectedDateString = formatDate(expectedDate);

      if (row.checkin_date === expectedDateString) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1); // move to previous day
      } else {
        break; // streak broken
      }
    }

    res.json({ streak });
  });
});


// Undo today's check-in for a habit
router.delete('/:habitId', verifyToken, (req, res) => {
  const { habitId } = req.params;
  const today = formatDate(new Date());

  const sql = 'DELETE FROM checkins WHERE habit_id = ? AND checkin_date = ?';
  db.query(sql, [habitId, today], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No check-in found for today' });
    }

    res.json({ message: 'Check-in undone successfully' });
  });
});

module.exports = router;