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
        // Nota: En el Swagger no se encontró un endpoint específico para activar roles
        // Se podría utilizar PATCH para actualizar el estado
        return ApiService.patch(API_CONFIG.ENDPOINTS.ROL.BY_ID(id), { active: true });
    },
    
    /**
     * Desactiva un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deactivateRole(id) {
        // Según Swagger, la desactivación de roles se hace con PATCH a /api/Rol/soft-delete/{id}
        return ApiService.patch(API_CONFIG.ENDPOINTS.ROL.DEACTIVATE(id));
    },
    
    /**
     * Obtiene los formularios asociados a un rol
     * @param {number} id - ID del rol
     * @returns {Promise<Array>} Lista de formularios asociados al rol
     */
    async getRoleForms(id) {
        // Según Swagger, se debe obtener de /api/RolForm filtrando por rolId
        return ApiService.get(API_CONFIG.ENDPOINTS.ROL.FORMS(), { rolId: id });
    },
    
    /**
     * Asigna un formulario a un rol
     * @param {number} roleId - ID del rol
     * @param {Object} formData - Datos de la relación rol-formulario
     * @returns {Promise<Object>} Relación creada
     */
    async assignFormToRole(roleId, formData) {
        // Aseguramos que el formData incluya el rolId
        const data = { ...formData, rolId: roleId };
        return ApiService.post(API_CONFIG.ENDPOINTS.ROL.FORMS(), data);
    }
};