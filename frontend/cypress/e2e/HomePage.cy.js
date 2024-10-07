    beforeEach(() => {
        cy.visit('http://localhost:4000');
    });

    it('Debe mostrar el mensaje de bienvenida', () => {
        cy.contains('Bienvenido a Coloretto').should('exist');
    });

    it('Debe mostrar la descripción del juego', () => {
        cy.contains('¡Prepárate para disfrutar de').should('exist');
    });

    it('Debe mostrar la lista de características', () => {
        const features = [
            'Partidas dinámicas:',
            'Juego multijugador:',
            'Chat en vivo:',
            'Chat privado en cada partida:'
        ];
        features.forEach(feature => {
            cy.contains(feature).should('exist');
        });
    });

    it('Debe mostrar las instrucciones del juego', () => {
        cy.contains('No te preocupes si es tu primera vez').should('exist');
    });

    it('Debe tener el enlace a preguntas frecuentes', () => {
        cy.get('a').contains('Preguntas Frecuentes').should('have.attr', 'href', '/faqs');
    });

    it('Debe mostrar la fase de prueba', () => {
        cy.contains('Esta es una fase de prueba').should('exist');
    });
