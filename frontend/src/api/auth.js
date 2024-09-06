import axios from './axios';

// Usuarios: GET

export const getAllUsernames = () => axios.get('/users/usernames');

export const profileUser = (username) => axios.get(`/users/profile/${username}`);

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

// Chat General - Mensajes: GET

export const getAllMessages = () => axios.get('/messages');

// Juegos: GET

export const getAvailableGames = (page = 1) => axios.get(`/games?page=${page}`);

export const getGameByName = (gameName) => axios.get(`/games/${gameName}`);

export const getGameByUser = (owner) => axios.get(`/games/owner/${owner}`);

// Juegos: POST

export const createGame = async (gameName, maxPlayers, isAiControlled, ownerUsername, aiPlayersCount) => {
    return axios.post('/games/create', {
      gameName,
      maxPlayers,
      isAiControlled,
      owner: ownerUsername,
      aiPlayersCount,
    });
  };

export const joinGame = (gameName, username) => axios.post('/games/join', { gameName, username });

export const leaveGame = (gameName, username) => axios.post(`/games/leave`, { gameName, username });