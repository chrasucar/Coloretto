describe('Navbar', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4000');
    });

    it('Navbar está oculto en la página de inicio de sesión', () => {
        cy.visit('http://localhost:4000/auth/login');
      
        cy.get('nav').should('have.class', 'hide-menu');
      
        cy.get('nav').should('not.be.visible');
      });
  
    it('Enlaces de autenticación cuando el usuario no está autenticado', () => {

      cy.contains('Iniciar Sesión').should('be.visible');
      cy.contains('Registrarse').should('be.visible');
  
      cy.get('a').contains('Jugar').should('not.exist');
      cy.get('a').contains('Chat').should('not.exist');
      cy.get('a').contains('Mi Perfil').should('not.exist');
      cy.get('a').contains('Preguntas frecuentes').should('not.exist');
      cy.get('a').contains('Cerrar Sesión').should('not.exist');
    });
  
    it('Enlaces de usuario cuando el usuario está autenticado', () => {

      cy.visit('http://localhost:4000/auth/login');
      cy.get('input[placeholder="Usuario"]').type('juanperez');
      cy.get('input[placeholder="Contraseña"]').type('contraseña123');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/');

      cy.wait(5000);

      cy.get('nav').should('exist');

      cy.contains('Jugar').should('be.visible');
      cy.contains('Chat').should('be.visible');
      cy.contains('Mi Perfil').should('be.visible');
      cy.contains('Preguntas frecuentes').should('be.visible');
      cy.contains('Cerrar Sesión').should('be.visible');
  
      cy.get('a').contains('Iniciar Sesión').should('not.exist');
      cy.get('a').contains('Registrarse').should('not.exist');
    });
  
    it('Cerrar sesión y redirigir al usuario', () => {

      cy.visit('http://localhost:4000/auth/login');
      cy.get('input[placeholder="Usuario"]').type('juanperez');
      cy.get('input[placeholder="Contraseña"]').type('contraseña123');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/');

      cy.wait(5000);

      cy.get('nav').should('exist');
  
      cy.contains('Jugar').should('be.visible');
      cy.contains('Chat').should('be.visible');
      cy.contains('Mi Perfil').should('be.visible');
      cy.contains('Preguntas frecuentes').should('be.visible');
      cy.contains('Cerrar Sesión').should('be.visible');
    
      cy.contains('Cerrar Sesión').click();

      cy.url().should('include', '/');

      cy.wait(5000);

      cy.get('nav').should('exist');
      
      cy.contains('Iniciar Sesión').should('be.visible');
      cy.contains('Registrarse').should('be.visible');
      cy.get('a').contains('Jugar').should('not.exist');
      cy.get('a').contains('Chat').should('not.exist');
      cy.get('a').contains('Mi Perfil').should('not.exist');
      cy.get('a').contains('Preguntas frecuentes').should('not.exist');
      cy.get('a').contains('Cerrar sesión').should('not.exist');
    });
  });
  