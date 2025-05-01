/**
 * Servicio para gestionar operaciones relacionadas con usuarios
 * Utiliza el ApiService base para comunicarse con el backend
 */

const UserService = {
    /**
     * Obtiene todos los usuarios
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getAll() {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.USER.BASE);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            throw error;
        }
    },

    /**
     * Obtiene un usuario específico por su ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Datos del usuario
     */
    async getById(id) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.USER.BY_ID(id));
        } catch (error) {
            console.error(`Error al obtener el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del usuario a crear
     * @returns {Promise<Object>} Datos del usuario creado
     */
    async create(userData) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.USER.BASE, userData);
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    },

    /**
     * Actualiza un usuario existente (reemplazo completo)
     * @param {number} id - ID del usuario
     * @param {Object} userData - Nuevos datos del usuario
     * @returns {Promise<Object>} Datos actualizados del usuario
     */
    async update(id, userData) {
        try {
            return await ApiService.put(API_CONFIG.ENDPOINTS.USER.BY_ID(id), userData);
        } catch (error) {
            console.error(`Error al actualizar el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Actualiza parcialmente un usuario
     * @param {number} id - ID del usuario
     * @param {Object} partialData - Datos parciales a actualizar
     * @returns {Promise<Object>} Datos actualizados del usuario
     */
    async patch(id, partialData) {
        try {
            return await ApiService.patch(API_CONFIG.ENDPOINTS.USER.BY_ID(id), partialData);
        } catch (error) {
            console.error(`Error al actualizar parcialmente el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina un usuario
     * @param {number} id - ID del usuario a eliminar
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.USER.BY_ID(id));
        } catch (error) {
            console.error(`Error al eliminar el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Activa un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async activate(id) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.USER.ACTIVATE(id));
        } catch (error) {
            console.error(`Error al activar el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Desactiva un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivate(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.USER.DEACTIVATE(id));
        } catch (error) {
            console.error(`Error al desactivar el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Cambia el estado de activación de un usuario
     * @param {number} id - ID del usuario
     * @param {boolean} status - Nuevo estado (true=activo, false=inactivo)
     * @returns {Promise<Object>} Resultado de la operación
     */
    async changeStatus(id, status) {
        try {
            if (status) {
                return await ApiService.post(API_CONFIG.ENDPOINTS.USER.ACTIVATE(id));
            } else {
                return await ApiService.delete(API_CONFIG.ENDPOINTS.USER.DEACTIVATE(id));
            }
        } catch (error) {
            console.error(`Error al cambiar el estado del usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Cambia la contraseña de un usuario
     * @param {number} id - ID del usuario
     * @param {Object} passwordData - Objeto con la nueva contraseña
     * @returns {Promise<Object>} Resultado de la operación
     */
    async changePassword(id, passwordData) {
        try {
            return await ApiService.post(`${API_CONFIG.ENDPOINTS.USER.BY_ID(id)}/password`, passwordData);
        } catch (error) {
            console.error(`Error al cambiar la contraseña del usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene los roles asignados a un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Array>} Lista de roles asignados
     */
    async getUserRoles(id) {
        try {
            return await ApiService.get(`${API_CONFIG.ENDPOINTS.USER.BY_ID(id)}/roles`);
        } catch (error) {
            console.error(`Error al obtener los roles del usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Asigna roles a un usuario
     * @param {number} userId - ID del usuario
     * @param {Array<number>} rolIds - IDs de los roles a asignar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async assignRoles(userId, rolIds) {
        try {
            return await ApiService.post(`${API_CONFIG.ENDPOINTS.USER.BY_ID(userId)}/roles`, { rolIds });
        } catch (error) {
            console.error(`Error al asignar roles al usuario con ID ${userId}:`, error);
            throw error;
        }
    },

    /**
     * Desactiva un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivateUser(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.USER.DEACTIVATE(id));
        } catch (error) {
            console.error(`Error al desactivar el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene un usuario específico por su ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Datos del usuario
     */
    async getUserById(id) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.USER.BY_ID(id));
        } catch (error) {
            console.error(`Error al obtener el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Activa un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async activateUser(id) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.USER.ACTIVATE(id));
        } catch (error) {
            console.error(`Error al activar el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Actualiza un usuario (método de conveniencia)
     * @param {number} id - ID del usuario
     * @param {Object} userData - Datos del usuario a actualizar
     * @returns {Promise<Object>} Datos actualizados del usuario
     */
    async updateUser(id, userData) {
        try {
            // Si no se proporciona una nueva contraseña, simplemente enviamos los datos
            // al endpoint regular sin incluir una contraseña
            if (!userData.password || userData.password.trim() === '') {
                console.log('Actualizando sin contraseña');
                
                // Crear una copia para evitar modificar el objeto original
                const dataToSend = { ...userData };
                
                // Asegurarse de que no enviamos una contraseña vacía o nula
                delete dataToSend.password;
                
                // IMPORTANTE: Asegurarse de que el ID en el objeto coincide con el ID de la URL
                // Esto es crucial para pasar la validación en el backend
                dataToSend.id = id;
                
                console.log('Enviando datos para actualizar usuario (sin contraseña):', dataToSend);
                return await ApiService.patch(API_CONFIG.ENDPOINTS.USER.BY_ID(id), dataToSend);
            } else {
                // Si se proporciona una nueva contraseña, la enviamos para que sea encriptada
                console.log('Actualizando con nueva contraseña para encriptar en el servidor');
                
                // Asegurarse de que el ID en el objeto coincide con el ID de la URL
                const dataToSend = { ...userData, id: id };
                
                console.log('Enviando datos para actualizar usuario (con nueva contraseña):', dataToSend);
                return await ApiService.put(API_CONFIG.ENDPOINTS.USER.BY_ID(id), dataToSend);
            }
        } catch (error) {
            console.error(`Error al actualizar el usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene un usuario con su contraseña por ID
     * Este método es interno y solo debe usarse para operaciones específicas
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Datos completos del usuario, incluyendo contraseña encriptada
     */
    async getUserWithPasswordById(id) {
        try {
            // Usar el endpoint configurado en API_CONFIG
            return await ApiService.get(API_CONFIG.ENDPOINTS.USER.WITH_PASSWORD(id));
        } catch (error) {
            console.error(`Error al obtener datos completos del usuario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo usuario (método de conveniencia)
     * @param {Object} userData - Datos del usuario a crear
     * @returns {Promise<Object>} Datos del usuario creado
     */
    async createUser(userData) {
        try {
            return await this.create(userData);
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    },

    /**
     * Elimina un usuario (método de conveniencia)
     * @param {number} id - ID del usuario a eliminar
     * @returns {Promise<void>}
     */
    async deleteUser(id) {
        try {
            return await this.delete(id);
        } catch (error) {
            console.error(`Error al eliminar el usuario con ID ${id}:`, error);
            throw error;
        }
    },
};