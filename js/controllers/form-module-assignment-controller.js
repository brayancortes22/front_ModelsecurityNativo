/**
 * Controlador para la asignación de formularios a módulos
 */
const FormModuleAssignmentController = {
    // Elementos del DOM
    elements: {
        modulesList: null,
        formsList: null,
        assignedFormsList: null,
        selectedModuleInfo: null,
        searchModule: null,
        searchForm: null,
        saveButton: null,
        removeFormButton: null
    },

    // Estado del controlador
    state: {
        modules: [],
        forms: [],
        moduleForms: [], // Formularios asignados al módulo seleccionado
        selectedModule: null,
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
        this.elements.modulesList = document.getElementById('modulesList');
        this.elements.formsList = document.getElementById('formsList');
        this.elements.assignedFormsList = document.getElementById('assignedFormsList');
        this.elements.selectedModuleInfo = document.getElementById('selectedModuleInfo');
        this.elements.searchModule = document.getElementById('searchModule');
        this.elements.searchForm = document.getElementById('searchForm');
        this.elements.saveButton = document.getElementById('btnSaveAssignment');
        this.elements.removeFormButton = document.getElementById('btnRemoveForm');
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

        // Evento para eliminar formulario asignado
        this.elements.removeFormButton?.addEventListener('click', () => {
            this.removeAssignedForm();
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
     * Carga los formularios asignados al módulo seleccionado
     */
    async loadModuleForms(moduleId) {
        try {
            this.state.moduleForms = await FormModuleService.getByModuleId(moduleId);
            this.renderAssignedFormsList();
        } catch (error) {
            console.error(`Error al cargar formularios del módulo con ID ${moduleId}:`, error);
            Helpers.showError('Error', 'No se pudieron cargar los formularios del módulo: ' + error.message);
            this.state.moduleForms = [];
            this.renderAssignedFormsList();
        }
    },

    /**
     * Renderiza las listas de módulos y formularios
     */
    renderLists() {
        this.renderModulesList();
        this.renderFormsList();
        this.renderAssignedFormsList();
    },

    /**
     * Renderiza la lista de módulos
     */
    renderModulesList() {
        if (!this.elements.modulesList) return;

        this.elements.modulesList.innerHTML = '';

        if (this.state.modules.length === 0) {
            this.elements.modulesList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-exclamation-circle text-muted"></i>
                    <p class="text-muted">No hay módulos disponibles</p>
                </div>
            `;
            return;
        }

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
     * Renderiza la lista de formularios asignados al módulo
     */
    renderAssignedFormsList() {
        if (!this.elements.assignedFormsList) return;

        this.elements.assignedFormsList.innerHTML = '';

        // Si no hay módulo seleccionado
        if (!this.state.selectedModule) {
            this.elements.assignedFormsList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-info-circle text-muted"></i>
                    <p class="text-muted">No hay módulo seleccionado</p>
                </div>
            `;
            return;
        }

        // Si no tiene formularios asignados
        if (!this.state.moduleForms || this.state.moduleForms.length === 0) {
            this.elements.assignedFormsList.innerHTML = `
                <div class="text-center p-3">
                    <i class="bi bi-exclamation-circle text-muted"></i>
                    <p class="text-muted">Este módulo no tiene formularios asignados</p>
                </div>
            `;
            return;
        }

        // Mostrar los formularios asignados
        this.state.moduleForms.forEach(moduleForm => {
            const form = this.findFormById(moduleForm.formId);
            if (!form) return; // Si no se encuentra el formulario, saltamos

            const item = document.createElement('a');
            item.href = '#';
            item.className = 'list-group-item list-group-item-action';
            if (this.state.selectedAssignedForm?.id === moduleForm.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${Helpers.escapeHtml(form.name)}</h6>
                    <small><span class="badge bg-info">ID: ${moduleForm.id}</span></small>
                </div>
                <small>Ruta: ${Helpers.escapeHtml(form.route || 'N/A')}</small>
            `;

            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.selectAssignedForm(moduleForm, form);
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
     * Selecciona un módulo
     */
    async selectModule(module) {
        this.state.selectedModule = module;
        
        // Actualizar la información del módulo seleccionado
        if (this.elements.selectedModuleInfo) {
            this.elements.selectedModuleInfo.textContent = `Módulo seleccionado: ${module.name}`;
        }
        
        // Cargar los formularios del módulo
        await this.loadModuleForms(module.id);
        
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
    selectAssignedForm(moduleForm, form) {
        this.state.selectedAssignedForm = {
            ...moduleForm,
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
            const canAssign = this.state.selectedModule && this.state.selectedForm;
            this.elements.saveButton.disabled = !canAssign;
        }

        // Botón de eliminar formulario
        if (this.elements.removeFormButton) {
            this.elements.removeFormButton.disabled = !this.state.selectedAssignedForm;
        }
    },

    /**
     * Filtra la lista de módulos
     */
    filterModules(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            // Si el término de búsqueda está vacío, cargar todos los módulos nuevamente
            this.loadData();
            return;
        }
        
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
     * Guarda la asignación de formulario a módulo
     */
    async saveAssignment() {
        if (!this.state.selectedModule || !this.state.selectedForm) {
            Helpers.showError('Error', 'Debe seleccionar un módulo y un formulario');
            return;
        }

        try {
            Helpers.showLoading();

            // Comprobar si el formulario ya está asignado al módulo
            const isAlreadyAssigned = this.state.moduleForms.some(
                moduleForm => moduleForm.formId === this.state.selectedForm.id
            );

            if (isAlreadyAssigned) {
                Helpers.hideLoading();
                Helpers.showError('Error', 'Este formulario ya está asignado al módulo');
                return;
            }

            const assignmentData = {
                id: 0,
                moduleId: this.state.selectedModule.id,
                formId: this.state.selectedForm.id,
                statusProcedure: "true" // Convertido a string para coincidir con el tipo en el backend
            };

            await FormModuleService.create(assignmentData);

            Helpers.showMessage('Éxito', 'Formulario asignado correctamente al módulo');
            
            // Recargar los formularios del módulo
            await this.loadModuleForms(this.state.selectedModule.id);
            
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
     * Elimina un formulario asignado al módulo
     */
    async removeAssignedForm() {
        if (!this.state.selectedAssignedForm) {
            Helpers.showError('Error', 'Debe seleccionar un formulario asignado para eliminar');
            return;
        }

        try {
            Helpers.showLoading();

            // Confirmar la eliminación
            if (!confirm(`¿Está seguro que desea quitar el formulario "${this.state.selectedAssignedForm.formInfo.name}" del módulo "${this.state.selectedModule.name}"?`)) {
                Helpers.hideLoading();
                return;
            }

            // Eliminar el formulario asignado
            await FormModuleService.delete(this.state.selectedAssignedForm.id);

            Helpers.showMessage('Éxito', `Formulario "${this.state.selectedAssignedForm.formInfo.name}" eliminado correctamente del módulo`);
            
            // Limpiar la selección del formulario asignado
            this.state.selectedAssignedForm = null;
            
            // Recargar los formularios del módulo
            await this.loadModuleForms(this.state.selectedModule.id);
            
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