import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import Footer from '../components/Footer';
import 'swiper/swiper-bundle.css';
import '../css/HomePage.css';
import '../css/Footer.css';

import mosquito from '../assets/gifs/mosquito.gif';
import chameleonBlue from '../assets/cards/chameleonBlue.png';
import chameleonYellow from '../assets/cards/chameleonYellow.png';
import chameleonRed from '../assets/cards/chameleonRed.png';
import chameleonOrange from '../assets/cards/chameleonOrange.png';

import dinamica from '../assets/gifs/dinamica.gif';
import multijugador from '../assets/gifs/multijugador.gif';
import chat from '../assets/gifs/chat.gif';
import mantis from '../assets/gifs/mantis.gif';

function HomePage() {
  const [visibleSection, setVisibleSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const sectionHeight = window.innerHeight;
      const currentScroll = window.scrollY;
      const currentSection = Math.floor(currentScroll / sectionHeight);

      if (currentSection !== visibleSection) {
        setVisibleSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [visibleSection]);

  const getSectionClass = (sectionIndex) => {
    return visibleSection === sectionIndex ? 'visible' : 'hidden';
  };

  return (
    <div className="home-page">
      <section id="intro" className={getSectionClass(0)}>
        <div className="text-and-slider">
          <div className="mosquito-container">
            <img src={mosquito} alt="Mosquito" className="mosquito-gif" />{' '}
          </div>
          <h2 className="glow">¡Bienvenido, jugador!</h2>
          <h3>Prepárate para una nueva aventura</h3>
          <div className="text-container">
            <h4 className="description">
              Reta a coleccionar las mejores combinaciones de colores, pero,
              cuidado con acumular más de tres, ¡o te costará puntos!
            </h4>
          </div>

          <Swiper
            spaceBetween={50}
            slidesPerView={3}
            centeredSlides={true}
            loop={true}
            grabCursor={true}
            initialSlide={3}
            className="card-slider"
          >
            <SwiperSlide key={0}>
              <img
                src={chameleonBlue}
                alt="Carta Azul"
                className="chameleon-card"
              />
            </SwiperSlide>
            <SwiperSlide key={1}>
              <img
                src={chameleonYellow}
                alt="Carta Amarilla"
                className="chameleon-card"
              />
            </SwiperSlide>
            <SwiperSlide key={2}>
              <img
                src={chameleonRed}
                alt="Carta Roja"
                className="chameleon-card"
              />
            </SwiperSlide>
            <SwiperSlide key={3}>
              <img
                src={chameleonOrange}
                alt="Carta Naranja"
                className="chameleon-card"
              />{' '}
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      <section id="features" className={getSectionClass(1)}>
        <h2 className="glow">Te encontrarás ante:</h2>
        <ul>
          <li>
            <strong>Partidas dinámicas:</strong>
            <div>
              <p>
                Las decisiones rápidas y estratégicas son clave mientras tratas
                de acumular los colores correctos.
              </p>
            </div>
            <img src={dinamica} alt="Partidas dinámicas" />
          </li>
          <li>
            <strong>Juego multijugador:</strong>
            <div>
              <p>Juega con amigos o compite con otros jugadores online.</p>
            </div>
            <img src={multijugador} alt="Juego multijugador" />
          </li>
          <li>
            <strong>Chat general y privado:</strong>
            <div>
              <p>
                Usa nuestro chat general para conversar con otros jugadores.
                Además, tendrás uno privado en la partida que estés unido.
              </p>
            </div>
            <img src={chat} alt="Chat en vivo y privado" />
          </li>
        </ul>
      </section>

      <section id="faqs" className={getSectionClass(2)}>
        <div className="mantis-container">
          <img src={mantis} alt="Mantis" className="mantis-gif" />
        </div>
        <div className="faq-title">
          <h2 className="glow">¿Dudas?</h2>
        </div>
        <div className="faq-contents">
          <p>
            Puedes visitar nuestras{' '}
            <a href="/faqs" className="faq-link">
              Preguntas Frecuentes
            </a>{' '}
            para obtener más detalles.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default HomePage;
