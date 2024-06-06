import { createContext, useState, useContext, useEffect } from 'react';
import {
  registerRequest,
  loginRequest,
  verifyToken,
  removeToken,
  profileUser,
  removeAccount,
  updateProfilePicture,
  updateEmail,
  updatePassword,
  getContacts,
  getConnectionTime,
  GameState,
} from '../api/auth';
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('Error interno del servidor.');
  }

  return context;
};

export const AuthProvider = ({ children, navigate }) => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [connectionTime, setConnectionTime] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(true);
  const { username: paramUsername } = useParams();

  // ----------------------------Juego-----------------------------

  const [gameState] = useState(null);

  // Registro.

  const signUp = async (user) => {
    try {
      const res = await registerRequest(user);
      setUser(res.data);
      setAuthenticated(false);
      setError([]);
      return true;
    } catch (error) {
      const errorMsg =
        error.response && error.response.data
          ? error.response.data
          : ['Error al registrarse.'];

      setError(
        Array.isArray(errorMsg) ? errorMsg : [errorMsg.message || errorMsg],
      );
      return false;
    }
  };

  // Iniciar sesión.

  const signIn = async (user) => {
    try {
      const res = await loginRequest(user);
      Cookies.set('token', res.data.token, { expires: 7 });
      setUser(res.data);
      setAuthenticated(true);
      setError([]);
      return true;
    } catch (error) {
      const errorMsg =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Error al iniciar sesión.';
      setError([errorMsg]);
      return false;
    }
  };

  // Perfil del usuario.

  const fetchUserProfile = async (user) => {
    try {
      if (user) {
        const res = await profileUser(user);
        const profileData = res.data;
        if (profileData) {
          setUser((prevUser) => ({ ...prevUser, profile: res.data }));
        } else {
          console.error('No se ha encontrado al usuario.');
        }
      } else {
        console.error('Error al obtener el perfil de usuario.');
      }
    } catch (error) {
      console.error('Error al obtener el perfil de usuario.', error);
    }
  };

  // Obtener usuario.

  const getUser = async (username) => {
    try {
      const res = await profileUser(username);

      return res.data;
    } catch (error) {
      console.log('Fallo obteniendo el usuario:', error);
    }
  };

  // Obtener contactos del usuario.

  const fetchContacts = async (username) => {
    try {
      const response = await getContacts(username);
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  useEffect(() => {
    if (user && user.profile) {
      fetchContacts(user.profile.username);
    }
  }, [user]);

  // Obtener tiempo de conexión del usuario.

  const fetchConnectionTime = async (username) => {
    try {
      const time = await getConnectionTime(username);
      setConnectionTime(time.data.connectionTime);
    } catch (error) {
      console.error(
        'Error al obtener el tiempo de conexión del usuario:',
        error,
      );
    }
  };

  useEffect(() => {
    if (user && user.username) {
      fetchUserProfile(user.username).then(() => {
        fetchConnectionTime(user.username);
      });
    }
  }, [user]);

  // Actualizar foto de perfil del usuario.

  const handleUpdateProfilePicture = async (username, file, imageUrl) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageUrl', imageUrl);

    try {
      const res = await updateProfilePicture(username, formData);
      const filePath = res.data.filePath;
      setUser((prevUser) => ({
        ...prevUser,
        profile: {
          ...prevUser.profile,
          profilePicture: filePath,
        },
      }));
    } catch (error) {
      console.error('Error actualizando la foto de perfil:', error);
    }
  };

  // Actualizar correo electrónico.

  const handleUpdateEmail = async (username, password, newEmail) => {
    try {
      const userResponse = await profileUser(username);
      const user = userResponse.data;

      if (user && user.password === password) {
        if (user.email !== newEmail) {
          const res = await updateEmail(username, password, newEmail);
          const updatedUser = res.data;

          setUser((prevUser) => ({
            ...prevUser,
            profile: {
              ...prevUser.profile,
              email: updatedUser.email,
            },
          }));
          await fetchUserProfile(username);
        } else {
          throw new Error(
            'El nuevo correo electrónico es igual al correo electrónico actual.',
          );
        }
      } else {
        throw new Error('La contraseña actual introducida no es correcta.');
      }
    } catch (error) {
      console.error('Error actualizando email:', error);
      throw error;
    }
  };

  // Actualizar contraseña.

  const handleUpdatePassword = async (
    username,
    currentPassword,
    newPassword,
    verifyPassword,
  ) => {
    try {
      const userResponse = await profileUser(username);
      const user = userResponse.data;

      if (user && user.password === currentPassword) {
        if (newPassword !== currentPassword) {
          if (newPassword === verifyPassword) {
            const res = await updatePassword(
              username,
              currentPassword,
              newPassword,
              verifyPassword,
            );
            const updatedUser = res.data;

            setUser((prevUser) => ({
              ...prevUser,
              profile: {
                ...prevUser.profile,
                password: updatedUser.password,
              },
            }));
            await fetchUserProfile(username);
          } else {
            throw new Error(
              'La nueva contraseña introducida no es igual a la verificación de la nueva contraseña.',
            );
          }
        } else {
          throw new Error('La nueva contraseña es igual que la actual.');
        }
      } else {
        throw new Error('La contraseña actual introducida no es correcta.');
      }
    } catch (error) {
      console.error('Error actualizando la contraseña:', error);
      throw error;
    }
  };

  // Eliminar cuenta.

  const deleteUserAccount = async (username) => {
    try {
      await removeAccount(username);
      setUser(null);
      setAuthenticated(false);
    } catch (error) {
      setError(error);
    }
  };

  // Cerrar sesión.

  const logout = async () => {
    try {
      const res = await removeToken();
      Cookies.remove(res);
      setTimeout(() => {
        setAuthenticated(false);
        setUser(null);
      }, 300);
    } catch (error) {
      console.error('Error durante el cierre de sesión:', error);
    }
  };

  // ------------------------ JUEGO -----------------------

  // Obtener estado del juego.

  const fetchGameState = async (userId) => {
    try {
      const res = await GameState(userId);
      return res.data;
    } catch (error) {
      console.error('Error obteniendo el estado del juego:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGameState(user._id);
    }
  }, [user]);

  useEffect(() => {
    if (error.length > 0) {
      const timer = setTimeout(() => {
        setError([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Comprobar inicio de sesión.

  useEffect(() => {
    async function checkLogin() {
      const token = Cookies.get();

      if (!token) {
        setAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await verifyToken(token);

        if (res.data) {
          setAuthenticated(true);
          setUser(res.data);
          if (res.data.username) {
            await fetchUserProfile(res.data.username);
          }
        } else {
          setAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        setAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  // Cargar perfil.

  useEffect(() => {
    async function loadProfile() {
      if (paramUsername) {
        await fetchUserProfile(paramUsername);
        if (user && user.profile && user.profile.username) {
          await fetchContacts(user.profile.username);
        } else {
          console.error(
            'Error al obtener el usuario o el perfil de usuario.',
            user,
          );
        }
      }
    }

    loadProfile();
  }, [paramUsername, fetchUserProfile]);

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        fetchUserProfile,
        logout,
        updateProfilePicture,
        handleUpdateProfilePicture,
        getUser,
        handleUpdateEmail,
        handleUpdatePassword,
        deleteUserAccount,
        fetchContacts,
        fetchConnectionTime,
        fetchGameState,
        user,
        contacts,
        connectionTime,
        loading,
        authenticated,
        gameState,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
