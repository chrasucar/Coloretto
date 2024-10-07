describe('Game List', () => {

    beforeEach(() => {
    
        const username = 'juanperez';
    
        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000/play/join'); 
    
    });

    it('Mostrar lista de partidas', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.get('h1').contains('Partidas disponibles'); 
        cy.get('li').should('have.length', 7);

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);

    });

    it('Unirse a partida en la lista', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.get('ul li').find('button').contains('Unirse').click();
    
        cy.url().should('include', '/play/Juego1');

        cy.wait(3000);

        cy.contains('Cerrar sesión').click({force: true});
        cy.clearCookies();
        cy.wait(10000);

    });

    it('Volver a unirse', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.get('ul li').find('button').contains('Unido').click();
    
        cy.url().should('include', '/play/Juego1');

        cy.wait(3000);

        cy.contains('Abandonar partida').click({force: true});

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(10000);

      });
    });