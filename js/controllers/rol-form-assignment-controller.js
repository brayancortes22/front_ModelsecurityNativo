/**
 * Controlador para la asignación de formularios a roles
 */
const RolFormAssignmentController = {
    // Elementos del DOM
    elements: {
        rolesList: null,
        formsList: null,
        searchRole: null,
        searchForm: null,
        saveButton: null
    },

    // Estado del controlador
    state: {
        roles: [],
        forms: [],
        selectedRole: null,
        selectedForm: null,
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
        this.elements.searchRole = document.getElementById('searchRole');
        this.elements.searchForm = document.getElementById('searchForm');
        this.elements.saveButton = document.getElementById('btnSaveAssignment');
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
     * Renderiza las listas de roles y formularios
     */
    renderLists() {
        this.renderRolesList();
        this.renderFormsList();
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
     * Renderiza la lista de formularios
     */
    renderFormsList() {
        if (!this.elements.formsList) return;

        this.elements.formsList.innerHTML = '';

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
     * Selecciona un rol
     */
    selectRole(role) {
        this.state.selectedRole = role;
        this.renderLists();
        this.updateSaveButton();
    },

    /**
     * Selecciona un formulario
     */
    selectForm(form) {
        this.state.selectedForm = form;
        this.renderLists();
        this.updateSaveButton();
    },

    /**
     * Actualiza el estado del botón de guardar
     */
    updateSaveButton() {
        if (this.elements.saveButton) {
            const canSave = this.state.selectedRole && this.state.selectedForm;
            this.elements.saveButton.disabled = !canSave;
        }
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
     * Filtra la lista de formularios
     */
    filterForms(searchTerm) {
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

            const assignmentData = {
                id: 0,
                rolId: this.state.selectedRole.id,
                formId: this.state.selectedForm.id,
                permission: "READ" // Por defecto permiso de lectura
            };

            await RolFormService.create(assignmentData);

            Helpers.showMessage('Éxito', 'Asignación guardada correctamente');
            
            // Limpiar selección
            this.state.selectedRole = null;
            this.state.selectedForm = null;
            this.renderLists();
            this.updateSaveButton();

            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al guardar asignación:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudo guardar la asignación: ' + error.message);
        }
    }
};