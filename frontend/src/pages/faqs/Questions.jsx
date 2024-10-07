import React, { useState } from 'react';
import '../../css/Footer.css';
import '../../css/faqs/Questions.css';
import Footer from '../../components/Footer';

import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

function FAQPage() {

  const faqItems = [
    { question: '¿Cuántos jugadores pueden participar en una partida?', answer: 'El juego está diseñado para 2 a 5 jugadores.' },
    { question: '¿Cómo se gana una partida?', answer: 'El objetivo es acumular cartas de colores, pero solo puedes contar puntos positivos por hasta tres colores. Los colores adicionales te restarán puntos. ¡Gana quien tenga más puntos al final de la partida!' },
    { question: '¿Qué son las cartas de comodín?', answer: 'Las cartas de comodín pueden usarse como cualquier color y te permiten completar colecciones estratégicas. Son extremadamente útiles para maximizar tus puntos y evitar penalizaciones.' },
    { question: '¿Cuánto tiempo dura una partida?', answer: 'Una partida de Coloretto suele durar entre 30 y 45 minutos, dependiendo del número de jugadores y su familiaridad con el juego.' },
    { question: '¿Cómo termina una partida?', answer: 'La partida termina cuando se revela la carta de final y todos los jugadores toman columna. En ese momento, los jugadores suman los puntos de sus tres mejores colecciones y restan los de cualquier otro color adicional que hayan acumulado.' },
    { question: '¿Cómo funcionan los turnos?', answer: 'En cada turno, los jugadores pueden elegir entre dos acciones: revelar una carta y colocarla en una columna o tomar una columna de cartas y agregarla a su colección. Si un jugador toma una columna, no jugará más en esa ronda.' },
    { question: '¿Qué sucede si un jugador toma una columna?', answer: 'Si un jugador toma una columna, deja de participar en esa ronda. Los demás jugadores continuarán hasta que todos hayan tomado una columna. Luego, comienza una nueva ronda.' },
    { question: '¿Cuándo comienza una nueva ronda?', answer: 'Una nueva ronda comienza cuando todos los jugadores han tomado una columna. Las columnas se vacían y los jugadores continúan el juego hasta que se revela la carta de final.' },
    { question: '¿Qué pasa si un jugador no quiere tomar una columna?', answer: 'Los jugadores no están obligados a tomar una columna en su turno, siempre que queden cartas por revelar. Sin embargo, si todas las columnas están llenas, eventualmente tendrán que tomar una para continuar.' },
    { question: '¿Qué ocurre si no puedes completar tus colecciones?', answer: 'No te preocupes si no completas todas las colecciones, pero ten cuidado de no acumular demasiados colores, ya que los colores adicionales restan puntos al final de la partida.' },
    { question: '¿Qué pasa si dos o más jugadores tienen el mismo número de puntos al final?', answer: 'En caso de empate, los jugadores comparten la victoria. ¡Ambos se consideran ganadores!' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {

    setCurrentIndex((prevIndex) => (prevIndex + 1) % faqItems.length);

  };

  const handlePrev = () => {

    setCurrentIndex((prevIndex) => (prevIndex - 1 + faqItems.length) % faqItems.length);

  };

  return (
    <div className="faq-page">
    <h2>Consulta tus dudas.</h2>
    <div className="faq-content">
      <div className="faq-item">
        <h2 className="item glow">{faqItems[currentIndex].question}</h2>
        <p className="item2">{faqItems[currentIndex].answer}</p>
      </div>
      <div className="faq-navigation">
        <FaArrowLeft className="arrow left-arrow" onClick={handlePrev} />
        <FaArrowRight className="arrow right-arrow" onClick={handleNext} />
      </div>
    </div>
    <Footer />
  </div>
);
};

export default FAQPage;
