import React from 'react';

function FAQPage() {
  return (
    <div className="faq-page">
      <h1>Preguntas Frecuentes</h1>
      
      <div className="faq-item">
        <h2>¿Cuántos jugadores pueden participar en una partida de Coloretto?</h2>
        <p>El juego está diseñado para <strong>2 a 5 jugadores</strong></p>
      </div>

      <div className="faq-item">
        <h2>¿Cómo se gana en Coloretto?</h2>
        <p>El objetivo es acumular cartas de colores, pero solo puedes contar puntos positivos por hasta tres colores. Los colores adicionales te restarán puntos. ¡Gana quien tenga más puntos al final de la partida!</p>
      </div>

      <div className="faq-item">
        <h2>¿Qué son las cartas de comodín?</h2>
        <p>Las cartas de comodín pueden usarse como cualquier color y te permiten completar colecciones estratégicas. Son extremadamente útiles para maximizar tus puntos y evitar penalizaciones.</p>
      </div>

      <div className="faq-item">
        <h2>¿Cuánto tiempo dura una partida?</h2>
        <p>Una partida de Coloretto suele durar entre <strong>30 y 45 minutos</strong>, dependiendo del número de jugadores y su familiaridad con el juego.</p>
      </div>

      <div className="faq-item">
        <h2>¿Cómo termina una partida?</h2>
        <p>La partida termina cuando se revela la carta de final y todos los jugadores toman columna. En ese momento, los jugadores suman los puntos de sus tres mejores colecciones y restan los de cualquier otro color adicional que hayan acumulado.</p>
      </div>

      <div className="faq-item">
        <h2>¿Cómo funcionan los turnos en Coloretto?</h2>
        <p>En cada turno, los jugadores pueden elegir entre dos acciones: <strong>revelar una carta y colocarla en una columna</strong> o <strong>tomar una columna de cartas</strong> y agregarla a su colección. Si un jugador toma una columna, no jugará más en esa ronda.</p>
      </div>

      <div className="faq-item">
        <h2>¿Qué sucede si un jugador toma una columna?</h2>
        <p>Si un jugador toma una columna, deja de participar en esa ronda. Los demás jugadores continuarán hasta que todos hayan tomado una columna. Luego, comienza una nueva ronda.</p>
      </div>

      <div className="faq-item">
        <h2>¿Cuándo comienza una nueva ronda?</h2>
        <p>Una nueva ronda comienza cuando todos los jugadores han tomado una columna. Las columnas se vacían y los jugadores continúan el juego hasta que se revela la carta de final.</p>
      </div>

      <div className="faq-item">
        <h2>¿Qué pasa si un jugador no quiere tomar una columna?</h2>
        <p>Los jugadores no están obligados a tomar una columna en su turno, siempre que queden cartas por revelar. Sin embargo, si todas las columnas están llenas, eventualmente tendrán que tomar una para continuar.</p>
      </div>

      <div className="faq-item">
        <h2>¿Qué ocurre si no puedes completar tus colecciones?</h2>
        <p>No pasa nada grave si no completas todas las colecciones, pero ten cuidado de no acumular demasiados colores, ya que los colores adicionales restan puntos al final de la partida.</p>
      </div>

      <div className="faq-item">
        <h2>¿Qué pasa si dos o más jugadores tienen el mismo número de puntos al final?</h2>
        <p>En caso de empate, los jugadores comparten la victoria. ¡Ambos se consideran ganadores!</p>
      </div>

      <p>Si tienes más preguntas, no dudes en contactarnos. ¡Estamos aquí para ayudarte a disfrutar al máximo!</p>
    </div>
  );
}

export default FAQPage;
