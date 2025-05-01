/**
 * Servicio para gestionar operaciones relacionadas con roles
 * Utiliza el ApiService base para comunicarse con el backend
 */

const RoleService = {
    /**
     * Obtiene todos los roles
     * @returns {Promise<Array>} Lista de roles
     */
    async getAll() {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.ROL.BASE);
        } catch (error) {
            console.error('Error al obtener los roles:', error);
            throw error;
        }
    },

    /**
     * Obtiene un rol específico por su ID
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Datos del rol
     */
    async getById(id) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.ROL.BY_ID(id));
        } catch (error) {
            console.error(`Error al obtener el rol con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo rol
     * @param {Object} roleData - Datos del rol a crear
     * @returns {Promise<Object>} Datos del rol creado
     */
    async create(roleData) {
        try {
            // Formatear datos de acuerdo a lo que espera la API
            const formattedData = {
                id: 0, // Para crear un nuevo rol, el ID debe ser 0 o no incluirse
                typeRol: roleData.name,
                description: roleData.description,
                active: roleData.active
            };
            return await ApiService.post(API_CONFIG.ENDPOINTS.ROL.BASE, formattedData);
        } catch (error) {
            console.error('Error al crear el rol:', error);
            throw error;
        }
    },

    /**
     * Actualiza un rol existente
     * @param {number} id - ID del rol
     * @param {Object} roleData - Nuevos datos del rol
     * @returns {Promise<Object>} Datos actualizados del rol
     */
    async update(id, roleData) {
        try {
            // Formatear datos de acuerdo a lo que espera la API
            const formattedData = {
                id: id,
                typeRol: roleData.name,
                description: roleData.description,
                active: roleData.active
            };
            return await ApiService.put(API_CONFIG.ENDPOINTS.ROL.BY_ID(id), formattedData);
        } catch (error) {
            console.error(`Error al actualizar el rol con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Actualiza parcialmente un rol
     * @param {number} id - ID del rol
     * @param {Object} partialData - Datos parciales a actualizar
     * @returns {Promise<Object>} Datos actualizados del rol
     */
    async patch(id, partialData) {
        try {
            // Formatear datos de acuerdo a lo que espera la API
            const formattedData = { id: id };
            if (partialData.name !== undefined) formattedData.typeRol = partialData.name;
            if (partialData.description !== undefined) formattedData.description = partialData.description;
            if (partialData.active !== undefined) formattedData.active = partialData.active;
            
            return await ApiService.patch(API_CONFIG.ENDPOINTS.ROL.BY_ID(id), formattedData);
        } catch (error) {
            console.error(`Error al actualizar parcialmente el rol con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina un rol
     * @param {number} id - ID del rol a eliminar
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.ROL.BY_ID(id));
        } catch (error) {
            console.error(`Error al eliminar el rol con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Activa un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Resultado de la operación
     */
    async activate(id) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.ROL.ACTIVATE(id), {});
        } catch (error) {
            console.error(`Error al activar el rol con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Desactiva un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivate(id) {
        try {
            return await ApiService.patch(API_CONFIG.ENDPOINTS.ROL.DEACTIVATE(id), {});
        } catch (error) {
            console.error(`Error al desactivar el rol con ID ${id}:`, error);
            throw error;
        }
    },
    
    /**
     * Cambia el estado de activación de un rol
     * @param {number} id - ID del rol
     * @param {boolean} active - Nuevo estado de activación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async changeStatus(id, active) {
        try {
            if (active) {
                return await this.activate(id);
            } else {
                return await this.deactivate(id);
            }
        } catch (error) {
            console.error(`Error al cambiar el estado del rol con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene los formularios asociados a un rol
     * @param {number} roleId - ID del rol
     * @returns {Promise<Array>} Lista de formularios
     */
    async getFormsByRoleId(roleId) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.ROL.FORMS(roleId));
        } catch (error) {
            console.error(`Error al obtener formularios del rol con ID ${roleId}:`, error);
            throw error;
        }
    },
    
    /**
     * Asigna formularios a un rol
     * @param {number} roleId - ID del rol
     * @param {Array<number>} formIds - IDs de los formularios a asignar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async assignForms(roleId, formIds) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.ROL.ASSIGN_FORMS(roleId), { formIds });
        } catch (error) {
            console.error(`Error al asignar formularios al rol con ID ${roleId}:`, error);
            throw error;
        }
    },
    
    /**
     * Elimina la asignación de un formulario a un rol
     * @param {number} roleId - ID del rol
     * @param {number} formId - ID del formulario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async removeForm(roleId, formId) {
        try {
            return await ApiService.delete(`${API_CONFIG.ENDPOINTS.ROL.BY_ID(roleId)}/forms/${formId}`);
        } catch (error) {
            console.error(`Error al quitar formulario ${formId} del rol con ID ${roleId}:`, error);
            throw error;
        }
    }
};