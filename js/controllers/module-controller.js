/**
 * Controlador para la gestión de módulos
 * Maneja todas las operaciones CRUD para módulos y la gestión de sus formularios
 */

const ModuleController = {
    // Elementos del DOM
    elements: {
        modulesList: null,
        modulesForm: null,
        searchInput: null,
        addButton: null,
        saveButton: null,
        moduleCount: null,
        filterButtons: {},
        formsList: null,
        formForm: null,
    },
    
    // Datos
    modules: [],
    filteredModules: [],
    currentModule: null,
    isEditing: false,
    currentFilter: 'all', // 'all', 'active', 'inactive'
    
    /**
     * Inicializa el controlador
     */
    async init() {
        // Obtener referencias a elementos del DOM
        this.elements.modulesList = document.getElementById('modulesList');
        this.elements.modulesForm = document.getElementById('moduleForm');
        this.elements.searchInput = document.getElementById('searchModule');
        this.elements.addButton = document.getElementById('btnNewModule');
        this.elements.saveButton = document.getElementById('btnSaveModule');
        this.elements.moduleCount = document.getElementById('moduleCount');
        this.elements.filterButtons = {
            all: document.getElementById('btnFilterAllModules'),
            active: document.getElementById('btnFilterActiveModules'),
            inactive: document.getElementById('btnFilterInactiveModules')
        };
        this.elements.formsList = document.getElementById('formsList');
        this.elements.formForm = document.getElementById('formForm');
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Cargar lista de módulos
        await this.loadModules();
    },
    
    /**
     * Configura los escuchadores de eventos
     */
    setupEventListeners() {
        // Evento para botón Agregar Módulo
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', () => {
                this.showModuleForm();
            });
        }
        
        // Evento para formulario de módulo
        if (this.elements.modulesForm) {
            this.elements.modulesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveModule();
            });
        }
        
        // Evento para búsqueda
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.filterModules(e.target.value);
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
        const refreshButton = document.getElementById('btnRefreshModules');
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                await this.loadModules();
            });
        }
        
        // Evento para limpiar búsqueda
        const clearSearchButton = document.getElementById('btnClearModuleSearch');
        if (clearSearchButton) {
            clearSearchButton.addEventListener('click', () => {
                if (this.elements.searchInput) {
                    this.elements.searchInput.value = '';
                    this.filterModules('');
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
        
        // Eventos para formularios
        document.getElementById('btnAddForm').addEventListener('click', () => {
            this.showFormModal();
        });
        
        document.getElementById('btnSaveForm').addEventListener('click', () => {
            this.saveForm();
        });
        
        document.getElementById('btnCancelForm').addEventListener('click', () => {
            const formModal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
            formModal.hide();
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
     * Aplica los filtros actuales (búsqueda y estado) a la lista de módulos
     */
    applyFilters() {
        const searchTerm = this.elements.searchInput ? this.elements.searchInput.value.toLowerCase() : '';
        
        // Filtrar por término de búsqueda y estado
        this.filteredModules = this.modules.filter(module => {
            // Filtro por estado
            if (this.currentFilter === 'active' && !module.active) return false;
            if (this.currentFilter === 'inactive' && module.active) return false;
            
            // Si no hay término de búsqueda, incluir el módulo
            if (!searchTerm) return true;
            
            // Filtro por término de búsqueda
            return (
                (module.name && module.name.toLowerCase().includes(searchTerm)) ||
                (module.description && module.description.toLowerCase().includes(searchTerm))
            );
        });
        
        // Actualizar la lista visualizada
        this.renderModulesList();
    },
    
    /**
     * Carga la lista de módulos desde el servidor
     */
    async loadModules() {
        try {
            Helpers.showLoading();
            
            // Obtener módulos del servidor
            this.modules = await ModuleService.getAll();
            
            // Aplicar filtros
            this.applyFilters();
            
            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al cargar los módulos:', error);
            Helpers.showError('Error', 'No se pudieron cargar los módulos: ' + error.message);
            
            // Mostrar mensaje de error en la tabla
            if (this.elements.modulesList) {
                this.elements.modulesList.innerHTML = `
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
     * Renderiza la lista de módulos en la interfaz
     */
    renderModulesList() {
        if (!this.elements.modulesList) return;
        
        // Limpiar lista actual
        this.elements.modulesList.innerHTML = '';
        
        // Actualizar contador de módulos
        if (this.elements.moduleCount) {
            this.elements.moduleCount.textContent = `${this.filteredModules.length} módulos`;
        }
        
        // Si no hay módulos, mostrar mensaje
        if (this.filteredModules.length === 0) {
            this.elements.modulesList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay módulos que mostrar</td>
                </tr>
            `;
            return;
        }
        
        // Renderizar cada módulo
        this.filteredModules.forEach(module => {
            const row = document.createElement('tr');
            
            // Truncar descripción si es muy larga
            const description = module.description 
                ? Helpers.truncateText(module.description, 50) 
                : '(Sin descripción)';
                
            row.innerHTML = `
                <td>${module.id}</td>
                <td>${Helpers.escapeHtml(module.name)}</td>
                <td>${Helpers.escapeHtml(description)}</td>
                <td>${Helpers.createStatusBadge(module.active)}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary btn-edit" title="Editar módulo">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-info btn-forms text-white" title="Gestionar formularios">
                            <i class="bi bi-list-check"></i>
                        </button>
                        <button class="btn ${module.active ? 'btn-warning' : 'btn-success'} btn-toggle-status" 
                            title="${module.active ? 'Desactivar' : 'Activar'} módulo">
                            <i class="bi ${module.active ? 'bi-toggle-off' : 'bi-toggle-on'}"></i>
                        </button>
                        <button class="btn btn-danger btn-delete" title="Eliminar módulo">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Agregar eventos a los botones
            row.querySelector('.btn-edit').addEventListener('click', () => {
                this.editModule(module.id);
            });
            
            row.querySelector('.btn-forms').addEventListener('click', () => {
                this.showModuleForms(module.id);
            });
            
            row.querySelector('.btn-toggle-status').addEventListener('click', () => {
                this.toggleModuleStatus(module.id, !module.active);
            });
            
            row.querySelector('.btn-delete').addEventListener('click', () => {
                this.deleteModule(module.id);
            });
            
            this.elements.modulesList.appendChild(row);
        });
    },
    
    /**
     * Filtra la lista de módulos según el término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     */
    filterModules(searchTerm) {
        // Aplicar filtros actualizados
        this.applyFilters();
    },
    
    /**
     * Muestra el formulario para crear/editar un módulo
     * @param {Object} module - Datos del módulo a editar (opcional)
     */
    showModuleForm(module = null) {
        this.isEditing = !!module;
        this.currentModule = module;
        
        const form = this.elements.modulesForm;
        if (!form) return;
        
        // Limpiar formulario
        form.reset();
        
        // Actualizar título del modal
        document.getElementById('moduleFormTitle').textContent = 
            this.isEditing ? 'Editar Módulo' : 'Nuevo Módulo';
        
        // Si estamos editando, llenar el formulario con los datos del módulo
        if (this.isEditing && module) {
            document.getElementById('moduleId').value = module.id;
            document.getElementById('name').value = module.name || '';
            document.getElementById('description').value = module.description || '';
            document.getElementById('active').checked = !!module.active;
        } else {
            // Valores por defecto para nuevo módulo
            document.getElementById('moduleId').value = '0';
            document.getElementById('active').checked = true;
        }
        
        // Mostrar el modal
        const moduleModal = new bootstrap.Modal(document.getElementById('moduleModal'));
        moduleModal.show();
    },
    
    /**
     * Guarda los datos de un módulo (creación o edición)
     */
    async saveModule() {
        try {
            const form = this.elements.modulesForm;
            if (!form) return;
            
            // Validar formulario
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            
            Helpers.showLoading();
            
            // Recopilar datos del formulario
            const moduleData = {
                id: parseInt(document.getElementById('moduleId').value) || 0,
                name: document.getElementById('name').value.trim(),
                description: document.getElementById('description').value.trim(),
                active: document.getElementById('active').checked
            };
            
            let savedModule;
            
            // Crear o actualizar según corresponda
            if (this.isEditing) {
                savedModule = await ModuleService.update(moduleData.id, moduleData);
                Helpers.showMessage('Éxito', `El módulo "${moduleData.name}" ha sido actualizado correctamente.`);
            } else {
                savedModule = await ModuleService.create(moduleData);
                Helpers.showMessage('Éxito', `El módulo "${moduleData.name}" ha sido creado correctamente.`);
            }
            
            // Cerrar modal
            const moduleModal = bootstrap.Modal.getInstance(document.getElementById('moduleModal'));
            moduleModal.hide();
            
            // Recargar lista de módulos
            await this.loadModules();
        } catch (error) {
            console.error('Error al guardar el módulo:', error);
            Helpers.showError('Error', 'No se pudo guardar el módulo: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Carga los datos de un módulo para edición
     * @param {number} id - ID del módulo
     */
    async editModule(id) {
        try {
            Helpers.showLoading();
            
            // Obtener datos del módulo
            const module = await ModuleService.getById(id);
            
            // Mostrar formulario de edición
            this.showModuleForm(module);
        } catch (error) {
            console.error(`Error al cargar el módulo con ID ${id}:`, error);
            Helpers.showError('Error', 'No se pudo cargar el módulo: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Cambia el estado de activación de un módulo
     * @param {number} id - ID del módulo
     * @param {boolean} newStatus - Nuevo estado (true = activo, false = inactivo)
     */
    async toggleModuleStatus(id, newStatus) {
        try {
            // Confirmar acción
            const action = newStatus ? 'activar' : 'desactivar';
            if (!confirm(`¿Está seguro que desea ${action} este módulo?`)) {
                return;
            }
            
            Helpers.showLoading();
            
            // Cambiar estado en el servidor
            await ModuleService.changeStatus(id, newStatus);
            
            // Mostrar mensaje de éxito
            Helpers.showMessage('Éxito', `El módulo ha sido ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
            
            // Recargar lista de módulos
            await this.loadModules();
        } catch (error) {
            console.error(`Error al ${newStatus ? 'activar' : 'desactivar'} el módulo con ID ${id}:`, error);
            Helpers.showError('Error', `No se pudo ${newStatus ? 'activar' : 'desactivar'} el módulo: ` + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Elimina un módulo
     * @param {number} id - ID del módulo
     */
    async deleteModule(id) {
        try {
            // Confirmar eliminación
            if (!confirm('¿Está seguro que desea eliminar este módulo? Esta acción no se puede deshacer.')) {
                return;
            }
            
            Helpers.showLoading();
            
            // Eliminar módulo en el servidor
            await ModuleService.delete(id);
            
            // Mostrar mensaje de éxito
            Helpers.showMessage('Éxito', 'El módulo ha sido eliminado correctamente.');
            
            // Recargar lista de módulos
            await this.loadModules();
        } catch (error) {
            console.error(`Error al eliminar el módulo con ID ${id}:`, error);
            Helpers.showError('Error', 'No se pudo eliminar el módulo: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Muestra el modal de gestión de formularios de un módulo
     * @param {number} moduleId - ID del módulo
     */
    async showModuleForms(moduleId) {
        try {
            Helpers.showLoading();
            
            // Obtener datos del módulo
            const module = await ModuleService.getById(moduleId);
            
            // Configurar modal
            document.getElementById('moduleFormsName').textContent = module.name;
            
            // Obtener formularios asociados al módulo
            const forms = await ModuleService.getFormsByModuleId(moduleId);
            
            // Renderizar listado de formularios
            this.renderFormsList(forms, moduleId);
            
            // Guardar referencia al módulo actual
            this.currentModule = module;
            
            // Mostrar modal
            const moduleFormsModal = new bootstrap.Modal(document.getElementById('moduleFormsModal'));
            moduleFormsModal.show();
        } catch (error) {
            console.error(`Error al cargar formularios del módulo con ID ${moduleId}:`, error);
            Helpers.showError('Error', 'No se pudieron cargar los formularios: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Renderiza la lista de formularios en el modal de gestión
     * @param {Array} forms - Lista de formularios
     * @param {number} moduleId - ID del módulo
     */
    renderFormsList(forms, moduleId) {
        const formsList = this.elements.formsList;
        if (!formsList) return;
        
        // Limpiar lista actual
        formsList.innerHTML = '';
        
        // Si no hay formularios, mostrar mensaje
        if (!forms || forms.length === 0) {
            formsList.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No hay formularios asociados a este módulo.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Renderizar cada formulario
        forms.forEach(form => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${form.id}</td>
                <td>${Helpers.escapeHtml(form.name)}</td>
                <td><code>${Helpers.escapeHtml(form.route)}</code></td>
                <td>${Helpers.createStatusBadge(form.active)}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary btn-edit-form" title="Editar formulario">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn ${form.active ? 'btn-warning' : 'btn-success'} btn-toggle-form-status" 
                            title="${form.active ? 'Desactivar' : 'Activar'} formulario">
                            <i class="bi ${form.active ? 'bi-toggle-off' : 'bi-toggle-on'}"></i>
                        </button>
                        <button class="btn btn-danger btn-delete-form" title="Eliminar formulario">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Agregar eventos a los botones
            row.querySelector('.btn-edit-form').addEventListener('click', () => {
                this.showFormModal(form, moduleId);
            });
            
            row.querySelector('.btn-toggle-form-status').addEventListener('click', () => {
                this.toggleFormStatus(form.id, !form.active, moduleId);
            });
            
            row.querySelector('.btn-delete-form').addEventListener('click', () => {
                this.deleteForm(form.id, moduleId);
            });
            
            formsList.appendChild(row);
        });
    },
    
    /**
     * Muestra el modal para crear/editar un formulario
     * @param {Object} form - Datos del formulario (opcional)
     * @param {number} moduleId - ID del módulo
     */
    showFormModal(form = null, moduleId = null) {
        // Obtener ID del módulo (de parámetro o del módulo actual)
        const targetModuleId = moduleId || (this.currentModule ? this.currentModule.id : null);
        if (!targetModuleId) {
            Helpers.showError('Error', 'No se pudo determinar el módulo para el formulario.');
            return;
        }
        
        const isEditing = !!form;
        const formForm = this.elements.formForm;
        
        if (!formForm) return;
        
        // Limpiar formulario
        formForm.reset();
        
        // Actualizar título
        document.getElementById('formModalTitle').textContent = 
            isEditing ? 'Editar Formulario' : 'Nuevo Formulario';
        
        // Establecer ID del módulo
        document.getElementById('moduleId').value = targetModuleId;
        
        // Si estamos editando, llenar el formulario
        if (isEditing && form) {
            document.getElementById('formId').value = form.id;
            document.getElementById('formName').value = form.name || '';
            document.getElementById('formRoute').value = form.route || '';
            document.getElementById('formActive').checked = !!form.active;
        } else {
            // Valores por defecto para nuevo formulario
            document.getElementById('formId').value = '0';
            document.getElementById('formActive').checked = true;
        }
        
        // Cerrar modal de módulos-formularios si está abierto
        // (para evitar problemas con múltiples modales)
        const moduleFormsModal = bootstrap.Modal.getInstance(document.getElementById('moduleFormsModal'));
        if (moduleFormsModal) moduleFormsModal.hide();
        
        // Mostrar modal de formulario
        const formModal = new bootstrap.Modal(document.getElementById('formModal'));
        formModal.show();
    },
    
    /**
     * Guarda los datos de un formulario (creación o edición)
     */
    async saveForm() {
        try {
            const form = this.elements.formForm;
            if (!form) return;
            
            // Validar formulario
            const nameInput = document.getElementById('formName');
            const routeInput = document.getElementById('formRoute');
            
            if (!nameInput.value.trim()) {
                Helpers.showError('Error', 'El nombre del formulario es obligatorio.');
                nameInput.focus();
                return;
            }
            
            if (!routeInput.value.trim()) {
                Helpers.showError('Error', 'La ruta del formulario es obligatoria.');
                routeInput.focus();
                return;
            }
            
            Helpers.showLoading();
            
            // Recopilar datos del formulario
            const formData = {
                id: parseInt(document.getElementById('formId').value) || 0,
                moduleId: parseInt(document.getElementById('moduleId').value),
                name: nameInput.value.trim(),
                route: routeInput.value.trim(),
                active: document.getElementById('formActive').checked
            };
            
            // TODO: Implementar servicio para guardar formulario
            // Por ahora simularemos éxito
            console.log('Datos del formulario a guardar:', formData);
            
            // Mensaje de éxito simulado
            const action = formData.id ? 'actualizado' : 'creado';
            Helpers.showMessage('Éxito', `El formulario "${formData.name}" ha sido ${action} correctamente.`);
            
            // Cerrar modal de formulario
            const formModal = bootstrap.Modal.getInstance(document.getElementById('formModal'));
            formModal.hide();
            
            // Reabrir modal de formularios de módulo
            await this.showModuleForms(formData.moduleId);
        } catch (error) {
            console.error('Error al guardar el formulario:', error);
            Helpers.showError('Error', 'No se pudo guardar el formulario: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Cambia el estado de activación de un formulario
     * @param {number} formId - ID del formulario
     * @param {boolean} newStatus - Nuevo estado (true = activo, false = inactivo)
     * @param {number} moduleId - ID del módulo
     */
    async toggleFormStatus(formId, newStatus, moduleId) {
        try {
            // Confirmar acción
            const action = newStatus ? 'activar' : 'desactivar';
            if (!confirm(`¿Está seguro que desea ${action} este formulario?`)) {
                return;
            }
            
            Helpers.showLoading();
            
            // TODO: Implementar servicio para cambiar estado
            // Por ahora simularemos éxito
            console.log(`Cambiando estado del formulario ${formId} a ${newStatus}`);
            
            // Mensaje de éxito simulado
            Helpers.showMessage('Éxito', `El formulario ha sido ${newStatus ? 'activado' : 'desactivado'} correctamente.`);
            
            // Recargar formularios
            await this.showModuleForms(moduleId);
        } catch (error) {
            console.error(`Error al ${newStatus ? 'activar' : 'desactivar'} el formulario:`, error);
            Helpers.showError('Error', `No se pudo ${newStatus ? 'activar' : 'desactivar'} el formulario: ` + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Elimina un formulario
     * @param {number} formId - ID del formulario
     * @param {number} moduleId - ID del módulo
     */
    async deleteForm(formId, moduleId) {
        try {
            // Confirmar eliminación
            if (!confirm('¿Está seguro que desea eliminar este formulario? Esta acción no se puede deshacer.')) {
                return;
            }
            
            Helpers.showLoading();
            
            // TODO: Implementar servicio para eliminar formulario
            // Por ahora simularemos éxito
            console.log(`Eliminando formulario ${formId}`);
            
            // Mensaje de éxito simulado
            Helpers.showMessage('Éxito', 'El formulario ha sido eliminado correctamente.');
            
            // Recargar formularios
            await this.showModuleForms(moduleId);
        } catch (error) {
            console.error('Error al eliminar el formulario:', error);
            Helpers.showError('Error', 'No se pudo eliminar el formulario: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    }
};