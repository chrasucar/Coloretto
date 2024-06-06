import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth.context';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';

// ----------------------------- Usuarios ------------------------------

import RegisterPage from './pages/users/RegisterPage';
import LoginPage from './pages/users/LoginPage';
import PrivateRoute from './PrivateRoute';
import ProfilePage from './pages/users/ProfilePage';
import UsersPage from './pages/users/UsersPage';
import EmailFormPage from './pages/users/EmailFormPage';
import PasswordFormPage from './pages/users/PasswordFormPage';
import ProfilePictureFormWindow from './pages/users/ProfilePictureFormWindow';

// ------------------------------ Juego --------------------------------

import GamePage from './pages/games/GamePage.jsx'; 
import GameSetup from './pages/games/GameSetup.jsx';


function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path = '/' element={<HomePage/>} />
      <Route path = '/users/register' element={<RegisterPage/>} />
      <Route path = '/auth/login' element={<LoginPage/>} />

      <Route element = {<PrivateRoute/>}>
      <Route path = '/users/profile/:username' element={<ProfilePage/>} />
      <Route path = '/users' element={<UsersPage/>} />
      <Route path = '/users/profile/:username/change-email' element={<EmailFormPage/>} />
      <Route path = '/users/profile/:username/change-password' element={<PasswordFormPage/>} />
      <Route path = '/:username/update-profile-picture' element={<ProfilePictureFormWindow/>} />
      
      <Route path = '/users/game' element={<GamePage/>} />
      <Route path = '/setup-game' element={<GameSetup/>} />
      </Route>
    </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
