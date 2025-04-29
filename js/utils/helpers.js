/**
 * Utilidades y funciones de ayuda para la aplicación
 */

const Helpers = {
    /**
     * Muestra un mensaje de notificación al usuario usando un modal Bootstrap
     * @param {string} title - Título del mensaje
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de mensaje (success, error, warning, info)
     */
    showMessage(title, message, type = 'success') {
        // Obtener el modal
        const modalElement = document.getElementById('messageModal');
        if (!modalElement) {
            console.error('Modal no encontrado en el DOM');
            alert(`${title}: ${message}`);
            return;
        }
        
        // Obtener elementos del modal
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        
        // Configurar clase según el tipo
        const headerClass = `modal-header bg-${type === 'error' ? 'danger' : type}`;
        const headerElement = modalElement.querySelector('.modal-header');
        
        // Limpiar clases previas de tipo
        headerElement.className = 'modal-header';
        headerElement.classList.add(type === 'error' ? 'bg-danger' : `bg-${type}`);
        
        if (type === 'error' || type === 'warning') {
            headerElement.classList.add('text-white');
        } else {
            headerElement.classList.remove('text-white');
        }
        
        // Establecer título y mensaje
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        
        // Mostrar el modal usando la API de Bootstrap
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // También registrar en consola
        switch (type.toLowerCase()) {
            case 'error':
                console.error(message);
                break;
            case 'warning':
                console.warn(message);
                break;
            case 'info':
                console.info(message);
                break;
            case 'success':
            default:
                console.log(message);
                break;
        }
    },
    
    /**
     * Muestra un mensaje de error al usuario
     * @param {string} title - Título del mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(title, message) {
        this.showMessage(title, message, 'error');
    },
    
    /**
     * Muestra u oculta el indicador de carga
     * @param {boolean} show - Indica si se debe mostrar u ocultar el spinner
     */
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (!spinner) return;
        spinner.classList.remove('d-none');
    },
    
    /**
     * Oculta el indicador de carga
     */
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (!spinner) return;
        spinner.classList.add('d-none');
    },
    
    /**
     * Crea un elemento de badge para mostrar el estado
     * @param {boolean} active - Estado de activación
     * @returns {string} HTML del badge
     */
    createStatusBadge(active) {
        return active
            ? '<span class="badge bg-success">Activo</span>'
            : '<span class="badge bg-danger">Inactivo</span>';
    },
    
    /**
     * Escapa caracteres HTML para prevenir XSS
     * @param {string} text - Texto a escapar
     * @returns {string} Texto escapado
     */
    escapeHtml(text) {
        if (!text) return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.toString().replace(/[&<>"']/g, m => map[m]);
    },
    
    /**
     * Formatea una fecha para mostrarla
     * @param {Date|string} date - Fecha a formatear
     * @returns {string} Fecha formateada
     */
    formatDate(date) {
        if (!date) return 'N/A';
        
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            return dateObj.toLocaleString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha inválida';
        }
    },
    
    /**
     * Trunca un texto si es muy largo
     * @param {string} text - Texto a truncar
     * @param {number} maxLength - Longitud máxima
     * @returns {string} Texto truncado
     */
    truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        
        return text.substring(0, maxLength) + '...';
    },
    
    /**
     * Genera un ID único
     * @returns {string} ID único
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },
    
    /**
     * Convierte un objeto FormData a un objeto JavaScript
     * @param {FormData} formData - Objeto FormData
     * @returns {Object} Objeto JavaScript
     */
    formDataToObject(formData) {
        const object = {};
        formData.forEach((value, key) => {
            // Manejar checkboxes
            if (key.endsWith('[]')) {
                const arrayKey = key.slice(0, -2);
                if (!object[arrayKey]) {
                    object[arrayKey] = [];
                }
                object[arrayKey].push(value);
            } else {
                object[key] = value;
            }
        });
        return object;
    },
    
    /**
     * Verifica si un valor es un número válido
     * @param {any} value - Valor a verificar
     * @returns {boolean} true si es un número válido
     */
    isValidNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    
    /**
     * Verifica si una cadena es un email válido
     * @param {string} email - Email a verificar
     * @returns {boolean} true si es un email válido
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    /**
     * Capitaliza la primera letra de una cadena
     * @param {string} text - Texto a capitalizar
     * @returns {string} Texto con la primera letra en mayúscula
     */
    capitalizeFirstLetter(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    },
    
    /**
     * Desactivar un formulario para evitar envíos múltiples
     * @param {HTMLFormElement} form - Formulario a desactivar
     * @param {boolean} disabled - Si se debe desactivar o activar
     */
    disableForm(form, disabled = true) {
        if (!form) return;
        
        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
            elements[i].disabled = disabled;
        }
    }
};