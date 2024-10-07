describe('Create Game', () => {

    beforeEach(() => {
    
        const username = 'juanperez';
    
        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000/play'); 
    
    });

    it('Mostrar error si el nombre de la partida está vacío', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.get('button').contains('Crear partida').should('be.visible').click();

        cy.url().should('include', '/create');

        cy.get('input[placeholder="Máximo de jugadores"]').type('3');
        cy.get('button').contains('Crear').click();
        cy.get('p').should('have.text', 'El nombre de la partida no puede estar vacío.');

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);
    
    });

    it('Mostrar un error si el número de jugadores no está en el rango correcto', () => {
        
        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.get('button').contains('Crear partida').should('be.visible').click();

        cy.url().should('include', '/create');
      
        cy.get('input[placeholder="Nombre de la partida"]').type('Test Game');
        cy.get('input[placeholder="Máximo de jugadores"]').type('1');
        cy.get('button').contains('Crear').click();
        cy.get('p').should('have.text', 'El número de jugadores debe estar entre 2 y 5.');

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);

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

        cy.contains('Abandonar partida').click();

        cy.contains('Cerrar sesión').click();
        cy.clearCookies();
        cy.wait(3000);

      });
    });
