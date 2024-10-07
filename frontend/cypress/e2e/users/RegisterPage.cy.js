describe('Registro de usuario', () => {
    beforeEach(() => {
      cy.visit('http://localhost:4000/users/register');
    });
  
    it('Registrar un nuevo usuario exitosamente', () => {

        cy.get('input[placeholder="Nombre y apellidos"]').type('Juan Pérez');
        cy.get('input[placeholder="Usuario"]').type('juanperez');
        cy.get('input[placeholder="Correo electrónico"]').type('juan@example.com');
        cy.get('input[placeholder="Contraseña"]').type('contraseña123');
        cy.get('button[type="submit"]').click();

        cy.contains('¡Se ha registrado correctamente!, espere.').should('exist');

        cy.wait(5000);

        cy.url().should('include', '/auth/login');
    });
  
    it('Mostrar errores cuando los campos requeridos están vacíos', () => {

        cy.get('button[type="submit"]').click();
  
        cy.contains('Por favor, introduce tu nombre y tus apellidos.').should('exist');
        cy.contains('Por favor, introduce un nombre de usuario.').should('exist');
        cy.contains('Por favor, introduce tu correo electrónico.').should('exist');
        cy.contains('Por favor, introduce una contraseña.').should('exist');
    });

    it('Mostrar un error si el registro falla', () => {

        cy.get('input[placeholder="Nombre y apellidos"]').type('Juan Pérez');
        cy.get('input[placeholder="Usuario"]').type('juanperez');
        cy.get('input[placeholder="Correo electrónico"]').type('juan@example.com');
        cy.get('input[placeholder="Contraseña"]').type('contraseña123');
        cy.get('button[type="submit"]').click();
  
        cy.get('button[type="submit"]').click();
  
        cy.contains('El nombre de usuario ya está en uso.').should('exist');
    });
  });
  