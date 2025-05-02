/**
 * Controlador para la asignación de roles a usuarios
 */
const UserRoleAssignmentController = {
    // Elementos del DOM
    elements: {
        usersList: null,
        rolesList: null,
        searchUser: null,
        searchRole: null,
        saveButton: null
    },

    // Estado del controlador
    state: {
        users: [],
        roles: [],
        selectedUser: null,
        selectedRole: null,
    },

    /**
     * Inicializa el controlador
     */
    async init() {
        this.cacheElements();
        this.setupEventListeners();
        await this.loadData();
    },

    /**
     * Almacena referencias a elementos del DOM
     */
    cacheElements() {
        this.elements.usersList = document.getElementById('usersList');
        this.elements.rolesList = document.getElementById('rolesList');
        this.elements.searchUser = document.getElementById('searchUser');
        this.elements.searchRole = document.getElementById('searchRole');
        this.elements.saveButton = document.getElementById('btnSaveAssignment');
    },

    /**
     * Configura los escuchadores de eventos
     */
    setupEventListeners() {
        // Eventos de búsqueda
        this.elements.searchUser?.addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        this.elements.searchRole?.addEventListener('input', (e) => {
            this.filterRoles(e.target.value);
        });

        // Evento para guardar asignación
        this.elements.saveButton?.addEventListener('click', () => {
            this.saveAssignment();
        });
    },

    /**
     * Carga los datos iniciales (usuarios y roles)
     */
    async loadData() {
        try {
            Helpers.showLoading();

            // Cargar usuarios y roles en paralelo
            const [users, roles] = await Promise.all([
                UserService.getAll(),
                RoleService.getAll()
            ]);

            this.state.users = users;
            this.state.roles = roles;

            this.renderLists();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudieron cargar los datos: ' + error.message);
        }
    },

    /**
     * Renderiza las listas de usuarios y roles
     */
    renderLists() {
        this.renderUsersList();
        this.renderRolesList();
    },

    /**
     * Renderiza la lista de usuarios
     */
    renderUsersList() {
        if (!this.elements.usersList) return;

        this.elements.usersList.innerHTML = '';

        this.state.users.forEach(user => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            if (this.state.selectedUser?.id === user.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${Helpers.escapeHtml(user.username)}</h6>
                    <small>${user.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'}</small>
                </div>
                <small>${Helpers.escapeHtml(user.email)}</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectUser(user);
            });

            this.elements.usersList.appendChild(item);
        });
    },

    /**
     * Renderiza la lista de roles
     */
    renderRolesList() {
        if (!this.elements.rolesList) return;

        this.elements.rolesList.innerHTML = '';

        this.state.roles.forEach(role => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            if (this.state.selectedRole?.id === role.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${Helpers.escapeHtml(role.typeRol)}</h6>
                    <small>${role.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'}</small>
                </div>
                <small>${Helpers.escapeHtml(role.description || 'Sin descripción')}</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectRole(role);
            });

            this.elements.rolesList.appendChild(item);
        });
    },

    /**
     * Selecciona un usuario
     */
    selectUser(user) {
        this.state.selectedUser = user;
        this.renderLists();
        this.updateSaveButton();
    },

    /**
     * Selecciona un rol
     */
    selectRole(role) {
        this.state.selectedRole = role;
        this.renderLists();
        this.updateSaveButton();
    },

    /**
     * Actualiza el estado del botón de guardar
     */
    updateSaveButton() {
        if (this.elements.saveButton) {
            const canSave = this.state.selectedUser && this.state.selectedRole;
            this.elements.saveButton.disabled = !canSave;
        }
    },

    /**
     * Filtra la lista de usuarios
     */
    filterUsers(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filteredUsers = this.state.users.filter(user => 
            user.username.toLowerCase().includes(term) || 
            user.email.toLowerCase().includes(term)
        );
        
        this.state.users = filteredUsers;
        this.renderUsersList();
    },

    /**
     * Filtra la lista de roles
     */
    filterRoles(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filteredRoles = this.state.roles.filter(role => 
            role.typeRol.toLowerCase().includes(term) || 
            (role.description && role.description.toLowerCase().includes(term))
        );
        
        this.state.roles = filteredRoles;
        this.renderRolesList();
    },

    /**
     * Guarda la asignación de rol al usuario
     */
    async saveAssignment() {
        if (!this.state.selectedUser || !this.state.selectedRole) {
            Helpers.showError('Error', 'Debe seleccionar un usuario y un rol');
            return;
        }

        try {
            Helpers.showLoading();

            const assignmentData = {
                id: 0,
                userId: this.state.selectedUser.id,
                rolId: this.state.selectedRole.id
            };

            // Enviar directamente el objeto en lugar de un array
            await UserService.assignRoles(this.state.selectedUser.id, assignmentData);

            Helpers.showMessage('Éxito', 'Rol asignado correctamente al usuario');
            
            // Limpiar selección
            this.state.selectedUser = null;
            this.state.selectedRole = null;
            this.renderLists();
            this.updateSaveButton();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al asignar rol:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudo asignar el rol: ' + error.message);
        }
    }
};