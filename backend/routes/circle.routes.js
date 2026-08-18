const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/auth.middleware');

// Create a new circle (creator automatically becomes a member)
router.post('/', verifyToken, (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Circle name is required' });
  }

  const sql = 'INSERT INTO circles (name, created_by) VALUES (?, ?)';
  db.query(sql, [name, req.userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    const circleId = result.insertId;

    // automatically add creator as a member
    const memberSql = 'INSERT INTO circle_members (circle_id, user_id) VALUES (?, ?)';
    db.query(memberSql, [circleId, req.userId], (err2) => {
      if (err2) {
        return res.status(500).json({ message: 'Server error', error: err2.message });
      }
      res.status(201).json({ message: 'Circle created', circleId });
    });
  });
});

// Get all circles the logged-in user is a member of
router.get('/mine', verifyToken, (req, res) => {
  const sql = `
    SELECT c.id, c.name, c.created_by, c.created_at
    FROM circles c
    JOIN circle_members cm ON c.id = cm.circle_id
    WHERE cm.user_id = ?
  `;
  db.query(sql, [req.userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json(results);
  });
});

// Join an existing circle
router.post('/:circleId/join', verifyToken, (req, res) => {
  const { circleId } = req.params;

  const sql = 'INSERT INTO circle_members (circle_id, user_id) VALUES (?, ?)';
  db.query(sql, [circleId, req.userId], (err) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'You are already a member of this circle' });
      }
      if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(404).json({ message: 'Circle not found' });
      }
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.status(201).json({ message: 'Joined circle successfully' });
  });
});

// Get all circles (so users can browse and join)
router.get('/all', verifyToken, (req, res) => {
  const sql = `
    SELECT c.id, c.name, u.name AS created_by_name,
      (SELECT COUNT(*) FROM circle_members WHERE circle_id = c.id) AS member_count
    FROM circles c
    JOIN users u ON c.created_by = u.id
    ORDER BY c.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json(results);
  });
});

// Get group progress for a circle (all members + their habits + today's checkin status)
router.get('/:circleId/progress', verifyToken, (req, res) => {
  const { circleId } = req.params;

  const sql = `
    SELECT 
      u.id AS user_id,
      u.name AS user_name,
      h.id AS habit_id,
      h.title AS habit_title,
      c.checkin_date
    FROM circle_members cm
    JOIN users u ON cm.user_id = u.id
    LEFT JOIN habits h ON h.user_id = u.id AND h.circle_id = cm.circle_id
    LEFT JOIN checkins c ON c.habit_id = h.id AND c.checkin_date = CURDATE()
    WHERE cm.circle_id = ?
    ORDER BY u.name
  `;

  db.query(sql, [circleId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    res.json(results);
  });
});



// Rename a circle (only the creator can do this)
router.put('/:circleId', verifyToken, (req, res) => {
  const { circleId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Circle name is required' });
  }

  // First check if this user is the creator
  const checkSql = 'SELECT created_by FROM circles WHERE id = ?';
  db.query(checkSql, [circleId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Circle not found' });
    }
    if (results[0].created_by !== req.userId) {
      return res.status(403).json({ message: 'Only the creator can rename this circle' });
    }

    // Authorized, proceed with rename
    const updateSql = 'UPDATE circles SET name = ? WHERE id = ?';
    db.query(updateSql, [name, circleId], (err2) => {
      if (err2) {
        return res.status(500).json({ message: 'Server error', error: err2.message });
      }
      res.json({ message: 'Circle renamed successfully' });
    });
  });
});

// Delete a circle (only the creator can do this)
router.delete('/:circleId', verifyToken, (req, res) => {
  const { circleId } = req.params;

  const checkSql = 'SELECT created_by FROM circles WHERE id = ?';
  db.query(checkSql, [circleId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Server error', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Circle not found' });
    }
    if (results[0].created_by !== req.userId) {
      return res.status(403).json({ message: 'Only the creator can delete this circle' });
    }

    const deleteSql = 'DELETE FROM circles WHERE id = ?';
    db.query(deleteSql, [circleId], (err2) => {
      if (err2) {
        return res.status(500).json({ message: 'Server error', error: err2.message });
      }
      res.json({ message: 'Circle deleted successfully' });
    });
  });
});

module.exports = router;