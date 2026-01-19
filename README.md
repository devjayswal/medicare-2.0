# 🏥 Eastencher Hospital Management System

A full-stack healthcare appointment booking and management system built with **Angular**, **.NET Core**, and **MongoDB**.

## 📋 Features

- ✅ **Patient Portal**
  - Register and login
  - Book appointments with available doctors
  - View and manage bookings
  - Cancel appointments

- ✅ **Admin Dashboard**
  - Manage all appointments
  - Update appointment status (BOOKED, COMPLETED, CANCELLED, NO_SHOW)
  - View patient and doctor details
  - Monitor hospital operations

- ✅ **Doctor Management**
  - Doctor profiles with specialties
  - Availability scheduling (time slots per day)
  - Appointment tracking

- ✅ **Secure Authentication**
  - JWT-based authentication
  - Role-based access control (Patient, Admin)
  - Password hashing with BCrypt

## 🛠️ Tech Stack

### Backend
- **.NET 10** (C#)
- **MongoDB** (Cloud)
- **JWT Authentication**
- **RESTful API**

### Frontend
- **Angular 19** (Standalone components)
- **TypeScript**
- **RxJS**
- **Responsive CSS**

## 🚀 Quick Start

### Prerequisites
- **.NET SDK 10.x**
- **Node.js 18+** (for Angular)
- **MongoDB Atlas Account** (cloud database)
- **Git**

### Backend Setup

1. **Navigate to Backend folder:**
   ```bash
   cd Backend
   ```

2. **Create `appsettings.json`** (copy from `appsettings.example.json`):
   ```json
   {
     "DatabaseSettings": {
       "ConnectionString": "mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority",
       "DatabaseName": "EastencherDB"
     },
     "Jwt": {
       "SecretKey": "YOUR_SECRET_KEY_AT_LEAST_32_CHARACTERS",
       "Issuer": "Eastencher",
       "Audience": "EastencherUsers"
     }
   }
   ```

3. **Run the backend:**
   ```bash
   dotnet run
   ```
   Backend runs on `http://localhost:5007`

### Frontend Setup

1. **Navigate to Frontend folder:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Angular dev server:**
   ```bash
   ng serve
   ```
   Frontend runs on `http://localhost:4200`

### Database Setup

1. **Seed initial data:**
   ```bash
   cd New_Eastencher
   node seed-node.js
   ```
   This creates:
   - 2 sample doctors (Cardiology, Dermatology)
   - 56 availability slots
   - 1 admin account: `admin@eastencher.com` / `Admin@12345`
   - 1 patient account: `8888888888` / `patient123`

2. **Check database:**
   ```bash
   node check-db.js
   ```

## 🔐 Security

⚠️ **IMPORTANT**: 
- **Never commit** `appsettings.json` with real credentials (it's in `.gitignore`)
- **Never share** your MongoDB connection string
- Always use environment variables or `.env` files for secrets
- Use `appsettings.example.json` as a template for team members

## 📖 API Endpoints

### Authentication
- `POST /api/patients/register` - Register patient
- `POST /api/patients/login` - Patient login
- `POST /api/admin/login` - Admin login

### Patient Routes
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/{id}/slots?date=YYYY-MM-DD` - Get available slots
- `POST /api/appointments/book` - Book appointment
- `GET /api/patients/{id}/appointments` - Get patient's appointments
- `POST /api/appointments/{id}/cancel` - Cancel appointment

### Admin Routes
- `GET /api/admin/appointments` - Get all appointments
- `PATCH /api/admin/appointments/{id}/status` - Update appointment status

## 🧹 Utility Scripts

| Script | Purpose |
|--------|---------|
| `seed-node.js` | Initialize database with sample data |
| `check-db.js` | Verify database contents |
| `clear-patients.js` | Clear patient/appointment data |
| `cleanup-doctors.js` | Clean up duplicate doctors |
| `create-indexes.js` | Create database indexes |
| `generate-hashes.js` | Generate password hashes |

Run any script:
```bash
node script-name.js
```

## 📝 Default Test Credentials

### Admin
- **Email:** admin@eastencher.com
- **Password:** Admin@12345

### Patient
- **Mobile:** 8888888888
- **Password:** patient123

## 🐛 Troubleshooting

### Backend won't start
- Verify MongoDB connection string in `appsettings.json`
- Ensure port 5007 is not in use: `netstat -ano | findstr :5007`

### Frontend build errors
- Clear node_modules: `rm -r node_modules && npm install`
- Clear Angular cache: `ng cache clean`

### Appointments not loading
- Check browser console for errors (F12 → Console)
- Verify backend is running on `http://localhost:5007`
- Ensure you're logged in as a patient

## 📞 Support

For issues or questions, check the console logs:
- **Backend logs:** Terminal where `dotnet run` is executing
- **Frontend logs:** Browser DevTools (F12 → Console)
- **Database logs:** MongoDB Atlas dashboard

## 📄 License

This project is proprietary. All rights reserved.

---

**Last Updated:** January 19, 2026  
**Status:** Production Ready
