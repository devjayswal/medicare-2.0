using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/appointments")]
    public class AppointmentsController : ControllerBase
    {
        private readonly MongoDBService _db;

        public AppointmentsController(MongoDBService db)
        {
            _db = db;
        }

        // POST: api/appointments/book
        [HttpPost("book")]
        [Authorize]
        public async Task<IActionResult> BookAppointment([FromBody] BookAppointmentDto dto)
        {
            try
            {
                // Check if slot is already booked
                var existing = await _db.Appointments
                    .Find(a => a.DoctorId == dto.DoctorId && 
                               a.AppointmentAt == dto.AppointmentAt &&
                               a.Status != "CANCELLED")
                    .FirstOrDefaultAsync();

                if (existing != null)
                {
                    return Conflict(new { message = "Slot already booked" });
                }

                var appointment = new Appointment
                {
                    PatientId = dto.PatientId,
                    DoctorId = dto.DoctorId,
                    AppointmentAt = dto.AppointmentAt,
                    Status = "BOOKED",
                    CreatedDate = DateTime.UtcNow
                };

                await _db.Appointments.InsertOneAsync(appointment);

                return CreatedAtAction(nameof(GetAppointment), new { id = appointment.Id }, appointment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to book appointment", error = ex.Message });
            }
        }

        // GET: api/appointments/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetAppointment(string id)
        {
            try
            {
                var appointment = await _db.Appointments
                    .Find(a => a.Id == id)
                    .FirstOrDefaultAsync();

                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                return Ok(appointment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching appointment", error = ex.Message });
            }
        }

        // POST: api/appointments/{id}/cancel
        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelAppointment(string id)
        {
            try
            {
                var update = Builders<Appointment>.Update.Set(a => a.Status, "CANCELLED");
                var result = await _db.Appointments.UpdateOneAsync(a => a.Id == id, update);

                if (result.ModifiedCount == 0)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                return Ok(new { message = "Appointment cancelled successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to cancel appointment", error = ex.Message });
            }
        }

        // POST: api/appointments/{id}/reschedule
        [HttpPost("{id}/reschedule")]
        [Authorize]
        public async Task<IActionResult> RescheduleAppointment(string id, [FromBody] RescheduleAppointmentDto dto)
        {
            try
            {
                var appointment = await _db.Appointments
                    .Find(a => a.Id == id)
                    .FirstOrDefaultAsync();

                if (appointment == null)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                // Check if new slot is available
                var existing = await _db.Appointments
                    .Find(a => a.DoctorId == appointment.DoctorId && 
                               a.AppointmentAt == dto.NewAppointmentAt &&
                               a.Status != "CANCELLED")
                    .FirstOrDefaultAsync();

                if (existing != null)
                {
                    return Conflict(new { message = "New slot already booked" });
                }

                var update = Builders<Appointment>.Update.Set(a => a.AppointmentAt, dto.NewAppointmentAt);
                await _db.Appointments.UpdateOneAsync(a => a.Id == id, update);

                return Ok(new { message = "Appointment rescheduled successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to reschedule appointment", error = ex.Message });
            }
        }
    }
}
