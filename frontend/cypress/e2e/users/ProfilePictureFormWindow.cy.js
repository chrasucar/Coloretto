import 'cypress-file-upload';

describe('Profile Picture Form Window', () => {

    const username = 'juanperez';
  
    beforeEach(() => {

        cy.visit('http://localhost:4000/auth/login');
    
        cy.get('input[placeholder="Usuario"]').type(username); 
        cy.get('input[placeholder="Contraseña"]').should('not.be.disabled').should('be.visible').type('contraseña123');
        cy.get('button[type="submit"]').click();
        cy.getCookie('token');
    
        cy.visit('http://localhost:4000');
    
      });
  
    it('Cargar formulario correctamente', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}/update-profile-picture`);  
        
        cy.contains('Actualizar Foto de Perfil').should('be.visible');

        cy.contains('Cancelar').click();

        cy.url().should('include', `/users/profile/${username}`);

    });
  
    it('Seleccionar un archivo de imagen desde el PC', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}/update-profile-picture`);

        const imageFile = 'test-image.png';
  
        cy.get('#fileInput').attachFile(imageFile);

        cy.contains('Cancelar').click();

        cy.url().should('include', `/users/profile/${username}`);

    });

    it('Error si no se proporciona ninguna imagen', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}/update-profile-picture`);

        cy.get('button').contains('Actualizar').click();
  
        cy.contains('Debe proporcionar una imagen válida.').should('be.visible');

        cy.contains('Cancelar').click();

        cy.url().should('include', `/users/profile/${username}`); 
    });
  
    it('Cargar imagen y navegar de vuelta al perfil del usuario', () => {

        cy.getCookie('token').then((cookie) => {
            expect(cookie).to.exist;
        });

        cy.visit(`http://localhost:4000/users/profile/${username}/update-profile-picture`);

        const imageFile = 'test-image.png';

        cy.get('#fileInput').attachFile(imageFile);
  
        cy.get('button').contains('Actualizar').click();
  
        cy.url().should('include', `/users/profile/${username}`);

        cy.get('nav').should('exist');
        cy.contains('Cerrar sesión').should('be.visible').click();
        cy.clearCookies();
        cy.url().should('include', '/'); 
    });
});
  