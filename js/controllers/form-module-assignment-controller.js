/**
 * Controlador para la asignación de formularios a módulos
 */
const FormModuleAssignmentController = {
    // Elementos del DOM
    elements: {
        modulesList: null,
        formsList: null,
        searchModule: null,
        searchForm: null,
        saveButton: null
    },

    // Estado del controlador
    state: {
        modules: [],
        forms: [],
        selectedModule: null,
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
        this.elements.modulesList = document.getElementById('modulesList');
        this.elements.formsList = document.getElementById('formsList');
        this.elements.searchModule = document.getElementById('searchModule');
        this.elements.searchForm = document.getElementById('searchForm');
        this.elements.saveButton = document.getElementById('btnSaveAssignment');
    },

    /**
     * Configura los escuchadores de eventos
     */
    setupEventListeners() {
        // Eventos de búsqueda
        this.elements.searchModule?.addEventListener('input', (e) => {
            this.filterModules(e.target.value);
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
     * Carga los datos iniciales (módulos y formularios)
     */
    async loadData() {
        try {
            Helpers.showLoading();

            // Cargar módulos y formularios en paralelo
            const [modules, forms] = await Promise.all([
                ModuleService.getAll(),
                FormService.getAll()
            ]);

            this.state.modules = modules;
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
     * Renderiza las listas de módulos y formularios
     */
    renderLists() {
        this.renderModulesList();
        this.renderFormsList();
    },

    /**
     * Renderiza la lista de módulos
     */
    renderModulesList() {
        if (!this.elements.modulesList) return;

        this.elements.modulesList.innerHTML = '';

        this.state.modules.forEach(module => {
            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            if (this.state.selectedModule?.id === module.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${Helpers.escapeHtml(module.name)}</h6>
                    <small>${module.active ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'}</small>
                </div>
                <small>${Helpers.escapeHtml(module.description || 'Sin descripción')}</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectModule(module);
            });

            this.elements.modulesList.appendChild(item);
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
     * Selecciona un módulo
     */
    selectModule(module) {
        this.state.selectedModule = module;
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
            const canSave = this.state.selectedModule && this.state.selectedForm;
            this.elements.saveButton.disabled = !canSave;
        }
    },

    /**
     * Filtra la lista de módulos
     */
    filterModules(searchTerm) {
        const term = searchTerm.toLowerCase();
        const filteredModules = this.state.modules.filter(module => 
            module.name.toLowerCase().includes(term) || 
            (module.description && module.description.toLowerCase().includes(term))
        );
        
        this.state.modules = filteredModules;
        this.renderModulesList();
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
     * Guarda la asignación de formulario a módulo
     */
    async saveAssignment() {
        if (!this.state.selectedModule || !this.state.selectedForm) {
            Helpers.showError('Error', 'Debe seleccionar un módulo y un formulario');
            return;
        }

        try {
            Helpers.showLoading();

            const assignmentData = {
                id: 0,
                moduleId: this.state.selectedModule.id,
                formId: this.state.selectedForm.id,
                statusProcedure: true // Por defecto activo
            };

            await FormModuleService.create(assignmentData);

            Helpers.showMessage('Éxito', 'Asignación guardada correctamente');
            
            // Limpiar selección
            this.state.selectedModule = null;
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