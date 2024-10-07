describe('EmailFormPage', () => {

    const username = 'juanperez';
  
    beforeEach(() => {

        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000');
    
      });
  
    it('Mostrar formulario de actualización de email', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar correo electrónico').should('be.visible').click();

        cy.get('input[type="password"]').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');

        cy.contains('Guardar cambios').should('be.visible');
        cy.contains('Cancelar').should('be.visible');
    });
  
    it('Ingresar correo electrónico y contraseña', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar correo electrónico').should('be.visible').click();

        cy.get('input[type="password"]').type('contraseña123');
        cy.get('input[type="email"]').type('nuevoemail@example.com');
        cy.get('input[type="password"]').should('have.value', 'contraseña123');
        cy.get('input[type="email"]').should('have.value', 'nuevoemail@example.com');
    });

  
    it('Actualizar el correo electrónico correctamente', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar correo electrónico').should('be.visible').click();

        cy.get('input[type="password"]').type('contraseña123');
        cy.get('input[type="email"]').type('nuevoemail@example.com');

        cy.contains('Guardar cambios').click();
  
        cy.url().should('include', `/users/profile/${username}`);

        cy.contains('nuevoemail@example.com').should('be.visible');
    });
  
    it('Error si contraseña no es correcta', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar correo electrónico').should('be.visible').click();

        cy.get('input[type="password"]').type('password123');
        cy.get('input[type="email"]').type('nuevoemail@example.com');
  
        cy.contains('Guardar cambios').click();
  
        cy.contains('La contraseña actual introducida no es correcta.').should('exist');

    });

    it('Error si el nuevo email es el mismo que antes', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar correo electrónico').should('be.visible').click();

        cy.get('input[type="password"]').type('contraseña123');
        cy.get('input[type="email"]').type('nuevoemail@example.com');
  
        cy.contains('Guardar cambios').click();
  
        cy.contains('El nuevo correo electrónico es igual al correo electrónico actual.').should('exist');

    });
  
    it('Redirigir a la página de perfil al hacer clic en "Cancelar"', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar correo electrónico').should('be.visible').click();

        cy.contains('Cancelar').click();
  
        cy.url().should('include', `/users/profile/${username}`);
        
    });
  });
  