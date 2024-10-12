import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  registerRequest,
  loginRequest,
  verifyToken,
  removeToken,
  getAllUsernames,
  profileUser,
  removeAccount,
  updateProfilePicture,
  updateEmail,
  updatePassword,
  getConnectionTime,
  getAllMessages,
  getAllMessagesGame,
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

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [connectionTime, setConnectionTime] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const { username: paramUsername } = useParams();
  const { gameName } = useParams();

  // Registro.

  const signUp = async (user) => {
    try {
      const res = await registerRequest(user);
      setUser(res.data);
      setAuthenticated(false);
      setError([]);
      return true;
    } catch (error) {
      throw error;
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
      throw error;
    }
  };

  // Obtener todos los nombres de usuario.
  
  const fetchAllUsernames = async () => {
    try {
      const response = await getAllUsernames();
      setUsers(response.data);
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    fetchAllUsernames();
  }, []);

  // Perfil del usuario.

  const fetchUserProfile = async (user) => {
    try {
      if (user) {
        const res = await profileUser(user);
        const profileData = res.data;
        if (profileData) {
          setUser((prevUser) => ({ ...prevUser, profile: res.data }));
        }
      }
    } catch (error) {
      return null;
    }
  };

  // Obtener tiempo de conexión del usuario.

  const fetchConnectionTime = async (username) => {
    try {
      const time = await getConnectionTime(username);
      setConnectionTime(time.data.connectionTime);
    } catch (error) {
      return null;
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

  const handleUpdateProfilePicture = async (username, file) => {

     const formData = new FormData();

     if (file) {

         formData.append('file', file);

     }

     formData.append('username', username);
 
     try {

         const res = await updateProfilePicture(username, formData);
         
         if (res && res.data) {

             const filePath = res.data.file || '';

             setUser(prevUser => ({
                 ...prevUser,
                 profile: {
                     ...prevUser.profile,
                     profilePicture: filePath,
                 },
             }));

         } else {

             console.error('No se recibió una respuesta válida del servidor.');

         }

     } catch (error) {

        setError('Ocurrió un error al actualizar la foto de perfil.');
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
      throw error;
    }
  };

  // Actualizar contraseña.

  const handleUpdatePassword = async (username, currentPassword, newPassword, verifyPassword) => {

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
              'La nueva contraseña introducida no es igual a la verificación de la nueva contraseña.');
            }
        } else {
          throw new Error('La nueva contraseña es igual que la actual.');
        }
      } else {
        throw new Error('La contraseña actual introducida no es correcta.');
      }
    } catch (error) {
      throw error;
    }
  };

  // Eliminar cuenta.

  const deleteUserAccount = async (username) => {
    try {
      const res = await removeAccount(username);
      setUser(null);
      setAuthenticated(false);
      alert(res.data.message);
      return res;
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
    if (paramUsername) {
      fetchUserProfile(paramUsername);
    }
  }, [paramUsername]);

  // -------------------------------------------Chat General y Privado: Mensajes---------------------------

  // Obtener todos los mensajes.

  const fetchAllMessages = async () => {
    try {
      const response = await getAllMessages();
      setMessages(response.data);
    } catch (error) {
      return null;
    }
  };

  // Obtener todos los mensajes de la partida.

  const fetchAllMessagesGame = async (gameName) => {
    try {
      const response = await getAllMessagesGame(gameName);
      setMessages(response.data);
    } catch (error) {
      return null;
    }
    };

  useEffect(() => {

    if(gameName) {

      fetchAllMessagesGame(gameName);

    }

    else {

      fetchAllMessages();

    }
  }, [gameName]);

  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        fetchUserProfile,
        logout,
        updateProfilePicture,
        handleUpdateProfilePicture,
        handleUpdateEmail,
        handleUpdatePassword,
        deleteUserAccount,
        fetchConnectionTime,
        fetchAllMessages,
        fetchAllMessagesGame,
        user,
        users,
        connectionTime,
        messages,
        loading,
        authenticated,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
