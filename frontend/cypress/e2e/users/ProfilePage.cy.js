describe('ProfilePage', () => {

  const username = 'juanperez';

  beforeEach(() => {

    cy.visit('http://localhost:4000/auth/login');

    cy.get('input[placeholder="Usuario"]').type(username); 
    cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
    cy.get('button[type="submit"]').click();
    cy.getCookie('token');

    cy.visit('http://localhost:4000');

  });

  it('Información de perfil del usuario', () => {

    cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
    });

    cy.visit(`http://localhost:4000/users/profile/${username}`);

    cy.contains('Perfil de Usuario').should('be.visible');
    cy.contains('Nombre y Apellidos: Juan Pérez').should('be.visible');
    cy.contains(`Nombre de Usuario: ${username}`).should('be.visible');
    cy.contains('Correo Electrónico: juan@example.com').should('be.visible');   
    cy.get('img').should('have.attr', 'src').and('include', 'profile-pictures');
    cy.contains('Partidas jugadas: 0').should('be.visible');
    cy.contains('Partidas ganadas: 0').should('be.visible');
    cy.contains('Partidas perdidas: 0').should('be.visible');
    cy.contains('Conectado.').should('be.visible');
  });

  it('Navegar a páginas de actualización', () => {

    cy.getCookie('token').then((cookie) => {
        expect(cookie).to.exist;
    });

    cy.visit(`http://localhost:4000/users/profile/${username}`);

    cy.contains('Actualizar correo electrónico').click();
    cy.url().should('include', `/users/profile/${username}/change-email`);
    cy.visit(`http://localhost:4000/users/profile/${username}`);
    
    cy.contains('Actualizar contraseña').click();
    cy.url().should('include', `/users/profile/${username}/change-password`);
    cy.visit(`http://localhost:4000/users/profile/${username}`);
    
    cy.contains('Actualizar foto de perfil').click();
    cy.url().should('include', `/users/profile/${username}/update-profile-picture`);
});

  it('Redirigir al inicio si usuario no autenticado', () => {

    cy.clearCookie('token');

    cy.visit(`http://localhost:4000/users/profile/${username}`);

    cy.url().should('include', '/');

    cy.contains('Iniciar Sesión').should('be.visible');
    cy.contains('Registrarse').should('be.visible');
  });

  it('Eliminar cuenta', () => {

    cy.getCookie('token').then((cookie) => {
      expect(cookie).to.exist;
  });

    cy.visit(`http://localhost:4000/users/profile/${username}`);

    cy.contains('Eliminar cuenta').should('be.visible').click();

    cy.clearCookie('token');

    cy.visit('http://localhost:4000');
});
});

