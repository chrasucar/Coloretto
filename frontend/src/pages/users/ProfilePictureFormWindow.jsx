import React, { useState } from 'react';
import axios from '../../api/axios';
import '../../css/ProfilePictureFormWindow.css';

function ProfilePictureFormWindow({
  onClose,
  username,
  onProfilePictureUpdate,
}) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setImageUrl('');
  };

  const handleUrlChange = (event) => {
    setImageUrl(event.target.value);
    setFile(null);
  };

  const handleSubmit = async () => {
    try {
      let formData = new FormData();

      if (file) {
        formData.append('file', file);
      } else if (imageUrl && !file) {
        formData.append('imageUrl', imageUrl);
      } else {
        throw new Error(
          'Debe proporcionar una imagen o una URL de imagen válida.',
        );
      }

      const response = await axios.put(
        `/users/${username}/update-profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      onProfilePictureUpdate(response.data.filePath);
      onClose();
    } catch (error) {
      console.error('Error al actualizar la foto de perfil:', error);
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
          />
        </div>
        <div>
          <label htmlFor="fileInput">
            Si lo prefieres, súbelo desde tu PC:
          </label>
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button onClick={handleSubmit}>Actualizar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}

export default ProfilePictureFormWindow;
