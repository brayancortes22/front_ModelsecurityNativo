/**
 * Controlador para la gestión de roles
 * Maneja la interacción del usuario con la vista de roles
 */

const RoleController = {
    // Referencia a elementos del DOM
    elements: {
        rolesContainer: null,
        rolesList: null,
        roleForm: null,
        roleFormTitle: null,
        btnNewRole: null,
        btnSaveRole: null,
        btnCancelRole: null,
        roleFormMsg: null,
        searchRoleInput: null
    },
    
    // Estado del controlador
    state: {
        roles: [],
        currentRole: null,
        editMode: false
    },
    
    /**
     * Inicializa el controlador
     */
    async init() {
        this.cacheElements();
        this.bindEvents();
        await this.loadRoles();
        this.renderRolesList();
    },
    
    /**
     * Almacena referencias a elementos del DOM
     */
    cacheElements() {
        const container = document.getElementById('rolesView');
        if (!container) return;
        
        this.elements.rolesContainer = container;
        this.elements.rolesList = container.querySelector('#rolesList');
        this.elements.roleForm = container.querySelector('#roleForm');
        this.elements.roleFormTitle = container.querySelector('#roleFormTitle');
        this.elements.btnNewRole = container.querySelector('#btnNewRole');
        this.elements.btnSaveRole = container.querySelector('#btnSaveRole');
        this.elements.btnCancelRole = container.querySelector('#btnCancelRole');
        this.elements.roleFormMsg = container.querySelector('#roleFormMsg');
        this.elements.searchRoleInput = container.querySelector('#searchRole');
    },
    
    /**
     * Vincula eventos a elementos del DOM
     */
    bindEvents() {
        if (!this.elements.rolesContainer) return;
        
        // Evento para crear un nuevo rol
        this.elements.btnNewRole.addEventListener('click', () => this.showRoleForm());
        
        // Evento para guardar un rol
        this.elements.roleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRole();
        });
        
        // Evento para cancelar la edición
        this.elements.btnCancelRole.addEventListener('click', () => this.cancelRoleEdit());
        
        // Evento para buscar roles
        if (this.elements.searchRoleInput) {
            this.elements.searchRoleInput.addEventListener('input', (e) => {
                this.filterRoles(e.target.value);
            });
        }
    },
    
    /**
     * Carga la lista de roles desde la API
     */
    async loadRoles() {
        try {
            Helpers.showLoading();
            this.state.roles = await RoleService.getAllRoles();
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cargar los roles', error.message);
            console.error('Error loading roles:', error);
        }
    },
    
    /**
     * Renderiza la lista de roles
     */
    renderRolesList() {
        if (!this.elements.rolesList) return;
        
        this.elements.rolesList.innerHTML = '';
        
        if (this.state.roles.length === 0) {
            this.elements.rolesList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay roles disponibles</td>
                </tr>
            `;
            return;
        }
        
        this.state.roles.forEach(role => {
            const tr = document.createElement('tr');
            tr.className = role.active ? '' : 'table-secondary';
            
            tr.innerHTML = `
                <td>${role.id}</td>
                <td>${Helpers.escapeHtml(role.typeRol)}</td>
                <td>${Helpers.escapeHtml(role.description || '')}</td>
                <td>
                    <span class="badge ${role.active ? 'bg-success' : 'bg-danger'}">
                        ${role.active ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-edit" data-id="${role.id}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${role.active 
                            ? `<button class="btn btn-outline-warning btn-deactivate" data-id="${role.id}" title="Desactivar">
                                <i class="bi bi-toggle-off"></i>
                              </button>`
                            : `<button class="btn btn-outline-success btn-activate" data-id="${role.id}" title="Activar">
                                <i class="bi bi-toggle-on"></i>
                              </button>`
                        }
                        <button class="btn btn-outline-danger btn-delete" data-id="${role.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-outline-info btn-forms" data-id="${role.id}" title="Formularios">
                            <i class="bi bi-file-earmark-text"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Agregar event listeners a los botones
            const editBtn = tr.querySelector('.btn-edit');
            const activateBtn = tr.querySelector('.btn-activate');
            const deactivateBtn = tr.querySelector('.btn-deactivate');
            const deleteBtn = tr.querySelector('.btn-delete');
            const formsBtn = tr.querySelector('.btn-forms');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editRole(role.id));
            }
            
            if (activateBtn) {
                activateBtn.addEventListener('click', () => this.toggleRoleStatus(role.id, true));
            }
            
            if (deactivateBtn) {
                deactivateBtn.addEventListener('click', () => this.toggleRoleStatus(role.id, false));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteRole(role.id));
            }
            
            if (formsBtn) {
                formsBtn.addEventListener('click', () => this.manageRoleForms(role.id));
            }
            
            this.elements.rolesList.appendChild(tr);
        });
    },
    
    /**
     * Filtra la lista de roles según el texto de búsqueda
     * @param {string} searchText - Texto de búsqueda
     */
    filterRoles(searchText) {
        if (!this.elements.rolesList) return;
        
        const rows = this.elements.rolesList.querySelectorAll('tr');
        
        rows.forEach(row => {
            const roleText = row.textContent.toLowerCase();
            const match = roleText.includes(searchText.toLowerCase());
            row.style.display = match ? '' : 'none';
        });
    },
    
    /**
     * Muestra el formulario para crear un nuevo rol
     */
    showRoleForm(roleData = null) {
        if (!this.elements.roleForm) return;
        
        this.state.editMode = !!roleData;
        this.state.currentRole = roleData;
        
        // Restablecer formulario
        this.elements.roleForm.reset();
        this.elements.roleFormMsg.textContent = '';
        
        // Establecer título según modo
        this.elements.roleFormTitle.textContent = this.state.editMode ? 'Editar Rol' : 'Nuevo Rol';
        
        // Completar datos si está en modo edición
        if (this.state.editMode && roleData) {
            this.elements.roleForm.elements['typeRol'].value = roleData.typeRol || '';
            this.elements.roleForm.elements['description'].value = roleData.description || '';
            this.elements.roleForm.elements['active'].checked = roleData.active;
        } else {
            // En modo creación, establecer activo por defecto
            this.elements.roleForm.elements['active'].checked = true;
        }
        
        // Mostrar formulario
        this.elements.roleForm.classList.remove('d-none');
        this.elements.rolesList.closest('.card').classList.add('d-none');
        this.elements.btnNewRole.classList.add('d-none');
    },
    
    /**
     * Cancela la edición de un rol
     */
    cancelRoleEdit() {
        if (!this.elements.roleForm) return;
        
        this.elements.roleForm.classList.add('d-none');
        this.elements.rolesList.closest('.card').classList.remove('d-none');
        this.elements.btnNewRole.classList.remove('d-none');
        
        this.state.editMode = false;
        this.state.currentRole = null;
    },
    
    /**
     * Edita un rol existente
     * @param {number} id - ID del rol a editar
     */
    async editRole(id) {
        try {
            Helpers.showLoading();
            const role = await RoleService.getRoleById(id);
            Helpers.hideLoading();
            
            this.showRoleForm(role);
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cargar el rol', error.message);
            console.error('Error loading role for edit:', error);
        }
    },
    
    /**
     * Guarda un rol (nuevo o existente)
     */
    async saveRole() {
        if (!this.elements.roleForm) return;
        
        try {
            // Validar formulario
            if (!this.validateRoleForm()) {
                return;
            }
            
            // Obtener datos del formulario
            const roleData = {
                typeRol: this.elements.roleForm.elements['typeRol'].value,
                description: this.elements.roleForm.elements['description'].value,
                active: this.elements.roleForm.elements['active'].checked
            };
            
            Helpers.showLoading();
            
            // En modo edición, incluir el ID
            if (this.state.editMode && this.state.currentRole) {
                roleData.id = this.state.currentRole.id;
                await RoleService.updateRole(this.state.currentRole.id, roleData);
                Helpers.showMessage('Rol actualizado', 'El rol se ha actualizado correctamente');
            } else {
                await RoleService.createRole(roleData);
                Helpers.showMessage('Rol creado', 'El rol se ha creado correctamente');
            }
            
            // Recargar roles y mostrar lista
            await this.loadRoles();
            this.renderRolesList();
            this.cancelRoleEdit();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al guardar el rol', error.message);
            console.error('Error saving role:', error);
        }
    },
    
    /**
     * Valida el formulario de rol antes de enviar
     * @returns {boolean} True si la validación es exitosa
     */
    validateRoleForm() {
        if (!this.elements.roleForm) return false;
        
        const typeRol = this.elements.roleForm.elements['typeRol'].value.trim();
        
        if (!typeRol) {
            this.elements.roleFormMsg.textContent = 'El tipo de rol es obligatorio';
            this.elements.roleFormMsg.classList.remove('d-none');
            return false;
        }
        
        this.elements.roleFormMsg.textContent = '';
        this.elements.roleFormMsg.classList.add('d-none');
        return true;
    },
    
    /**
     * Cambia el estado de un rol (activo/inactivo)
     * @param {number} id - ID del rol
     * @param {boolean} active - Nuevo estado
     */
    async toggleRoleStatus(id, active) {
        try {
            Helpers.showLoading();
            
            if (active) {
                await RoleService.activateRole(id);
                Helpers.showMessage('Rol activado', 'El rol se ha activado correctamente');
            } else {
                await RoleService.deactivateRole(id);
                Helpers.showMessage('Rol desactivado', 'El rol se ha desactivado correctamente');
            }
            
            // Recargar roles y actualizar vista
            await this.loadRoles();
            this.renderRolesList();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cambiar el estado del rol', error.message);
            console.error('Error toggling role status:', error);
        }
    },
    
    /**
     * Elimina un rol
     * @param {number} id - ID del rol a eliminar
     */
    async deleteRole(id) {
        // Confirmación antes de eliminar
        if (!confirm('¿Está seguro de eliminar este rol? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            Helpers.showLoading();
            await RoleService.deleteRole(id);
            
            Helpers.showMessage('Rol eliminado', 'El rol se ha eliminado correctamente');
            
            // Recargar roles y actualizar vista
            await this.loadRoles();
            this.renderRolesList();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al eliminar el rol', error.message);
            console.error('Error deleting role:', error);
        }
    },
    
    /**
     * Muestra la gestión de formularios para un rol
     * @param {number} id - ID del rol
     */
    async manageRoleForms(id) {
        // Esta función se implementaría para mostrar y gestionar 
        // los formularios asignados a un rol
        alert('Gestión de formularios para el rol con ID: ' + id + ' (funcionalidad en desarrollo)');
    }
};