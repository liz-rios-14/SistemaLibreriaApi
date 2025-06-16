// Configuración de la API
const API_CONFIG = {
    //baseURL: 'https://localhost:7100/api',
    baseURL: 'https://localhost:44386/api',
    // Para acceso por IP cambiar a: 'https://TU-IP:7100/api'
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};

// Clase para manejar la API
class LibraryAPI {
    constructor() {
        this.baseURL = API_CONFIG.baseURL;
        this.headers = API_CONFIG.headers;
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            console.log(`🌐 ${config.method || 'GET'} ${url}`);
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Respuesta exitosa:', data);
            return data;
        } catch (error) {
            console.error('❌ Error en API:', error);
            throw error;
        }
    }

    // ====== MÉTODOS PARA AUTORES ======
    
    async getAutores() {
        return this.request('/autores');
    }

    async getAutor(id) {
        return this.request(`/autores/${id}`);
    }

    async createAutor(autor) {
        return this.request('/autores', {
            method: 'POST',
            body: JSON.stringify(autor)
        });
    }

    async updateAutor(id, autor) {
        return this.request(`/autores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(autor)
        });
    }

    async deleteAutor(id) {
        return this.request(`/autores/${id}`, {
            method: 'DELETE'
        });
    }

    // ====== MÉTODOS PARA LIBROS ======
    
    async getLibros() {
        return this.request('/libros');
    }

    async getLibro(id) {
        return this.request(`/libros/${id}`);
    }

    async createLibro(libro) {
        return this.request('/libros', {
            method: 'POST',
            body: JSON.stringify(libro)
        });
    }

    async updateLibro(id, libro) {
        return this.request(`/libros/${id}`, {
            method: 'PUT',
            body: JSON.stringify(libro)
        });
    }

    async deleteLibro(id) {
        return this.request(`/libros/${id}`, {
            method: 'DELETE'
        });
    }

    // ====== MÉTODOS PARA RELACIONES ======
    
    async asignarAutorALibro(libroId, autorId) {
        return this.request(`/libros/${libroId}/autores/${autorId}`, {
            method: 'POST'
        });
    }

    async removerAutorDeLibro(libroId, autorId) {
        return this.request(`/libros/${libroId}/autores/${autorId}`, {
            method: 'DELETE'
        });
    }

    // ====== MÉTODOS DE UTILIDAD ======
    
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Instancia global de la API
const api = new LibraryAPI();

// Exportar para uso en otros archivos
window.LibraryAPI = LibraryAPI;
window.api = api;