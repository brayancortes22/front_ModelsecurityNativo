/**
 * Controlador principal de la aplicación
 * Gestiona la navegación y carga de vistas
 */

const AppController = {
    // Vista actual
    currentView: null,
    
    // Historial de navegación
    navigationHistory: [],
    
    // Elementos del DOM
    elements: {
        viewContainer: null,
        navLinks: null,
        userInfo: null,
        logoutButton: null,
    },
    
    /**
     * Inicializa el controlador de la aplicación
     */
    init() {
        console.log('Inicializando AppController...');
        this.elements.viewContainer = document.getElementById('viewContainer');
        
        // Verificar si el viewContainer existe
        if (!this.elements.viewContainer) {
            console.warn('No se encontró el elemento viewContainer en el DOM');
            // Intentar buscar por selector alternativo - puede haber un contenedor con otra clase o ID
            const alternativeContainer = document.querySelector('.view-container') || 
                                       document.querySelector('main .container') ||
                                       document.querySelector('main');
            
            if (alternativeContainer) {
                console.log('Se encontró un contenedor alternativo:', alternativeContainer);
                this.elements.viewContainer = alternativeContainer;
            }
        } else {
            console.log('viewContainer inicializado correctamente');
        }
        
        this.elements.navLinks = document.querySelectorAll('.nav-link[data-view]');
        this.elements.userInfo = document.getElementById('currentUser');
        this.elements.logoutButton = document.getElementById('btnLogout');
        
        // Evento para enlaces de navegación
        if (this.elements.navLinks) {
            this.elements.navLinks.forEach(link => {
                // Eliminar cualquier listener previo para evitar duplicados
                link.removeEventListener('click', this.handleNavigation);
                // Usar una función flecha para mantener el contexto 'this' correcto
                link.addEventListener('click', (e) => this.handleNavigation(e));
            });
        }
        
        // Evento para botón de cerrar sesión - verificar que el elemento existe
        if (this.elements.logoutButton) {
            this.elements.logoutButton.addEventListener('click', () => {
                AuthController.handleLogout();
            });
        }
        
        // Comprobar autenticación al iniciar
        this.checkAuth();
    },
    
    /**
     * Maneja la navegación desde enlaces del menú
     */
    handleNavigation(e) {
        e.preventDefault();
        const view = e.target.getAttribute('data-view');
        console.log('AppController: Navegando a vista:', view);
        this.loadView(view);
    },
    
    /**
     * Comprueba si el usuario está autenticado y muestra la vista correspondiente
     */
    async checkAuth() {
        const isLoggedIn = AuthService.isAuthenticated();

        if (isLoggedIn) {
            try {
                // Verificar que el token sea válido
                const isTokenValid = await AuthService.validateToken();

                if (isTokenValid) {
                    this.updateUserInfo();
                    // Cargar vista inicial para usuario autenticado
                    this.loadView(CONSTANTS.VIEWS.DASHBOARD);
                    return;
                } else {
                    console.warn('Token inválido, redirigiendo al login');
                }
            } catch (error) {
                console.error('Error al validar el token:', error);
            }
        }

        // Usuario no autenticado o token inválido
        console.warn('Usuario no autenticado, redirigiendo al login');
        AuthService.clearAuth();
        this.loadView(CONSTANTS.VIEWS.LOGIN);
    },
    
    /**
     * Actualiza la información del usuario en la interfaz
     */
    updateUserInfo() {
        const user = AuthService.getCurrentUser();
        
        if (user) {
            // Verificar que los elementos existan antes de modificarlos
            if (this.elements.userInfo) {
                this.elements.userInfo.textContent = user.username || 'Usuario';
            }
            
            if (this.elements.logoutButton) {
                this.elements.logoutButton.classList.remove('d-none');
            }
            
            // Mostrar barra de navegación
            document.querySelectorAll('.navbar-nav').forEach(nav => {
                nav.classList.remove('d-none');
            });
        } else {
            if (this.elements.userInfo) {
                this.elements.userInfo.textContent = 'Usuario no autenticado';
            }
            
            if (this.elements.logoutButton) {
                this.elements.logoutButton.classList.add('');
            }
            
            // Ocultar barra de navegación
            document.querySelectorAll('.navbar-nav').forEach(nav => {
                nav.classList.add('');
            });
        }
    },
    
    /**
     * Carga una vista específica en el contenedor principal
     * @param {string} viewName - Nombre de la vista a cargar
     */
    async loadView(viewName) {
        if (this.currentView === viewName) return;
        
        // Si no es la vista de login, verificar autenticación
        if (viewName !== CONSTANTS.VIEWS.LOGIN && !AuthService.isAuthenticated()) {
            this.loadView(CONSTANTS.VIEWS.LOGIN);
            return;
        }
        
        try {
            Helpers.toggleSpinner(true);
            
            // Verificar si el viewContainer está inicializado
            if (!this.elements.viewContainer) {
                console.warn('viewContainer no está inicializado, intentando encontrarlo nuevamente');
                this.elements.viewContainer = document.getElementById('viewContainer');
                
                if (!this.elements.viewContainer) {
                    // Intentar buscar por selector alternativo
                    const alternativeContainer = document.querySelector('.view-container') || 
                                              document.querySelector('main .container') ||
                                              document.querySelector('main');
                    
                    if (alternativeContainer) {
                        console.log('Se encontró un contenedor alternativo:', alternativeContainer);
                        this.elements.viewContainer = alternativeContainer;
                    } else {
                        throw new Error('No se pudo encontrar el contenedor de vistas en la página actual');
                    }
                }
            }
            
            // Guardar vista actual en el historial si existe
            if (this.currentView && this.currentView !== CONSTANTS.VIEWS.LOGIN) {
                this.navigationHistory.push(this.currentView);
                // Limitar el historial a 10 entradas para evitar que crezca demasiado
                if (this.navigationHistory.length > 10) {
                    this.navigationHistory.shift();
                }
                console.log('Historial de navegación actualizado:', this.navigationHistory);
            }
            
            // Limpiar contenedor de vista
            this.elements.viewContainer.innerHTML = '';
            
            // Cargar template de la vista
            const viewTemplate = await this.fetchViewTemplate(viewName);
            this.elements.viewContainer.innerHTML = viewTemplate;
            
            // Actualizar enlaces activos
            this.updateActiveNavLink(viewName);
            
            // Inicializar controlador específico de la vista
            await this.initViewController(viewName);
            
            // Actualizar vista actual
            this.currentView = viewName;
            
            // Configurar los botones de volver atrás si existen
            this.setupBackButtons();
        } catch (error) {
            console.error('Error al cargar la vista:', error);
            Helpers.showError('Error al cargar la vista: ' + error.message);
        } finally {
            Helpers.toggleSpinner(false);
        }
    },
    
    /**
     * Configura los botones de volver atrás en la vista actual
     */
    setupBackButtons() {
        const backButtons = document.querySelectorAll('.btn-back');
        backButtons.forEach(button => {
            // Remover cualquier listener previo para evitar duplicados
            button.removeEventListener('click', this._backButtonHandler);

            // Usar una función nombrada para poder removerla después si es necesario
            this._backButtonHandler = () => {
                // Recargar la página para reinicializar todo
                window.location.reload();
            };

            button.addEventListener('click', this._backButtonHandler);
        });
    },
    
    /**
     * Navega a la vista anterior en el historial
     */
    goBack() {
        if (this.navigationHistory.length > 0) {
            const previousView = this.navigationHistory.pop();
            console.log('Volviendo a la vista anterior:', previousView);
            // Cargar vista anterior sin añadirla al historial
            this.loadViewWithoutHistory(previousView);
        } else {
            console.log('No hay historial para volver atrás, redirigiendo al dashboard');
            this.loadView(CONSTANTS.VIEWS.DASHBOARD);
        }
    },
    
    /**
     * Carga una vista sin añadirla al historial de navegación
     * @param {string} viewName - Nombre de la vista a cargar
     */
    async loadViewWithoutHistory(viewName) {
        const tempHistory = [...this.navigationHistory];
        this.navigationHistory = []; // Temporalmente vaciar el historial
        
        try {
            Helpers.toggleSpinner(true);
            
            // Limpiar contenedor de vista
            this.elements.viewContainer.innerHTML = '';
            
            // Cargar template de la vista
            const viewTemplate = await this.fetchViewTemplate(viewName);
            this.elements.viewContainer.innerHTML = viewTemplate;
            
            // Actualizar enlaces activos
            this.updateActiveNavLink(viewName);
            
            // Inicializar controlador específico de la vista
            await this.initViewController(viewName);
            
            // Actualizar vista actual
            this.currentView = viewName;
            
            // Configurar los botones de volver atrás si existen
            this.setupBackButtons();
        } catch (error) {
            console.error('Error al cargar la vista:', error);
            Helpers.showError('Error al cargar la vista: ' + error.message);
        } finally {
            Helpers.toggleSpinner(false);
            // Restaurar el historial sin la última entrada
            this.navigationHistory = tempHistory;
        }
    },
    
    /**
     * Obtiene la plantilla HTML para una vista
     * @param {string} viewName - Nombre de la vista
     * @returns {Promise<string>} HTML de la vista
     */
    async fetchViewTemplate(viewName) {
        // Si es login, usamos el template que ya está en el HTML
        if (viewName === CONSTANTS.VIEWS.LOGIN) {
            const loginTemplate = document.getElementById('loginView').outerHTML;
            return loginTemplate;
        }
        
        // Para otras vistas, cargar desde archivos
        try {
            // Verificar si estamos en la ruta correcta
            const baseUrl = window.location.pathname.includes('/views/') 
                ? './' // Si ya estamos en /views/, usar ruta relativa
                : 'views/'; // Si no, usar la carpeta views
            
            const response = await fetch(`${baseUrl}${viewName}.html`);
            
            if (!response.ok) {
                throw new Error(`Error al cargar la vista ${viewName}`);
            }
            
            return await response.text();
        } catch (error) {
            console.error('Error al cargar template:', error);
            return `<div class="alert alert-danger">Error al cargar la vista ${viewName}</div>`;
        }
    },
    
    /**
     * Actualiza el enlace activo en la navegación
     * @param {string} viewName - Nombre de la vista actual
     */
    updateActiveNavLink(viewName) {
        // Quitar clase activa de todos los enlaces
        this.elements.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Añadir clase activa al enlace correspondiente
        const activeLink = document.querySelector(`.nav-link[data-view="${viewName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    },
    
    /**
     * Inicializa el controlador específico para una vista
     * @param {string} viewName - Nombre de la vista
     */
    async initViewController(viewName) {
        switch (viewName) {
            case CONSTANTS.VIEWS.LOGIN:
                AuthController.init();
                break;
            case CONSTANTS.VIEWS.DASHBOARD:
                if (typeof DashboardController !== 'undefined') {
                    await DashboardController.init();
                }
                break;
            case CONSTANTS.VIEWS.USERS:
                if (typeof UserController !== 'undefined') {
                    UserController.init();
                }
                break;
            case CONSTANTS.VIEWS.PERSONS:
                if (typeof PersonController !== 'undefined') {
                    PersonController.init();
                }
                break;
            case CONSTANTS.VIEWS.ROLES:
                if (typeof RoleController !== 'undefined') {
                    RoleController.init();
                }
                break;
            case CONSTANTS.VIEWS.MODULES:
                if (typeof ModuleController !== 'undefined') {
                    ModuleController.init();
                }
                break;
            default:
                console.warn(`No se encontró controlador para la vista: ${viewName}`);
        }
    }
};