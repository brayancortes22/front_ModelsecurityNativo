/**
 * Controlador para la gestión de módulos
 * Maneja la interacción del usuario con la vista de módulos
 */

const ModuleController = {
    // Referencia a elementos del DOM
    elements: {
        modulesContainer: null,
        modulesList: null,
        moduleForm: null,
        moduleFormTitle: null,
        btnNewModule: null,
        btnSaveModule: null,
        btnCancelModule: null,
        moduleFormMsg: null,
        searchModuleInput: null
    },
    
    // Estado del controlador
    state: {
        modules: [],
        currentModule: null,
        editMode: false
    },
    
    /**
     * Inicializa el controlador
     */
    async init() {
        this.cacheElements();
        this.bindEvents();
        await this.loadModules();
        this.renderModulesList();
    },
    
    /**
     * Almacena referencias a elementos del DOM
     */
    cacheElements() {
        const container = document.getElementById('modulesView');
        if (!container) return;
        
        this.elements.modulesContainer = container;
        this.elements.modulesList = container.querySelector('#modulesList');
        this.elements.moduleForm = container.querySelector('#moduleForm');
        this.elements.moduleFormTitle = container.querySelector('#moduleFormTitle');
        this.elements.btnNewModule = container.querySelector('#btnNewModule');
        this.elements.btnSaveModule = container.querySelector('#btnSaveModule');
        this.elements.btnCancelModule = container.querySelector('#btnCancelModule');
        this.elements.moduleFormMsg = container.querySelector('#moduleFormMsg');
        this.elements.searchModuleInput = container.querySelector('#searchModule');
    },
    
    /**
     * Vincula eventos a elementos del DOM
     */
    bindEvents() {
        if (!this.elements.modulesContainer) return;
        
        // Evento para crear un nuevo módulo
        this.elements.btnNewModule.addEventListener('click', () => this.showModuleForm());
        
        // Evento para guardar un módulo
        this.elements.moduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveModule();
        });
        
        // Evento para cancelar la edición
        this.elements.btnCancelModule.addEventListener('click', () => this.cancelModuleEdit());
        
        // Evento para buscar módulos
        if (this.elements.searchModuleInput) {
            this.elements.searchModuleInput.addEventListener('input', (e) => {
                this.filterModules(e.target.value);
            });
        }
    },
    
    /**
     * Carga la lista de módulos desde la API
     */
    async loadModules() {
        try {
            Helpers.showLoading();
            this.state.modules = await ModuleService.getAllModules();
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cargar los módulos', error.message);
            console.error('Error loading modules:', error);
        }
    },
    
    /**
     * Renderiza la lista de módulos
     */
    renderModulesList() {
        if (!this.elements.modulesList) return;
        
        this.elements.modulesList.innerHTML = '';
        
        if (this.state.modules.length === 0) {
            this.elements.modulesList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay módulos disponibles</td>
                </tr>
            `;
            return;
        }
        
        this.state.modules.forEach(module => {
            const tr = document.createElement('tr');
            tr.className = module.active ? '' : 'table-secondary';
            
            tr.innerHTML = `
                <td>${module.id}</td>
                <td>${Helpers.escapeHtml(module.name)}</td>
                <td>${Helpers.escapeHtml(module.description || '')}</td>
                <td>
                    <span class="badge ${module.active ? 'bg-success' : 'bg-danger'}">
                        ${module.active ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-edit" data-id="${module.id}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${module.active 
                            ? `<button class="btn btn-outline-warning btn-deactivate" data-id="${module.id}" title="Desactivar">
                                <i class="bi bi-toggle-off"></i>
                              </button>`
                            : `<button class="btn btn-outline-success btn-activate" data-id="${module.id}" title="Activar">
                                <i class="bi bi-toggle-on"></i>
                              </button>`
                        }
                        <button class="btn btn-outline-danger btn-delete" data-id="${module.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-outline-info btn-forms" data-id="${module.id}" title="Formularios">
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
                editBtn.addEventListener('click', () => this.editModule(module.id));
            }
            
            if (activateBtn) {
                activateBtn.addEventListener('click', () => this.toggleModuleStatus(module.id, true));
            }
            
            if (deactivateBtn) {
                deactivateBtn.addEventListener('click', () => this.toggleModuleStatus(module.id, false));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteModule(module.id));
            }
            
            if (formsBtn) {
                formsBtn.addEventListener('click', () => this.manageModuleForms(module.id));
            }
            
            this.elements.modulesList.appendChild(tr);
        });
    },
    
    /**
     * Filtra la lista de módulos según el texto de búsqueda
     * @param {string} searchText - Texto de búsqueda
     */
    filterModules(searchText) {
        if (!this.elements.modulesList) return;
        
        const rows = this.elements.modulesList.querySelectorAll('tr');
        
        rows.forEach(row => {
            const moduleText = row.textContent.toLowerCase();
            const match = moduleText.includes(searchText.toLowerCase());
            row.style.display = match ? '' : 'none';
        });
    },
    
    /**
     * Muestra el formulario para crear un nuevo módulo
     */
    showModuleForm(moduleData = null) {
        if (!this.elements.moduleForm) return;
        
        this.state.editMode = !!moduleData;
        this.state.currentModule = moduleData;
        
        // Restablecer formulario
        this.elements.moduleForm.reset();
        this.elements.moduleFormMsg.textContent = '';
        
        // Establecer título según modo
        this.elements.moduleFormTitle.textContent = this.state.editMode ? 'Editar Módulo' : 'Nuevo Módulo';
        
        // Completar datos si está en modo edición
        if (this.state.editMode && moduleData) {
            this.elements.moduleForm.elements['name'].value = moduleData.name || '';
            this.elements.moduleForm.elements['description'].value = moduleData.description || '';
            this.elements.moduleForm.elements['active'].checked = moduleData.active;
        } else {
            // En modo creación, establecer activo por defecto
            this.elements.moduleForm.elements['active'].checked = true;
        }
        
        // Mostrar formulario
        this.elements.moduleForm.classList.remove('d-none');
        this.elements.modulesList.closest('.card').classList.add('d-none');
        this.elements.btnNewModule.classList.add('d-none');
    },
    
    /**
     * Cancela la edición de un módulo
     */
    cancelModuleEdit() {
        if (!this.elements.moduleForm) return;
        
        this.elements.moduleForm.classList.add('d-none');
        this.elements.modulesList.closest('.card').classList.remove('d-none');
        this.elements.btnNewModule.classList.remove('d-none');
        
        this.state.editMode = false;
        this.state.currentModule = null;
    },
    
    /**
     * Edita un módulo existente
     * @param {number} id - ID del módulo a editar
     */
    async editModule(id) {
        try {
            Helpers.showLoading();
            const module = await ModuleService.getModuleById(id);
            Helpers.hideLoading();
            
            this.showModuleForm(module);
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cargar el módulo', error.message);
            console.error('Error loading module for edit:', error);
        }
    },
    
    /**
     * Guarda un módulo (nuevo o existente)
     */
    async saveModule() {
        if (!this.elements.moduleForm) return;
        
        try {
            // Validar formulario
            if (!this.validateModuleForm()) {
                return;
            }
            
            // Obtener datos del formulario
            const moduleData = {
                name: this.elements.moduleForm.elements['name'].value,
                description: this.elements.moduleForm.elements['description'].value,
                active: this.elements.moduleForm.elements['active'].checked
            };
            
            Helpers.showLoading();
            
            // En modo edición, incluir el ID
            if (this.state.editMode && this.state.currentModule) {
                moduleData.id = this.state.currentModule.id;
                await ModuleService.updateModule(this.state.currentModule.id, moduleData);
                Helpers.showMessage('Módulo actualizado', 'El módulo se ha actualizado correctamente');
            } else {
                await ModuleService.createModule(moduleData);
                Helpers.showMessage('Módulo creado', 'El módulo se ha creado correctamente');
            }
            
            // Recargar módulos y mostrar lista
            await this.loadModules();
            this.renderModulesList();
            this.cancelModuleEdit();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al guardar el módulo', error.message);
            console.error('Error saving module:', error);
        }
    },
    
    /**
     * Valida el formulario de módulo antes de enviar
     * @returns {boolean} True si la validación es exitosa
     */
    validateModuleForm() {
        if (!this.elements.moduleForm) return false;
        
        const name = this.elements.moduleForm.elements['name'].value.trim();
        
        if (!name) {
            this.elements.moduleFormMsg.textContent = 'El nombre del módulo es obligatorio';
            this.elements.moduleFormMsg.classList.remove('d-none');
            return false;
        }
        
        this.elements.moduleFormMsg.textContent = '';
        this.elements.moduleFormMsg.classList.add('d-none');
        return true;
    },
    
    /**
     * Cambia el estado de un módulo (activo/inactivo)
     * @param {number} id - ID del módulo
     * @param {boolean} active - Nuevo estado
     */
    async toggleModuleStatus(id, active) {
        try {
            Helpers.showLoading();
            
            if (active) {
                await ModuleService.activateModule(id);
                Helpers.showMessage('Módulo activado', 'El módulo se ha activado correctamente');
            } else {
                await ModuleService.deactivateModule(id);
                Helpers.showMessage('Módulo desactivado', 'El módulo se ha desactivado correctamente');
            }
            
            // Recargar módulos y actualizar vista
            await this.loadModules();
            this.renderModulesList();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cambiar el estado del módulo', error.message);
            console.error('Error toggling module status:', error);
        }
    },
    
    /**
     * Elimina un módulo
     * @param {number} id - ID del módulo a eliminar
     */
    async deleteModule(id) {
        // Confirmación antes de eliminar
        if (!confirm('¿Está seguro de eliminar este módulo? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            Helpers.showLoading();
            await ModuleService.deleteModule(id);
            
            Helpers.showMessage('Módulo eliminado', 'El módulo se ha eliminado correctamente');
            
            // Recargar módulos y actualizar vista
            await this.loadModules();
            this.renderModulesList();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al eliminar el módulo', error.message);
            console.error('Error deleting module:', error);
        }
    },
    
    /**
     * Muestra la gestión de formularios para un módulo
     * @param {number} id - ID del módulo
     */
    async manageModuleForms(id) {
        // Esta función se implementaría para mostrar y gestionar 
        // los formularios asignados a un módulo
        alert('Gestión de formularios para el módulo con ID: ' + id + ' (funcionalidad en desarrollo)');
    }
};