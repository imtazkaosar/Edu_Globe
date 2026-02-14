# 🌍 EduGlobe — E-Learning & Study Abroad Assistance Platform  

**Course:** CSE471 – System Analysis and Design  
**Semester:** Fall 2025    
---

## 👥 Team Members

|--------------------------|
| Md. Imtaz Kaosar         |
|  Sougata Das             |
| Anusheh Anadil Raham     |

---

## 📌 Project Overview  

EduGlobe is a full-featured E-Learning and Study Abroad Assistance Platform.  
It supports students, teachers, and administrators through a role-based system with real-time data updates.

The system provides:
- Online course management
- Live class integration
- Quiz & assignment tracking
- Automated certificate generation
- Study abroad university search
- Secure online payments

---

## 🛠 Tech Stack  

- **Language:** JavaScript  
- **Frontend:** React.js  
- **Styling:** Tailwind CSS  
- **Database:** MongoDB  
- **Architecture:** MVC (Model-View-Controller)  
- **Payment Integration:** Stripe 
- **Live Class Integration:** Zoom / Google Meet  
- **Deployment:** Localhost  

---

# 📂 Functional Requirements  

## 🔐 User Management & Personalization  

### Role-Based Dashboard
- Separate dashboards for:
  - System Admin
  - Student
  - Teacher
- Personalized data display
- Real-time updates using React and MongoDB

### Authentication & Profile Management
- User registration
- Secure login
- Update profile information
- Change password

### Role Management & Content Control
- Admin can:
  - Add/Edit/Delete users
  - Add/Edit/Delete courses
  - Manage announcements

### Payment Gateway Integration
- Course payments via Stripe or PayPal
- Transaction history stored in MongoDB
- Automatic invoice generation

---

## 📚 Course & Learning Management  

### Advanced Course Search & Filtering
- Filter by category
- Filter by instructor
- Filter by ratings

### Live Class Integration
- Online live classes via Zoom or Google Meet

### Quiz & Progress Tracking System
- MCQ-based quizzes
- Automatic scoring
- Time limits
- Student-wise performance tracking

### Assignment Upload & Submission Portal
- Teachers upload assignments with deadlines
- Students submit assignments online

---

## 🏆 Performance & Recognition  

### Dynamic Learning Progress Graph
- Visual graph of quiz and assignment performance

### Auto Certificate Generation
- Downloadable certificates after course completion

### Course Review System
- Students can rate and review courses

### Pre-recorded Class Access
- Students can watch recorded lectures anytime

---

## 🌎 Extra Dynamic Features  

### Study Abroad Module – University Search
- Search universities by:
  - Location
  - Tuition
  - Admission criteria

### Application Deadline Countdown
- Dynamic countdown timer for each university application

---

# 🏗 System Architecture  

The system follows the MVC architecture:

- **Model:** MongoDB database
- **View:** React.js frontend
- **Controller:** Backend logic

---

# ⚙️ Installation & Setup Guide  

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/eduglobe.git
cd eduglobe
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Set Up Environment Variables

Create a `.env` file in the root directory and add:

```env
MONGO_URI=your_mongodb_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
```

## 4️⃣ Run the Project

```bash
npm start
```

The application will run on:

```
http://localhost:3000
```

---

# 📁 Project Structure  

```
EduGlobe/
│
├── client/         # React frontend
├── server/         # Backend
├── models/         # Database models
├── controllers/    # Business logic
├── routes/         # API routes
├── config/         # Configuration files
└── README.md
```

---

# 🚀 Future Improvements  

- Cloud deployment (AWS / Firebase)
- AI-based course recommendation
- Scholarship recommendation system
- Mobile application version

---

# 📌 Conclusion  

EduGlobe integrates online learning and study abroad assistance into one unified platform.  
It ensures secure authentication, efficient course management, performance tracking, and university search tools to support students in their academic journey.
