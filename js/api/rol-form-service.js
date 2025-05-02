/**
 * Servicio para gestionar operaciones relacionadas con la asignación de roles a formularios
 */
const RolFormService = {
    /**
     * Crea una nueva asignación de rol a formulario
     * @param {Object} data - Datos de la asignación
     * @returns {Promise<Object>} Resultado de la operación
     */
    async create(data) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.ROL_FORM.BASE, data);
        } catch (error) {
            console.error('Error al crear asignación de rol a formulario:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las asignaciones de roles a formularios
     * @returns {Promise<Array>} Lista de asignaciones
     */
    async getAll() {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.ROL_FORM.BASE);
        } catch (error) {
            console.error('Error al obtener asignaciones de roles a formularios:', error);
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
            return await ApiService.get(API_CONFIG.ENDPOINTS.ROL_FORM.BY_ID(id));
        } catch (error) {
            console.error(`Error al obtener asignación de rol a formulario con ID ${id}:`, error);
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
            return await ApiService.put(API_CONFIG.ENDPOINTS.ROL_FORM.BY_ID(id), data);
        } catch (error) {
            console.error(`Error al actualizar asignación de rol a formulario con ID ${id}:`, error);
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
            return await ApiService.delete(API_CONFIG.ENDPOINTS.ROL_FORM.BY_ID(id));
        } catch (error) {
            console.error(`Error al eliminar asignación de rol a formulario con ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtiene los formularios asignados a un rol específico
     * @param {number} rolId - ID del rol
     * @returns {Promise<Array>} Lista de formularios asignados
     */
    async getFormsByRoleId(rolId) {
        try {
            return await ApiService.get(API_CONFIG.ENDPOINTS.ROL.FORMS(rolId));
        } catch (error) {
            console.error(`Error al obtener formularios asignados al rol con ID ${rolId}:`, error);
            throw error;
        }
    },

    /**
     * Asigna un conjunto de formularios a un rol
     * @param {number} rolId - ID del rol
     * @param {Array<number>} formIds - IDs de los formularios a asignar
     * @returns {Promise<Object>} Resultado de la operación
     */
    async assignForms(rolId, formIds) {
        try {
            return await ApiService.post(API_CONFIG.ENDPOINTS.ROL.ASSIGN_FORMS(rolId), { formIds });
        } catch (error) {
            console.error(`Error al asignar formularios al rol con ID ${rolId}:`, error);
            throw error;
        }
    }
};