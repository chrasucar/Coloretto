import React, { useState } from 'react';
import '../../css/ProfilePictureFormWindow.css';
import { useAuth } from '../../context/auth.context';
import { useNavigate, useParams } from 'react-router-dom';

function ProfilePictureFormWindow() {

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);
  const { handleUpdateProfilePicture } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  // Cambiar foto de perfil por archivo local.

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setImageUrl('');
    } else {
      setError('Por favor, selecciona un archivo de imagen válido.');
      setFile(null);
    }
  };

  // Cambiar foto de perfil por URL (no se ha desplegado aún, servirá cuando se despliegue).

  const handleUrlChange = (event) => {
    setImageUrl(event.target.value);
    setFile(null);
    setError(null);
  };

  const handleClose = () => {
    navigate(`/users/profile/${username}`);
  };

  const handleSubmit = async () => {

    try {

        if (!file && !imageUrl) {

            throw new Error('Debe proporcionar una imagen o una URL de imagen válida.');

        }

        await handleUpdateProfilePicture(username, file, imageUrl);

        navigate(`/users/profile/${username}`);

    } catch (error) {

        setError('Error al actualizar la foto de perfil.');
        
    }
};

return (
  <div className="modal">
      <div className="modal-content">
          <h2>Actualizar Foto de Perfil</h2>
          {error && <p>{error}</p>}
          <div>
              <label htmlFor="urlInput">Introduce la URL de la imagen:</label>
              <input
                  type="text"
                  id="urlInput"
                  value={imageUrl}
                  onChange={handleUrlChange}
                  disabled={file !== null}
              />
          </div>
          <div>
              <label htmlFor="fileInput">Si lo prefieres, súbelo desde tu PC:</label>
              <input
                  type="file"
                  id="fileInput"
                  accept="image/*"
                  onChange={handleFileChange}
              />
          </div>
          <button onClick={handleSubmit}>Actualizar</button>
          <button onClick={handleClose}>Cancelar</button>
      </div>
  </div>
);
}

export default ProfilePictureFormWindow;
