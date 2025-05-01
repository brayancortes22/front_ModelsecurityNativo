/**
 * Controlador para la gestión de roles
 * Maneja todas las operaciones CRUD para roles y su relación con formularios
 */

const RoleController = {
    // Elementos del DOM
    elements: {
        rolesList: null,
        rolesForm: null,
        searchInput: null,
        addButton: null,
        saveButton: null,
        roleCount: null,
        filterButtons: {},
        formsList: null,
    },
    
    // Datos
    roles: [],
    filteredRoles: [],
    currentRole: null,
    isEditing: false,
    currentFilter: 'all', // 'all', 'active', 'inactive'
    allForms: [], // Todos los formularios disponibles
    
    /**
     * Inicializa el controlador
     */
    async init() {
        // Obtener referencias a elementos del DOM
        this.elements.rolesList = document.getElementById('rolesList');
        this.elements.rolesForm = document.getElementById('roleForm');
        this.elements.searchInput = document.getElementById('searchRole');
        this.elements.addButton = document.getElementById('btnNewRole');
        this.elements.saveButton = document.getElementById('btnSaveRole');
        this.elements.roleCount = document.getElementById('roleCount');
        this.elements.filterButtons = {
            all: document.getElementById('btnFilterAllRoles'),
            active: document.getElementById('btnFilterActiveRoles'),
            inactive: document.getElementById('btnFilterInactiveRoles')
        };
        this.elements.formsList = document.getElementById('roleFormsList');
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Cargar lista de roles
        await this.loadRoles();
    },
    
    /**
     * Configura los escuchadores de eventos
     */
    setupEventListeners() {
        // Evento para botón Agregar Rol
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', () => {
                this.showRoleForm();
            });
        }
        
        // Evento para formulario de rol
        if (this.elements.rolesForm) {
            this.elements.rolesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRole();
            });
        }
        
        // Evento para búsqueda
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.filterRoles(e.target.value);
            });
        }
        
        // Eventos para botones de filtro
        if (this.elements.filterButtons.all) {
            this.elements.filterButtons.all.addEventListener('click', () => {
                this.setFilter('all');
            });
        }
        
        if (this.elements.filterButtons.active) {
            this.elements.filterButtons.active.addEventListener('click', () => {
                this.setFilter('active');
            });
        }
        
        if (this.elements.filterButtons.inactive) {
            this.elements.filterButtons.inactive.addEventListener('click', () => {
                this.setFilter('inactive');
            });
        }
        
        // Evento para refrescar lista
        const refreshButton = document.getElementById('btnRefreshRoles');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.loadRoles();
            });
        }
        
        // Evento para limpiar búsqueda
        const clearSearchButton = document.getElementById('btnClearRoleSearch');
        if (clearSearchButton) {
            clearSearchButton.addEventListener('click', () => {
                if (this.elements.searchInput) {
                    this.elements.searchInput.value = '';
                    this.filterRoles('');
                }
            });
        }
        
        // Evento para botón volver
        const backButton = document.querySelector('.btn-back');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }
        
        // Evento para gestionar permisos
        document.getElementById('btnSaveRolePermissions')?.addEventListener('click', () => {
            this.saveRolePermissions();
        });
    },
    
    /**
     * Establece el filtro actual y actualiza la visualización
     * @param {string} filter - Filtro a aplicar ('all', 'active', 'inactive')
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Actualizar clases CSS de los botones
        Object.keys(this.elements.filterButtons).forEach(key => {
            const button = this.elements.filterButtons[key];
            if (button) {
                button.classList.remove('active', 'btn-primary', 'btn-success', 'btn-danger');
                button.classList.add('btn-outline-primary', 'btn-outline-success', 'btn-outline-danger');
                
                if (key === 'all') {
                    button.classList.replace('btn-outline-primary', 'btn-outline-primary');
                } else if (key === 'active') {
                    button.classList.replace('btn-outline-success', 'btn-outline-success');
                } else if (key === 'inactive') {
                    button.classList.replace('btn-outline-danger', 'btn-outline-danger');
                }
            }
        });
        
        // Añadir clase activa al botón seleccionado
        if (this.elements.filterButtons[filter]) {
            this.elements.filterButtons[filter].classList.remove('btn-outline-primary', 'btn-outline-success', 'btn-outline-danger');
            
            if (filter === 'all') {
                this.elements.filterButtons[filter].classList.add('active', 'btn-primary');
            } else if (filter === 'active') {
                this.elements.filterButtons[filter].classList.add('active', 'btn-success');
            } else if (filter === 'inactive') {
                this.elements.filterButtons[filter].classList.add('active', 'btn-danger');
            }
        }
        
        // Aplicar filtro a la lista
        this.applyFilters();
    },
    
    /**
     * Aplica los filtros actuales (búsqueda y estado) a la lista de roles
     */
    applyFilters() {
        const searchTerm = this.elements.searchInput ? this.elements.searchInput.value.toLowerCase() : '';
        
        // Filtrar por término de búsqueda y estado
        this.filteredRoles = this.roles.filter(role => {
            // Filtro por estado
            if (this.currentFilter === 'active' && !role.active) return false;
            if (this.currentFilter === 'inactive' && role.active) return false;
            
            // Si no hay término de búsqueda, incluir el rol
            if (!searchTerm) return true;
            
            // Filtro por término de búsqueda
            return (
                (role.typeRol && role.typeRol.toLowerCase().includes(searchTerm)) ||
                (role.description && role.description.toLowerCase().includes(searchTerm))
            );
        });
        
        // Actualizar la lista visualizada
        this.renderRolesList();
    },
    
    /**
     * Carga la lista de roles desde el servidor
     */
    async loadRoles() {
        try {
            Helpers.showLoading();
            
            // Obtener roles del servidor
            this.roles = await RoleService.getAll();
            
            // Aplicar filtros
            this.applyFilters();
            
            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al cargar los roles:', error);
            Helpers.showError('Error', 'No se pudieron cargar los roles: ' + error.message);
            
            // Mostrar mensaje de error en la tabla
            if (this.elements.rolesList) {
                this.elements.rolesList.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center text-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Error al cargar datos: ${error.message}
                        </td>
                    </tr>
                `;
            }
            
            Helpers.hideLoading();
        }
    },
    
    /**
     * Renderiza la lista de roles en la interfaz
     */
    renderRolesList() {
        if (!this.elements.rolesList) return;
        
        // Limpiar lista actual
        this.elements.rolesList.innerHTML = '';
        
        // Actualizar contador de roles
        if (this.elements.roleCount) {
            this.elements.roleCount.textContent = `${this.filteredRoles.length} roles`;
        }
        
        // Si no hay roles, mostrar mensaje
        if (this.filteredRoles.length === 0) {
            this.elements.rolesList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay roles que mostrar</td>
                </tr>
            `;
            return;
        }
        
        // Renderizar cada rol
        this.filteredRoles.forEach(role => {
            const row = document.createElement('tr');
            
            // Truncar descripción si es muy larga
            const description = role.description 
                ? Helpers.truncateText(role.description, 50) 
                : '(Sin descripción)';
                
            row.innerHTML = `
                <td>${role.id}</td>
                <td>${Helpers.escapeHtml(role.typeRol || 'Sin tipo')}</td>
                <td>${Helpers.escapeHtml(description)}</td>
                <td>${Helpers.createStatusBadge(role.active)}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary btn-edit" title="Editar rol">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-info btn-permissions text-white" title="Gestionar permisos">
                            <i class="bi bi-shield-lock"></i>
                        </button>
                        <button class="btn ${role.active ? 'btn-warning' : 'btn-success'} btn-toggle-status" 
                            title="${role.active ? 'Desactivar' : 'Activar'} rol">
                            <i class="bi ${role.active ? 'bi-toggle-off' : 'bi-toggle-on'}"></i>
                        </button>
                        <button class="btn btn-danger btn-delete" title="Eliminar rol">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Agregar eventos a los botones
            row.querySelector('.btn-edit').addEventListener('click', () => {
                this.editRole(role.id);
            });
            
            row.querySelector('.btn-permissions').addEventListener('click', () => {
                this.showRolePermissions(role.id);
            });
            
            row.querySelector('.btn-toggle-status').addEventListener('click', () => {
                this.toggleRoleStatus(role.id, !role.active);
            });
            
            row.querySelector('.btn-delete').addEventListener('click', () => {
                this.deleteRole(role.id);
            });
            
            this.elements.rolesList.appendChild(row);
        });
    },
    
    /**
     * Filtra la lista de roles según el término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     */
    filterRoles(searchTerm) {
        // Aplicar filtros actualizados
        this.applyFilters();
    },
    
    /**
     * Muestra el formulario para crear/editar un rol
     * @param {Object} role - Datos del rol a editar (opcional)
     */
    showRoleForm(role = null) {
        this.isEditing = !!role;
        this.currentRole = role;
        
        const form = this.elements.rolesForm;
        if (!form) return;
        
        // Limpiar formulario
        form.reset();
        
        // Actualizar título del modal
        document.getElementById('roleFormTitle').textContent = 
            this.isEditing ? 'Editar Rol' : 'Nuevo Rol';
        
        // Si estamos editando, llenar el formulario con los datos del rol
        if (this.isEditing && role) {
            document.getElementById('roleId').value = role.id;
            document.getElementById('roleName').value = role.typeRol || '';
            document.getElementById('roleDescription').value = role.description || '';
            document.getElementById('roleActive').checked = !!role.active;
        } else {
            // Valores por defecto para nuevo rol
            document.getElementById('roleId').value = '0';
            document.getElementById('roleActive').checked = true;
        }
        
        // Mostrar el modal
        const roleModal = new bootstrap.Modal(document.getElementById('roleModal'));
        roleModal.show();
    },
    
    /**
     * Guarda los datos de un rol (creación o edición)
     */
    async saveRole() {
        try {
            const form = this.elements.rolesForm;
            if (!form) return;
            
            // Validar formulario
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            
            Helpers.showLoading();
            
            // Recopilar datos del formulario
            const roleData = {
                id: parseInt(document.getElementById('roleId').value) || 0,
                name: document.getElementById('roleName').value.trim(),
                description: document.getElementById('roleDescription').value.trim(),
                active: document.getElementById('roleActive').checked
            };
            
            let savedRole;
            
            // Crear o actualizar según corresponda
            if (this.isEditing) {
                savedRole = await RoleService.update(roleData.id, roleData);
                Helpers.showMessage('Éxito', `El rol "${roleData.name}" ha sido actualizado correctamente.`);
            } else {
                savedRole = await RoleService.create(roleData);
                Helpers.showMessage('Éxito', `El rol "${roleData.name}" ha sido creado correctamente.`);
            }
            
            // Cerrar modal
            const roleModal = bootstrap.Modal.getInstance(document.getElementById('roleModal'));
            if (roleModal) {
                roleModal.hide();
            } else {
                // Si no se puede obtener la instancia, usar jQuery o cerrar manualmente
                document.querySelector('#roleModal .btn-close').click();
            }
            
            // Recargar lista de roles
            await this.loadRoles();
        } catch (error) {
            console.error('Error al guardar el rol:', error);
            Helpers.showError('Error', 'No se pudo guardar el rol: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Carga los datos de un rol para edición
     * @param {number} id - ID del rol
     */
    async editRole(id) {
        try {
            Helpers.showLoading();
            
            // Obtener datos del rol
            const role = await RoleService.getById(id);
            
            // Mostrar formulario de edición
            this.showRoleForm(role);
        } catch (error) {
            console.error(`Error al cargar el rol con ID ${id}:`, error);
            Helpers.showError('Error', 'No se pudo cargar el rol: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Cambia el estado de activación de un rol
     * @param {number} id - ID del rol
     * @param {boolean} newStatus - Nuevo estado (true = activo, false = inactivo)
     */
    async toggleRoleStatus(id, newStatus) {
        try {
            // Confirmar acción
            const action = newStatus ? 'activar' : 'desactivar';
            if (!confirm(`¿Está seguro que desea ${action} este rol?`)) {
                return;
            }
            
            Helpers.showLoading();
            
            // Cambiar estado en el servidor
            await RoleService.changeStatus(id, newStatus);
            
            // Mostrar mensaje de éxito
            Helpers.showMessage('Éxito', `El rol ha sido ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
            
            // Recargar lista de roles
            await this.loadRoles();
        } catch (error) {
            console.error(`Error al ${newStatus ? 'activar' : 'desactivar'} el rol con ID ${id}:`, error);
            Helpers.showError('Error', `No se pudo ${newStatus ? 'activar' : 'desactivar'} el rol: ` + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Elimina un rol
     * @param {number} id - ID del rol
     */
    async deleteRole(id) {
        try {
            // Confirmar eliminación
            if (!confirm('¿Está seguro que desea eliminar este rol? Esta acción no se puede deshacer.')) {
                return;
            }
            
            Helpers.showLoading();
            
            // Eliminar rol en el servidor
            await RoleService.delete(id);
            
            // Mostrar mensaje de éxito
            Helpers.showMessage('Éxito', 'El rol ha sido eliminado correctamente.');
            
            // Recargar lista de roles
            await this.loadRoles();
        } catch (error) {
            console.error(`Error al eliminar el rol con ID ${id}:`, error);
            Helpers.showError('Error', 'No se pudo eliminar el rol: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Muestra el modal de gestión de permisos de un rol
     * @param {number} roleId - ID del rol
     */
    async showRolePermissions(roleId) {
        try {
            Helpers.showLoading();
            
            // Obtener datos del rol
            const role = await RoleService.getById(roleId);
            
            // Configurar modal
            document.getElementById('rolePermissionsName').textContent = role.name;
            document.getElementById('rolePermissionsId').value = role.id;
            
            // Cargar todos los formularios disponibles
            const allForms = await FormService.getAll();
            this.allForms = allForms || [];
            
            // Obtener formularios asociados al rol
            const roleForms = await RoleService.getFormsByRoleId(roleId);
            
            // Renderizar listado de formularios con checkboxes
            this.renderPermissionsList(roleForms);
            
            // Guardar referencia al rol actual
            this.currentRole = role;
            
            // Mostrar modal
            const roleFormsModal = new bootstrap.Modal(document.getElementById('rolePermissionsModal'));
            roleFormsModal.show();
        } catch (error) {
            console.error(`Error al cargar permisos del rol con ID ${roleId}:`, error);
            Helpers.showError('Error', 'No se pudieron cargar los permisos: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Renderiza la lista de permisos (formularios) en el modal de gestión
     * @param {Array} roleForms - Lista de formularios asociados al rol
     */
    renderPermissionsList(roleForms) {
        const formsList = this.elements.formsList;
        if (!formsList) return;
        
        // Limpiar lista actual
        formsList.innerHTML = '';
        
        // Si no hay formularios disponibles, mostrar mensaje
        if (!this.allForms || this.allForms.length === 0) {
            formsList.innerHTML = `
                <div class="alert alert-info">
                    No hay formularios disponibles en el sistema.
                </div>
            `;
            return;
        }
        
        // Crear una tabla para mostrar formularios agrupados por módulo
        const formsTable = document.createElement('table');
        formsTable.className = 'table table-striped table-hover';
        
        // Agrupar formularios por módulo
        const moduleMap = new Map();
        this.allForms.forEach(form => {
            if (!moduleMap.has(form.moduleId)) {
                moduleMap.set(form.moduleId, {
                    moduleId: form.moduleId,
                    moduleName: form.moduleName || `Módulo ID: ${form.moduleId}`,
                    forms: []
                });
            }
            
            // Verificar si este formulario está asignado al rol
            const isAssigned = roleForms && roleForms.some(rf => rf.id === form.id);
            moduleMap.get(form.moduleId).forms.push({
                ...form,
                isAssigned
            });
        });
        
        // Convertir mapa a array para iterar
        const moduleGroups = Array.from(moduleMap.values());
        
        // Si no hay grupos de módulos, mostrar mensaje alternativo
        if (moduleGroups.length === 0) {
            formsList.innerHTML = `
                <div class="alert alert-info">
                    No hay formularios disponibles en el sistema.
                </div>
            `;
            return;
        }
        
        // Renderizar cada grupo de módulo
        moduleGroups.forEach(moduleGroup => {
            // Crear encabezado de módulo
            const moduleHeader = document.createElement('div');
            moduleHeader.className = 'module-header my-3';
            moduleHeader.innerHTML = `
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${Helpers.escapeHtml(moduleGroup.moduleName)}</h5>
                        <div class="form-check">
                            <input class="form-check-input module-toggle" type="checkbox" 
                                data-module-id="${moduleGroup.moduleId}" id="module${moduleGroup.moduleId}">
                            <label class="form-check-label" for="module${moduleGroup.moduleId}">
                                Seleccionar todos
                            </label>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row form-permissions">
                            <!-- Los formularios se insertarán aquí -->
                        </div>
                    </div>
                </div>
            `;
            
            formsList.appendChild(moduleHeader);
            
            // Referencia al contenedor de formularios
            const formsContainer = moduleHeader.querySelector('.form-permissions');
            
            // Verificar si todos los formularios del módulo están asignados
            const allFormsAssigned = moduleGroup.forms.every(form => form.isAssigned);
            const moduleCheckbox = moduleHeader.querySelector('.module-toggle');
            moduleCheckbox.checked = allFormsAssigned;
            
            // Evento para seleccionar/deseleccionar todos los formularios del módulo
            moduleCheckbox.addEventListener('change', function() {
                const formCheckboxes = formsContainer.querySelectorAll('.form-checkbox');
                formCheckboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
            });
            
            // Renderizar cada formulario del módulo
            moduleGroup.forms.forEach(form => {
                const formCol = document.createElement('div');
                formCol.className = 'col-md-6 mb-2';
                formCol.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input form-checkbox" type="checkbox" 
                            value="${form.id}" id="form${form.id}" 
                            data-module-id="${moduleGroup.moduleId}" ${form.isAssigned ? 'checked' : ''}>
                        <label class="form-check-label d-flex justify-content-between" for="form${form.id}">
                            <span>${Helpers.escapeHtml(form.name)}</span>
                            <small class="text-muted ms-2">
                                <code>${Helpers.escapeHtml(form.route)}</code>
                            </small>
                        </label>
                    </div>
                `;
                
                // Evento para actualizar el "Seleccionar todos" cuando cambia un formulario
                formCol.querySelector('.form-checkbox').addEventListener('change', () => {
                    const formCheckboxes = formsContainer.querySelectorAll('.form-checkbox');
                    const allChecked = Array.from(formCheckboxes).every(cb => cb.checked);
                    moduleCheckbox.checked = allChecked;
                });
                
                formsContainer.appendChild(formCol);
            });
        });
    },
    
    /**
     * Guarda los permisos (formularios) asignados a un rol
     */
    async saveRolePermissions() {
        try {
            // Obtener el ID del rol actual
            const roleId = parseInt(document.getElementById('rolePermissionsId').value);
            if (!roleId) {
                Helpers.showError('Error', 'No se pudo determinar el rol actual.');
                return;
            }
            
            Helpers.showLoading();
            
            // Recopilar IDs de todos los formularios seleccionados
            const selectedFormIds = [];
            document.querySelectorAll('.form-checkbox:checked').forEach(checkbox => {
                selectedFormIds.push(parseInt(checkbox.value));
            });
            
            // Enviar datos al servidor
            await RoleService.assignForms(roleId, selectedFormIds);
            
            // Mostrar mensaje de éxito
            Helpers.showMessage('Éxito', 'Los permisos del rol han sido actualizados correctamente.');
            
            // Cerrar modal
            const rolePermissionsModal = bootstrap.Modal.getInstance(document.getElementById('rolePermissionsModal'));
            rolePermissionsModal.hide();
        } catch (error) {
            console.error('Error al guardar permisos del rol:', error);
            Helpers.showError('Error', 'No se pudieron guardar los permisos: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    }
};