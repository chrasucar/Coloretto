import React, { useState } from 'react';
import '../../css/users/ProfilePictureFormWindow.css';
import { useAuth } from '../../context/auth.context';
import { useNavigate, useParams } from 'react-router-dom';

function ProfilePictureFormWindow() {

  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const { handleUpdateProfilePicture } = useAuth();
  const { username } = useParams();
  const navigate = useNavigate();

  // Cambiar foto de perfil por archivo local.

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
    } else {
      setError('Por favor, selecciona un archivo de imagen válido.');
      setFile(null);
    }
  };

  const handleClose = () => {
    navigate(`/users/profile/${username}`);
  };

  const handleSubmit = async () => {

    try {

        if (!file) {

            throw new Error('Debe proporcionar una imagen válida.');

        }

        await handleUpdateProfilePicture(username, file);

        navigate(`/users/profile/${username}`);

    } catch (error) {

        setError(error.message);
        
    }
};

return (
  <div className="modal">
    <div className="modal-content">
    <h2>Actualizar Foto de Perfil</h2>
      {error && <p>{error}</p>}
      <div className="file-input-container">
        <label htmlFor="fileInput" className="custom-file-label">
          Selecciona una imagen
        </label>
        <input
          type="file"
          id="fileInput"
          accept="image/*"
          onChange={handleFileChange}
          className="custom-file-input"
        />
        <span className="file-selected">
          {file ? file.name : "Archivo no seleccionado."}
        </span>
      </div>
      <div className="button-container">
        <button className="button-update" onClick={handleSubmit}>Actualizar</button>
        <button className="button-cancel" onClick={handleClose}>Cancelar</button>
      </div>
    </div>
  </div>
);
};

export default ProfilePictureFormWindow;
