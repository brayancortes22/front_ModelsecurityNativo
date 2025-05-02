/**
 * Controlador de autenticación
 * Gestiona las operaciones de inicio y cierre de sesión
 */

const AuthController = {
    // Elementos del DOM para los formularios
    elements: {
        loginForm: null,
        usernameInput: null,
        passwordInput: null,
        submitButton: null,
        // Nuevos elementos para el formulario de registro
        registerForm: null,
        registerTab: null,
        loginTab: null
    },
    
    /**
     * Inicializa el controlador de autenticación
     */
    init() {
        // Obtener referencias a elementos del DOM - Login
        this.elements.loginForm = document.getElementById('loginForm');
        this.elements.usernameInput = document.getElementById('username');
        this.elements.passwordInput = document.getElementById('password');
        
        // Obtener referencias a elementos del DOM - Registro
        this.elements.registerForm = document.getElementById('registerForm');
        this.elements.registerTab = document.getElementById('register-tab');
        this.elements.loginTab = document.getElementById('login-tab');
        
        // Si el formulario de login existe, configurar el evento de envío
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Si el formulario de registro existe, configurar el evento de envío
        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    },
    
    /**
     * Maneja el proceso de inicio de sesión
     */
    async handleLogin() {
        try {
            // Obtener valores del formulario
            const username = this.elements.usernameInput.value.trim();
            const password = this.elements.passwordInput.value.trim();
            
            // Validación básica
            if (!username || !password) {
                Helpers.showError('Por favor, complete todos los campos.');
                return;
            }
            
            // Mostrar spinner de carga
            Helpers.toggleSpinner(true);
            
            // Intentar inicio de sesión
            await AuthService.login(username, password);
            
            // Actualizar información de usuario en la interfaz
            AppController.updateUserInfo();
            
            // Limpiar el formulario
            this.elements.loginForm.reset();
            
            // Cargar la vista del dashboard
            AppController.loadView(CONSTANTS.VIEWS.DASHBOARD);
            
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            Helpers.showError('Error en el inicio de sesión: ' + error.message);
        } finally {
            Helpers.toggleSpinner(false);
        }
    },
    
    /**
     * Maneja el proceso de registro de persona y usuario
     */
    async handleRegister() {
        try {
            // Validar el formulario
            if (!this.validateRegisterForm()) {
                return;
            }
            
            // Mostrar spinner de carga
            Helpers.toggleSpinner(true);
            
            // Recopilar datos de persona
            const personData = {
                name: document.getElementById('regName').value.trim(),
                firstName: document.getElementById('regFirstName').value.trim(),
                secondName: document.getElementById('regSecondName').value.trim(),
                firstLastName: document.getElementById('regFirstLastName').value.trim(),
                secondLastName: document.getElementById('regSecondLastName').value.trim(),
                email: document.getElementById('regEmail').value.trim(),
                phoneNumber: document.getElementById('regPhoneNumber').value.trim(),
                typeIdentification: document.getElementById('regTypeIdentification').value,
                numberIdentification: parseInt(document.getElementById('regNumberIdentification').value.trim()),
                active: true,
                createDate: new Date().toISOString() // Añadir fecha de creación (requerida en la base de datos)
            };
            
            // Recopilar datos de usuario
            const userData = {
                username: document.getElementById('regUsername').value.trim(),
                password: document.getElementById('regPassword').value.trim(),
                email: document.getElementById('regEmail').value.trim(),
                active: true
            };
            
            // Paso 1: Crear la persona
            console.log('Creando persona:', personData);
            const createdPerson = await PersonService.create(personData);
            
            if (!createdPerson || !createdPerson.id) {
                throw new Error('No se recibió respuesta del servidor al crear la persona o no se asignó un ID');
            }
            
            console.log('Persona creada exitosamente:', createdPerson);
            
            // Paso 2: Crear el usuario asociado a la persona
            userData.personId = createdPerson.id;
            console.log('Creando usuario:', userData);
            const createdUser = await UserService.create(userData);
            
            if (!createdUser || !createdUser.id) {
                throw new Error('No se recibió respuesta del servidor al crear el usuario o no se asignó un ID');
            }
            
            console.log('Usuario creado exitosamente:', createdUser);
            
            // Asignar rol básico al usuario
            try {
                // Asignar un rol por defecto (ejemplo: ID 1 para "Usuario Básico")
                const defaultRolId = 1; // ID del rol por defecto
                await UserService.assignRol(createdUser.id, defaultRolId);
                console.log(`Rol ${defaultRolId} asignado exitosamente al usuario ${createdUser.id}`);
            } catch (roleError) {
                console.error('Error al asignar el rol por defecto:', roleError);
                // No detenemos el proceso por este error, pero lo mostramos
                Helpers.showError('Advertencia: El usuario se creó pero no se pudo asignar el rol por defecto. Un administrador deberá asignarle roles.');
            }
            
            // Mostrar mensaje de éxito y redireccionar
            Helpers.showMessage('Registro exitoso', 'Su cuenta ha sido creada correctamente. Ahora puede iniciar sesión.');
            
            // Limpiar formulario y cambiar a la pestaña de login
            this.elements.registerForm.reset();
            this.switchToLoginTab();
            
        } catch (error) {
            console.error('Error detallado en el registro:', error);
            let errorMessage = error.message || 'Error desconocido al registrarse';
            
            // Mostrar mensaje de error más detallado
            if (errorMessage.includes('unique constraint') || errorMessage.includes('duplicate')) {
                errorMessage = 'Ya existe un usuario con ese nombre de usuario o correo electrónico, o el número de identificación ya está registrado.';
            }
            
            Helpers.showError('Error en el registro: ' + errorMessage);
        } finally {
            Helpers.toggleSpinner(false);
        }
    },
    
    /**
     * Valida el formulario de registro
     * @returns {boolean} True si el formulario es válido, False en caso contrario
     */
    validateRegisterForm() {
        // Validar campos requeridos
        const requiredFields = [
            { id: 'regName', label: 'Nombre Completo' },
            { id: 'regEmail', label: 'Email' },
            { id: 'regTypeIdentification', label: 'Tipo de Identificación' },
            { id: 'regNumberIdentification', label: 'Número de Identificación' },
            { id: 'regUsername', label: 'Nombre de Usuario' },
            { id: 'regPassword', label: 'Contraseña' },
            { id: 'regConfirmPassword', label: 'Confirmar Contraseña' }
        ];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element.value.trim()) {
                Helpers.showError(`El campo "${field.label}" es obligatorio.`);
                element.focus();
                return false;
            }
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const email = document.getElementById('regEmail').value.trim();
        if (!emailRegex.test(email)) {
            Helpers.showError('Por favor, ingrese un email válido.');
            document.getElementById('regEmail').focus();
            return false;
        }
        
        // Validar contraseña
        const password = document.getElementById('regPassword').value;
        if (password.length < 8) {
            Helpers.showError('La contraseña debe tener al menos 8 caracteres.');
            document.getElementById('regPassword').focus();
            return false;
        }
        
        // Verificar que las contraseñas coincidan
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        if (password !== confirmPassword) {
            Helpers.showError('Las contraseñas no coinciden.');
            document.getElementById('regConfirmPassword').focus();
            return false;
        }
        
        // Validar que se acepten los términos y condiciones
        if (!document.getElementById('regTerms').checked) {
            Helpers.showError('Debe aceptar los términos y condiciones.');
            return false;
        }
        
        return true;
    },
    
    /**
     * Cambia a la pestaña de login
     */
    switchToLoginTab() {
        if (this.elements.loginTab) {
            // Usar la API de Bootstrap para cambiar de tab
            const tab = new bootstrap.Tab(this.elements.loginTab);
            tab.show();
        }
    },
    
    /**
     * Maneja el proceso de cierre de sesión
     */
    async handleLogout() {
        try {
            Helpers.toggleSpinner(true);
            
            // Cerrar sesión en el servidor y limpiar datos locales
            await AuthService.logout();
            
            // Actualizar interfaz
            AppController.updateUserInfo();
            
            // Redirigir a la página de login
            AppController.loadView(CONSTANTS.VIEWS.LOGIN);
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Helpers.showError('Error al cerrar sesión: ' + error.message);
        } finally {
            Helpers.toggleSpinner(false);
        }
    }
};