describe('InitialGamePage', () => {

beforeEach(() => {

    const username = 'juanperez';

    cy.visit('http://localhost:4000/auth/login');

    cy.get('input[placeholder="Usuario"]').type(username); 
    cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
    cy.get('button[type="submit"]').click();
    cy.getCookie('token');

    cy.visit('http://localhost:4000/play'); 

    });

    it('Mostrar el botón "Crear Partida" si no hay partida activa', () => {

    cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
    });

    cy.get('button').contains('Crear partida').should('be.visible');

    cy.contains('Cerrar sesión').click();
    cy.clearCookies();
    cy.wait(3000);

    });

    it('Mostrar el botón "Unirse"', () => {

    cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
    });
    
    cy.get('button').contains('Unirse').should('be.visible');
    
    cy.contains('Cerrar sesión').click();
    cy.clearCookies();
    cy.wait(3000);
    
    });

    it('Navegar al hacer clic en el botón "Crear Partida"', () => {

    cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
    });

    cy.get('button').contains('Crear partida').click();
    cy.url().should('include', '/create');

    });

    it('Navegar al hacer clic en el botón "Unirse"', () => {

    cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
    });

    cy.get('button').contains('Unirse').click();
    cy.url().should('include', '/join');

    cy.contains('Cerrar sesión').click();
    cy.clearCookies();
    cy.wait(3000);

    });
});