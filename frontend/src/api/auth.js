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

export const updateProfilePicture = (username, formData) => axios.put(`/users/profile/${username}/update-profile-picture`, formData );

export const updateEmail = (username, password, newEmail) => 
    axios.put(`/users/profile/${username}/change-email`, { password, newEmail });

export const updatePassword = (username, currentPassword, newPassword, verifyPassword) => 
    axios.put(`/users/profile/${username}/change-password`, { currentPassword, newPassword, verifyPassword });

// Usuarios: DELETE

export const removeAccount = (username) => axios.delete(`/users/${username}`);

// Chat General y Privado - Mensajes: GET

export const getAllMessages = () => axios.get('/messages/general');

export const getAllMessagesGame = (gameName) => axios.get(`/messages/game?gameName=${gameName}`);

// Juegos: GET

export const getAvailableGames = (page = 1) => axios.get(`/games?page=${page}`);

export const getPreparationTimeRemaining = (gameName) => axios.get(`/games/${gameName}/preparation-time`);

export const getGameByName = (gameName) => axios.get(`/games/${gameName}`);

export const getGameByUser = (owner) => axios.get(`/games/owner/${owner}`);

// Juegos: POST

export const createGame = async (gameName, maxPlayers, isAiControlled, ownerUsername, difficultyLevel) => {
    return axios.post('/games/create', {
      gameName,
      maxPlayers,
      isAiControlled,
      owner: ownerUsername,
      difficultyLevel
    });
  };

export const selectDifficultyAndPrepareGame = (gameName, level) => axios.post(`/games/${gameName}/select-difficulty`, { level });

export const joinGame = (gameName, username) => axios.post('/games/join', { gameName, username });

export const prepareGame = (gameName) => axios.post(`/games/${gameName}/prepare`);

export const revealedCard = (gameName, playerName, columnIndex) => {
  return axios.post(`/games/${gameName}/reveal-card`, { playerName, columnIndex });
};

export const nextTurns = (gameName) => { 
  return axios.post(`/games/${gameName}/next-turn`);
}

export const takedColumn = (gameName, playerName, columnIndex) => {
  return axios.post(`/games/${gameName}/take-column`, { playerName, columnIndex });
};

export const finalizeScores = (gameName) => {
  return axios.post(`/games/${gameName}/finalize-scores`);
};


// Juegos: DELETE

export const leaveGame = (gameName, username) => {
  return axios.delete(`/games/leave/${gameName}/${username}`);
};