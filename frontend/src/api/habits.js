import api from './axios';

export const getMyHabits = () => api.get('/habits/mine');
export const createHabit = (data) => api.post('/habits', data);
