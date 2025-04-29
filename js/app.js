/**
 * Archivo principal de la aplicación
 * Inicializa la aplicación y gestiona la navegación
 */

// Estado global de la aplicación
const App = {
    // Estado actual de la aplicación
    state: {
        currentUser: null,
        isAuthenticated: false,
        currentView: null,
        viewParams: null,
        loading: false,
        errorMessage: null,
        successMessage: null,
    },
    
    // Inicialización de la aplicación
    async init() {
        console.log('Inicializando aplicación ModelSecurity v2...');
        
        // Comprobar si hay un usuario autenticado
        if (AuthService.isAuthenticated()) {
            try {
                // Validar el token actual
                const isValid = await AuthService.validateToken();
                
                if (isValid) {
                    this.state.currentUser = AuthService.getCurrentUser();
                    this.state.isAuthenticated = true;
                    
                    // Redirigir al dashboard si estamos en la página de inicio
                    if (window.location.pathname === '/index.html' || window.location.pathname === '/') {
                        this.navigateTo('dashboard');
                        return;
                    }
                } else {
                    // Token inválido, limpiar auth
                    AuthService.clearAuth();
                    this.state.isAuthenticated = false;
                    this.state.currentUser = null;
                    
                    // Redirigir al login
                    if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
                        window.location.href = '/index.html';
                        return;
                    }
                }
            } catch (error) {
                console.error('Error al validar sesión:', error);
                AuthService.clearAuth();
                this.state.isAuthenticated = false;
                this.state.currentUser = null;
            }
        } else {
            // No hay token, verificar si estamos en una página protegida
            if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
                window.location.href = '/index.html';
                return;
            }
        }
        
        // Inicializar controladores
        this.initControllers();
        
        // Inicializar eventos
        this.initEvents();
        
        // Inicializar vista actual basada en la ubicación
        this.initCurrentView();
        
        console.log('Aplicación inicializada correctamente');
    },
    
    // Inicializa los controladores de la aplicación
    initControllers() {
        // Controladores específicos se inicializarán según la vista
    },
    
    // Inicializa los eventos globales de la aplicación
    initEvents() {
        // Eventos de navegación
        document.addEventListener('click', (event) => {
            // Manejar enlaces de navegación
            if (event.target.matches('a[data-nav]') || event.target.closest('a[data-nav]')) {
                const navLink = event.target.matches('a[data-nav]') 
                    ? event.target 
                    : event.target.closest('a[data-nav]');
                
                event.preventDefault();
                
                const view = navLink.getAttribute('data-nav');
                const params = navLink.getAttribute('data-params');
                
                this.navigateTo(view, params ? JSON.parse(params) : null);
            }
            
            // Manejar botones de logout
            if (event.target.matches('button[data-action="logout"]') || event.target.closest('button[data-action="logout"]')) {
                event.preventDefault();
                this.logout();
            }
        });
        
        // Evento para formulario de login
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                await this.login(username, password);
            });
        }
    },
    
    // Inicializa la vista actual basada en la ubicación
    initCurrentView() {
        // Determinar vista actual
        const path = window.location.pathname;
        
        if (path.includes('dashboard.html')) {
            this.loadView('dashboard');
        } else if (path.includes('persons.html')) {
            this.loadView('persons');
        } else if (path.includes('users.html')) {
            this.loadView('users');
        } else if (path.includes('roles.html')) {
            this.loadView('roles');
        } else if (path.includes('forms.html')) {
            this.loadView('forms');
        } else if (path.includes('modules.html')) {
            this.loadView('modules');
        } else {
            // Página de inicio (login)
            this.loadView('login');
        }
    },
    
    // Navega a una vista específica
    navigateTo(viewName, params = null) {
        console.log(`Navegando a: ${viewName}`, params);
        
        // Guardar parámetros
        this.state.viewParams = params;
        
        // Si es la vista de login, ir a index.html
        if (viewName === 'login') {
            window.location.href = '/index.html';
            return;
        }
        
        // Comprobar autenticación para vistas protegidas
        if (!this.state.isAuthenticated) {
            window.location.href = '/index.html';
            return;
        }
        
        // Navegar a la vista correspondiente
        switch (viewName) {
            case 'dashboard':
                window.location.href = '/views/dashboard.html';
                break;
            case 'persons':
                window.location.href = '/views/persons.html';
                break;
            case 'users':
                window.location.href = '/views/users.html';
                break;
            case 'roles':
                window.location.href = '/views/roles.html';
                break;
            case 'forms':
                window.location.href = '/views/forms.html';
                break;
            case 'modules':
                window.location.href = '/views/modules.html';
                break;
            default:
                console.error(`Vista desconocida: ${viewName}`);
                break;
        }
    },
    
    // Carga la vista actual
    async loadView(viewName, params = null) {
        console.log(`Cargando vista: ${viewName}`, params);
        
        this.state.currentView = viewName;
        
        if (params) {
            this.state.viewParams = params;
        }
        
        // Mostrar spinner de carga
        this.setLoading(true);
        
        try {
            // Cargar controlador específico de la vista
            switch (viewName) {
                case 'login':
                    // El login se maneja directamente en el index.html
                    break;
                case 'dashboard':
                    if (typeof DashboardController !== 'undefined') {
                        await DashboardController.init();
                    }
                    break;
                case 'persons':
                    if (typeof PersonController !== 'undefined') {
                        await PersonController.init();
                    }
                    break;
                case 'users':
                    if (typeof UserController !== 'undefined') {
                        await UserController.init();
                    }
                    break;
                case 'roles':
                    if (typeof RoleController !== 'undefined') {
                        await RoleController.init();
                    }
                    break;
                case 'modules':
                    if (typeof ModuleController !== 'undefined') {
                        await ModuleController.init();
                    }
                    break;
                default:
                    console.error(`Controlador no encontrado para la vista: ${viewName}`);
                    break;
            }
        } catch (error) {
            console.error(`Error al cargar vista ${viewName}:`, error);
            this.showError(`Error al cargar la vista: ${error.message}`);
        } finally {
            this.setLoading(false);
        }
    },
    
    // Proceso de login
    async login(username, password) {
        if (!username || !password) {
            this.showError('Por favor, ingrese usuario y contraseña');
            return;
        }
        
        this.setLoading(true);
        
        try {
            const user = await AuthService.login(username, password);
            
            this.state.currentUser = user;
            this.state.isAuthenticated = true;
            
            this.showSuccess('Inicio de sesión exitoso');
            
            // Redirigir al dashboard
            setTimeout(() => {
                this.navigateTo('dashboard');
            }, 500);
            
        } catch (error) {
            console.error('Error de inicio de sesión:', error);
            this.showError('Error de inicio de sesión: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    },
    
    // Proceso de logout
    async logout() {
        this.setLoading(true);
        
        try {
            await AuthService.logout();
            
            this.state.currentUser = null;
            this.state.isAuthenticated = false;
            
            // Redirigir al login
            window.location.href = '/index.html';
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            // Intentar limpiar de todos modos
            AuthService.clearAuth();
            window.location.href = '/index.html';
        } finally {
            this.setLoading(false);
        }
    },
    
    // Muestra un mensaje de error
    showError(message) {
        this.state.errorMessage = message;
        this.state.successMessage = null;
        
        Helpers.showError('Error', message);
        
        // Limpiar mensaje después de un tiempo
        setTimeout(() => {
            this.state.errorMessage = null;
        }, 5000);
    },
    
    // Muestra un mensaje de éxito
    showSuccess(message) {
        this.state.successMessage = message;
        this.state.errorMessage = null;
        
        Helpers.showMessage('Éxito', message);
        
        // Limpiar mensaje después de un tiempo
        setTimeout(() => {
            this.state.successMessage = null;
        }, 5000);
    },
    
    // Establece el estado de carga
    setLoading(loading) {
        this.state.loading = loading;
        
        const loadingSpinner = document.getElementById('loadingSpinner');
        if (loadingSpinner) {
            loadingSpinner.classList.toggle('d-none', !loading);
        }
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});