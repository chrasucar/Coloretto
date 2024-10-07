describe('Página de inicio de sesión', () => {

    beforeEach(() => {
      cy.visit('http://localhost:4000/auth/login');
    });
  
    it('Iniciar sesión exitosamente', () => {

      cy.get('input[placeholder="Usuario"]').type('juanperez');
      cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').type('contraseña123');
      cy.get('button[type="submit"]').click();

      cy.contains('¡Ha iniciado sesión correctamente!, redirigiendo a la página principal...').should('exist');
  
      cy.url().should('include', '/');
    });
  
    it('Mostrar errores cuando los campos requeridos están vacíos', () => {

      cy.get('button[type="submit"]').click();
      cy.contains('Usuario requerido.').should('exist');
      cy.contains('Contraseña requerida.').should('exist');
    });
  
    it('Mostrar error si el usuario no es encontrado', () => {

        cy.get('input[placeholder="Usuario"]').type('usuario_incorrecto');
        cy.get('input[placeholder="Contraseña"]').type('contraseña123');
        cy.get('button[type="submit"]').click();
    
        cy.contains('Usuario no encontrado.').should('exist');
        cy.contains('La contraseña actual introducida no es correcta').should('not.exist');
      });
    
    it('Mostrar error si la contraseña es incorrecta', () => {
        cy.get('input[placeholder="Usuario"]').type('juanperez');
        cy.get('input[placeholder="Contraseña"]').type('contraseña_incorrecta');
        cy.get('button[type="submit"]').click();
    
        cy.contains('La contraseña actual introducida no es correcta').should('exist');
        cy.contains('Usuario no encontrado.').should('not.exist');
      });
    });
  