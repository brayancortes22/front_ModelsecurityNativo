/**
 * Servicio para gestionar operaciones relacionadas con la asignación de formularios a módulos
 */
const FormModuleService = {
    /**
     * Crea una nueva asignación de formulario a módulo
     * @param {Object} data - Datos de la asignación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async create(data) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.FORM_MODULE.BASE, data);
        } catch (error) {
            console.error('Error al crear asignación de formulario a módulo:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las asignaciones de formularios a módulos
     * @returns {Promise<Array>} Lista de asignaciones
     */
    async getAll() {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.FORM_MODULE.BASE);
        } catch (error) {
            console.error('Error al obtener asignaciones de formularios a módulos:', error);
            throw error;
        }
    },

    /**
     * Obtiene una asignación específica por su ID
     * @param {number} id - ID de la asignación
     * @returns {Promise<Object>} Datos de la asignación
     */
    async getById(id) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.FORM_MODULE.BY_ID(id));
        } catch (error) {
            console.error(`Error al obtener asignación de formulario a módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Actualiza una asignación existente
     * @param {number} id - ID de la asignación
     * @param {Object} data - Nuevos datos de la asignación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async update(id, data) {
        try {
            return await ApiService.put(API_CONFIG.ENDPOINTS.FORM_MODULE.BY_ID(id), data);
        } catch (error) {
            console.error(`Error al actualizar asignación de formulario a módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Elimina una asignación
     * @param {number} id - ID de la asignación
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            return await ApiService.delete(API_CONFIG.ENDPOINTS.FORM_MODULE.BY_ID(id));
        } catch (error) {
            console.error(`Error al eliminar asignación de formulario a módulo con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene todos los formularios asignados a un módulo específico
     * @param {number} moduleId - ID del módulo
     * @returns {Promise<Array>} Lista de asignaciones de formularios al módulo
     */
    async getByModuleId(moduleId) {
        try {
            return await ModuleService.getFormsByModuleId(moduleId);
        } catch (error) {
            console.error(`Error al obtener formularios asignados al módulo con ID ${moduleId}:`, error);
            throw error;
        }
    }
};