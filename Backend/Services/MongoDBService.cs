using MongoDB.Driver;
using Backend.Models;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public class MongoDBService
    {
        private readonly IMongoDatabase _database;
        private static MongoClient? _client;
        private static readonly object _lock = new object();

        public MongoDBService(IOptions<DatabaseSettings> settings)
        {
            // Use singleton pattern for MongoClient (recommended by MongoDB)
            if (_client == null)
            {
                lock (_lock)
                {
                    if (_client == null)
                    {
                        var mongoSettings = MongoClientSettings.FromConnectionString(settings.Value.ConnectionString);
                        mongoSettings.MaxConnectionPoolSize = 50;
                        mongoSettings.MinConnectionPoolSize = 10;
                        mongoSettings.ConnectTimeout = TimeSpan.FromSeconds(10);
                        mongoSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);
                        _client = new MongoClient(mongoSettings);
                    }
                }
            }
            _database = _client.GetDatabase(settings.Value.DatabaseName);
            
            // Create indexes for better query performance (fire and forget, don't block startup)
            _ = CreateIndexesAsync();
        }

        private async Task CreateIndexesAsync()
        {
            try
            {
                // Appointment indexes
                var appointmentIndexes = Appointments.Indexes;
                await appointmentIndexes.CreateOneAsync(new CreateIndexModel<Appointment>(
                    Builders<Appointment>.IndexKeys.Ascending(a => a.DoctorId)));
                await appointmentIndexes.CreateOneAsync(new CreateIndexModel<Appointment>(
                    Builders<Appointment>.IndexKeys.Ascending(a => a.PatientId)));
                await appointmentIndexes.CreateOneAsync(new CreateIndexModel<Appointment>(
                    Builders<Appointment>.IndexKeys.Ascending(a => a.Status)));
                await appointmentIndexes.CreateOneAsync(new CreateIndexModel<Appointment>(
                    Builders<Appointment>.IndexKeys.Descending(a => a.AppointmentAt)));
                await appointmentIndexes.CreateOneAsync(new CreateIndexModel<Appointment>(
                    Builders<Appointment>.IndexKeys.Ascending(a => a.DoctorId).Ascending(a => a.AppointmentAt)));

                // Patient indexes
                var patientIndexes = Patients.Indexes;
                await patientIndexes.CreateOneAsync(new CreateIndexModel<Patient>(
                    Builders<Patient>.IndexKeys.Ascending(p => p.Email)));
                await patientIndexes.CreateOneAsync(new CreateIndexModel<Patient>(
                    Builders<Patient>.IndexKeys.Ascending(p => p.Mobile)));
            }
            catch (Exception ex)
            {
                // Log but don't fail initialization if indexes can't be created
                System.Diagnostics.Debug.WriteLine($"Warning: Could not create indexes: {ex.Message}");
            }
        }

        public IMongoCollection<Patient> Patients =>
            _database.GetCollection<Patient>("Patients");

        public IMongoCollection<Doctor> Doctors =>
            _database.GetCollection<Doctor>("Doctors");

        public IMongoCollection<Appointment> Appointments =>
            _database.GetCollection<Appointment>("Appointments");

        public IMongoCollection<DoctorAvailability> DoctorAvailability =>
            _database.GetCollection<DoctorAvailability>("DoctorAvailability");
    }
}
