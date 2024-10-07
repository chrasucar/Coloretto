describe('Join Game', () => {

    beforeEach(() => {
    
        const username = 'juanperez';
    
        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000/play'); 
    
    });

    it('Crear la partida y redirigir al usuario a la página de la partida', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.get('button').contains('Crear partida').should('be.visible').click();

        cy.url().should('include', '/create');
      
        cy.get('input[placeholder="Nombre de la partida"]').type('Test Game');
        cy.get('input[placeholder="Máximo de jugadores"]');
        cy.get('button').contains('Crear').click();
        cy.get('p').should('have.text', 'Ha creado la partida. Redirigiendo...');
      
        cy.url().should('include', '/play/Test%20Game');

        cy.wait(3000);

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);

      });

    it('Mostrar título correcto de unión de partidas', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.url().should('include', '/join');

        cy.contains('Partidas disponibles');

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);

    });

    it('Redirigir a lista de partidas si el usuario tiene una partida activa', () => {
        
        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.url().should('include', '/play/join');

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);
        
    });
});