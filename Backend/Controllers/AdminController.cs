using Backend.DTOs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using BCrypt.Net;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly MongoDBService _db;
        private readonly JwtService _jwt;

        public AdminController(MongoDBService db, JwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        // POST: api/admin/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AdminLoginDto dto)
        {
            try
            {
                var admin = await _db.Patients
                    .Find(p => p.Email == dto.Email && p.Role == "ADMIN")
                    .FirstOrDefaultAsync();

                if (admin == null)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, admin.Password))
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                // Generate JWT token
                var token = _jwt.GenerateToken(admin.Id!, admin.Role, admin.Mobile);

                // Set token in HTTP-only cookie
                Response.Cookies.Append("token", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                // Return admin info without password
                admin.Password = string.Empty;

                return Ok(new
                {
                    message = "Login successful",
                    token,
                    admin
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Login failed", error = ex.Message });
            }
        }

        // GET: api/admin/appointments
        [HttpGet("appointments")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllAppointments([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            try
            {
                // Validate pagination parameters
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 20;

                var filter = status != null
                    ? Builders<Appointment>.Filter.Eq(a => a.Status, status)
                    : Builders<Appointment>.Filter.Empty;

                // Get total count
                var totalCount = await _db.Appointments.CountDocumentsAsync(filter);

                // Fetch appointments with pagination
                var appointments = await _db.Appointments
                    .Find(filter)
                    .SortByDescending(a => a.AppointmentAt)
                    .Skip((page - 1) * pageSize)
                    .Limit(pageSize)
                    .ToListAsync();

                // Batch fetch patient and doctor details (solves N+1 problem)
                var patientIds = appointments.Select(a => a.PatientId).Where(id => id != null).Distinct().ToList();
                var doctorIds = appointments.Select(a => a.DoctorId).Where(id => id != null).Distinct().ToList();

                var patientFilter = Builders<Patient>.Filter.In(p => p.Id, patientIds);
                var doctorFilter = Builders<Doctor>.Filter.In(d => d.Id, doctorIds);

                var patients = await _db.Patients
                    .Find(patientFilter)
                    .ToListAsync();

                var doctors = await _db.Doctors
                    .Find(doctorFilter)
                    .ToListAsync();

                // Create lookup dictionaries for O(1) access
                var patientDict = patients.Where(p => p.Id != null).ToDictionary(p => p.Id!);
                var doctorDict = doctors.Where(d => d.Id != null).ToDictionary(d => d.Id!);

                // Build result with pre-fetched data
                var result = appointments.Select(appointment =>
                {
                    patientDict.TryGetValue(appointment.PatientId, out var patient);
                    doctorDict.TryGetValue(appointment.DoctorId, out var doctor);

                    if (patient != null)
                    {
                        patient.Password = string.Empty;
                    }

                    return new
                    {
                        appointment.Id,
                        appointment.AppointmentAt,
                        appointment.Status,
                        appointment.CreatedDate,
                        Patient = patient,
                        Doctor = doctor
                    };
                }).ToList();

                return Ok(new
                {
                    data = result,
                    totalCount = totalCount,
                    pageCount = (int)Math.Ceiling((double)totalCount / pageSize),
                    currentPage = page,
                    pageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching appointments", error = ex.Message });
            }
        }

        // PATCH: api/admin/appointments/{id}/status
        [HttpPatch("appointments/{id}/status")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateAppointmentStatus(string id, [FromBody] UpdateAppointmentStatusDto dto)
        {
            try
            {
                var validStatuses = new[] { "BOOKED", "COMPLETED", "CANCELLED", "NO_SHOW" };
                if (!validStatuses.Contains(dto.Status))
                {
                    return BadRequest(new { message = "Invalid status" });
                }

                var update = Builders<Appointment>.Update.Set(a => a.Status, dto.Status);
                var result = await _db.Appointments.UpdateOneAsync(a => a.Id == id, update);

                if (result.ModifiedCount == 0)
                {
                    return NotFound(new { message = "Appointment not found" });
                }

                return Ok(new { message = "Appointment status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Failed to update status", error = ex.Message });
            }
        }
    }
}
