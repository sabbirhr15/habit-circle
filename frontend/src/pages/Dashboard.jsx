import { useState, useEffect } from 'react';
import { getMyHabits, createHabit } from '../api/habits';
import { getMyCircles } from '../api/circles';
import { checkIn, getStreak, undoCheckIn } from '../api/checkins';

import Navbar from '../components/Navbar';

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [streaks, setStreaks] = useState({}); // { habitId: streakNumber }
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [message, setMessage] = useState('');
  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  // Load habits and circles when the page first opens
  useEffect(() => {
    loadHabits();
    loadCircles();
  }, []);

  const loadCircles = async () => {
    try {
      const res = await getMyCircles();
      setCircles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadHabits = async () => {
    try {
      const res = await getMyHabits();
      setHabits(res.data);
      res.data.forEach((habit) => {
        loadStreak(habit.id);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async (habitId) => {
    try {
      const res = await getStreak(habitId);
      setStreaks((prev) => ({ ...prev, [habitId]: res.data.streak }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    try {
      await createHabit({ title: newHabitTitle, circleId: selectedCircleId });
      setNewHabitTitle('');
      loadHabits();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleCheckIn = async (habitId) => {
  try {
    await checkIn(habitId);
    setMessage('Checked in successfully!');
    loadStreak(habitId); // refresh streak for this habit
  } catch (err) {
    setMessage(err.response?.data?.message || 'Something went wrong');
  }
};

const handleUndoCheckIn = async (habitId) => {
  try {
    await undoCheckIn(habitId);
    setMessage('Check-in undone');
    loadStreak(habitId); // refresh streak
  } catch (err) {
    setMessage(err.response?.data?.message || 'Something went wrong');
  }
};
  return (
    <div className="container">
      <Navbar />
      <h2>Welcome, {user?.name}</h2>

      <h3>Add a new habit</h3>
      <form onSubmit={handleCreateHabit}>
        <select
          value={selectedCircleId}
          onChange={(e) => setSelectedCircleId(e.target.value)}
          required
        >
          <option value="">Select a circle</option>
          {circles.map((circle) => (
            <option key={circle.id} value={circle.id}>{circle.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="e.g. Read for 1 hour"
          value={newHabitTitle}
          onChange={(e) => setNewHabitTitle(e.target.value)}
          required
        />
        <button type="submit">Add Habit</button>
      </form>

      {message && <p>{message}</p>}

      <h3>My Habits</h3>
      {loading ? (
        <p>Loading your habits...</p>
      ) : (
        <>
          {habits.length === 0 && <p>No habits yet. Add one above!</p>}
          <ul>
            {habits.map((habit) => (
            <li key={habit.id}>
                <strong>{habit.title}</strong> ({habit.circle_name}) — Streak: {streaks[habit.id] ?? '...'} 🔥
                <button onClick={() => handleCheckIn(habit.id)}>Check In Today</button>
            <button onClick={() => handleUndoCheckIn(habit.id)}>Undo</button>
            </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Dashboard;