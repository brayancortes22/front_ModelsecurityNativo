/**
 * Controlador para la gestión de formularios
 */
const FormController = {
    // Elementos del DOM
    elements: {
        formsList: null,
        formCount: null,
        searchForm: null,
        btnClearFormSearch: null,
        btnRefreshForms: null,
        btnFilterAllForms: null,
        btnFilterActiveForms: null,
        btnFilterInactiveForms: null,
        btnNewForm: null,
        formModal: null,
        formForm: null,
        formFormTitle: null,
        formFormMsg: null,
        formId: null,
        formName: null,
        formDescription: null,
        formRoute: null,
        formCuestion: null,
        formTypeCuestion: null,
        formAnswer: null,
        formActive: null,
        btnSaveForm: null,
        formDetailsModal: null,
        formDetailsName: null,
        detailFormId: null,
        detailFormName: null,
        detailFormRoute: null,
        detailFormStatus: null,
        detailFormCreateDate: null,
        detailFormUpdateDate: null,
        detailFormDescription: null,
        detailFormCuestion: null,
        detailFormTypeCuestion: null,
        detailFormAnswer: null,
        btnEditFromDetails: null,
        formPagination: null
    },

    // Estado del controlador
    state: {
        forms: [],
        filteredForms: [],
        currentFilter: 'all',
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 1,
        searchQuery: '',
        currentFormId: null
    },

    /**
     * Inicializa el controlador
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.loadForms();
    },

    /**
     * Almacena referencias a elementos del DOM
     */
    cacheElements() {
        // Lista y filtros
        this.elements.formsList = document.getElementById('formsList');
        this.elements.formCount = document.getElementById('formCount');
        this.elements.searchForm = document.getElementById('searchForm');
        this.elements.btnClearFormSearch = document.getElementById('btnClearFormSearch');
        this.elements.btnRefreshForms = document.getElementById('btnRefreshForms');
        this.elements.btnFilterAllForms = document.getElementById('btnFilterAllForms');
        this.elements.btnFilterActiveForms = document.getElementById('btnFilterActiveForms');
        this.elements.btnFilterInactiveForms = document.getElementById('btnFilterInactiveForms');
        this.elements.btnNewForm = document.getElementById('btnNewForm');
        this.elements.formPagination = document.getElementById('formPagination');

        // Modal de formulario
        this.elements.formModal = document.getElementById('formModal');
        this.elements.formForm = document.getElementById('formForm');
        this.elements.formFormTitle = document.getElementById('formFormTitle');
        this.elements.formFormMsg = document.getElementById('formFormMsg');
        this.elements.formId = document.getElementById('formId');
        this.elements.formName = document.getElementById('formName');
        this.elements.formDescription = document.getElementById('formDescription');
        this.elements.formRoute = document.getElementById('formRoute');
        this.elements.formCuestion = document.getElementById('formCuestion');
        this.elements.formTypeCuestion = document.getElementById('formTypeCuestion');
        this.elements.formAnswer = document.getElementById('formAnswer');
        this.elements.formActive = document.getElementById('formActive');
        this.elements.btnSaveForm = document.getElementById('btnSaveForm');

        // Modal de detalles
        this.elements.formDetailsModal = document.getElementById('formDetailsModal');
        this.elements.formDetailsName = document.getElementById('formDetailsName');
        this.elements.detailFormId = document.getElementById('detailFormId');
        this.elements.detailFormName = document.getElementById('detailFormName');
        this.elements.detailFormRoute = document.getElementById('detailFormRoute');
        this.elements.detailFormStatus = document.getElementById('detailFormStatus');
        this.elements.detailFormCreateDate = document.getElementById('detailFormCreateDate');
        this.elements.detailFormUpdateDate = document.getElementById('detailFormUpdateDate');
        this.elements.detailFormDescription = document.getElementById('detailFormDescription');
        this.elements.detailFormCuestion = document.getElementById('detailFormCuestion');
        this.elements.detailFormTypeCuestion = document.getElementById('detailFormTypeCuestion');
        this.elements.detailFormAnswer = document.getElementById('detailFormAnswer');
        this.elements.btnEditFromDetails = document.getElementById('btnEditFromDetails');

        // Botón de volver
        this.elements.btnBack = document.querySelector('.btn-back');
    },

    /**
     * Asocia eventos a elementos del DOM
     */
    bindEvents() {
        // Eventos de búsqueda y filtrado
        this.elements.searchForm?.addEventListener('input', this.handleSearch.bind(this));
        this.elements.btnClearFormSearch?.addEventListener('click', this.handleClearSearch.bind(this));
        this.elements.btnRefreshForms?.addEventListener('click', this.handleRefresh.bind(this));
        this.elements.btnFilterAllForms?.addEventListener('click', () => this.handleFilter('all'));
        this.elements.btnFilterActiveForms?.addEventListener('click', () => this.handleFilter('active'));
        this.elements.btnFilterInactiveForms?.addEventListener('click', () => this.handleFilter('inactive'));
        
        // Evento para nuevo formulario
        this.elements.btnNewForm?.addEventListener('click', this.handleNewForm.bind(this));
        
        // Evento para guardar formulario
        this.elements.formForm?.addEventListener('submit', this.handleSaveForm.bind(this));
        
        // Evento para editar desde detalles
        this.elements.btnEditFromDetails?.addEventListener('click', this.handleEditFromDetails.bind(this));

        // Evento para volver atrás
        this.elements.btnBack?.addEventListener('click', () => window.location.href = 'dashboard.html');

        // Bootstrap modals
        if (this.elements.formModal) {
            this.elements.formModal.addEventListener('hidden.bs.modal', this.resetFormForm.bind(this));
        }
    },

    /**
     * Carga la lista de formularios desde el servidor
     */
    async loadForms() {
        try {
            Helpers.showLoading();
            
            // Obtener formularios
            const forms = await FormService.getAll();
            
            // Almacenar y mostrar formularios
            this.state.forms = forms;
            this.applyFiltersAndSearch();
            
            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al cargar formularios:', error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudieron cargar los formularios: ' + error.message);
            
            // Mostrar mensaje de error en la tabla
            if (this.elements.formsList) {
                this.elements.formsList.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center text-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Error al cargar los formularios: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    },

    /**
     * Aplica filtros y búsqueda a la lista de formularios
     */
    applyFiltersAndSearch() {
        let filtered = [...this.state.forms];
        
        // Aplicar filtro de estado
        if (this.state.currentFilter === 'active') {
            filtered = filtered.filter(form => form.active);
        } else if (this.state.currentFilter === 'inactive') {
            filtered = filtered.filter(form => !form.active);
        }
        
        // Aplicar búsqueda
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            filtered = filtered.filter(form => 
                form.name.toLowerCase().includes(query) || 
                (form.description && form.description.toLowerCase().includes(query)) ||
                (form.route && form.route.toLowerCase().includes(query))
            );
        }
        
        // Actualizar estado
        this.state.filteredForms = filtered;
        this.state.totalPages = Math.max(1, Math.ceil(filtered.length / this.state.itemsPerPage));
        
        // Asegurar que la página actual es válida
        if (this.state.currentPage > this.state.totalPages) {
            this.state.currentPage = 1;
        }
        
        // Renderizar resultados
        this.renderFormsList();
        this.renderPagination();
        this.updateFilterButtons();
        
        // Actualizar contador
        if (this.elements.formCount) {
            this.elements.formCount.textContent = `${filtered.length} formulario${filtered.length !== 1 ? 's' : ''}`;
        }
    },

    /**
     * Actualiza la apariencia de los botones de filtro según el filtro actual
     */
    updateFilterButtons() {
        // Quitar clase activa de todos los botones
        this.elements.btnFilterAllForms?.classList.remove('btn-primary');
        this.elements.btnFilterAllForms?.classList.add('btn-outline-primary');
        this.elements.btnFilterActiveForms?.classList.remove('btn-success');
        this.elements.btnFilterActiveForms?.classList.add('btn-outline-success');
        this.elements.btnFilterInactiveForms?.classList.remove('btn-danger');
        this.elements.btnFilterInactiveForms?.classList.add('btn-outline-danger');
        
        // Añadir clase activa al botón correspondiente al filtro actual
        if (this.state.currentFilter === 'all' && this.elements.btnFilterAllForms) {
            this.elements.btnFilterAllForms.classList.remove('btn-outline-primary');
            this.elements.btnFilterAllForms.classList.add('btn-primary');
        } else if (this.state.currentFilter === 'active' && this.elements.btnFilterActiveForms) {
            this.elements.btnFilterActiveForms.classList.remove('btn-outline-success');
            this.elements.btnFilterActiveForms.classList.add('btn-success');
        } else if (this.state.currentFilter === 'inactive' && this.elements.btnFilterInactiveForms) {
            this.elements.btnFilterInactiveForms.classList.remove('btn-outline-danger');
            this.elements.btnFilterInactiveForms.classList.add('btn-danger');
        }
    },

    /**
     * Renderiza la lista de formularios en la tabla
     */
    renderFormsList() {
        if (!this.elements.formsList) return;
        
        const start = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const end = start + this.state.itemsPerPage;
        const paginatedForms = this.state.filteredForms.slice(start, end);
        
        if (paginatedForms.length === 0) {
            this.elements.formsList.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">
                        <i class="bi bi-inbox me-2"></i>
                        No se encontraron formularios
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        paginatedForms.forEach(form => {
            html += `
                <tr>
                    <td>${form.id}</td>
                    <td>${Helpers.escapeHtml(form.name)}</td>
                    <td>${form.route ? Helpers.escapeHtml(form.route) : '<span class="text-muted">No definida</span>'}</td>
                    <td>${Helpers.escapeHtml(form.typeCuestion || '')}</td>
                    <td>
                        ${form.active 
                            ? '<span class="badge bg-success">Activo</span>' 
                            : '<span class="badge bg-danger">Inactivo</span>'}
                    </td>
                    <td class="text-center">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-info btn-view-form" data-id="${form.id}" title="Ver detalles">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-edit-form" data-id="${form.id}" title="Editar">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn ${form.active ? 'btn-warning' : 'btn-success'} btn-toggle-form" 
                                    data-id="${form.id}" data-active="${form.active}" 
                                    title="${form.active ? 'Desactivar' : 'Activar'}">
                                <i class="bi ${form.active ? 'bi-toggle-off' : 'bi-toggle-on'}"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        this.elements.formsList.innerHTML = html;
        
        // Asociar eventos a los botones de acciones
        this.elements.formsList.querySelectorAll('.btn-view-form').forEach(btn => {
            btn.addEventListener('click', () => this.handleViewForm(parseInt(btn.dataset.id)));
        });
        
        this.elements.formsList.querySelectorAll('.btn-edit-form').forEach(btn => {
            btn.addEventListener('click', () => this.handleEditForm(parseInt(btn.dataset.id)));
        });
        
        this.elements.formsList.querySelectorAll('.btn-toggle-form').forEach(btn => {
            btn.addEventListener('click', () => this.handleToggleForm(
                parseInt(btn.dataset.id), 
                btn.dataset.active === 'true'
            ));
        });
    },

    /**
     * Renderiza la paginación
     */
    renderPagination() {
        if (!this.elements.formPagination) return;
        
        if (this.state.totalPages <= 1) {
            this.elements.formPagination.innerHTML = '';
            return;
        }
        
        let html = `
            <li class="page-item ${this.state.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.state.currentPage - 1}">Anterior</a>
            </li>
        `;
        
        // Mostrar máximo 5 páginas
        const startPage = Math.max(1, this.state.currentPage - 2);
        const endPage = Math.min(this.state.totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.state.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        
        html += `
            <li class="page-item ${this.state.currentPage === this.state.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.state.currentPage + 1}">Siguiente</a>
            </li>
        `;
        
        this.elements.formPagination.innerHTML = html;
        
        // Asociar eventos a los enlaces de paginación
        this.elements.formPagination.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(link.dataset.page);
                if (!isNaN(page) && page > 0 && page <= this.state.totalPages) {
                    this.state.currentPage = page;
                    this.renderFormsList();
                    this.renderPagination();
                }
            });
        });
    },

    /**
     * Maneja la búsqueda de formularios
     */
    handleSearch(event) {
        this.state.searchQuery = event.target.value.trim();
        this.state.currentPage = 1;
        this.applyFiltersAndSearch();
    },

    /**
     * Maneja la limpieza del campo de búsqueda
     */
    handleClearSearch() {
        if (this.elements.searchForm) {
            this.elements.searchForm.value = '';
            this.state.searchQuery = '';
            this.state.currentPage = 1;
            this.applyFiltersAndSearch();
        }
    },

    /**
     * Maneja la actualización de la lista de formularios
     */
    handleRefresh() {
        this.loadForms();
    },

    /**
     * Maneja el cambio de filtro
     */
    handleFilter(filter) {
        this.state.currentFilter = filter;
        this.state.currentPage = 1;
        this.applyFiltersAndSearch();
    },

    /**
     * Maneja el evento de creación de nuevo formulario
     */
    handleNewForm() {
        // Mostrar modal en modo creación
        this.resetFormForm();
        this.elements.formFormTitle.textContent = 'Nuevo Formulario';
        this.elements.formId.value = '0';
        this.elements.formActive.checked = true;
        
        // Mostrar modal
        const modal = bootstrap.Modal.getInstance(this.elements.formModal) || new bootstrap.Modal(this.elements.formModal);
        modal.show();
    },

    /**
     * Maneja el evento de edición de formulario
     */
    async handleEditForm(id) {
        try {
            Helpers.showLoading();
            
            // Obtener detalles del formulario
            const form = await FormService.getById(id);
            
            // Llenar formulario
            this.elements.formFormTitle.textContent = 'Editar Formulario';
            this.elements.formId.value = form.id;
            this.elements.formName.value = form.name || '';
            this.elements.formDescription.value = form.description || '';
            this.elements.formRoute.value = form.route || '';
            this.elements.formCuestion.value = form.cuestion || '';
            this.elements.formTypeCuestion.value = form.typeCuestion || '';
            this.elements.formAnswer.value = form.answer || '';
            this.elements.formActive.checked = form.active;
            
            // Ocultar mensaje de error si está visible
            this.elements.formFormMsg.classList.add('d-none');
            
            // Mostrar modal
            const modal = bootstrap.Modal.getInstance(this.elements.formModal) || new bootstrap.Modal(this.elements.formModal);
            modal.show();
            
            Helpers.hideLoading();
        } catch (error) {
            console.error(`Error al cargar formulario con ID ${id}:`, error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudo cargar el formulario: ' + error.message);
        }
    },

    /**
     * Maneja el evento de ver detalles de formulario
     */
    async handleViewForm(id) {
        try {
            Helpers.showLoading();
            
            // Obtener detalles del formulario
            const form = await FormService.getById(id);
            this.state.currentFormId = id;
            
            // Actualizar la información del modal
            this.elements.formDetailsName.textContent = form.name;
            this.elements.detailFormId.textContent = form.id;
            this.elements.detailFormName.textContent = form.name || '';
            this.elements.detailFormRoute.textContent = form.route || 'No definida';
            
            // Estado
            this.elements.detailFormStatus.innerHTML = form.active 
                ? '<span class="badge bg-success">Activo</span>' 
                : '<span class="badge bg-danger">Inactivo</span>';
            
            // Fechas
            this.elements.detailFormCreateDate.textContent = form.createDate 
                ? new Date(form.createDate).toLocaleString() 
                : 'No disponible';
                
            this.elements.detailFormUpdateDate.textContent = form.updateDate 
                ? new Date(form.updateDate).toLocaleString() 
                : 'No disponible';
            
            // Información de cuestión
            this.elements.detailFormDescription.textContent = form.description || 'Sin descripción';
            this.elements.detailFormCuestion.textContent = form.cuestion || '';
            this.elements.detailFormTypeCuestion.textContent = form.typeCuestion || '';
            this.elements.detailFormAnswer.textContent = form.answer || '';
            
            // Mostrar modal
            const modal = bootstrap.Modal.getInstance(this.elements.formDetailsModal) || new bootstrap.Modal(this.elements.formDetailsModal);
            modal.show();
            
            Helpers.hideLoading();
        } catch (error) {
            console.error(`Error al cargar detalles del formulario con ID ${id}:`, error);
            Helpers.hideLoading();
            Helpers.showError('Error', 'No se pudieron cargar los detalles del formulario: ' + error.message);
        }
    },

    /**
     * Maneja el evento de editar desde la vista de detalles
     */
    handleEditFromDetails() {
        // Cerrar modal de detalles
        const detailsModal = bootstrap.Modal.getInstance(this.elements.formDetailsModal);
        if (detailsModal) {
            detailsModal.hide();
        }
        
        // Abrir modal de edición
        if (this.state.currentFormId) {
            this.handleEditForm(this.state.currentFormId);
        }
    },

    /**
     * Maneja el evento de cambio de estado de un formulario
     */
    async handleToggleForm(id, isActive) {
        try {
            const action = isActive ? 'desactivar' : 'activar';
            const confirmation = confirm(`¿Está seguro que desea ${action} este formulario?`);
            
            if (!confirmation) return;
            
            Helpers.showLoading();
            
            // Cambiar estado
            await FormService.changeStatus(id, !isActive);
            
            // Refrescar lista
            await this.loadForms();
            
            Helpers.hideLoading();
            Helpers.showMessage('Éxito', `Formulario ${action}do correctamente`);
        } catch (error) {
            console.error(`Error al cambiar estado del formulario con ID ${id}:`, error);
            Helpers.hideLoading();
            Helpers.showError('Error', `No se pudo ${isActive ? 'desactivar' : 'activar'} el formulario: ` + error.message);
        }
    },

    /**
     * Maneja el evento de guardar formulario
     */
    async handleSaveForm(event) {
        event.preventDefault();
        
        try {
            // Validar formulario
            if (!this.validateFormForm()) {
                return;
            }
            
            Helpers.showLoading();
            
            // Recopilar datos
            const formData = {
                id: parseInt(this.elements.formId.value) || 0,
                name: this.elements.formName.value.trim(),
                description: this.elements.formDescription.value.trim(),
                route: this.elements.formRoute.value.trim(),
                cuestion: this.elements.formCuestion.value.trim(),
                typeCuestion: this.elements.formTypeCuestion.value,
                answer: this.elements.formAnswer.value.trim(),
                active: this.elements.formActive.checked
            };
            
            // Determinar si es creación o actualización
            let result;
            if (formData.id === 0) {
                result = await FormService.create(formData);
            } else {
                result = await FormService.update(formData.id, formData);
            }
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(this.elements.formModal);
            if (modal) {
                modal.hide();
            }
            
            // Refrescar lista
            await this.loadForms();
            
            Helpers.hideLoading();
            Helpers.showMessage('Éxito', `Formulario ${formData.id === 0 ? 'creado' : 'actualizado'} correctamente`);
        } catch (error) {
            console.error('Error al guardar formulario:', error);
            Helpers.hideLoading();
            
            // Mostrar mensaje de error en el formulario
            this.elements.formFormMsg.textContent = 'Error al guardar: ' + error.message;
            this.elements.formFormMsg.classList.remove('d-none');
        }
    },

    /**
     * Valida el formulario antes de enviar
     */
    validateFormForm() {
        // Ocultar mensaje de error si está visible
        this.elements.formFormMsg.classList.add('d-none');
        
        // Validar nombre
        if (!this.elements.formName.value.trim()) {
            this.elements.formFormMsg.textContent = 'El nombre del formulario es obligatorio';
            this.elements.formFormMsg.classList.remove('d-none');
            this.elements.formName.focus();
            return false;
        }
        
        // Validar cuestión
        if (!this.elements.formCuestion.value.trim()) {
            this.elements.formFormMsg.textContent = 'La cuestión es obligatoria';
            this.elements.formFormMsg.classList.remove('d-none');
            this.elements.formCuestion.focus();
            return false;
        }
        
        // Validar tipo de cuestión
        if (!this.elements.formTypeCuestion.value) {
            this.elements.formFormMsg.textContent = 'El tipo de cuestión es obligatorio';
            this.elements.formFormMsg.classList.remove('d-none');
            this.elements.formTypeCuestion.focus();
            return false;
        }
        
        // Validar respuesta
        if (!this.elements.formAnswer.value.trim()) {
            this.elements.formFormMsg.textContent = 'La respuesta es obligatoria';
            this.elements.formFormMsg.classList.remove('d-none');
            this.elements.formAnswer.focus();
            return false;
        }
        
        return true;
    },

    /**
     * Resetea el formulario
     */
    resetFormForm() {
        this.elements.formForm.reset();
        this.elements.formId.value = '0';
        this.elements.formFormMsg.classList.add('d-none');
    }
};