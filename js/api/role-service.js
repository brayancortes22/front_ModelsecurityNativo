/**
 * Servicio para operaciones relacionadas con roles
 * Proporciona métodos para gestionar roles en el sistema
 */

const RoleService = {
    /**
     * Obtiene todos los roles
     * @param {Object} params - Parámetros de filtrado opcional
     * @returns {Promise<Array>} Lista de roles
     */
    async getAllRoles(params = {}) {
        return ApiService.get(API_CONFIG.ENDPOINTS.ROL.BASE, params);
    },
    
    /**
     * Obtiene un rol por su ID
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Rol encontrado
     */
    async getRoleById(id) {
        return ApiService.get(API_CONFIG.ENDPOINTS.ROL.BY_ID(id));
    },
    
    /**
     * Crea un nuevo rol
     * @param {Object} roleData - Datos del rol a crear
     * @returns {Promise<Object>} Rol creado
     */
    async createRole(roleData) {
        return ApiService.post(API_CONFIG.ENDPOINTS.ROL.BASE, roleData);
    },
    
    /**
     * Actualiza un rol existente
     * @param {number} id - ID del rol
     * @param {Object} roleData - Datos actualizados del rol
     * @returns {Promise<Object>} Rol actualizado
     */
    async updateRole(id, roleData) {
        return ApiService.put(API_CONFIG.ENDPOINTS.ROL.BY_ID(id), roleData);
    },
    
    /**
     * Actualiza parcialmente un rol
     * @param {number} id - ID del rol
     * @param {Object} partialData - Datos parciales a actualizar
     * @returns {Promise<Object>} Rol actualizado
     */
    async patchRole(id, partialData) {
        return ApiService.patch(API_CONFIG.ENDPOINTS.ROL.BY_ID(id), partialData);
    },
    
    /**
     * Elimina un rol
     * @param {number} id - ID del rol
     * @returns {Promise<void>}
     */
    async deleteRole(id) {
        return ApiService.delete(API_CONFIG.ENDPOINTS.ROL.BY_ID(id));
    },
    
    /**
     * Activa un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Resultado de la operación
     */
    async activateRole(id) {
        return ApiService.post(API_CONFIG.ENDPOINTS.ROL.ACTIVATE(id));
    },
    
    /**
     * Desactiva un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivateRole(id) {
        return ApiService.post(API_CONFIG.ENDPOINTS.ROL.DEACTIVATE(id));
    },
    
    /**
     * Obtiene los formularios asociados a un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Array>} Lista de formularios asociados al rol
     */
    async getRoleForms(id) {
        return ApiService.get(API_CONFIG.ENDPOINTS.ROL.FORMS(id));
    },
    
    /**
     * Asigna un formulario a un rol
     * @param {number} roleId - ID del rol
     * @param {Object} formData - Datos de la relación rol-formulario
     * @returns {Promise<Object>} Relación creada
     */
    async assignFormToRole(roleId, formData) {
        return ApiService.post(API_CONFIG.ENDPOINTS.ROL.FORMS(roleId), formData);
    }
};