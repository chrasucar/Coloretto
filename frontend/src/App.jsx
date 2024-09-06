import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth.context';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AppWrapper from './components/Inactividad';

// ----------------------------- Usuarios ------------------------------

import RegisterPage from './pages/users/RegisterPage';
import LoginPage from './pages/users/LoginPage';
import PrivateRoute from './PrivateRoute';
import ProfilePage from './pages/users/ProfilePage';
import EmailFormPage from './pages/users/EmailFormPage';
import PasswordFormPage from './pages/users/PasswordFormPage';
import ProfilePictureFormWindow from './pages/users/ProfilePictureFormWindow';

// ----------------------------- Chat General ---------------------------

import Chat from './pages/chats/Chat';

// ----------------------------- Juego ----------------------------------

import { GameProvider } from './context/GameProvider';
import InitialGamePage from './pages/games/InitialGamePage';
import CreateGamePage from './pages/games/CreateGame';
import JoinGamePage from './pages/games/JoinGame';
import GamePage from './pages/games/GamePage';
import GameList from './pages/games/GameList';

// ----------------------------- Notificaciones -------------------------

import Notification from './components/Notification';

function App() {
  
  return (
    <AuthProvider>
    <BrowserRouter>
    <GameProvider>
    <Navbar/>
    <Routes>
      <Route path = '/' element={<HomePage/>} />
      <Route path = '/users/register' element={<RegisterPage/>} />
      <Route path = '/auth/login' element={<LoginPage/>} />


      <Route element = {<AppWrapper><PrivateRoute/></AppWrapper>}>
      <Route path = '/users/profile/:username' element={<ProfilePage/>} />
      <Route path = '/users/profile/:username/change-email' element={<EmailFormPage/>} />
      <Route path = '/users/profile/:username/change-password' element={<PasswordFormPage/>} />
      <Route path = '/:username/update-profile-picture' element={<ProfilePictureFormWindow/>} />
      <Route path = '/chat' element={<Chat/>} />
      <Route path = "/play" element={<InitialGamePage />} />
      <Route path = "/create" element={<CreateGamePage />} />
      <Route path = "/join" element={<JoinGamePage />} />
      <Route path = "/play/join" element={<GameList />} />
      <Route path = "/play/:gameName" element={<GamePage />} />
      </Route>
    </Routes>
    <Notification />
    </GameProvider>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
