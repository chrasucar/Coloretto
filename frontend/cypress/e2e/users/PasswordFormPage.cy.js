describe('EmailFormPage', () => {

    const username = 'juanperez';
    let currentPassword = 'contraseña123';
  
    beforeEach(() => {

        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type(currentPassword);
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000');
    
      });
  
    it('Mostrar formulario de actualización de contraseña', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });
    
        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar contraseña').should('be.visible').click();

        cy.get('input[type="password"]').should('be.visible');
        cy.get('input[type="text"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');

        cy.contains('Guardar cambios').should('be.visible');
        cy.contains('Cancelar').should('be.visible');
    });
  
    it('Ingresar contraseña actual, nueva contraseña y verificarla', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar contraseña').should('be.visible').click();

        cy.get('input[type="password"]').eq(0).type(currentPassword);
        cy.get('input[type="text"]').type('password123');
        cy.get('input[type="password"]').eq(1).type('password123');

        cy.get('input[type="password"]').eq(0).should('have.value', currentPassword);
        cy.get('input[type="text"]').should('have.value', 'password123');
        cy.get('input[type="password"]').eq(1).should('have.value', 'password123');
    });
  
    it('Actualizar la contraseña correctamente', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar contraseña').should('be.visible').click();

        cy.get('input[type="password"]').eq(0).type(currentPassword);
        cy.get('input[type="text"]').type('password123');
        cy.get('input[type="password"]').eq(1).type('password123');

        cy.contains('Guardar cambios').click();
  
        cy.url().should('include', `/users/profile/${username}`);

        cy.get('nav').should('exist');
        cy.contains('Cerrar sesión').should('be.visible').click();
        cy.clearCookies();
        cy.url().should('include', '/'); 
    });


    it('Iniciar sesión con la nueva contraseña', () => {

        currentPassword = 'password123';
        cy.clearCookies(); 
        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type(currentPassword);
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000');
    });

    it('Error si nueva contraseña distinta de su verificación', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar contraseña').should('be.visible').click();

        cy.get('input[type="password"]').eq(0).type('password123');
        cy.get('input[type="text"]').type('password12345'); 
        cy.get('input[type="password"]').eq(1).type('password1234');
  
        cy.contains('Guardar cambios').click();

        cy.contains('La nueva contraseña introducida no es igual a la verificación de la nueva contraseña.').should('exist');

        cy.contains('Cancelar').click();

        cy.url().should('include', `/users/profile/${username}`);

    });

    it('Error si nueva contraseña igual que la actual', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar contraseña').should('be.visible').click();

        cy.get('input[type="password"]').eq(0).type('password123');
        cy.get('input[type="text"]').type('password123');
        cy.get('input[type="password"]').eq(1).type('password123');
  
        cy.contains('Guardar cambios').click();
  
        cy.contains('La nueva contraseña es igual que la actual.').should('exist');

        cy.contains('Cancelar').click();

        cy.url().should('include', `/users/profile/${username}`);

    });

    it('Error si contraseña actual no es correcta', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}`);
        cy.contains('Actualizar contraseña').should('be.visible').click();

        cy.get('input[type="password"]').eq(0).type('password122');
        cy.get('input[type="text"]').type('password12345'); 
        cy.get('input[type="password"]').eq(1).type('password12345');
  
        cy.contains('Guardar cambios').click();
  
        cy.contains('La contraseña actual introducida no es correcta.').should('exist');

        cy.contains('Cancelar').click();

        cy.url().should('include', `/users/profile/${username}`);

        cy.get('nav').should('exist');
        cy.contains('Cerrar sesión').should('be.visible').click();
        cy.clearCookies();
        cy.url().should('include', '/');

    });
});

  