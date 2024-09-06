import { createContext, useState, useContext, useEffect } from 'react';
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
  const [users, setUsers] = useState([]);
  const [connectionTime, setConnectionTime] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const { username: paramUsername } = useParams();

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

  // Obtener todos los nombres de usuario.
  
  const fetchAllUsernames = async () => {
    try {
      const response = await getAllUsernames();
      setUsers(response.data);
    } catch (error) {
      console.error('Error al obtener los nombres de usuario:', error);
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

  // -------------------------------------------Chat General: Mensajes---------------------------

  // Obtener todos los mensajes.
  const fetchAllMessages = async () => {
    try {
      const response = await getAllMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Error al obtener los mensajes:', error);
    }
  };

  useEffect(() => {
    fetchAllUsernames();
    fetchAllMessages(); 
  }, []);


  return (
    <AuthContext.Provider
      value={{
        signUp,
        signIn,
        fetchAllUsernames,
        fetchUserProfile,
        logout,
        updateProfilePicture,
        handleUpdateProfilePicture,
        handleUpdateEmail,
        handleUpdatePassword,
        deleteUserAccount,
        fetchConnectionTime,
        fetchAllMessages,
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
