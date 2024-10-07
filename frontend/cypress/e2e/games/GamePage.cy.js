describe('Game Page', () => {

    // PENDIENTE

    beforeEach(() => {
    
        const username = 'juanperez';
    
        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000/play/join');

    });

    it('Unirse a partida en la lista y cargar sus detalles', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
        
        cy.get('ul li').find('button').contains('Unirse').click();
        
        cy.url().should('include', '/play/Juego1');
    
        cy.wait(3000);

        cy.contains('Detalles del Juego').should('be.visible');
        cy.contains('Propietario').should('be.visible');
        cy.contains('Jugadores').should('be.visible');
        cy.contains('Máximo de Jugadores').should('be.visible');

        cy.wait(3000);
        cy.contains('Cerrar sesión').click({ force: true });
        cy.clearCookies();
    
    });

        /*

    it('Revelar una carta deshabilitado sin seleccionar columna', () => {
        
        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.get('ul li').find('button').contains('Unido').click();
    
        cy.url().should('include', '/play/Juego1');
    
        cy.get('button').contains('Revelar carta').should('be.disabled');

        cy.wait(3000);
        cy.contains('Cerrar sesión').click({ force: true });
        cy.clearCookies();

    });

    it('Revelar una carta', () => {
        
        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.get('ul li').find('button').contains('Unido').click();
    
        cy.url().should('include', '/play/Juego1');

        cy.get('ul').contains('Columna 0').click();
    
        cy.get('button').contains('Revelar carta').click();

        cy.contains('Carta revelada con éxito.');

        cy.wait(5000);

        cy.get('ul li').should('exist').and('be.visible');

        cy.wait(3000);
        cy.contains('Cerrar sesión').click({ force: true });
        cy.clearCookies();

    });

    it('Cambio de turno por inactividad después de 10 segundos', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.get('ul li').find('button').contains('Unido').click();
    
        cy.url().should('include', '/play/Juego1');
    
        // Verifica que es el turno del jugador actual
        cy.contains('Índice del jugador actual: 0').should('be.visible');
    
        // Espera 10 segundos para simular inactividad
        cy.wait(10000);
    
        // Verifica que el turno haya pasado al siguiente jugador con índice 1
        cy.contains('Índice del jugador actual: 1').should('be.visible');
    
        // Cierra la sesión al final de la prueba
        cy.contains('Cerrar sesión').click({ force: true });
        cy.clearCookies();
    });

    it('Volver a unirse y seleccionar una columna', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
        
        cy.get('ul li').find('button').contains('Unido').click();
        
        cy.url().should('include', '/play/Juego1');
    
        cy.wait(3000);

        cy.get('ul').contains('Columna 0').click();

        cy.wait(3000);
    
        cy.contains('Cerrar sesión').click({force: true});
        cy.clearCookies();
    
    });

    it('Volver a unirse y seleccionar una columna y tomarla', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
        
        cy.get('ul li').find('button').contains('Unido').click();
        
        cy.url().should('include', '/play/Juego1');
    
        cy.wait(3000);

        cy.get('ul').contains('Columna 0').click();

        cy.get('button').contains('Tomar columna').should('be.visible').click();

        cy.wait(3000);
    
        cy.contains('Cerrar sesión').click({force: true});
        cy.clearCookies();
    
    });

    it('Tomar una columna deshabilitado sin seleccionar', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.get('ul li').find('button').contains('Unido').click();
    
        cy.url().should('include', '/play/Juego1');
    
        cy.wait(3000);

        cy.get('button').contains('Tomar columna').should('be.disabled');
    
        cy.wait(3000);
    
        cy.contains('Cerrar sesión').click({ force: true });
        cy.clearCookies();
    });
    */
  
      it('Enviar un mensaje', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.get('ul li').find('button').contains('Unido').click();
    
        cy.url().should('include', '/play/Juego1');

        cy.get('#messageInput').should('be.visible');
        cy.get('#messageInput').type('Prueba de cypress');
        cy.get('button[type="submit"]').click();

        cy.wait(3000);

        cy.get('.message-list').should('contain', 'Prueba de cypress');

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);
    });


    it('Mostrar usuarios conectados', () => {

      cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
      });

      cy.get('ul li').find('button').contains('Unido').click();

      cy.url().should('include', '/play/Juego1');

      cy.get('.connected-users-panel').within(() => {

      cy.get('li').should('have.length.greaterThan', 0);

      });

      cy.contains('Cerrar sesión').click();
      cy.clearCookies();
      cy.wait(3000);
    
    });
  
    it('Indicar que el usuario está escribiendo', () => {

      cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
      });

      cy.get('ul li').find('button').contains('Unido').click();

      cy.url().should('include', '/play/Juego1');

      cy.get('#messageInput').type('Escribiendo...');

      cy.get('.typing-indicator').should('contain', 'está escribiendo...');

      cy.wait(3000);

      cy.contains('Cerrar sesión').click();
      cy.clearCookies();
      cy.wait(3000);
      
    });
  
    it('Seleccionar un emoticono', () => {
     
      cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
      });

      cy.get('ul li').find('button').contains('Unido').click();

      cy.url().should('include', '/play/Juego1');

      cy.get('.emoticon-button').click();
      cy.get('.emoticon-picker').should('be.visible');
  
      cy.get('.emoticon-picker .emoticon-item').first().click();
      cy.contains('Enviar').should('be.visible').click();

      cy.get('.message-list').should('contain', '😊');

      cy.wait(3000);

      cy.contains('Cerrar sesión').click();
      cy.clearCookies();
      cy.wait(3000);
      
    });

    it('Añadir reacción a mensaje', () => {

      cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
      });

      cy.get('ul li').find('button').contains('Unido').click();

      cy.url().should('include', '/play/Juego1');

      cy.get('.message-list li').should('have.length.greaterThan', 0);
  
      cy.get('.message-item').first().trigger('mouseover');
      cy.get('.reaction-button').first().click();
  
      cy.get('.reaction-picker').should('be.visible');
  
      cy.get('.reaction-picker .reaction-button').first().click();

      cy.get('.message-reactions').first().should('contain', '😊');

      cy.wait(3000);

      cy.contains('Cerrar sesión').click();
      cy.clearCookies();
      cy.wait(3000);

    });
    
    it('Eliminar reacción a mensaje', () => {

      cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
      });

      cy.get('ul li').find('button').contains('Unido').click();

      cy.url().should('include', '/play/Juego1');

      cy.get('.message-list li').should('have.length.greaterThan', 0);
  
      cy.get('.message-item').first().trigger('mouseover');
      cy.get('.reaction-button').first().click();
  
      cy.get('.reaction-picker').should('be.visible');
  
      cy.get('.reaction-picker .reaction-button').first().click();

      cy.get('.message-reactions').first().should('not.contain', '😊');

      cy.wait(3000);

      cy.contains('Cerrar sesión').click();
      cy.clearCookies();
      cy.wait(3000);
      
    });
  });