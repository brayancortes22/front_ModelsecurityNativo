/**
 * Controlador para la asignación de formularios a roles
 */
const RolFormAssignmentController = {
    // Elementos del DOM
    elements: {
        rolesList: null,
        formsList: null,
        assignedFormsList: null,
        selectedRoleInfo: null,
        searchRole: null,
        searchForm: null,
        saveButton: null,
        removeFormButton: null
    },

    // Estado del controlador
    state: {
        roles: [],
        forms: [],
        roleForms: [], // Formularios asignados al rol seleccionado
        selectedRole: null,
        selectedForm: null,
        selectedAssignedForm: null // Para el formulario seleccionado en la lista de asignados
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
        this.elements.rolesList = document.getElementById('rolesList');
        this.elements.formsList = document.getElementById('formsList');
        this.elements.assignedFormsList = document.getElementById('assignedFormsList');
        this.elements.selectedRoleInfo = document.getElementById('selectedRoleInfo');
        this.elements.searchRole = document.getElementById('searchRole');
        this.elements.searchForm = document.getElementById('searchForm');
        this.elements.saveButton = document.getElementById('btnSaveAssignment');
        this.elements.removeFormButton = document.getElementById('btnRemoveForm');
    },

    /**
     * Configura los escuchadores de eventos
     */
    setupEventListeners() {
        // Eventos de búsqueda
        this.elements.searchRole?.addEventListener('input', (e) => {
            this.filterRoles(e.target.value);
        });

        this.elements.searchForm?.addEventListener('input', (e) => {
            this.filterForms(e.target.value);
        });

        // Evento para guardar asignación
        this.elements.saveButton?.addEventListener('click', () => {
            this.saveAssignment();
        });

        // Evento para eliminar formulario asignado
        this.elements.removeFormButton?.addEventListener('click', () => {
            this.removeAssignedForm();
        });
    },

    /**
     * Carga los datos iniciales (roles y formularios)
     */
    async loadData() {
        try {
            Helpers.showLoading();

            // Cargar roles y formularios en paralelo
            const [roles, forms] = await Promise.all([
                RoleService.getAll(),
                FormService.getAll()
            ]);

            this.state.roles = roles;
            this.state.forms = forms;

            this.renderLists();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudieron cargar los datos: ' + error.message);
        }
    },

    /**
     * Carga los formularios asignados al rol seleccionado
     */
    async loadRoleForms(roleId) {
        try {
            this.state.roleForms = await RolFormService.getFormsByRoleId(roleId);
            this.renderAssignedFormsList();
        } catch (error) {
            console.error(`Error al cargar formularios del rol con ID ${roleId}:`, error);
            Helpers.showError('Error', 'No se pudieron cargar los formularios del rol: ' + error.message);
            this.state.roleForms = [];
            this.renderAssignedFormsList();
        }
    },

    /**
     * Renderiza las listas de roles y formularios
     */
    renderLists() {
        this.renderRolesList();
        this.renderFormsList();
        this.renderAssignedFormsList();
    },

    /**
     * Renderiza la lista de roles
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
     * Renderiza la lista de formularios disponibles
     */
    renderFormsList() {
        if (!this.elements.formsList) return;

        this.elements.formsList.innerHTML = '';

        if (this.state.forms.length === 0) {
            this.elements.formsList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-exclamation-circle text-muted"></i>
                    <p class="text-muted">No hay formularios disponibles</p>
                </div>
            `;
            return;
        }

        this.state.forms.forEach(form => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            if (this.state.selectedForm?.id === form.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${Helpers.escapeHtml(form.name)}</h6>
                    <small>${form.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'}</small>
                </div>
                <small class="text-muted">Ruta: ${Helpers.escapeHtml(form.route || 'N/A')}</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectForm(form);
            });

            this.elements.formsList.appendChild(item);
        });
    },

    /**
     * Renderiza la lista de formularios asignados al rol
     */
    renderAssignedFormsList() {
        if (!this.elements.assignedFormsList) return;

        this.elements.assignedFormsList.innerHTML = '';

        // Si no hay rol seleccionado
        if (!this.state.selectedRole) {
            this.elements.assignedFormsList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-info-circle text-muted"></i>
                    <p class="text-muted">No hay rol seleccionado</p>
                </div>
            `;
            return;
        }

        // Si no tiene formularios asignados
        if (!this.state.roleForms || this.state.roleForms.length === 0) {
            this.elements.assignedFormsList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-exclamation-circle text-muted"></i>
                    <p class="text-muted">Este rol no tiene formularios asignados</p>
                </div>
            `;
            return;
        }

        // Mostrar los formularios asignados
        this.state.roleForms.forEach(roleForm => {
            const form = this.findFormById(roleForm.formId);
            if (!form) return; // Si no se encuentra el formulario, saltamos

            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            if (this.state.selectedAssignedForm?.id === roleForm.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${Helpers.escapeHtml(form.name)}</h6>
                    <small><span class="badge bg-info">ID: ${roleForm.id}</span></small>
                </div>
                <small>Ruta: ${Helpers.escapeHtml(form.route || 'N/A')}</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAssignedForm(roleForm, form);
            });

            this.elements.assignedFormsList.appendChild(item);
        });
    },

    /**
     * Encuentra un formulario por su ID
     */
    findFormById(formId) {
        return this.state.forms.find(form => form.id === formId);
    },

    /**
     * Selecciona un rol
     */
    async selectRole(role) {
        this.state.selectedRole = role;
        
        // Actualizar la información del rol seleccionado
        if (this.elements.selectedRoleInfo) {
            this.elements.selectedRoleInfo.textContent = `Rol seleccionado: ${role.typeRol}`;
        }
        
        // Cargar los formularios del rol
        await this.loadRoleForms(role.id);
        
        // Limpiar la selección de formulario asignado
        this.state.selectedAssignedForm = null;
        
        this.renderLists();
        this.updateButtons();
    },

    /**
     * Selecciona un formulario
     */
    selectForm(form) {
        this.state.selectedForm = form;
        this.renderLists();
        this.updateButtons();
    },

    /**
     * Selecciona un formulario asignado
     */
    selectAssignedForm(roleForm, form) {
        this.state.selectedAssignedForm = {
            ...roleForm,
            formInfo: form // Guardamos la información del formulario para acceso rápido
        };
        this.renderLists();
        this.updateButtons();
    },

    /**
     * Actualiza el estado de los botones
     */
    updateButtons() {
        // Botón de asignar formulario
        if (this.elements.saveButton) {
            const canAssign = this.state.selectedRole && this.state.selectedForm;
            this.elements.saveButton.disabled = !canAssign;
        }

        // Botón de eliminar formulario
        if (this.elements.removeFormButton) {
            this.elements.removeFormButton.disabled = !this.state.selectedAssignedForm;
        }
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
     * Filtra la lista de formularios
     */
    filterForms(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            // Si el término de búsqueda está vacío, cargar todos los formularios nuevamente
            this.loadData();
            return;
        }
        
        const term = searchTerm.toLowerCase();
        const filteredForms = this.state.forms.filter(form => 
            form.name.toLowerCase().includes(term) || 
            (form.route && form.route.toLowerCase().includes(term))
        );
        
        this.state.forms = filteredForms;
        this.renderFormsList();
    },

    /**
     * Guarda la asignación de formulario a rol
     */
    async saveAssignment() {
        if (!this.state.selectedRole || !this.state.selectedForm) {
            Helpers.showError('Error', 'Debe seleccionar un rol y un formulario');
            return;
        }

        try {
            Helpers.showLoading();

            // Comprobar si el formulario ya está asignado al rol
            const isAlreadyAssigned = this.state.roleForms.some(
                roleForm => roleForm.formId === this.state.selectedForm.id
            );

            if (isAlreadyAssigned) {
                Helpers.hideLoading();
                Helpers.showError('Error', 'Este formulario ya está asignado al rol');
                return;
            }

            // Método alternativo usando una petición directa a la API
            const authToken = AuthService.getAuthToken();
            const assignmentData = {
                id: 0,
                RolId: this.state.selectedRole.id,
                FormId: this.state.selectedForm.id,
                Permission: "READ"
            };
            
            console.log("Enviando datos:", JSON.stringify(assignmentData));
            
            // Realizar la petición de forma manual con fetch
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ROL_FORM.BASE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken ? `Bearer ${authToken}` : ''
                },
                body: JSON.stringify(assignmentData)
            });
            
            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = await response.json();
                    console.log("Error detallado:", errorData);
                    errorMessage = errorData.message || `Error ${response.status}: ${response.statusText}`;
                    throw new Error(errorMessage);
                } catch (e) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            const result = await response.json();
            console.log("Respuesta del servidor:", result);

            Helpers.showMessage('Éxito', 'Formulario asignado correctamente al rol');
            
            // Recargar los formularios del rol
            await this.loadRoleForms(this.state.selectedRole.id);
            
            // Limpiar selección
            this.state.selectedForm = null;
            this.renderLists();
            this.updateButtons();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al guardar asignación:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudo guardar la asignación: ' + error.message);
        }
    },

    /**
     * Elimina un formulario asignado al rol
     */
    async removeAssignedForm() {
        if (!this.state.selectedAssignedForm) {
            Helpers.showError('Error', 'Debe seleccionar un formulario asignado para eliminar');
            return;
        }

        try {
            Helpers.showLoading();

            // Confirmar la eliminación
            if (!confirm(`¿Está seguro que desea quitar el formulario "${this.state.selectedAssignedForm.formInfo.name}" del rol "${this.state.selectedRole.typeRol}"?`)) {
                Helpers.hideLoading();
                return;
            }

            // Eliminar el formulario asignado
            await RolFormService.delete(this.state.selectedAssignedForm.id);

            Helpers.showMessage('Éxito', `Formulario "${this.state.selectedAssignedForm.formInfo.name}" eliminado correctamente del rol`);
            
            // Limpiar la selección del formulario asignado
            this.state.selectedAssignedForm = null;
            
            // Recargar los formularios del rol
            await this.loadRoleForms(this.state.selectedRole.id);
            
            this.renderLists();
            this.updateButtons();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al eliminar formulario asignado:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudo eliminar el formulario asignado: ' + error.message);
        }
    }
};