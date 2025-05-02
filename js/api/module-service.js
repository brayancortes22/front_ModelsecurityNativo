/**
 * Servicio para gestionar operaciones relacionadas con módulos
 * Utiliza el ApiService base para comunicarse con el backend
 */

const ModuleService = {
    /**
     * Obtiene todos los módulos
     * @returns {Promise<Array>} Lista de módulos
     */
    async getAll() {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.MODULE.BASE);
        } catch (error) {
            console.error('Error al obtener los módulos:', error);
            throw error;
        }
    },

    /**
     * Obtiene un módulo específico por su ID
     * @param {number} id - ID del módulo
     * @returns {Promise<Object>} Datos del módulo
     */
    async getById(id) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.MODULE.BY_ID(id));
        } catch (error) {
            console.error(`Error al obtener el módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Crea un nuevo módulo
     * @param {Object} moduleData - Datos del módulo a crear
     * @returns {Promise<Object>} Datos del módulo creado
     */
    async create(moduleData) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.MODULE.BASE, moduleData);
        } catch (error) {
            console.error('Error al crear el módulo:', error);
            throw error;
        }
    },

    /**
     * Actualiza un módulo existente
     * @param {number} id - ID del módulo
     * @param {Object} moduleData - Nuevos datos del módulo
     * @returns {Promise<Object>} Datos actualizados del módulo
     */
    async update(id, moduleData) {
        try {
            return await ApiService.put(API_CONFIG.ENDPOINTS.MODULE.BY_ID(id), moduleData);
        } catch (error) {
            console.error(`Error al actualizar el módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina un módulo
     * @param {number} id - ID del módulo a eliminar
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.MODULE.BY_ID(id));
        } catch (error) {
            console.error(`Error al eliminar el módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Activa un módulo
     * @param {number} id - ID del módulo
     * @returns {Promise<Object>} Resultado de la operación
     */
    async activate(id) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.MODULE.ACTIVATE(id));
        } catch (error) {
            console.error(`Error al activar el módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Desactiva un módulo
     * @param {number} id - ID del módulo
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivate(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.MODULE.DEACTIVATE(id));
        } catch (error) {
            console.error(`Error al desactivar el módulo con ID ${id}:`, error);
            throw error;
        }
    },
    
    /**
     * Cambia el estado de activación de un módulo
     * @param {number} id - ID del módulo
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
            console.error(`Error al cambiar el estado del módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene los formularios asociados a un módulo
     * @param {number} moduleId - ID del módulo
     * @returns {Promise<Array>} Lista de formularios
     */
    async getFormsByModuleId(moduleId) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.MODULE.MODULE_FORMS(moduleId));
        } catch (error) {
            console.error(`Error al obtener formularios del módulo con ID ${moduleId}:`, error);
            throw error;
        }
    }
};