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
        viewAllActivityButton: null
    },
    
    /**
     * Inicializa el controlador del dashboard
     */
    async init() {
        console.log('Inicializando Dashboard Controller');
        
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
        
        // Configurar eventos
        if (this.elements.refreshButton) {
            this.elements.refreshButton.addEventListener('click', () => this.loadDashboardData());
        }
        
        if (this.elements.viewAllActivityButton) {
            this.elements.viewAllActivityButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Ver todas las actividades...');
                // Aquí podríamos abrir un modal con el historial completo
            });
        }
        
        // Configurar eventos para los enlaces de navegación
        this.setupNavigationEvents();
        
        // Cargar datos del dashboard
        await this.loadDashboardData();
    },
    
    /**
     * Configura los eventos de navegación para los botones "Ver detalles"
     */
    setupNavigationEvents() {
        console.log('Configurando eventos de navegación');
        
        // Configurar todos los elementos con data-view para la navegación
        document.querySelectorAll('[data-view]').forEach(element => {
            // Usamos una función flecha para mantener el contexto 'this' correcto
            element.addEventListener('click', (e) => this.handleNavigation(e));
        });
    },
    
    /**
     * Manejador de eventos para la navegación
     */
    handleNavigation(e) {
        e.preventDefault();
        const view = e.currentTarget.getAttribute('data-view');
        console.log('Navegando a:', view);
        
        // Verificar si estamos en el contexto de una SPA o una navegación tradicional
        if (typeof AppController !== 'undefined' && AppController !== null) {
            // Navegación SPA con AppController
            AppController.loadView(view);
        } else {
            // Navegación tradicional si AppController no está disponible
            console.log('AppController no está definido, realizando navegación directa a:', view);
            try {
                // Redirigir directamente a la vista
                window.location.href = `${view}.html`;
            } catch (error) {
                console.error('Error al navegar a', view, error);
                alert(`No se pudo navegar a ${view}`);
            }
        }
    },
    
    /**
     * Carga los datos del dashboard (estadísticas y actividad reciente)
     */
    async loadDashboardData() {
        try {
            Helpers.toggleSpinner(true);
            
            // Cargar información del usuario actual
            this.loadCurrentUserInfo();
            
            // Cargar estadísticas
            await this.loadStatistics();
            
            // Cargar actividad reciente
            await this.loadRecentActivity();
            
            // Configurar nuevamente los eventos de navegación después de actualizar el DOM
            this.setupNavigationEvents();
            
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
            Helpers.showError('Error al cargar el dashboard: ' + error.message);
        } finally {
            Helpers.toggleSpinner(false);
        }
    },
    
    /**
     * Carga la información del usuario actual
     */
    loadCurrentUserInfo() {
        const user = AuthService.getCurrentUser();
        
        if (user) {
            this.elements.currentUserName.textContent = user.username || 'Usuario';
            this.elements.currentUserEmail.textContent = `Email: ${user.email || 'No disponible'}`;
            
            // Obtener información de roles (simulada por ahora)
            this.elements.currentUserRole.textContent = `Rol: ${user.rol || 'Usuario estándar'}`;
            
            // Fecha de último acceso (simulada)
            const now = new Date();
            this.elements.currentUserLastLogin.textContent = `Último acceso: ${Helpers.formatDate(now)}`;
        } else {
            this.elements.currentUserName.textContent = 'Usuario no identificado';
            this.elements.currentUserRole.textContent = 'Rol: No disponible';
            this.elements.currentUserEmail.textContent = 'Email: No disponible';
            this.elements.currentUserLastLogin.textContent = 'Último acceso: No disponible';
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
            
            // Obtener conteo de usuarios
            try {
                const users = await ApiService.get(API_CONFIG.ENDPOINTS.USER.BASE);
                userCount = Array.isArray(users) ? users.length : 0;
            } catch (error) {
                console.error('Error al obtener usuarios:', error);
            }
            
            // Obtener conteo de personas
            try {
                const persons = await ApiService.get(API_CONFIG.ENDPOINTS.PERSON.BASE);
                personCount = Array.isArray(persons) ? persons.length : 0;
            } catch (error) {
                console.error('Error al obtener personas:', error);
            }
            
            // Obtener conteo de roles
            try {
                const roles = await ApiService.get(API_CONFIG.ENDPOINTS.ROL.BASE);
                roleCount = Array.isArray(roles) ? roles.length : 0;
            } catch (error) {
                console.error('Error al obtener roles:', error);
            }
            
            // Obtener conteo de módulos
            try {
                const modules = await ApiService.get(API_CONFIG.ENDPOINTS.MODULE.BASE);
                moduleCount = Array.isArray(modules) ? modules.length : 0;
            } catch (error) {
                console.error('Error al obtener módulos:', error);
            }
            
            // Actualizar interfaz
            this.elements.totalUsers.textContent = userCount;
            this.elements.totalPersons.textContent = personCount;
            this.elements.totalRoles.textContent = roleCount;
            this.elements.totalModules.textContent = moduleCount;
            
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
            this.showStatisticsError();
        }
    },
    
    /**
     * Muestra mensaje de error en los contadores de estadísticas
     */
    showStatisticsError() {
        this.elements.totalUsers.textContent = 'Error';
        this.elements.totalPersons.textContent = 'Error';
        this.elements.totalRoles.textContent = 'Error';
        this.elements.totalModules.textContent = 'Error';
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
    }
};