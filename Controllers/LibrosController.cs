using LibreriaApi.Models.DTOs;
using LibreriaApi.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace LibreriaApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LibrosController : ControllerBase
    {
        private readonly ILibroService _libroService;

        public LibrosController(ILibroService libroService)
        {
            _libroService = libroService;
        }

        /// <summary>
        /// Obtiene todos los libros con sus autores
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<List<LibroDTO>>> GetLibros()
        {
            try
            {
                var libros = await _libroService.ObtenerLibrosAsync();
                return Ok(libros);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>
        /// Obtiene un libro por su ID con sus autores
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<LibroDTO>> GetLibro(int id)
        {
            try
            {
                var libro = await _libroService.ObtenerLibroPorIdAsync(id);
                if (libro == null)
                {
                    return NotFound($"No se encontró el libro con ID {id}");
                }
                return Ok(libro);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>
        /// Crea un nuevo libro
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<LibroDTO>> PostLibro(LibroDTO libroDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var nuevoLibro = await _libroService.CrearLibroAsync(libroDto);
                return CreatedAtAction(nameof(GetLibro), new { id = nuevoLibro.Id }, nuevoLibro);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>
        /// Actualiza un libro existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<LibroDTO>> PutLibro(int id, LibroDTO libroDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var libroActualizado = await _libroService.ActualizarLibroAsync(id, libroDto);
                if (libroActualizado == null)
                {
                    return NotFound($"No se encontró el libro con ID {id}");
                }

                return Ok(libroActualizado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>
        /// Elimina un libro (eliminación lógica)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLibro(int id)
        {
            try
            {
                var eliminado = await _libroService.EliminarLibroAsync(id);
                if (!eliminado)
                {
                    return NotFound($"No se encontró el libro con ID {id}");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>
        /// Asigna un autor a un libro
        /// </summary>
        [HttpPost("{libroId}/autores/{autorId}")]
        public async Task<ActionResult> AsignarAutor(int libroId, int autorId)
        {
            try
            {
                var asignado = await _libroService.AsignarAutorAsync(libroId, autorId);
                if (!asignado)
                {
                    return BadRequest("No se pudo asignar el autor al libro. Verifique que ambos existan.");
                }

                return Ok("Autor asignado exitosamente al libro");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        /// <summary>
        /// Remueve un autor de un libro
        /// </summary>
        [HttpDelete("{libroId}/autores/{autorId}")]
        public async Task<ActionResult> RemoverAutor(int libroId, int autorId)
        {
            try
            {
                var removido = await _libroService.RemoverAutorAsync(libroId, autorId);
                if (!removido)
                {
                    return NotFound("No se encontró la relación entre el libro y el autor");
                }

                return Ok("Autor removido exitosamente del libro");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }
    }
}
