describe('Chat General', () => {

    beforeEach(() => {

        const username = 'juanperez';

        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000/chat'); 
    
    });
  
      it('Enviar un mensaje', () => {

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