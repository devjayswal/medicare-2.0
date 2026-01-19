namespace Backend.Models
{
    public class DatabaseSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string PatientsCollection { get; set; } = "Patients";
        public string DoctorsCollection { get; set; } = "Doctors";
        public string AppointmentsCollection { get; set; } = "Appointments";
        public string AvailabilityCollection { get; set; } = "DoctorAvailability";
    }
}
