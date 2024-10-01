import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth.context';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';

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

// ----------------------------- Preguntas frecuentes --------------------

import Questions from './pages/faqs/Questions';

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


      <Route element = {<PrivateRoute/>}>
      <Route path = '/users/profile/:username' element={<ProfilePage/>} />
      <Route path = '/users/profile/:username/change-email' element={<EmailFormPage/>} />
      <Route path = '/users/profile/:username/change-password' element={<PasswordFormPage/>} />
      <Route path = '/users/profile/:username/update-profile-picture' element={<ProfilePictureFormWindow/>} />
      <Route path = '/chat' element={<Chat/>} />
      <Route path = "/play" element={<InitialGamePage />} />
      <Route path = "/faqs" element={<Questions />} />
      <Route path = "/create" element={<CreateGamePage />} />
      <Route path = "/join" element={<JoinGamePage />} />
      <Route path = "/play/join" element={<GameList />} />
      <Route path = "/play/:gameName" element={<GamePage />} />
      </Route>
    </Routes>
    </GameProvider>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
