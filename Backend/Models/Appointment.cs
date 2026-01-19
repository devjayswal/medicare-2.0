using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models
{
    public class Appointment
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("patientId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string PatientId { get; set; } = string.Empty;

        [BsonElement("doctorId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DoctorId { get; set; } = string.Empty;

        [BsonElement("appointmentAt")]
        public DateTime AppointmentAt { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "BOOKED";

        [BsonElement("createdDate")]
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    }
}
