using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/doctors")]
    public class DoctorsController : ControllerBase
    {
        private readonly MongoDBService _db;

        public DoctorsController(MongoDBService db)
        {
            _db = db;
        }

        // GET: api/doctors
        [HttpGet]
        public async Task<IActionResult> GetDoctors([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            try
            {
                // Validate pagination parameters
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 50;

                var totalCount = await _db.Doctors.CountDocumentsAsync(_ => true);

                var doctors = await _db.Doctors
                    .Find(_ => true)
                    .Skip((page - 1) * pageSize)
                    .Limit(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    data = doctors,
                    totalCount = totalCount,
                    pageCount = (int)Math.Ceiling((double)totalCount / pageSize),
                    currentPage = page,
                    pageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching doctors", error = ex.Message });
            }
        }

        // GET: api/doctors/{id}/slots?date=2026-01-20
        [HttpGet("{id}/slots")]
        public async Task<IActionResult> GetAvailableSlots(string id, [FromQuery] DateTime date)
        {
            try
            {
                // Get day of week (0=Sunday, 1=Monday, etc.)
                int dayOfWeek = (int)date.DayOfWeek;

                // Get all doctor availability records for this day (there may be multiple per day for different time slots)
                var availabilities = await _db.DoctorAvailability
                    .Find(a => a.DoctorId == id && a.DayOfWeek == dayOfWeek)
                    .ToListAsync();

                if (availabilities == null || availabilities.Count == 0)
                {
                    return Ok(new List<string>()); // No slots available on this day
                }

                // Generate 15-minute slots for all availability periods
                var slots = new List<string>();
                foreach (var availability in availabilities)
                {
                    var startTime = TimeSpan.Parse(availability.StartTime);
                    var endTime = TimeSpan.Parse(availability.EndTime);

                    var currentTime = startTime;
                    while (currentTime < endTime)
                    {
                        slots.Add(currentTime.ToString(@"hh\:mm"));
                        currentTime = currentTime.Add(TimeSpan.FromMinutes(15));
                    }
                }

                // Remove duplicate slots
                slots = slots.Distinct().OrderBy(s => s).ToList();

                // Get booked appointments for this doctor on this date
                var startOfDay = date.Date;
                var endOfDay = date.Date.AddDays(1);

                var bookedAppointments = await _db.Appointments
                    .Find(a => a.DoctorId == id && 
                               a.AppointmentAt >= startOfDay && 
                               a.AppointmentAt < endOfDay &&
                               a.Status != "CANCELLED")
                    .ToListAsync();

                var bookedSlots = bookedAppointments
                    .Select(a => a.AppointmentAt.ToString("HH:mm"))
                    .ToList();

                // Filter out booked slots
                var availableSlots = slots
                    .Where(slot => !bookedSlots.Contains(slot))
                    .ToList();

                return Ok(availableSlots);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error fetching slots", error = ex.Message });
            }
        }
    }
}
