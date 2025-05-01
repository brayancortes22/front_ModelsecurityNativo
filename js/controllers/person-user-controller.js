/**
 * Controlador para el registro combinado de personas y usuarios
 * Permite crear una persona y un usuario asociado en un solo proceso
 */

const PersonUserController = {
    // Elementos del DOM
    elements: {
        personForm: null,
        userForm: null,
        personTab: null,
        userTab: null,
        btnNextToUser: null,
        btnBackToPersonal: null,
        btnSavePersonUser: null,
        btnCopyEmail: null,
        togglePassword: null,
        toggleConfirmPassword: null
    },
    
    /**
     * Inicializa el controlador
     */
    init() {
        // Obtener referencias a elementos del DOM
        this.elements.personTab = document.getElementById('personal-tab');
        this.elements.userTab = document.getElementById('user-tab');
        this.elements.btnNextToUser = document.getElementById('btnNextToUser');
        this.elements.btnBackToPersonal = document.getElementById('btnBackToPersonal');
        this.elements.btnSavePersonUser = document.getElementById('btnSavePersonUser');
        this.elements.btnCopyEmail = document.getElementById('btnCopyEmail');
        this.elements.togglePassword = document.getElementById('togglePassword');
        this.elements.toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
        this.elements.personUserForm = document.getElementById('personUserForm');
        
        // Configurar eventos
        this.setupEventListeners();
    },
    
    /**
     * Configura los escuchadores de eventos
     */
    setupEventListeners() {
        // Navegación entre pestañas
        if (this.elements.btnNextToUser) {
            this.elements.btnNextToUser.addEventListener('click', () => {
                if (this.validatePersonalTab()) {
                    // Copiar email de persona a usuario por defecto
                    const personEmail = document.getElementById('email').value;
                    if (personEmail) {
                        document.getElementById('userEmail').value = personEmail;
                    }
                    
                    // Generar nombre de usuario basado en el nombre y apellido
                    const firstName = document.getElementById('firstName').value;
                    const firstLastName = document.getElementById('firstLastName').value;
                    if (firstName && firstLastName && !document.getElementById('username').value) {
                        const suggestedUsername = this.generateUsername(firstName, firstLastName);
                        document.getElementById('username').value = suggestedUsername;
                    }
                    
                    // Activar pestaña de usuario
                    const userTab = new bootstrap.Tab(this.elements.userTab);
                    userTab.show();
                }
            });
        }
        
        if (this.elements.btnBackToPersonal) {
            this.elements.btnBackToPersonal.addEventListener('click', () => {
                const personalTab = new bootstrap.Tab(this.elements.personTab);
                personalTab.show();
            });
        }
        
        // Botón para copiar email de persona a usuario
        if (this.elements.btnCopyEmail) {
            this.elements.btnCopyEmail.addEventListener('click', () => {
                const personEmail = document.getElementById('email').value;
                if (personEmail) {
                    document.getElementById('userEmail').value = personEmail;
                }
            });
        }
        
        // Toggle para mostrar/ocultar contraseña
        if (this.elements.togglePassword) {
            this.elements.togglePassword.addEventListener('click', () => {
                const passwordField = document.getElementById('password');
                this.togglePasswordVisibility(passwordField, this.elements.togglePassword.querySelector('i'));
            });
        }
        
        if (this.elements.toggleConfirmPassword) {
            this.elements.toggleConfirmPassword.addEventListener('click', () => {
                const confirmPasswordField = document.getElementById('confirmPassword');
                this.togglePasswordVisibility(confirmPasswordField, this.elements.toggleConfirmPassword.querySelector('i'));
            });
        }
        
        // Envío del formulario
        if (this.elements.personUserForm) {
            this.elements.personUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePersonUser();
            });
        }
    },
    
    /**
     * Alterna la visibilidad del campo de contraseña
     * @param {HTMLElement} passwordField - Campo de contraseña
     * @param {HTMLElement} icon - Ícono a cambiar
     */
    togglePasswordVisibility(passwordField, icon) {
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            passwordField.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    },
    
    /**
     * Valida los campos de la pestaña de datos personales
     * @returns {boolean} True si la validación es exitosa
     */
    validatePersonalTab() {
        const requiredFields = ['name', 'email', 'firstName', 'firstLastName', 'typeIdentification', 'numberIdentification'];
        
        // Validar campos requeridos
        let isValid = true;
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                element.classList.add('is-invalid');
                isValid = false;
            } else {
                element.classList.remove('is-invalid');
                element.classList.add('is-valid');
            }
        });
        
        // Validar email
        const emailField = document.getElementById('email');
        if (emailField.value && !this.isValidEmail(emailField.value)) {
            emailField.classList.add('is-invalid');
            isValid = false;
        }
        
        if (!isValid) {
            Helpers.showMessage('Datos incompletos', 'Complete todos los campos obligatorios antes de continuar.', 'warning');
        }
        
        return isValid;
    },
    
    /**
     * Valida los campos de la pestaña de datos de usuario
     * @returns {boolean} True si la validación es exitosa
     */
    validateUserTab() {
        const requiredFields = ['username', 'userEmail', 'password', 'confirmPassword'];
        
        // Validar campos requeridos
        let isValid = true;
        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                element.classList.add('is-invalid');
                isValid = false;
            } else {
                element.classList.remove('is-invalid');
                element.classList.add('is-valid');
            }
        });
        
        // Validar email
        const userEmailField = document.getElementById('userEmail');
        if (userEmailField.value && !this.isValidEmail(userEmailField.value)) {
            userEmailField.classList.add('is-invalid');
            isValid = false;
        }
        
        // Validar que las contraseñas coincidan
        const passwordField = document.getElementById('password');
        const confirmPasswordField = document.getElementById('confirmPassword');
        if (passwordField.value !== confirmPasswordField.value) {
            confirmPasswordField.classList.add('is-invalid');
            isValid = false;
            
            if (passwordField.value && confirmPasswordField.value) {
                Helpers.showMessage('Error de validación', 'Las contraseñas no coinciden.', 'warning');
            }
        }
        
        // Validar longitud mínima de contraseña
        if (passwordField.value && passwordField.value.length < 6) {
            passwordField.classList.add('is-invalid');
            isValid = false;
            Helpers.showMessage('Error de validación', 'La contraseña debe tener al menos 6 caracteres.', 'warning');
        }
        
        if (!isValid && !document.querySelector('.is-invalid')) {
            Helpers.showMessage('Datos incompletos', 'Complete todos los campos obligatorios antes de guardar.', 'warning');
        }
        
        return isValid;
    },
    
    /**
     * Guarda la persona y el usuario asociado
     */
    async savePersonUser() {
        // Validar ambas pestañas
        if (!this.validatePersonalTab() || !this.validateUserTab()) {
            return;
        }
        
        try {
            Helpers.showLoading();
            
            // Recopilar datos de la persona
            const personData = {
                id: 0, // Nueva persona
                name: document.getElementById('name').value.trim(),
                firstName: document.getElementById('firstName').value.trim(),
                secondName: document.getElementById('secondName').value.trim() || "",
                firstLastName: document.getElementById('firstLastName').value.trim(),
                secondLastName: document.getElementById('secondLastName').value.trim() || "",
                phoneNumber: document.getElementById('phoneNumber').value.trim() || "",
                email: document.getElementById('email').value.trim(),
                typeIdentification: document.getElementById('typeIdentification').value,
                numberIdentification: parseInt(document.getElementById('numberIdentification').value, 10),
                signing: document.getElementById('signing').checked ? "true" : "",
                active: true // Nueva persona siempre activa
            };
            
            console.log('Enviando datos de persona:', personData);
            
            // 1. Crear la persona
            const savedPerson = await PersonService.create(personData);
            console.log('Persona creada:', savedPerson);
            
            // 2. Crear el usuario asociado a la persona
            const userData = {
                username: document.getElementById('username').value.trim(),
                email: document.getElementById('userEmail').value.trim(),
                password: document.getElementById('password').value,
                personId: savedPerson.id, // Asociar al ID de la persona creada
                active: document.getElementById('active').checked
            };
            
            console.log('Enviando datos de usuario:', userData);
            
            const savedUser = await UserService.createUser(userData);
            console.log('Usuario creado:', savedUser);
            
            // Mostrar mensaje de éxito
            Helpers.showMessage(
                'Registro exitoso', 
                `La persona "${personData.name}" y el usuario "${userData.username}" han sido creados correctamente.`,
                'success'
            );
            
            // Limpiar formulario
            this.elements.personUserForm.reset();
            
            // Redirigir después de un breve retraso
            setTimeout(() => {
                window.location.href = 'users.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error al guardar persona y usuario:', error);
            Helpers.showError('Error al guardar', error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Genera un nombre de usuario basado en nombre y apellido
     * @param {string} firstName - Primer nombre
     * @param {string} lastName - Primer apellido
     * @returns {string} Nombre de usuario sugerido
     */
    generateUsername(firstName, lastName) {
        // Limpiar y normalizar nombre y apellido
        const cleanFirstName = this.normalizeString(firstName);
        const cleanLastName = this.normalizeString(lastName);
        
        // Generar nombre de usuario
        let username = cleanFirstName.toLowerCase();
        
        // Añadir primera letra del apellido
        if (cleanLastName) {
            username = username + cleanLastName.charAt(0).toLowerCase();
        }
        
        return username;
    },
    
    /**
     * Normaliza una cadena eliminando acentos y caracteres especiales
     * @param {string} str - Cadena a normalizar
     * @returns {string} Cadena normalizada
     */
    normalizeString(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z0-9]/g, "");
    },
    
    /**
     * Verifica si una cadena es un email válido
     * @param {string} email - Email a verificar
     * @returns {boolean} true si es un email válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};