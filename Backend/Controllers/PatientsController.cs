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
    [Route("api/patients")]
    public class PatientsController : ControllerBase
    {
        private readonly MongoDBService _db;
        private readonly JwtService _jwt;

        public PatientsController(MongoDBService db, JwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        // POST: api/patients/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] PatientRegisterDto dto)
        {
            try
            {
                // Check if mobile already exists
                var existing = await _db.Patients
                    .Find(p => p.Mobile == dto.Mobile)
                    .FirstOrDefaultAsync();

                if (existing != null)
                {
                    return Conflict(new { message = "Mobile number already registered" });
                }

                // Hash password
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

                // Create patient
                var patient = new Patient
                {
                    FullName = dto.FullName,
                    Mobile = dto.Mobile,
                    Email = dto.Email,
                    Gender = dto.Gender,
                    DateOfBirth = dto.DateOfBirth,
                    Address = dto.Address,
                    City = dto.City,
                    State = dto.State,
                    Pincode = dto.Pincode,
                    Password = hashedPassword,
                    Role = "PATIENT",
                    CreatedDate = DateTime.UtcNow,
                    ModifiedDate = DateTime.UtcNow
                };

                await _db.Patients.InsertOneAsync(patient);

                // Generate patient code based on ID
                var patientCode = $"PAT{patient.Id?.Substring(patient.Id.Length - 6)}";
                var update = Builders<Patient>.Update.Set(p => p.PatientCode, patientCode);
                await _db.Patients.UpdateOneAsync(p => p.Id == patient.Id, update);

                patient.PatientCode = patientCode;

                // Remove password from response
                patient.Password = string.Empty;

                return CreatedAtAction(nameof(GetPatient), new { id = patient.Id }, patient);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Registration failed. Please check your input and try again.", error = ex.Message });
            }
        }

        // POST: api/patients/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] PatientLoginDto dto)
        {
            try
            {
                var patient = await _db.Patients
                    .Find(p => p.Mobile == dto.Mobile)
                    .FirstOrDefaultAsync();

                if (patient == null)
                {
                    return Unauthorized(new { message = "Invalid mobile or password" });
                }

                // Verify password
                if (!BCrypt.Net.BCrypt.Verify(dto.Password, patient.Password))
                {
                    return Unauthorized(new { message = "Invalid mobile or password" });
                }

                // Generate JWT token
                var token = _jwt.GenerateToken(patient.Id!, patient.Role, patient.Mobile);

                // Set token in HTTP-only cookie
                Response.Cookies.Append("token", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    Expires = DateTimeOffset.UtcNow.AddDays(7)
                });

                // Return patient info without password
                patient.Password = string.Empty;

                return Ok(new
                {
                    message = "Login successful",
                    token,
                    patient
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Login failed", error = ex.Message });
            }
        }

        // GET: api/patients/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetPatient(string id)
        {
            try
            {
                var patient = await _db.Patients
                    .Find(p => p.Id == id)
                    .FirstOrDefaultAsync();

                if (patient == null)
                {
                    return NotFound(new { message = "Patient not found" });
                }

                patient.Password = string.Empty;
                return Ok(patient);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching patient", error = ex.Message });
            }
        }

        // GET: api/patients/{id}/appointments
        [HttpGet("{id}/appointments")]
        [Authorize]
        public async Task<IActionResult> GetPatientAppointments(string id)
        {
            try
            {
                var appointments = await _db.Appointments
                    .Find(a => a.PatientId == id)
                    .SortByDescending(a => a.AppointmentAt)
                    .ToListAsync();

                // Batch fetch doctor details instead of N+1 queries
                var doctorIds = appointments.Select(a => a.DoctorId).Where(id => id != null).Distinct().ToList();
                var doctorFilter = Builders<Doctor>.Filter.In(d => d.Id, doctorIds);
                
                var doctors = await _db.Doctors
                    .Find(doctorFilter)
                    .ToListAsync();

                var doctorDict = doctors.Where(d => d.Id != null).ToDictionary(d => d.Id!);

                var result = appointments.Select(appointment =>
                {
                    doctorDict.TryGetValue(appointment.DoctorId, out var doctor);

                    return new
                    {
                        appointment.Id,
                        appointment.AppointmentAt,
                        appointment.Status,
                        appointment.CreatedDate,
                        Doctor = doctor
                    };
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching appointments", error = ex.Message });
            }
        }

        // GET: api/patients/list (Admin only)
        [HttpGet("list")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> GetAllPatients()
        {
            try
            {
                var patients = await _db.Patients
                    .Find(_ => true)
                    .SortByDescending(p => p.CreatedDate)
                    .ToListAsync();

                // Remove passwords
                patients.ForEach(p => p.Password = string.Empty);

                return Ok(patients);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching patients", error = ex.Message });
            }
        }
    }
}
