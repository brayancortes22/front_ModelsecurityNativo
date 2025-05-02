/**
 * Controlador para la asignación de roles a usuarios
 */
const UserRoleAssignmentController = {
    // Elementos del DOM
    elements: {
        usersList: null,
        rolesList: null,
        assignedRolesList: null,
        selectedUserInfo: null,
        searchUser: null,
        searchRole: null,
        saveButton: null,
        removeRoleButton: null
    },

    // Estado del controlador
    state: {
        users: [],
        roles: [],
        userRoles: [], // Roles asignados al usuario seleccionado
        selectedUser: null,
        selectedRole: null,
        selectedAssignedRole: null // Para el rol seleccionado en la lista de roles asignados
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
        this.elements.assignedRolesList = document.getElementById('assignedRolesList');
        this.elements.selectedUserInfo = document.getElementById('selectedUserInfo');
        this.elements.searchUser = document.getElementById('searchUser');
        this.elements.searchRole = document.getElementById('searchRole');
        this.elements.saveButton = document.getElementById('btnSaveAssignment');
        this.elements.removeRoleButton = document.getElementById('btnRemoveRole');
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

        // Evento para eliminar rol asignado
        this.elements.removeRoleButton?.addEventListener('click', () => {
            this.removeAssignedRole();
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
     * Carga los roles asignados al usuario seleccionado
     */
    async loadUserRoles(userId) {
        try {
            this.state.userRoles = await UserService.getUserRoles(userId);
            this.renderAssignedRolesList();
        } catch (error) {
            console.error(`Error al cargar roles del usuario con ID ${userId}:`, error);
            Helpers.showError('Error', 'No se pudieron cargar los roles del usuario: ' + error.message);
            this.state.userRoles = [];
            this.renderAssignedRolesList();
        }
    },

    /**
     * Renderiza las listas de usuarios y roles
     */
    renderLists() {
        this.renderUsersList();
        this.renderRolesList();
        this.renderAssignedRolesList();
    },

    /**
     * Renderiza la lista de usuarios
     */
    renderUsersList() {
        if (!this.elements.usersList) return;

        this.elements.usersList.innerHTML = '';

        if (this.state.users.length === 0) {
            this.elements.usersList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-exclamation-circle text-muted"></i>
                    <p class="text-muted">No hay usuarios disponibles</p>
                </div>
            `;
            return;
        }

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
     * Renderiza la lista de roles disponibles
     */
    renderRolesList() {
        if (!this.elements.rolesList) return;

        this.elements.rolesList.innerHTML = '';

        if (this.state.roles.length === 0) {
            this.elements.rolesList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-exclamation-circle text-muted"></i>
                    <p class="text-muted">No hay roles disponibles</p>
                </div>
            `;
            return;
        }

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
     * Renderiza la lista de roles asignados al usuario
     */
    renderAssignedRolesList() {
        if (!this.elements.assignedRolesList) return;

        this.elements.assignedRolesList.innerHTML = '';

        // Si no hay usuario seleccionado
        if (!this.state.selectedUser) {
            this.elements.assignedRolesList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-info-circle text-muted"></i>
                    <p class="text-muted">No hay usuario seleccionado</p>
                </div>
            `;
            return;
        }

        // Si no tiene roles asignados
        if (!this.state.userRoles || this.state.userRoles.length === 0) {
            this.elements.assignedRolesList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-exclamation-circle text-muted"></i>
                    <p class="text-muted">Este usuario no tiene roles asignados</p>
                </div>
            `;
            return;
        }

        // Mostrar los roles asignados
        this.state.userRoles.forEach(userRole => {
            const role = this.findRoleById(userRole.rolId);
            if (!role) return; // Si no se encuentra el rol, saltamos

            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            if (this.state.selectedAssignedRole?.id === userRole.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${Helpers.escapeHtml(role.typeRol)}</h6>
                    <small><span class="badge bg-info">ID: ${userRole.id}</span></small>
                </div>
                <small>${Helpers.escapeHtml(role.description || 'Sin descripción')}</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAssignedRole(userRole, role);
            });

            this.elements.assignedRolesList.appendChild(item);
        });
    },

    /**
     * Encuentra un rol por su ID
     */
    findRoleById(rolId) {
        return this.state.roles.find(role => role.id === rolId);
    },

    /**
     * Selecciona un usuario
     */
    async selectUser(user) {
        this.state.selectedUser = user;
        
        // Actualizar la información del usuario seleccionado
        if (this.elements.selectedUserInfo) {
            this.elements.selectedUserInfo.textContent = `Usuario seleccionado: ${user.username}`;
        }
        
        // Cargar los roles del usuario
        await this.loadUserRoles(user.id);
        
        // Limpiar la selección de rol asignado
        this.state.selectedAssignedRole = null;
        
        this.renderLists();
        this.updateButtons();
    },

    /**
     * Selecciona un rol
     */
    selectRole(role) {
        this.state.selectedRole = role;
        this.renderLists();
        this.updateButtons();
    },

    /**
     * Selecciona un rol asignado
     */
    selectAssignedRole(userRole, role) {
        this.state.selectedAssignedRole = {
            ...userRole,
            rolInfo: role // Guardamos la información del rol para acceso rápido
        };
        this.renderLists();
        this.updateButtons();
    },

    /**
     * Actualiza el estado de los botones
     */
    updateButtons() {
        // Botón de asignar rol
        if (this.elements.saveButton) {
            const canAssign = this.state.selectedUser && this.state.selectedRole;
            this.elements.saveButton.disabled = !canAssign;
        }

        // Botón de eliminar rol
        if (this.elements.removeRoleButton) {
            this.elements.removeRoleButton.disabled = !this.state.selectedAssignedRole;
        }
    },

    /**
     * Filtra la lista de usuarios
     */
    filterUsers(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            // Si el término de búsqueda está vacío, cargar todos los usuarios nuevamente
            this.loadData();
            return;
        }
        
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
        if (!searchTerm || searchTerm.trim() === '') {
            // Si el término de búsqueda está vacío, cargar todos los roles nuevamente
            this.loadData();
            return;
        }
        
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

            // Comprobar si el rol ya está asignado al usuario
            const isAlreadyAssigned = this.state.userRoles.some(
                userRole => userRole.rolId === this.state.selectedRole.id
            );

            if (isAlreadyAssigned) {
                Helpers.hideLoading();
                Helpers.showError('Error', 'Este rol ya está asignado al usuario');
                return;
            }

            // Enviar directamente el objeto
            await UserService.assignRoles(this.state.selectedUser.id, assignmentData);

            Helpers.showMessage('Éxito', 'Rol asignado correctamente al usuario');
            
            // Recargar los roles del usuario
            await this.loadUserRoles(this.state.selectedUser.id);
            
            // Limpiar selección del rol
            this.state.selectedRole = null;
            this.renderLists();
            this.updateButtons();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al asignar rol:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudo asignar el rol: ' + error.message);
        }
    },

    /**
     * Elimina un rol asignado al usuario
     */
    async removeAssignedRole() {
        if (!this.state.selectedAssignedRole) {
            Helpers.showError('Error', 'Debe seleccionar un rol asignado para eliminar');
            return;
        }

        try {
            Helpers.showLoading();

            // Confirmar la eliminación
            if (!confirm(`¿Está seguro que desea quitar el rol "${this.state.selectedAssignedRole.rolInfo.typeRol}" del usuario "${this.state.selectedUser.username}"?`)) {
                Helpers.hideLoading();
                return;
            }

            // Eliminar el rol asignado
            await UserService.removeRole(this.state.selectedAssignedRole.id);

            Helpers.showMessage('Éxito', `Rol "${this.state.selectedAssignedRole.rolInfo.typeRol}" eliminado correctamente del usuario`);
            
            // Limpiar la selección del rol asignado
            this.state.selectedAssignedRole = null;
            
            // Recargar los roles del usuario
            await this.loadUserRoles(this.state.selectedUser.id);
            
            this.renderLists();
            this.updateButtons();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al eliminar rol asignado:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudo eliminar el rol asignado: ' + error.message);
        }
    }
};