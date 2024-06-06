import axios from './axios';

// Usuarios: GET

export const profileUser = (username) => axios.get(`/users/profile/${username}`);

export const getContacts = (username) => axios.get(`/users/profile/${username}/contacts`);

export const getConnectionTime = (username) => axios.get(`/auth/${username}/connection-time`);

// Usuarios: POST

export const registerRequest = user => axios.post(`/users/register`, user);

export const loginRequest = user => axios.post(`/auth/login`, user);

export const verifyToken = () => axios.post('/auth/verify-token');

export const removeToken = () => axios.post('/auth/logout');

// Usuarios: PUT

export const updateProfilePicture = (username) => axios.put(`/users/${username}/update-profile-picture`);

export const updateEmail = (username, password, newEmail) => 
    axios.put(`/users/profile/${username}/change-email`, { password, newEmail });

export const updatePassword = (username, currentPassword, newPassword, verifyPassword) => 
    axios.put(`/users/profile/${username}/change-password`, { currentPassword, newPassword, verifyPassword });

// Usuarios: DELETE

export const removeAccount = (username) => axios.delete(`/users/${username}`);

// Juego: GET

export const GameState = (gameId) => axios.get(`/users/game/state/${gameId}`);