import React from 'react';
import '../css/HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Bienvenido a Coloretto</h1>
      <p>
        ¡Prepárate para disfrutar de <strong>Coloretto</strong>, un juego de cartas estratégico y emocionante para <strong>2 a 5 jugadores</strong>! 
        Este juego reta a coleccionar las mejores combinaciones de colores, pero ¡cuidado con acumular más de tres, o te costará puntos!
      </p>

      <h2>Te espera los siguientes aspectos:</h2>
      <ul>
        <li><strong>Partidas dinámicas:</strong> Las decisiones rápidas y estratégicas te mantendrán enganchado mientras tratas de acumular los colores correctos.</li>
        <li><strong>Juego multijugador:</strong> Juega con amigos o compite con otros jugadores online. La opción de jugar con usuarios automáticos la tienes disponible, ¡Hasta 5 jugadores por partida!</li>
        <li><strong>Chat en vivo:</strong> Usa nuestro chat general para conversar con otros jugadores mientras navegas por el juego, discute estrategias, o simplemente diviértete.</li>
        <li><strong>Chat privado en cada partida:</strong> Además del chat general, cada partida cuenta con su propio chat privado para que puedas comunicarte directamente con los jugadores en tu mesa. ¡Perfecto para negociar y planear tu estrategia!</li>
      </ul>

      <h2>¿Cómo jugar?</h2>
      <p>
        No te preocupes si es tu primera vez, <strong>Coloretto</strong> es fácil de aprender pero difícil de dominar. En cada turno, debes decidir si revelar una nueva carta o tomar una columna de cartas en juego. ¡Solo contarás puntos positivos por tres colores, pero cualquier otro te restará!
      </p>
      <p>
        ¿Tienes dudas? Puedes visitar nuestras <a href="/faqs">Preguntas Frecuentes</a> para obtener más detalles sobre las reglas del juego, el sistema de puntuación y estrategias para ganar.
      </p>

      <h2>¿Listo para jugar?</h2>
      <p>
        ¡Únete a una partida o crea la tuya propia! Disfruta de la competitividad en tiempo real con tus amigos o con otros jugadores de la comunidad. ¡No olvides usar el chat para interactuar y mejorar la experiencia!
      </p>

      <p>
        <em>Nota:</em> Esta es una fase de prueba, y la versión actual del juego está en desarrollo. Si encuentras algún problema o tienes sugerencias, no dudes en comunicárnoslo. ¡Estamos mejorando continuamente la experiencia para ti!
      </p>
    </div>
  );
}

export default HomePage;
