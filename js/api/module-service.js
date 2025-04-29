/**
 * Servicio para operaciones relacionadas con módulos
 * Proporciona métodos para gestionar módulos en el sistema
 */

const ModuleService = {
    /**
     * Obtiene todos los módulos
     * @param {Object} params - Parámetros de filtrado opcional
     * @returns {Promise<Array>} Lista de módulos
     */
    async getAllModules(params = {}) {
        return ApiService.get(API_CONFIG.ENDPOINTS.MODULE.BASE, params);
    },
    
    /**
     * Obtiene un módulo por su ID
     * @param {number} id - ID del módulo
     * @returns {Promise<Object>} Módulo encontrado
     */
    async getModuleById(id) {
        return ApiService.get(API_CONFIG.ENDPOINTS.MODULE.BY_ID(id));
    },
    
    /**
     * Crea un nuevo módulo
     * @param {Object} moduleData - Datos del módulo a crear
     * @returns {Promise<Object>} Módulo creado
     */
    async createModule(moduleData) {
        return ApiService.post(API_CONFIG.ENDPOINTS.MODULE.BASE, moduleData);
    },
    
    /**
     * Actualiza un módulo existente
     * @param {number} id - ID del módulo
     * @param {Object} moduleData - Datos actualizados del módulo
     * @returns {Promise<Object>} Módulo actualizado
     */
    async updateModule(id, moduleData) {
        return ApiService.put(API_CONFIG.ENDPOINTS.MODULE.BY_ID(id), moduleData);
    },
    
    /**
     * Actualiza parcialmente un módulo
     * @param {number} id - ID del módulo
     * @param {Object} partialData - Datos parciales a actualizar
     * @returns {Promise<Object>} Módulo actualizado
     */
    async patchModule(id, partialData) {
        return ApiService.patch(API_CONFIG.ENDPOINTS.MODULE.BY_ID(id), partialData);
    },
    
    /**
     * Elimina un módulo
     * @param {number} id - ID del módulo
     * @returns {Promise<void>}
     */
    async deleteModule(id) {
        return ApiService.delete(API_CONFIG.ENDPOINTS.MODULE.BY_ID(id));
    },
    
    /**
     * Activa un módulo
     * @param {number} id - ID del módulo
     * @returns {Promise<Object>} Resultado de la operación
     */
    async activateModule(id) {
        return ApiService.post(API_CONFIG.ENDPOINTS.MODULE.ACTIVATE(id));
    },
    
    /**
     * Desactiva un módulo
     * @param {number} id - ID del módulo
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivateModule(id) {
        return ApiService.post(API_CONFIG.ENDPOINTS.MODULE.DEACTIVATE(id));
    },
    
    /**
     * Obtiene los formularios asociados a un módulo
     * @param {number} id - ID del módulo
     * @returns {Promise<Array>} Lista de formularios asociados al módulo
     */
    async getModuleForms(id) {
        return ApiService.get(API_CONFIG.ENDPOINTS.MODULE.FORMS(id));
    },
    
    /**
     * Asigna un formulario a un módulo
     * @param {number} moduleId - ID del módulo
     * @param {Object} formData - Datos de la relación módulo-formulario
     * @returns {Promise<Object>} Relación creada
     */
    async assignFormToModule(moduleId, formData) {
        return ApiService.post(API_CONFIG.ENDPOINTS.MODULE.FORMS(moduleId), formData);
    }
};