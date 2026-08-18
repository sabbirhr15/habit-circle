import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getStreak } from '../api/checkins';
import { getMyCircles, createCircle, joinCircle, getCircleProgress, getAllCircles, renameCircle, deleteCircle } from '../api/circles';


function Circles() {
  const [circles, setCircles] = useState([]);
  const [newCircleName, setNewCircleName] = useState('');
  const [joinCircleId, setJoinCircleId] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCircleId, setSelectedCircleId] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allCircles, setAllCircles] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user'));



  useEffect(() => {
  loadCircles();
  loadAllCircles();
}, []);

  const loadCircles = async () => {
    try {
      const res = await getMyCircles();
      setCircles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


const loadAllCircles = async () => {
  try {
    const res = await getAllCircles();
    setAllCircles(res.data);
  } catch (err) {
    console.error(err);
  }
};


const handleJoinCircleById = async (circleId) => {
  try {
    await joinCircle(circleId);
    setMessage('Joined circle successfully!');
    loadCircles();
  } catch (err) {
    setMessage(err.response?.data?.message || 'Something went wrong');
  }
};


  const handleCreateCircle = async (e) => {
    e.preventDefault();
    try {
      await createCircle({ name: newCircleName });
      setNewCircleName('');
      loadCircles();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleJoinCircle = async (e) => {
    e.preventDefault();
    try {
      await joinCircle(joinCircleId);
      setJoinCircleId('');
      setMessage('Joined circle successfully!');
      loadCircles();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleRenameCircle = async (circleId, currentName) => {
  const newName = prompt('Enter new circle name:', currentName);
  if (!newName || newName.trim() === '') return;

  try {
    await renameCircle(circleId, newName);
    setMessage('Circle renamed successfully!');
    loadCircles();
  } catch (err) {
    setMessage(err.response?.data?.message || 'Something went wrong');
  }
};

const handleDeleteCircle = async (circleId) => {
  const confirmed = window.confirm('Are you sure you want to delete this circle? This cannot be undone.');
  if (!confirmed) return;

  try {
    await deleteCircle(circleId);
    setMessage('Circle deleted successfully!');
    loadCircles();
    if (selectedCircleId === circleId) {
      setSelectedCircleId(null); // hide progress/leaderboard if the deleted circle was selected
    }
  } catch (err) {
    setMessage(err.response?.data?.message || 'Something went wrong');
  }
};


  const viewProgress = async (circleId) => {
    try {
      const res = await getCircleProgress(circleId);
      setProgress(res.data);
      setSelectedCircleId(circleId);

      // Build leaderboard: fetch streak for each member's habit
      const withStreaks = await Promise.all(
        res.data
          .filter((row) => row.habit_id) // only rows that have a habit
          .map(async (row) => {
            const streakRes = await getStreak(row.habit_id);
            return {
              userName: row.user_name,
              habitTitle: row.habit_title,
              streak: streakRes.data.streak
            };
          })
      );

      // Sort by streak, highest first
      withStreaks.sort((a, b) => b.streak - a.streak);
      setLeaderboard(withStreaks);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <Navbar />
      <h2>Circles</h2>

      <h3>Create a new circle</h3>
      <form onSubmit={handleCreateCircle}>
        <input
          type="text"
          placeholder="Circle name"
          value={newCircleName}
          onChange={(e) => setNewCircleName(e.target.value)}
          required
        />
        <button type="submit">Create</button>
      </form>

      <h3>Browse & Join Circles</h3>
      <ul>
        {allCircles.map((circle) => (
          <li key={circle.id}>
            {circle.name} — by {circle.created_by_name} ({circle.member_count} members)
            <button onClick={() => handleJoinCircleById(circle.id)}>Join</button>
          </li>
        ))}
      </ul>

      {message && <p>{message}</p>}

      <h3>My Circles</h3>
      {loading ? (
        <p>Loading your circles...</p>
      ) : (
        <ul>
          {circles.map((circle) => (
           <li key={circle.id}>
            {circle.name} (ID: {circle.id})
            <button onClick={() => viewProgress(circle.id)}>View Progress</button>
            {circle.created_by === currentUser.id && (
                <>
                <button onClick={() => handleRenameCircle(circle.id, circle.name)}>Rename</button>
                <button onClick={() => handleDeleteCircle(circle.id)}>Delete</button>
                </>
            )}
           </li>
          ))}
        </ul>
      )}

      {selectedCircleId && (
        <div>
          <h3>Progress for Circle #{selectedCircleId}</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Member</th>
                <th>Habit</th>
                <th>Checked in today?</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((row, index) => (
                <tr key={index}>
                  <td>{row.user_name}</td>
                  <td>{row.habit_title || 'No habit yet'}</td>
                  <td>{row.checkin_date ? '✅ Yes' : '❌ No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



      {selectedCircleId && leaderboard.length > 0 && (
        <div>
          <h3>🏆 Leaderboard</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Member</th>
                <th>Habit</th>
                <th>Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index}>
                  <td>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </td>
                  <td>{entry.userName}</td>
                  <td>{entry.habitTitle}</td>
                  <td>{entry.streak} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Circles;
