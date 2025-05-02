/**
 * Controlador para el Dashboard
 * Muestra estadísticas y actividad reciente del sistema
 */

const DashboardController = {
    // Elementos del DOM
    elements: {
        totalUsers: null,
        totalPersons: null,
        totalRoles: null,
        totalModules: null,
        currentUserName: null,
        currentUserRole: null,
        currentUserEmail: null,
        currentUserLastLogin: null,
        recentActivityList: null,
        refreshButton: null,
        viewAllActivityButton: null,
        viewContainer: null, // Añadimos esta propiedad para manejar el contenedor de vistas
        logoutButton: null // Añadimos esta propiedad para manejar el botón de cerrar sesión
    },
    
    // Control de estado para evitar inicializaciones y cargas repetitivas
    isInitialized: false,
    isLoadingData: false,
    lastDataLoad: 0,
    dataRefreshInterval: 60000, // 1 minuto entre actualizaciones automáticas
    _eventsConfigured: false,
    
    /**
     * Inicializa el controlador del dashboard
     */
    async init() {
        console.log('Inicializando Dashboard Controller');
        
        // Si ya está inicializado, solo actualizar datos si es necesario
        if (this.isInitialized) {
            console.log('Dashboard ya inicializado, omitiendo inicialización');
            
            // Solo actualizar datos si ha pasado el intervalo definido
            const now = Date.now();
            if (now - this.lastDataLoad > this.dataRefreshInterval) {
                this.loadDashboardData();
            }
            return;
        }
        
        // Obtener referencias a elementos del DOM
        this.elements.totalUsers = document.getElementById('totalUsers');
        this.elements.totalPersons = document.getElementById('totalPersons');
        this.elements.totalRoles = document.getElementById('totalRoles');
        this.elements.totalModules = document.getElementById('totalModules');
        this.elements.currentUserName = document.getElementById('currentUserName');
        this.elements.currentUserRole = document.getElementById('currentUserRole');
        this.elements.currentUserEmail = document.getElementById('currentUserEmail');
        this.elements.currentUserLastLogin = document.getElementById('currentUserLastLogin');
        this.elements.recentActivityList = document.getElementById('recentActivityList');
        this.elements.refreshButton = document.getElementById('refreshDashboard');
        this.elements.viewAllActivityButton = document.getElementById('viewAllActivity');
        this.elements.viewContainer = document.getElementById('viewContainer');
        this.elements.logoutButton = document.getElementById('btnLogoutDashboard');
        
        // Inicializar AppController si existe, sólo una vez
        if (typeof AppController !== 'undefined' && AppController !== null && !AppController.elements.viewContainer) {
            try {
                console.log('Inicializando AppController desde DashboardController');
                
                // Asegurarnos de que AppController tenga sus elementos inicializados
                if (!AppController.init) {
                    console.warn('AppController no tiene método init');
                } else {
                    // Llamamos al método init de AppController para asegurar la inicialización de sus elementos
                    AppController.init();
                    console.log('AppController inicializado correctamente desde DashboardController');
                }
            } catch (error) {
                console.error('Error al inicializar AppController desde DashboardController:', error);
            }
        }
        
        // Configurar eventos
        if (this.elements.refreshButton) {
            this.elements.refreshButton.addEventListener('click', () => {
                // Invalidar caché al solicitar actualización manual
                CacheService.invalidateAll(); 
                this.loadDashboardData();
            });
        }
        
        if (this.elements.viewAllActivityButton) {
            this.elements.viewAllActivityButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Ver todas las actividades...');
                // Aquí podríamos abrir un modal con el historial completo
            });
        }
        
        // Configurar botón de cerrar sesión
        if (this.elements.logoutButton) {
            this.elements.logoutButton.addEventListener('click', this.handleLogout.bind(this));
        }
        
        // Configurar eventos para los enlaces de navegación (una sola vez)
        this.setupNavigationEvents();
        
        // Cargar datos del dashboard
        await this.loadDashboardData();
        
        // Marcar como inicializado
        this.isInitialized = true;
    },
    
    /**
     * Configura los eventos de navegación para los botones "Ver detalles"
     */
    setupNavigationEvents() {
        console.log('Reconfigurando eventos de navegación');

        // Configurar todos los elementos con data-view para la navegación
        document.querySelectorAll('[data-view]').forEach(element => {
            // Remover cualquier listener previo para evitar duplicados
            element.removeEventListener('click', this._navigationHandler);

            // Usar una función nombrada para poder removerla después si es necesario
            this._navigationHandler = (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                console.log('DashboardController: Navegando a vista:', view);

                // Verificar si AppController está disponible
                if (typeof AppController !== 'undefined' && AppController !== null) {
                    AppController.loadView(view);
                } else {
                    console.warn('AppController no está disponible, usando navegación alternativa');
                    this.fallbackNavigation(view);
                }
            };

            element.addEventListener('click', this._navigationHandler);
        });

        console.log('Eventos de navegación reconfigurados correctamente');
    },
    
    /**
     * Manejador de eventos para la navegación
     */
    handleNavigation(e) {
        e.preventDefault();
        const view = e.currentTarget.getAttribute('data-view');
        console.log('DashboardController: Navegando a vista:', view);
        
        // Verificar si estamos en el contexto de una SPA o una navegación tradicional
        if (typeof AppController !== 'undefined' && AppController !== null) {
            try {
                // Verificar el estado actual del AppController
                if (!AppController.elements || !AppController.elements.viewContainer) {
                    console.log('viewContainer no está inicializado en AppController, intentando reinicializarlo');
                    
                    // Reintentar inicializar el AppController
                    if (typeof AppController.init === 'function') {
                        AppController.init();
                    } else {
                        // Inicialización manual como fallback
                        AppController.elements = AppController.elements || {};
                        AppController.elements.viewContainer = document.getElementById('viewContainer');
                    }
                    
                    // Verificar si la inicialización fue exitosa
                    if (!AppController.elements.viewContainer) {
                        throw new Error('No se pudo inicializar el viewContainer en AppController');
                    }
                }
                
                // Agregar logs de debug para ayudar a diagnosticar el problema
                console.log('Estado antes de navegar:', {
                    'AppController.elements': AppController.elements,
                    'AppController.elements.viewContainer': AppController.elements.viewContainer,
                    'AppController.loadView': typeof AppController.loadView
                });
                
                // Navegación SPA con AppController
                if (typeof AppController.loadView === 'function') {
                    AppController.loadView(view);
                } else {
                    throw new Error('AppController.loadView no es una función');
                }
            } catch (error) {
                console.error('Error al intentar navegar con AppController:', error);
                // Mostrar mensaje de error en consola y UI para ayudar en la depuración
                console.warn('Intentando navegación alternativa...');
                Helpers.showError('Error de navegación: ' + error.message);
                
                // Fallback a navegación directa
                this.fallbackNavigation(view);
            }
        } else {
            // Navegación tradicional si AppController no está disponible
            console.warn('AppController no está disponible, usando navegación tradicional');
            this.fallbackNavigation(view);
        }
    },
    
    /**
     * Navegación alternativa cuando AppController no está disponible
     */
    fallbackNavigation(view) {
        console.log('Realizando navegación directa a:', view);
        try {
            // Determinar la ruta base según la ubicación actual
            const currentPath = window.location.pathname;
            
            // Verificar si ya estamos en la carpeta views o en una subcarpeta
            let viewUrl;
            if (currentPath.includes('/views/')) {
                // Si ya estamos en views, usar una ruta relativa al mismo nivel
                viewUrl = `./${view}.html`;
            } else if (currentPath.endsWith('/') || currentPath.endsWith('/index.html')) {
                // Si estamos en la raíz o en index.html
                viewUrl = `./views/${view}.html`;
            } else {
                // En cualquier otro caso, asumir que necesitamos ir hacia arriba y luego a views
                viewUrl = `./views/${view}.html`;
            }
            
            console.log(`Redirigiendo a: ${viewUrl}`);
            window.location.href = viewUrl;
        } catch (error) {
            console.error('Error al navegar a', view, error);
            alert(`No se pudo navegar a ${view}: ${error.message}`);
        }
    },
    
    /**
     * Carga los datos del dashboard (estadísticas y actividad reciente)
     */
    async loadDashboardData() {
        // Evitar múltiples cargas simultáneas
        if (this.isLoadingData) {
            console.log('Ya hay una carga de datos en progreso, ignorando solicitud');
            return;
        }
        
        try {
            this.isLoadingData = true;
            Helpers.toggleSpinner(true);
            
            // Cargar información del usuario actual
            this.loadCurrentUserInfo();
            
            // Cargar estadísticas
            await this.loadStatistics();
            
            // Cargar actividad reciente
            await this.loadRecentActivity();
            
            // Registrar el momento de la última carga
            this.lastDataLoad = Date.now();
            
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
            Helpers.showError('Error al cargar el dashboard: ' + error.message);
        } finally {
            this.isLoadingData = false;
            Helpers.toggleSpinner(false);
        }
    },
    
    /**
     * Carga la información del usuario actual
     */
    loadCurrentUserInfo() {
        try {
            const user = AuthService.getCurrentUser();
            
            if (user) {
                // Verificar que los elementos existan antes de usarlos
                if (this.elements.currentUserName) {
                    this.elements.currentUserName.textContent = user.username || 'Usuario';
                }
                
                if (this.elements.currentUserEmail) {
                    this.elements.currentUserEmail.textContent = `Email: ${user.email || 'No disponible'}`;
                }
                
                if (this.elements.currentUserRole) {
                    // Obtener información de roles (simulada por ahora)
                    this.elements.currentUserRole.textContent = `Rol: ${user.rol || 'Usuario estándar'}`;
                }
                
                if (this.elements.currentUserLastLogin) {
                    // Fecha de último acceso (simulada)
                    const now = new Date();
                    this.elements.currentUserLastLogin.textContent = `Último acceso: ${Helpers.formatDate(now)}`;
                }
            } else {
                if (this.elements.currentUserName) {
                    this.elements.currentUserName.textContent = 'Usuario no identificado';
                }
                if (this.elements.currentUserRole) {
                    this.elements.currentUserRole.textContent = 'Rol: No disponible';
                }
                if (this.elements.currentUserEmail) {
                    this.elements.currentUserEmail.textContent = 'Email: No disponible';
                }
                if (this.elements.currentUserLastLogin) {
                    this.elements.currentUserLastLogin.textContent = 'Último acceso: No disponible';
                }
            }
        } catch (error) {
            console.error('Error al cargar información del usuario:', error);
        }
    },
    
    /**
     * Carga las estadísticas del sistema desde la API
     */
    async loadStatistics() {
        try {
            // Inicializar contadores en cero
            let userCount = 0;
            let personCount = 0;
            let roleCount = 0;
            let moduleCount = 0;
            
            // Cargar datos con caché de forma paralela para mejor rendimiento
            const [users, persons, roles, modules] = await Promise.all([
                ApiService.getCached(API_CONFIG.ENDPOINTS.USER.BASE, {}, true, 30000), // 30 segundos
                ApiService.getCached(API_CONFIG.ENDPOINTS.PERSON.BASE, {}, true, 30000),
                ApiService.getCached(API_CONFIG.ENDPOINTS.ROL.BASE, {}, true, 30000),
                ApiService.getCached(API_CONFIG.ENDPOINTS.MODULE.BASE, {}, true, 30000)
            ]);
            
            // Calcular contadores
            userCount = Array.isArray(users) ? users.length : 0;
            personCount = Array.isArray(persons) ? persons.length : 0;
            roleCount = Array.isArray(roles) ? roles.length : 0;
            moduleCount = Array.isArray(modules) ? modules.length : 0;
            
            // Actualizar interfaz - verificar que los elementos existan
            if (this.elements.totalUsers) {
                this.elements.totalUsers.textContent = userCount;
            }
            
            if (this.elements.totalPersons) {
                this.elements.totalPersons.textContent = personCount;
            }
            
            if (this.elements.totalRoles) {
                this.elements.totalRoles.textContent = roleCount;
            }
            
            if (this.elements.totalModules) {
                this.elements.totalModules.textContent = moduleCount;
            }
            
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            this.showStatisticsError();
        }
    },
    
    /**
     * Muestra mensaje de error en los contadores de estadísticas
     */
    showStatisticsError() {
        // Verificar que los elementos existan antes de modificarlos
        if (this.elements.totalUsers) {
            this.elements.totalUsers.textContent = 'Error';
        }
        
        if (this.elements.totalPersons) {
            this.elements.totalPersons.textContent = 'Error';
        }
        
        if (this.elements.totalRoles) {
            this.elements.totalRoles.textContent = 'Error';
        }
        
        if (this.elements.totalModules) {
            this.elements.totalModules.textContent = 'Error';
        }
    },
    
    /**
     * Carga la actividad reciente del sistema
     */
    async loadRecentActivity() {
        try {
            // En un entorno real, esta sería una llamada API
            // Por ahora usamos datos de prueba
            
            // Simular carga
            await new Promise(resolve => setTimeout(resolve, 700));
            
            // Datos de prueba para actividad reciente
            const recentActivity = [
                {
                    date: new Date(),
                    user: 'admin',
                    action: 'CREATE',
                    table: 'Person',
                    details: 'Creación de nueva persona: Juan Pérez'
                },
                {
                    date: new Date(Date.now() - 3600000), // 1 hora atrás
                    user: 'supervisor',
                    action: 'UPDATE',
                    table: 'User',
                    details: 'Actualización de usuario: carlos123'
                },
                {
                    date: new Date(Date.now() - 7200000), // 2 horas atrás
                    user: 'admin',
                    action: 'DELETE',
                    table: 'UserRol',
                    details: 'Eliminación de rol para usuario: maría456'
                },
                {
                    date: new Date(Date.now() - 86400000), // 1 día atrás
                    user: 'operador',
                    action: 'CREATE',
                    table: 'Module',
                    details: 'Creación de nuevo módulo: Reportes'
                },
                {
                    date: new Date(Date.now() - 172800000), // 2 días atrás
                    user: 'admin',
                    action: 'UPDATE',
                    table: 'Rol',
                    details: 'Actualización de permisos para rol: Supervisor'
                }
            ];
            
            // Renderizar actividad
            this.renderRecentActivity(recentActivity);
            
        } catch (error) {
            console.error('Error al cargar actividad reciente:', error);
            
            if (this.elements.recentActivityList) {
                this.elements.recentActivityList.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger">
                            Error al cargar la actividad reciente
                        </td>
                    </tr>
                `;
            }
        }
    },
    
    /**
     * Renderiza la lista de actividad reciente
     * @param {Array} activities - Lista de actividades
     */
    renderRecentActivity(activities) {
        if (!this.elements.recentActivityList) return;
        
        // Limpiar lista actual
        this.elements.recentActivityList.innerHTML = '';
        
        // Si no hay actividades, mostrar mensaje
        if (!activities || activities.length === 0) {
            this.elements.recentActivityList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay actividad reciente</td>
                </tr>
            `;
            return;
        }
        
        // Renderizar cada actividad
        activities.forEach(activity => {
            const row = document.createElement('tr');
            
            // Definir clase según el tipo de acción
            let actionClass = '';
            switch (activity.action) {
                case 'CREATE':
                    actionClass = 'text-success';
                    break;
                case 'UPDATE':
                    actionClass = 'text-primary';
                    break;
                case 'DELETE':
                    actionClass = 'text-danger';
                    break;
                default:
                    actionClass = 'text-secondary';
            }
            
            row.innerHTML = `
                <td>${Helpers.formatDate(activity.date)}</td>
                <td>${activity.user}</td>
                <td class="${actionClass}">${activity.action}</td>
                <td>${activity.table}</td>
                <td>${activity.details}</td>
            `;
            
            this.elements.recentActivityList.appendChild(row);
        });
    },

    /**
     * Maneja el evento de cierre de sesión
     */
    async handleLogout() {
        try {
            console.log('Cerrando sesión desde el dashboard...');
            Helpers.showLoading();
            
            // Utilizar el servicio de autenticación para cerrar sesión
            if (typeof AuthController !== 'undefined' && AuthController.handleLogout) {
                // Si AuthController está disponible, usar su método
                await AuthController.handleLogout();
            } else {
                // Si no, implementar la lógica directamente
                await AuthService.logout();
                
                // Redirigir al usuario a la página de login
                window.location.href = '../index.html';
            }
            
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            Helpers.showError('Error al cerrar sesión: ' + error.message);
            Helpers.hideLoading();
        }
    },
};