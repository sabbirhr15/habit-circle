import api from './axios';

export const checkIn = (habitId) => api.post('/checkins', { habitId });
export const getStreak = (habitId) => api.get(`/checkins/streak/${habitId}`);
export const undoCheckIn = (habitId) => api.delete(`/checkins/${habitId}`);
