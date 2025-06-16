// JavaScript principal de la aplicación
class LibraryApp {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.data = {
            autores: [],
            libros: [],
            loading: false
        };
        
        this.init();
    }

    // Inicializar aplicación
    async init() {
        console.log('🚀 Iniciando Library App...');
        
        // Configurar navegación
        this.setupNavigation();
        
        // Cargar datos iniciales
        await this.loadInitialData();
        
        // Configurar página actual
        this.setupCurrentPage();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
        
        console.log('✅ Library App iniciada correctamente');
    }

    // Obtener página actual
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page;
    }

    // Configurar navegación
    setupNavigation() {
        const currentPage = this.currentPage;
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }

    // Cargar datos iniciales
    async loadInitialData() {
        try {
            // Verificar conexión con API
            const isConnected = await api.testConnection();
            if (!isConnected) {
                throw new Error('No se puede conectar con la API');
            }

            // Cargar autores y libros
            this.data.autores = await api.getAutores();
            this.data.libros = await api.getLibros();
            
            console.log('📚 Datos cargados:', {
                autores: this.data.autores.length,
                libros: this.data.libros.length
            });
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            NotificationUtils.show('Error al conectar con el servidor', 'error');
        }
    }

    // Configurar página actual
    setupCurrentPage() {
        switch (this.currentPage) {
            case 'index':
                this.setupDashboard();
                break;
            case 'autores':
                this.setupAutoresPage();
                break;
            case 'libros':
                this.setupLibrosPage();
                break;
            case 'crear-autor':
                this.setupCrearAutorPage();
                break;
            case 'crear-libro':
                this.setupCrearLibroPage();
                break;
        }
    }

    // Configurar dashboard
    setupDashboard() {
        this.updateDashboardStats();
        this.loadRecentItems();
    }

    // Actualizar estadísticas del dashboard
    updateDashboardStats() {
        const statsElements = {
            totalAutores: document.getElementById('total-autores'),
            totalLibros: document.getElementById('total-libros'),
            totalGeneros: document.getElementById('total-generos'),
            totalEditorials: document.getElementById('total-editorials')
        };

        if (statsElements.totalAutores) {
            statsElements.totalAutores.textContent = this.data.autores.length;
        }

        if (statsElements.totalLibros) {
            statsElements.totalLibros.textContent = this.data.libros.length;
        }

        if (statsElements.totalGeneros) {
            const generos = [...new Set(this.data.libros.map(libro => libro.genero).filter(g => g))];
            statsElements.totalGeneros.textContent = generos.length;
        }

        if (statsElements.totalEditorials) {
            const editorials = [...new Set(this.data.libros.map(libro => libro.editorial).filter(e => e))];
            statsElements.totalEditorials.textContent = editorials.length;
        }
    }

    // Cargar elementos recientes
    loadRecentItems() {
        this.loadRecentAutores();
        this.loadRecentLibros();
    }

    // Cargar autores recientes
    loadRecentAutores() {
        const container = document.getElementById('recent-autores');
        if (!container) return;

        const recentAutores = this.data.autores.slice(0, 5);
        
        if (recentAutores.length === 0) {
            UIUtils.showEmpty(container, 'No hay autores registrados');
            return;
        }

        const html = recentAutores.map(autor => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${autor.nombre} ${autor.apellido}</h4>
                    <p>${autor.nacionalidad || 'Nacionalidad no especificada'}</p>
                </div>
                <div class="recent-item-actions">
                    <a href="autores.html" class="btn btn-sm btn-primary">Ver todos</a>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Cargar libros recientes
    loadRecentLibros() {
        const container = document.getElementById('recent-libros');
        if (!container) return;

        const recentLibros = this.data.libros.slice(0, 5);
        
        if (recentLibros.length === 0) {
            UIUtils.showEmpty(container, 'No hay libros registrados');
            return;
        }

        const html = recentLibros.map(libro => `
            <div class="recent-item">
                <div class="recent-item-info">
                    <h4>${libro.titulo}</h4>
                    <p>${libro.editorial || 'Editorial no especificada'} - ${libro.genero || 'Género no especificado'}</p>
                    <div class="authors-list">
                        ${libro.autores.map(autor => `<span class="tag">${autor.nombre} ${autor.apellido}</span>`).join('')}
                    </div>
                </div>
                <div class="recent-item-actions">
                    <a href="libros.html" class="btn btn-sm btn-primary">Ver todos</a>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Configurar página de autores
    setupAutoresPage() {
        this.currentAutores = [...this.data.autores];
        this.setupAutoresSearch();
        this.renderAutoresTable();
    }

    // Configurar búsqueda de autores
    setupAutoresSearch() {
        const searchInput = document.getElementById('search-autores');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchText = e.target.value;
            this.filterAutores(searchText);
        });
    }

    // Filtrar autores
    filterAutores(searchText) {
        if (!searchText) {
            this.currentAutores = [...this.data.autores];
        } else {
            this.currentAutores = SearchUtils.filterByText(
                this.data.autores,
                searchText,
                ['nombre', 'apellido', 'nacionalidad']
            );
        }
        this.renderAutoresTable();
    }

    // Renderizar tabla de autores
    renderAutoresTable() {
        const tbody = document.getElementById('autores-tbody');
        if (!tbody) return;

        if (this.currentAutores.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No se encontraron autores</td>
                </tr>
            `;
            return;
        }

        const html = this.currentAutores.map(autor => `
            <tr>
                <td>${autor.nombre} ${autor.apellido}</td>
                <td>${DateUtils.formatDate(autor.fechaNacimiento)}</td>
                <td>${autor.nacionalidad || '-'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.editAutor(${autor.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteAutor(${autor.id})">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    // Configurar página de libros
    setupLibrosPage() {
        this.currentLibros = [...this.data.libros];
        this.setupLibrosSearch();
        this.renderLibrosTable();
    }

    // Configurar búsqueda de libros
    setupLibrosSearch() {
        const searchInput = document.getElementById('search-libros');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const searchText = e.target.value;
            this.filterLibros(searchText);
        });
    }

    // Filtrar libros
    filterLibros(searchText) {
        if (!searchText) {
            this.currentLibros = [...this.data.libros];
        } else {
            this.currentLibros = SearchUtils.filterByText(
                this.data.libros,
                searchText,
                ['titulo', 'editorial', 'genero', 'isbn']
            );
        }
        this.renderLibrosTable();
    }

    // Renderizar tabla de libros
    renderLibrosTable() {
        const tbody = document.getElementById('libros-tbody');
        if (!tbody) return;

        if (this.currentLibros.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No se encontraron libros</td>
                </tr>
            `;
            return;
        }

        const html = this.currentLibros.map(libro => `
            <tr>
                <td><strong>${libro.titulo}</strong></td>
                <td>${libro.isbn || '-'}</td>
                <td>${libro.editorial || '-'}</td>
                <td><span class="tag">${libro.genero || 'Sin categoría'}</span></td>
                <td>
                    <div class="authors-list">
                        ${libro.autores.map(autor => `<span class="tag tag-secondary">${autor.nombre} ${autor.apellido}</span>`).join('')}
                    </div>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.editLibro(${libro.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="app.deleteLibro(${libro.id})">
                            🗑️ Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    // Configurar página crear autor
    setupCrearAutorPage() {
        const form = document.getElementById('form-autor');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCrearAutor(form);
        });
    }

    // Manejar creación de autor
    async handleCrearAutor(form) {
        const formData = FormUtils.getFormData(form);
        
        // Validar formulario
        const rules = {
            nombre: [
                { required: true, message: 'El nombre es requerido' },
                { minLength: 2, message: 'El nombre debe tener al menos 2 caracteres' }
            ],
            apellido: [
                { required: true, message: 'El apellido es requerido' },
                { minLength: 2, message: 'El apellido debe tener al menos 2 caracteres' }
            ]
        };

        const errors = FormUtils.validateForm(form, rules);
        
        if (Object.keys(errors).length > 0) {
            FormUtils.showFormErrors(form, errors);
            return;
        }

        try {
            // Preparar datos
            const autorData = {
                id: 0,
                nombre: formData.nombre,
                apellido: formData.apellido,
                fechaNacimiento: formData.fechaNacimiento || null,
                nacionalidad: formData.nacionalidad || null,
                bibliografia: formData.bibliografia || null
            };

            // Crear autor
            const nuevoAutor = await api.createAutor(autorData);
            
            NotificationUtils.show('Autor creado exitosamente', 'success');
            
            // Limpiar formulario
            FormUtils.clearForm(form);
            
            // Actualizar datos locales
            this.data.autores.push(nuevoAutor);
            
            // Redirigir a lista de autores después de 2 segundos
            setTimeout(() => {
                window.location.href = 'autores.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error creando autor:', error);
            NotificationUtils.show('Error al crear el autor', 'error');
        }
    }

    // Configurar página crear libro
    setupCrearLibroPage() {
        this.loadAutoresSelect();
        
        const form = document.getElementById('form-libro');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCrearLibro(form);
        });
    }

    // Cargar select de autores
    loadAutoresSelect() {
        const container = document.getElementById('autores-select');
        if (!container) return;

        const html = this.data.autores.map(autor => `
            <div class="multi-select-item">
                <input type="checkbox" id="autor-${autor.id}" value="${autor.id}" name="autores">
                <label for="autor-${autor.id}">${autor.nombre} ${autor.apellido}</label>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Manejar creación de libro
    async handleCrearLibro(form) {
        const formData = FormUtils.getFormData(form);
        
        // Obtener autores seleccionados
        const autoresSeleccionados = Array.from(
            form.querySelectorAll('input[name="autores"]:checked')
        ).map(input => {
            const autorId = parseInt(input.value);
            return this.data.autores.find(autor => autor.id === autorId);
        });

        // Validar formulario
        const rules = {
            titulo: [
                { required: true, message: 'El título es requerido' },
                { minLength: 2, message: 'El título debe tener al menos 2 caracteres' }
            ]
        };

        const errors = FormUtils.validateForm(form, rules);
        
        if (autoresSeleccionados.length === 0) {
            errors.autores = 'Debe seleccionar al menos un autor';
        }
        
        if (Object.keys(errors).length > 0) {
            FormUtils.showFormErrors(form, errors);
            return;
        }

        try {
            // Preparar datos
            const libroData = {
                id: 0,
                titulo: formData.titulo,
                isbn: formData.isbn || null,
                fechaPublicacion: formData.fechaPublicacion || null,
                editorial: formData.editorial || null,
                numeroPaginas: formData.numeroPaginas ? parseInt(formData.numeroPaginas) : null,
                genero: formData.genero || null,
                descripcion: formData.descripcion || null,
                autores: autoresSeleccionados
            };

            // Crear libro
            const nuevoLibro = await api.createLibro(libroData);
            
            NotificationUtils.show('Libro creado exitosamente', 'success');
            
            // Limpiar formulario
            FormUtils.clearForm(form);
            
            // Actualizar datos locales
            this.data.libros.push(nuevoLibro);
            
            // Redirigir a lista de libros después de 2 segundos
            setTimeout(() => {
                window.location.href = 'libros.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error creando libro:', error);
            NotificationUtils.show('Error al crear el libro', 'error');
        }
    }

    // Editar autor
    async editAutor(id) {
        // Por simplicidad, redirigir a crear-autor con parámetro
        window.location.href = `crear-autor.html?edit=${id}`;
    }

    // Eliminar autor
    async deleteAutor(id) {
        if (!confirm('¿Está seguro de que desea eliminar este autor?')) {
            return;
        }

        try {
            await api.deleteAutor(id);
            
            // Remover de datos locales
            this.data.autores = this.data.autores.filter(autor => autor.id !== id);
            this.currentAutores = this.currentAutores.filter(autor => autor.id !== id);
            
            // Re-renderizar tabla
            this.renderAutoresTable();
            
            NotificationUtils.show('Autor eliminado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error eliminando autor:', error);
            NotificationUtils.show('Error al eliminar el autor', 'error');
        }
    }

    // Editar libro
    async editLibro(id) {
        window.location.href = `crear-libro.html?edit=${id}`;
    }

    // Eliminar libro
    async deleteLibro(id) {
        if (!confirm('¿Está seguro de que desea eliminar este libro?')) {
            return;
        }

        try {
            await api.deleteLibro(id);
            
            // Remover de datos locales
            this.data.libros = this.data.libros.filter(libro => libro.id !== id);
            this.currentLibros = this.currentLibros.filter(libro => libro.id !== id);
            
            // Re-renderizar tabla
            this.renderLibrosTable();
            
            NotificationUtils.show('Libro eliminado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error eliminando libro:', error);
            NotificationUtils.show('Error al eliminar el libro', 'error');
        }
    }

    // Configurar eventos globales
    setupGlobalEvents() {
        // Manejar errores de red globalmente
        window.addEventListener('offline', () => {
            NotificationUtils.show('Conexión perdida. Algunas funciones pueden no estar disponibles.', 'warning');
        });

        window.addEventListener('online', () => {
            NotificationUtils.show('Conexión restaurada.', 'success');
        });
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LibraryApp();
});