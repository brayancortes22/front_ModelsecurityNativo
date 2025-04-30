/**
 * Controlador para la gestión de usuarios
 * Maneja la interacción del usuario con la vista de usuarios
 */

const UserController = {
    // Referencia a elementos del DOM
    elements: {
        usersContainer: null,
        usersList: null,
        userForm: null,
        userFormTitle: null,
        btnNewUser: null,
        btnSaveUser: null,
        btnCancelUser: null,
        userFormMsg: null,
        searchUserInput: null
    },
    
    // Estado del controlador
    state: {
        users: [],
        currentUser: null,
        editMode: false,
        persons: [] // Personas disponibles para asociar a usuarios
    },
    
    /**
     * Inicializa el controlador
     */
    async init() {
        this.cacheElements();
        this.bindEvents();
        await Promise.all([
            this.loadUsers(),
            this.loadPersons()
        ]);
        this.renderUsersList();
    },
    
    /**
     * Almacena referencias a elementos del DOM
     */
    cacheElements() {
        const container = document.getElementById('usersView');
        if (!container) return;
        
        this.elements.usersContainer = container;
        this.elements.usersList = container.querySelector('#usersList');
        this.elements.userForm = container.querySelector('#userForm');
        this.elements.userFormTitle = container.querySelector('#userFormTitle');
        this.elements.btnNewUser = container.querySelector('#btnNewUser');
        this.elements.btnSaveUser = container.querySelector('#btnSaveUser');
        this.elements.btnCancelUser = container.querySelector('#btnCancelUser');
        this.elements.userFormMsg = container.querySelector('#userFormMsg');
        this.elements.searchUserInput = container.querySelector('#searchUser');
    },
    
    /**
     * Vincula eventos a elementos del DOM
     */
    bindEvents() {
        if (!this.elements.usersContainer) return;
        
        // Evento para crear un nuevo usuario
        this.elements.btnNewUser.addEventListener('click', () => this.showUserForm());
        
        // Evento para guardar un usuario
        this.elements.userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });
        
        // Evento para cancelar la edición
        this.elements.btnCancelUser.addEventListener('click', () => this.cancelUserEdit());
        
        // Evento para buscar usuarios
        if (this.elements.searchUserInput) {
            this.elements.searchUserInput.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }
    },
    
    /**
     * Carga la lista de usuarios desde la API con mensajes de depuración
     */
    async loadUsers() {
        try {
            console.log('UserController: Iniciando carga de usuarios...');
            Helpers.showLoading();
            this.state.users = await UserService.getAll();
            console.log('UserController: Usuarios cargados correctamente:', this.state.users);
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            console.error('UserController: Error al cargar los usuarios:', error);
            Helpers.showError('Error al cargar los usuarios', error.message);
        }
    },

    /**
     * Carga la lista de personas disponibles con mensajes de depuración
     */
    async loadPersons() {
        try {
            console.log('UserController: Iniciando carga de personas...');
            Helpers.showLoading();
            this.state.persons = await PersonService.getAllPersons();
            console.log('UserController: Personas cargadas correctamente:', this.state.persons);
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            console.error('UserController: Error al cargar las personas:', error);
            Helpers.showError('Error al cargar las personas', error.message);
        }
    },
    
    /**
     * Renderiza la lista de usuarios
     */
    renderUsersList() {
        if (!this.elements.usersList) return;
        
        this.elements.usersList.innerHTML = '';
        
        if (this.state.users.length === 0) {
            this.elements.usersList.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay usuarios disponibles</td>
                </tr>
            `;
            return;
        }
        
        this.state.users.forEach(user => {
            const tr = document.createElement('tr');
            tr.className = user.active ? '' : 'table-secondary';
            
            // Buscar información de la persona asociada
            const person = this.state.persons.find(p => p.id === user.personId);
            const personName = person ? `${person.firstName} ${person.firstLastName}` : 'N/A';
            
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${Helpers.escapeHtml(user.username)}</td>
                <td>${Helpers.escapeHtml(user.email)}</td>
                <td>${Helpers.escapeHtml(personName)}</td>
                <td>
                    <span class="badge ${user.active ? 'bg-success' : 'bg-danger'}">
                        ${user.active ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-edit" data-id="${user.id}" title="Editar">
                            <i class="bi bi-pencil"></i>
                        </button>
                        ${user.active 
                            ? `<button class="btn btn-outline-warning btn-deactivate" data-id="${user.id}" title="Desactivar">
                                <i class="bi bi-toggle-off"></i>
                              </button>`
                            : `<button class="btn btn-outline-success btn-activate" data-id="${user.id}" title="Activar">
                                <i class="bi bi-toggle-on"></i>
                              </button>`
                        }
                        <button class="btn btn-outline-danger btn-delete" data-id="${user.id}" title="Eliminar">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button class="btn btn-outline-info btn-roles" data-id="${user.id}" title="Roles">
                            <i class="bi bi-person-gear"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-password" data-id="${user.id}" title="Cambiar contraseña">
                            <i class="bi bi-key"></i>
                        </button>
                    </div>
                </td>
            `;
            
            // Agregar event listeners a los botones
            const editBtn = tr.querySelector('.btn-edit');
            const activateBtn = tr.querySelector('.btn-activate');
            const deactivateBtn = tr.querySelector('.btn-deactivate');
            const deleteBtn = tr.querySelector('.btn-delete');
            const rolesBtn = tr.querySelector('.btn-roles');
            const passwordBtn = tr.querySelector('.btn-password');
            
            if (editBtn) {
                editBtn.addEventListener('click', () => this.editUser(user.id));
            }
            
            if (activateBtn) {
                activateBtn.addEventListener('click', () => this.toggleUserStatus(user.id, true));
            }
            
            if (deactivateBtn) {
                deactivateBtn.addEventListener('click', () => this.toggleUserStatus(user.id, false));
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteUser(user.id));
            }
            
            if (rolesBtn) {
                rolesBtn.addEventListener('click', () => this.manageUserRoles(user.id));
            }
            
            if (passwordBtn) {
                passwordBtn.addEventListener('click', () => this.changeUserPassword(user.id));
            }
            
            this.elements.usersList.appendChild(tr);
        });
    },
    
    /**
     * Filtra la lista de usuarios según el texto de búsqueda
     * @param {string} searchText - Texto de búsqueda
     */
    filterUsers(searchText) {
        if (!this.elements.usersList) return;
        
        const rows = this.elements.usersList.querySelectorAll('tr');
        
        rows.forEach(row => {
            const userText = row.textContent.toLowerCase();
            const match = userText.includes(searchText.toLowerCase());
            row.style.display = match ? '' : 'none';
        });
    },
    
    /**
     * Muestra el formulario para crear un nuevo usuario
     */
    showUserForm(userData = null) {
        if (!this.elements.userForm) return;
        
        this.state.editMode = !!userData;
        this.state.currentUser = userData;
        
        // Restablecer formulario
        this.elements.userForm.reset();
        this.elements.userFormMsg.textContent = '';
        
        // Establecer título según modo
        this.elements.userFormTitle.textContent = this.state.editMode ? 'Editar Usuario' : 'Nuevo Usuario';
        
        // Cargar el select de personas
        const personSelect = this.elements.userForm.elements['personId'];
        personSelect.innerHTML = '<option value="">Seleccione una persona</option>';
        
        this.state.persons.forEach(person => {
            const option = document.createElement('option');
            option.value = person.id;
            option.textContent = `${person.firstName} ${person.firstLastName} (${person.numberIdentification})`;
            personSelect.appendChild(option);
        });
        
        // Mostrar u ocultar campo de contraseña según si es edición o creación
        const passwordField = this.elements.userForm.querySelector('.password-field');
        if (passwordField) {
            passwordField.classList.toggle('d-none', this.state.editMode);
        }
        
        // Completar datos si está en modo edición
        if (this.state.editMode && userData) {
            this.elements.userForm.elements['username'].value = userData.username || '';
            this.elements.userForm.elements['email'].value = userData.email || '';
            this.elements.userForm.elements['personId'].value = userData.personId || '';
            this.elements.userForm.elements['active'].checked = userData.active;
        } else {
            // En modo creación, establecer activo por defecto
            this.elements.userForm.elements['active'].checked = true;
        }
        
        // Mostrar formulario
        this.elements.userForm.classList.remove('d-none');
        this.elements.usersList.closest('.card').classList.add('d-none');
        this.elements.btnNewUser.classList.add('d-none');
    },
    
    /**
     * Cancela la edición de un usuario
     */
    cancelUserEdit() {
        if (!this.elements.userForm) return;
        
        this.elements.userForm.classList.add('d-none');
        this.elements.usersList.closest('.card').classList.remove('d-none');
        this.elements.btnNewUser.classList.remove('d-none');
        
        this.state.editMode = false;
        this.state.currentUser = null;
    },
    
    /**
     * Edita un usuario existente
     * @param {number} id - ID del usuario a editar
     */
    async editUser(id) {
        try {
            Helpers.showLoading();
            const user = await UserService.getUserById(id);
            Helpers.hideLoading();
            
            this.showUserForm(user);
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cargar el usuario', error.message);
            console.error('Error loading user for edit:', error);
        }
    },
    
    /**
     * Guarda un usuario (nuevo o existente)
     */
    async saveUser() {
        if (!this.elements.userForm) return;
        
        try {
            // Validar formulario
            if (!this.validateUserForm()) {
                return;
            }
            
            // Obtener datos del formulario
            const userData = {
                username: this.elements.userForm.elements['username'].value,
                email: this.elements.userForm.elements['email'].value,
                personId: parseInt(this.elements.userForm.elements['personId'].value),
                active: this.elements.userForm.elements['active'].checked
            };
            
            // Si es un nuevo usuario, agregar contraseña
            if (!this.state.editMode) {
                userData.password = this.elements.userForm.elements['password'].value;
            }
            
            Helpers.showLoading();
            
            // En modo edición, incluir el ID
            if (this.state.editMode && this.state.currentUser) {
                userData.id = this.state.currentUser.id;
                await UserService.updateUser(this.state.currentUser.id, userData);
                Helpers.showMessage('Usuario actualizado', 'El usuario se ha actualizado correctamente');
            } else {
                await UserService.createUser(userData);
                Helpers.showMessage('Usuario creado', 'El usuario se ha creado correctamente');
            }
            
            // Recargar usuarios y mostrar lista
            await this.loadUsers();
            this.renderUsersList();
            this.cancelUserEdit();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al guardar el usuario', error.message);
            console.error('Error saving user:', error);
        }
    },
    
    /**
     * Valida el formulario de usuario antes de enviar
     * @returns {boolean} True si la validación es exitosa
     */
    validateUserForm() {
        if (!this.elements.userForm) return false;
        
        const username = this.elements.userForm.elements['username'].value.trim();
        const email = this.elements.userForm.elements['email'].value.trim();
        const personId = this.elements.userForm.elements['personId'].value;
        const password = this.elements.userForm.elements['password']?.value;
        
        if (!username) {
            this.elements.userFormMsg.textContent = 'El nombre de usuario es obligatorio';
            this.elements.userFormMsg.classList.remove('d-none');
            return false;
        }
        
        if (!email) {
            this.elements.userFormMsg.textContent = 'El correo electrónico es obligatorio';
            this.elements.userFormMsg.classList.remove('d-none');
            return false;
        }
        
        if (!this.validateEmail(email)) {
            this.elements.userFormMsg.textContent = 'El correo electrónico no es válido';
            this.elements.userFormMsg.classList.remove('d-none');
            return false;
        }
        
        if (!personId) {
            this.elements.userFormMsg.textContent = 'Debe seleccionar una persona asociada';
            this.elements.userFormMsg.classList.remove('d-none');
            return false;
        }
        
        // Validar contraseña solo si es un nuevo usuario
        if (!this.state.editMode && (!password || password.length < 6)) {
            this.elements.userFormMsg.textContent = 'La contraseña debe tener al menos 6 caracteres';
            this.elements.userFormMsg.classList.remove('d-none');
            return false;
        }
        
        this.elements.userFormMsg.textContent = '';
        this.elements.userFormMsg.classList.add('d-none');
        return true;
    },
    
    /**
     * Valida si un string es un email válido
     * @param {string} email - Email a validar
     * @returns {boolean} True si es un email válido
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Cambia el estado de un usuario (activo/inactivo)
     * @param {number} id - ID del usuario
     * @param {boolean} active - Nuevo estado
     */
    async toggleUserStatus(id, active) {
        try {
            Helpers.showLoading();
            
            if (active) {
                await UserService.activateUser(id);
                Helpers.showMessage('Usuario activado', 'El usuario se ha activado correctamente');
            } else {
                await UserService.deactivateUser(id);
                Helpers.showMessage('Usuario desactivado', 'El usuario se ha desactivado correctamente');
            }
            
            // Recargar usuarios y actualizar vista
            await this.loadUsers();
            this.renderUsersList();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cambiar el estado del usuario', error.message);
            console.error('Error toggling user status:', error);
        }
    },
    
    /**
     * Elimina un usuario
     * @param {number} id - ID del usuario a eliminar
     */
    async deleteUser(id) {
        // Confirmación antes de eliminar
        if (!confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }
        
        try {
            Helpers.showLoading();
            await UserService.deleteUser(id);
            
            Helpers.showMessage('Usuario eliminado', 'El usuario se ha eliminado correctamente');
            
            // Recargar usuarios y actualizar vista
            await this.loadUsers();
            this.renderUsersList();
            
            Helpers.hideLoading();
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al eliminar el usuario', error.message);
            console.error('Error deleting user:', error);
        }
    },
    
    /**
     * Muestra la gestión de roles para un usuario
     * @param {number} id - ID del usuario
     */
    async manageUserRoles(id) {
        // Esta función se implementaría para mostrar y gestionar 
        // los roles asignados a un usuario
        alert('Gestión de roles para el usuario con ID: ' + id + ' (funcionalidad en desarrollo)');
    },
    
    /**
     * Cambia la contraseña de un usuario
     * @param {number} id - ID del usuario
     */
    async changeUserPassword(id) {
        const newPassword = prompt('Ingrese la nueva contraseña (mínimo 6 caracteres):');
        
        if (!newPassword) return;
        
        if (newPassword.length < 6) {
            Helpers.showError('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres');
            return;
        }
        
        try {
            Helpers.showLoading();
            
            await UserService.changePassword(id, { newPassword });
            
            Helpers.hideLoading();
            Helpers.showMessage('Contraseña actualizada', 'La contraseña se ha actualizado correctamente');
        } catch (error) {
            Helpers.hideLoading();
            Helpers.showError('Error al cambiar la contraseña', error.message);
            console.error('Error changing password:', error);
        }
    }
};