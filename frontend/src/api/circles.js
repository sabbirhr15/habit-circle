import api from './axios';

export const getMyCircles = () => api.get('/circles/mine');
export const createCircle = (data) => api.post('/circles', data);
export const joinCircle = (circleId) => api.post(`/circles/${circleId}/join`);
export const getCircleProgress = (circleId) => api.get(`/circles/${circleId}/progress`);
export const getAllCircles = () => api.get('/circles/all');
export const renameCircle = (circleId, name) => api.put(`/circles/${circleId}`, { name });
export const deleteCircle = (circleId) => api.delete(`/circles/${circleId}`);
