/**
 * Controlador para la gestión de personas
 * Permite listar, crear, editar, eliminar y cambiar el estado de personas
 */

const PersonController = {
    // Elementos del DOM
    elements: {
        personsList: null,
        personForm: null,
        searchInput: null,
        addButton: null,
        saveButton: null,
        clearSearchButton: null,
        refreshButton: null,
        filterAllButton: null,
        filterActiveButton: null,
        filterInactiveButton: null,
        personCount: null
    },
    
    // Datos
    persons: [],
    filteredPersons: [],
    currentPerson: null,
    isEditing: false,
    currentFilter: 'all', // 'all', 'active', 'inactive'
    
    /**
     * Inicializa el controlador de personas
     */
    async init() {
        // Obtener referencias a elementos del DOM
        this.elements.personsList = document.getElementById('personsList');
        this.elements.personForm = document.getElementById('personForm');
        this.elements.searchInput = document.getElementById('searchPerson');
        this.elements.addButton = document.getElementById('addPersonBtn');
        this.elements.saveButton = document.getElementById('btnSavePerson');
        this.elements.clearSearchButton = document.getElementById('btnClearPersonSearch');
        this.elements.refreshButton = document.getElementById('btnRefreshPersons');
        this.elements.filterAllButton = document.getElementById('btnFilterAllPersons');
        this.elements.filterActiveButton = document.getElementById('btnFilterActivePersons');
        this.elements.filterInactiveButton = document.getElementById('btnFilterInactivePersons');
        this.elements.personCount = document.getElementById('personCount');
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Cargar lista de personas
        await this.loadPersons();
    },
    
    /**
     * Configura los escuchadores de eventos
     */
    setupEventListeners() {
        // Evento para botón Agregar
        if (this.elements.addButton) {
            this.elements.addButton.addEventListener('click', () => {
                this.showPersonForm();
            });
        }
        
        // Evento para botón Guardar en el modal
        if (this.elements.saveButton) {
            this.elements.saveButton.addEventListener('click', () => {
                this.savePerson();
            });
        }
        
        // Evento para formulario
        if (this.elements.personForm) {
            this.elements.personForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePerson();
            });
        }
        
        // Evento para búsqueda
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.filterPersons(e.target.value);
            });
        }
        
        // Evento para limpiar búsqueda
        if (this.elements.clearSearchButton) {
            this.elements.clearSearchButton.addEventListener('click', () => {
                if (this.elements.searchInput) {
                    this.elements.searchInput.value = '';
                    this.filterPersons('');
                }
            });
        }
        
        // Evento para refrescar lista
        if (this.elements.refreshButton) {
            this.elements.refreshButton.addEventListener('click', async () => {
                await this.loadPersons();
            });
        }
        
        // Eventos para filtros
        if (this.elements.filterAllButton) {
            this.elements.filterAllButton.addEventListener('click', () => {
                this.setFilter('all');
            });
        }
        
        if (this.elements.filterActiveButton) {
            this.elements.filterActiveButton.addEventListener('click', () => {
                this.setFilter('active');
            });
        }
        
        if (this.elements.filterInactiveButton) {
            this.elements.filterInactiveButton.addEventListener('click', () => {
                this.setFilter('inactive');
            });
        }
    },
    
    /**
     * Establece el filtro actual y actualiza la visualización
     * @param {string} filter - Filtro a aplicar ('all', 'active', 'inactive')
     */
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Actualizar clases CSS de los botones
        const buttons = {
            'all': this.elements.filterAllButton,
            'active': this.elements.filterActiveButton,
            'inactive': this.elements.filterInactiveButton
        };
        
        // Quitar clase activa de todos los botones
        Object.values(buttons).forEach(button => {
            if (button) button.classList.remove('active', 'btn-primary', 'btn-success', 'btn-danger');
            if (button) button.classList.add('btn-outline-primary', 'btn-outline-success', 'btn-outline-danger');
        });
        
        // Añadir clase activa al botón seleccionado
        if (buttons[filter]) {
            buttons[filter].classList.remove('btn-outline-primary', 'btn-outline-success', 'btn-outline-danger');
            
            if (filter === 'all') {
                buttons[filter].classList.add('active', 'btn-primary');
            } else if (filter === 'active') {
                buttons[filter].classList.add('active', 'btn-success');
            } else if (filter === 'inactive') {
                buttons[filter].classList.add('active', 'btn-danger');
            }
        }
        
        // Aplicar filtro a la lista
        this.applyFilters();
    },
    
    /**
     * Aplica los filtros actuales (búsqueda y estado) a la lista de personas
     */
    applyFilters() {
        const searchTerm = this.elements.searchInput ? this.elements.searchInput.value.toLowerCase() : '';
        
        // Filtrar por término de búsqueda y estado
        this.filteredPersons = this.persons.filter(person => {
            // Filtro por estado
            if (this.currentFilter === 'active' && !person.active) return false;
            if (this.currentFilter === 'inactive' && person.active) return false;
            
            // Si no hay término de búsqueda, incluir la persona
            if (!searchTerm) return true;
            
            // Filtro por término de búsqueda
            return (
                (person.name && person.name.toLowerCase().includes(searchTerm)) ||
                (person.firstName && person.firstName.toLowerCase().includes(searchTerm)) ||
                (person.firstLastName && person.firstLastName.toLowerCase().includes(searchTerm)) ||
                (person.email && person.email.toLowerCase().includes(searchTerm)) ||
                (person.numberIdentification && person.numberIdentification.toString().includes(searchTerm))
            );
        });
        
        // Actualizar la lista visualizada
        this.renderPersonsList();
    },
    
    /**
     * Carga la lista de personas desde el servidor
     */
    async loadPersons() {
        try {
            Helpers.showLoading();
            
            // Obtener personas del servidor
            this.persons = await PersonService.getAll();
            
            // Aplicar filtros actuales
            this.applyFilters();
            
            Helpers.hideLoading();
        } catch (error) {
            console.error('Error al cargar personas:', error);
            Helpers.showError('Error al cargar la lista de personas: ' + error.message);
            Helpers.hideLoading();
            
            // Mostrar mensaje de error en la tabla
            if (this.elements.personsList) {
                this.elements.personsList.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center text-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Error al cargar datos: ${error.message}
                        </td>
                    </tr>
                `;
            }
        }
    },
    
    /**
     * Renderiza la lista de personas en la interfaz
     */
    renderPersonsList() {
        if (!this.elements.personsList) return;
        
        // Limpiar lista actual
        this.elements.personsList.innerHTML = '';
        
        // Actualizar contador de personas
        if (this.elements.personCount) {
            this.elements.personCount.textContent = `${this.filteredPersons.length} personas`;
        }
        
        // Si no hay personas, mostrar mensaje
        if (!this.filteredPersons || this.filteredPersons.length === 0) {
            this.elements.personsList.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No hay personas registradas</td>
                </tr>
            `;
            return;
        }
        
        // Renderizar cada persona
        this.filteredPersons.forEach(person => {
            const row = document.createElement('tr');
            row.dataset.id = person.id;
            
            row.innerHTML = `
                <td>${person.id}</td>
                <td>${Helpers.escapeHtml(person.name || '')}</td>
                <td>${Helpers.escapeHtml((person.firstName || '') + ' ' + (person.secondName || '') + ' ' + (person.firstLastName || '') + ' ' + (person.secondLastName || ''))}</td>
                <td>${Helpers.escapeHtml(person.email || '')}</td>
                <td>${Helpers.escapeHtml((person.typeIdentification || '') + ': ' + (person.numberIdentification || ''))}</td>
                <td>${Helpers.createStatusBadge(person.active)}</td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-primary btn-edit" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn ${person.active ? 'btn-warning' : 'btn-success'} btn-toggle-status" title="${person.active ? 'Desactivar' : 'Activar'}">
                            <i class="bi ${person.active ? 'bi-toggle-off' : 'bi-toggle-on'}"></i>
                        </button>
                        <button class="btn btn-danger btn-delete" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Agregar eventos a los botones
            row.querySelector('.btn-edit').addEventListener('click', () => {
                this.editPerson(person.id);
            });
            
            row.querySelector('.btn-toggle-status').addEventListener('click', () => {
                this.togglePersonStatus(person.id, !person.active);
            });
            
            row.querySelector('.btn-delete').addEventListener('click', () => {
                this.deletePerson(person.id);
            });
            
            this.elements.personsList.appendChild(row);
        });
    },
    
    /**
     * Filtra la lista de personas según el término de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     */
    filterPersons(searchTerm) {
        // Aplicar filtros actuales (incluye el término de búsqueda)
        this.applyFilters();
    },
    
    /**
     * Muestra el formulario para crear/editar una persona
     * @param {Object} person - Datos de la persona a editar (opcional)
     */
    showPersonForm(person = null) {
        // Obtener referencia al modal y formulario
        const modal = new bootstrap.Modal(document.getElementById('personModal'));
        const form = document.getElementById('personForm');
        
        if (!form) return;
        
        // Limpiar formulario
        form.reset();
        
        // Establecer modo (creación o edición)
        this.isEditing = !!person;
        this.currentPerson = person;
        
        // Actualizar título del modal
        document.getElementById('personModalTitle').textContent = 
            this.isEditing ? 'Editar Persona' : 'Crear Nueva Persona';
        
        // Si estamos editando, rellenar el formulario
        if (this.isEditing && person) {
            // Rellenar campos básicos
            form.elements['id'].value = person.id || '';
            form.elements['name'].value = person.name || '';
            form.elements['email'].value = person.email || '';
            form.elements['firstName'].value = person.firstName || '';
            form.elements['secondName'].value = person.secondName || '';
            form.elements['firstLastName'].value = person.firstLastName || '';
            form.elements['secondLastName'].value = person.secondLastName || '';
            form.elements['typeIdentification'].value = person.typeIdentification || '';
            form.elements['numberIdentification'].value = person.numberIdentification || '';
            form.elements['phoneNumber'].value = person.phoneNumber || '';
            
            // Comprobar checkboxes
            form.elements['signing'].checked = !!person.signing;
            form.elements['active'].checked = !!person.active;
        } else {
            // En creación, establecer valores por defecto
            form.elements['id'].value = '0';
            form.elements['active'].checked = true; // Por defecto activo
        }
        
        // Mostrar modal
        modal.show();
    },
    
    /**
     * Guarda los datos de una persona (creación o edición)
     */
    async savePerson() {
        try {
            // Obtener formulario y datos
            const form = document.getElementById('personForm');
            
            if (!form) return;
            
            // Validar formulario
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }
            
            // Recopilar datos del formulario
            const personData = {
                id: parseInt(form.elements['id'].value, 10) || 0,
                name: form.elements['name'].value.trim(),
                firstName: form.elements['firstName'].value.trim(),
                secondName: form.elements['secondName'].value.trim(),
                firstLastName: form.elements['firstLastName'].value.trim(),
                secondLastName: form.elements['secondLastName'].value.trim(),
                email: form.elements['email'].value.trim(),
                phoneNumber: form.elements['phoneNumber'].value.trim(),
                typeIdentification: form.elements['typeIdentification'].value,
                numberIdentification: parseInt(form.elements['numberIdentification'].value, 10) || 0,
                signing: form.elements['signing'].checked ? form.elements['signing'].checked.toString() : "",
                active: form.elements['active'].checked
            };
            
            console.log('Datos a enviar:', personData);
            
            // Mostrar spinner
            Helpers.showLoading();
            
            // Guardar datos en el servidor
            let savedPerson;
            
            if (this.isEditing && personData.id > 0) {
                // Edición: actualizar persona existente
                savedPerson = await PersonService.update(personData.id, personData);
                Helpers.showMessage('Persona actualizada', 'La persona ha sido actualizada correctamente.');
            } else {
                // Creación: crear nueva persona
                savedPerson = await PersonService.create(personData);
                Helpers.showMessage('Persona creada', 'La persona ha sido creada correctamente.');
            }
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('personModal'));
            if (modal) modal.hide();
            
            // Recargar lista de personas
            await this.loadPersons();
            
        } catch (error) {
            console.error('Error al guardar persona:', error);
            Helpers.showError('Error al guardar los datos', error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Carga los datos de una persona para edición
     * @param {number} id - ID de la persona
     */
    async editPerson(id) {
        try {
            Helpers.showLoading();
            
            // Obtener datos de la persona desde el servidor
            const person = await PersonService.getById(id);
            
            // Mostrar formulario con los datos cargados
            this.showPersonForm(person);
            
        } catch (error) {
            console.error(`Error al cargar datos de la persona ID ${id}:`, error);
            Helpers.showError('Error al cargar los datos de la persona: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Cambia el estado de activación de una persona
     * @param {number} id - ID de la persona
     * @param {boolean} newStatus - Nuevo estado (true = activo, false = inactivo)
     */
    async togglePersonStatus(id, newStatus) {
        const confirmMessage = newStatus 
            ? '¿Está seguro de activar esta persona?' 
            : '¿Está seguro de desactivar esta persona?';
            
        if (!confirm(confirmMessage)) {
            return;
        }
        
        try {
            Helpers.showLoading();
            
            // Actualizar estado en el servidor
            if (newStatus) {
                await PersonService.activate(id);
                Helpers.showMessage('Persona activada', 'La persona ha sido activada correctamente.');
            } else {
                await PersonService.deactivate(id);
                Helpers.showMessage('Persona desactivada', 'La persona ha sido desactivada correctamente.');
            }
            
            // Recargar lista de personas
            await this.loadPersons();
            
        } catch (error) {
            console.error(`Error al cambiar estado de la persona ID ${id}:`, error);
            Helpers.showError('Error al cambiar el estado de la persona: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    },
    
    /**
     * Elimina una persona
     * @param {number} id - ID de la persona
     */
    async deletePerson(id) {
        if (!confirm('¿Está seguro de eliminar esta persona? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            Helpers.showLoading();
            
            // Eliminar persona del servidor (usando soft delete)
            await PersonService.delete(id);
            
            Helpers.showMessage('Persona eliminada', 'La persona ha sido eliminada correctamente.');
            
            // Recargar lista de personas
            await this.loadPersons();
            
        } catch (error) {
            console.error(`Error al eliminar la persona ID ${id}:`, error);
            Helpers.showError('Error al eliminar la persona: ' + error.message);
        } finally {
            Helpers.hideLoading();
        }
    }
};