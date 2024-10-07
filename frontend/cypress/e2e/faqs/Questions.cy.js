beforeEach(() => {
    
    const username = 'juanperez';

    cy.visit('http://localhost:4000/auth/login');

    cy.get('input[placeholder="Usuario"]').type(username); 
    cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
    cy.get('button[type="submit"]').click();
    cy.getCookie('token');

    cy.visit('http://localhost:4000/faqs');

    });
    
      it('Mostrar todas las preguntas frecuentes', () => {
        const questions = [
          '¿Cuántos jugadores pueden participar en una partida de Coloretto?',
          '¿Cómo se gana en Coloretto?',
          '¿Qué son las cartas de comodín?',
          '¿Cuánto tiempo dura una partida?',
          '¿Cómo termina una partida?',
          '¿Cómo funcionan los turnos en Coloretto?',
          '¿Qué sucede si un jugador toma una columna?',
          '¿Cuándo comienza una nueva ronda?',
          '¿Qué pasa si un jugador no quiere tomar una columna?',
          '¿Qué ocurre si no puedes completar tus colecciones?',
          '¿Qué pasa si dos o más jugadores tienen el mismo número de puntos al final?'
        ];
    
        questions.forEach((question) => {
          cy.get('.faq-item').contains(question).should('be.visible');
        });
      });
    
      it('Mostrar las respuestas de las preguntas frecuentes', () => {
        cy.get('.faq-item').each(($item) => {
          cy.wrap($item).find('p').should('be.visible'); // Verifica que cada respuesta sea visible
        });
      });
    
      it('Mostrar un mensaje de contacto al final', () => {
        cy.contains('Si tienes más preguntas, no dudes en contactarnos. ¡Estamos aquí para ayudarte a disfrutar al máximo!').should('be.visible');
      });