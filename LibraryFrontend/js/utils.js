// Utilidades generales para la aplicación

// ====== UTILIDADES DE FECHA ======
const DateUtils = {
    // Formatear fecha para mostrar
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Formatear fecha para input
    formatDateForInput(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    },

    // Calcular edad
    calculateAge(birthDate) {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }
};

// ====== UTILIDADES DE UI ======
const UIUtils = {
    // Mostrar loading
    showLoading(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
    },

    // Mostrar error
    showError(container, message) {
        container.innerHTML = `
            <div class="error">
                <strong>Error:</strong> ${message}
            </div>
        `;
    },

    // Mostrar éxito
    showSuccess(container, message) {
        container.innerHTML = `
            <div class="success">
                <strong>Éxito:</strong> ${message}
            </div>
        `;
    },

    // Mostrar mensaje vacío
    showEmpty(container, message = 'No hay datos para mostrar') {
        container.innerHTML = `
            <div class="table-empty">
                <p>${message}</p>
            </div>
        `;
    },

    // Crear modal simple
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        // Cerrar modal
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
        return modal;
    }
};

// ====== UTILIDADES DE VALIDACIÓN ======
const ValidationUtils = {
    // Validar email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Validar que no esté vacío
    isNotEmpty(value) {
        return value && value.toString().trim().length > 0;
    },

    // Validar longitud mínima
    hasMinLength(value, minLength) {
        return value && value.toString().length >= minLength;
    },

    // Validar longitud máxima
    hasMaxLength(value, maxLength) {
        return value && value.toString().length <= maxLength;
    },

    // Validar número
    isValidNumber(value) {
        return !isNaN(value) && isFinite(value);
    },

    // Validar fecha
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    // Validar ISBN (básico)
    isValidISBN(isbn) {
        if (!isbn) return true; // ISBN es opcional
        const cleanISBN = isbn.replace(/[-\s]/g, '');
        return cleanISBN.length === 10 || cleanISBN.length === 13;
    }
};

// ====== UTILIDADES DE BÚSQUEDA Y FILTRADO ======
const SearchUtils = {
    // Filtrar array por texto
    filterByText(array, searchText, fields) {
        if (!searchText) return array;
        
        const search = searchText.toLowerCase();
        return array.filter(item => {
            return fields.some(field => {
                const value = this.getNestedValue(item, field);
                return value && value.toString().toLowerCase().includes(search);
            });
        });
    },

    // Obtener valor anidado (ej: 'autor.nombre')
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    },

    // Ordenar array
    sortArray(array, field, direction = 'asc') {
        return [...array].sort((a, b) => {
            const valueA = this.getNestedValue(a, field);
            const valueB = this.getNestedValue(b, field);
            
            if (valueA < valueB) return direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
};

// ====== UTILIDADES DE ALMACENAMIENTO LOCAL ======
const StorageUtils = {
    // Guardar en localStorage
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    },

    // Obtener de localStorage
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error al leer de localStorage:', error);
            return defaultValue;
        }
    },

    // Eliminar de localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error al eliminar de localStorage:', error);
        }
    }
};

// ====== UTILIDADES DE NOTIFICACIONES ======
const NotificationUtils = {
    // Mostrar notificación temporal
    show(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            animation: slideIn 0.3s ease;
        `;

        // Colores según tipo
        const colors = {
            success: { bg: '#d1fae5', color: '#059669', border: '#10b981' },
            error: { bg: '#fee2e2', color: '#dc2626', border: '#ef4444' },
            warning: { bg: '#fef3c7', color: '#d97706', border: '#f59e0b' },
            info: { bg: '#dbeafe', color: '#2563eb', border: '#3b82f6' }
        };

        const color = colors[type] || colors.info;
        notification.style.backgroundColor = color.bg;
        notification.style.color = color.color;
        notification.style.borderLeft = `4px solid ${color.border}`;

        // Cerrar notificación
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());

        document.body.appendChild(notification);

        // Auto-cerrar
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        return notification;
    }
};

// ====== UTILIDADES DE FORMULARIOS ======
const FormUtils = {
    // Obtener datos del formulario
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    },

    // Validar formulario
    validateForm(form, rules) {
        const errors = {};
        const data = this.getFormData(form);
        
        for (let field in rules) {
            const fieldRules = rules[field];
            const value = data[field];
            
            for (let rule of fieldRules) {
                if (rule.required && !ValidationUtils.isNotEmpty(value)) {
                    errors[field] = rule.message || `${field} es requerido`;
                    break;
                }
                
                if (rule.minLength && !ValidationUtils.hasMinLength(value, rule.minLength)) {
                    errors[field] = rule.message || `${field} debe tener al menos ${rule.minLength} caracteres`;
                    break;
                }
                
                if (rule.maxLength && !ValidationUtils.hasMaxLength(value, rule.maxLength)) {
                    errors[field] = rule.message || `${field} no puede exceder ${rule.maxLength} caracteres`;
                    break;
                }
                
                if (rule.email && !ValidationUtils.isValidEmail(value)) {
                    errors[field] = rule.message || `${field} debe ser un email válido`;
                    break;
                }
            }
        }
        
        return errors;
    },

    // Mostrar errores en formulario
    showFormErrors(form, errors) {
        // Limpiar errores anteriores
        form.querySelectorAll('.form-error').forEach(error => error.remove());
        form.querySelectorAll('.error').forEach(input => input.classList.remove('error'));
        
        // Mostrar nuevos errores
        for (let field in errors) {
            const input = form.querySelector(`[name="${field}"]`);
            if (input) {
                input.classList.add('error');
                
                const errorElement = document.createElement('div');
                errorElement.className = 'form-error';
                errorElement.textContent = errors[field];
                
                input.parentNode.appendChild(errorElement);
            }
        }
    },

    // Limpiar formulario
    clearForm(form) {
        form.reset();
        form.querySelectorAll('.form-error').forEach(error => error.remove());
        form.querySelectorAll('.error, .success').forEach(input => {
            input.classList.remove('error', 'success');
        });
    }
};

// Exportar utilidades globalmente
window.DateUtils = DateUtils;
window.UIUtils = UIUtils;
window.ValidationUtils = ValidationUtils;
window.SearchUtils = SearchUtils;
window.StorageUtils = StorageUtils;
window.NotificationUtils = NotificationUtils;
window.FormUtils = FormUtils;