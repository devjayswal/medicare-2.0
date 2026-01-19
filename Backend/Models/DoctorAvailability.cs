using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Models
{
    public class DoctorAvailability
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("doctorId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string DoctorId { get; set; } = string.Empty;

        [BsonElement("dayOfWeek")]
        public int DayOfWeek { get; set; } // 0=Sunday ... 6=Saturday

        [BsonElement("startTime")]
        public string StartTime { get; set; } = string.Empty; // "09:00"

        [BsonElement("endTime")]
        public string EndTime { get; set; } = string.Empty; // "17:00"
    }
}
