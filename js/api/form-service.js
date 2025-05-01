/**
 * Servicio para gestionar operaciones relacionadas con formularios
 * Utiliza el ApiService base para comunicarse con el backend
 */

const FormService = {
    /**
     * Obtiene todos los formularios
     * @returns {Promise<Array>} Lista de formularios
     */
    async getAll() {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.FORM.BASE);
        } catch (error) {
            console.error('Error al obtener los formularios:', error);
            throw error;
        }
    },

    /**
     * Obtiene un formulario específico por su ID
     * @param {number} id - ID del formulario
     * @returns {Promise<Object>} Datos del formulario
     */
    async getById(id) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.FORM.BY_ID(id));
        } catch (error) {
            console.error(`Error al obtener el formulario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo formulario
     * @param {Object} formData - Datos del formulario a crear
     * @returns {Promise<Object>} Datos del formulario creado
     */
    async create(formData) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.FORM.BASE, formData);
        } catch (error) {
            console.error('Error al crear el formulario:', error);
            throw error;
        }
    },

    /**
     * Actualiza un formulario existente
     * @param {number} id - ID del formulario
     * @param {Object} formData - Nuevos datos del formulario
     * @returns {Promise<Object>} Datos actualizados del formulario
     */
    async update(id, formData) {
        try {
            return await ApiService.put(API_CONFIG.ENDPOINTS.FORM.BY_ID(id), formData);
        } catch (error) {
            console.error(`Error al actualizar el formulario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina un formulario
     * @param {number} id - ID del formulario a eliminar
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.FORM.BY_ID(id));
        } catch (error) {
            console.error(`Error al eliminar el formulario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Activa un formulario
     * @param {number} id - ID del formulario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async activate(id) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.FORM.ACTIVATE(id));
        } catch (error) {
            console.error(`Error al activar el formulario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Desactiva un formulario
     * @param {number} id - ID del formulario
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivate(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.FORM.DEACTIVATE(id));
        } catch (error) {
            console.error(`Error al desactivar el formulario con ID ${id}:`, error);
            throw error;
        }
    },
    
    /**
     * Cambia el estado de activación de un formulario
     * @param {number} id - ID del formulario
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
            console.error(`Error al cambiar el estado del formulario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene los formularios asociados a un módulo
     * @param {number} moduleId - ID del módulo
     * @returns {Promise<Array>} Lista de formularios
     */
    async getByModuleId(moduleId) {
        try {
            return await ApiService.get(`${API_CONFIG.ENDPOINTS.MODULE.BY_ID(moduleId)}/forms`);
        } catch (error) {
            console.error(`Error al obtener formularios del módulo con ID ${moduleId}:`, error);
            throw error;
        }
    },
    
    /**
     * Asigna un formulario a un módulo
     * @param {number} moduleId - ID del módulo
     * @param {Object} formData - Datos del formulario
     * @returns {Promise<Object>} Formulario asignado
     */
    async assignToModule(moduleId, formData) {
        try {
            return await ApiService.post(`${API_CONFIG.ENDPOINTS.MODULE.BY_ID(moduleId)}/forms`, formData);
        } catch (error) {
            console.error(`Error al asignar formulario al módulo con ID ${moduleId}:`, error);
            throw error;
        }
    }
};