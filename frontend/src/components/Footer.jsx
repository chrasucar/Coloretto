import React from 'react';
import '../css/Footer.css';
import chameleon2 from '../assets/gifs/chameleon2.gif';

function Footer() {
  return (
    <footer className="footer">
      <img src={chameleon2} alt="Camaleón 2" className="chameleon2-gif" />{' '}
      <div className="footer-content">
        <p>
          &copy; Trabajo Fin de Grado: Coloretto. 
        </p>
        <p>Autor: Christian Asuero Carrellán</p>
        <p>Tutor: Pablo Trinidad Martín-Arroyo</p>
        <p>Año académico: 2023 - 2024</p>
        <p>
          Escuela Técnica Superior de Ingenieria Informática - Universidad de Sevilla.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
