/**
 * Configuración de la API
 * Define las URL base y los endpoints para las llamadas a la API
 */

const API_CONFIG = {
    // URL base de la API
    BASE_URL: 'https://localhost:7009/api',
    
    // Timeout para peticiones en milisegundos
    TIMEOUT: 30000,
    
    // Endpoints de la API
    ENDPOINTS: {
        // Autenticación
        AUTH: {
            LOGIN: '/Auth/login',
            LOGOUT: '/Auth/logout',
            REFRESH: '/Auth/refresh',
            VALIDATE: '/Auth/validate'
        },
        
        // Usuarios
        USER: {
            BASE: '/User',
            BY_ID: (id) => `/User/${id}`,
            ACTUALIZAR: (id) => `/User/${id}`,
            ACTIVATE: (id) => `/User/${id}/activate`,
            DEACTIVATE: (id) => `/User/${id}/soft`,
            WITH_PASSWORD: (id) => `/User/${id}/withpassword`, // Nuevo endpoint para obtener usuario con contraseña
        },
        
        // Personas
        PERSON: {
            BASE: '/Person',
            BY_ID: (id) => `/Person/${id}`,
            ACTIVATE: (id) => `/Person/${id}/activate`,
            DEACTIVATE: (id) => `/Person/${id}/soft`,
        },
        
        // Roles
        ROL: {
            BASE: '/Rol',
            BY_ID: (id) => `/Rol/${id}`,
            ACTIVATE: (id) => `/Rol/${id}/activate`,
            DEACTIVATE: (id) => `/Rol/soft-delete/${id}`, // Corregido para coincidir con el endpoint del backend
            FORMS: (id) => `/Rol/${id}/forms`, // Endpoint para obtener formularios asociados a un rol
            ASSIGN_FORMS: (id) => `/Rol/${id}/forms`, // Endpoint para asignar formularios a un rol
        },
        
        // Módulos
        MODULE: {
            BASE: '/Module',
            BY_ID: (id) => `/Module/${id}`,
            ACTIVATE: (id) => `/Module/${id}/activate`,
            DEACTIVATE: (id) => `/Module/${id}/soft`,
        },
        
        // Formularios
        FORM: {
            BASE: '/Form',
            BY_ID: (id) => `/Form/${id}`,
            ACTIVATE: (id) => `/Form/${id}/activate`,
            DEACTIVATE: (id) => `/Form/${id}/soft`,
        },
        
        // Registro de cambios
        CHANGELOG: {
            BASE: '/changelog',
            BY_ID: (id) => `/changelog/${id}`,
            BY_TABLE: (table) => `/changelog/table/${table}`,
            BY_USER: (user) => `/changelog/user/${user}`
        }
    }
};