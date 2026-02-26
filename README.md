# 🍲 FoodShare – Stop Food Waste, Feed the Hungry

FoodShare is a full-stack web application that connects food donors with people in need.  
The platform allows users to donate excess food, browse available donations, and help reduce food waste in their community.

This project was built to solve two real-world problems:
- Food wastage  
- Lack of structured food redistribution systems  

---

## 🌍 Live Demo

**Frontend (Vercel):**  
https://foodshare.vercel.app  

**Backend API (Render):**  
https://foodshare-backend-nvio.onrender.com  

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- JSX
- Axios
- CSS
- JWT token handling
- Environment variables (`VITE_API_URL`)

### Backend
- Flask
- Flask-JWT-Extended (Authentication)
- Flask-SQLAlchemy
- Flask-Mail
- RESTful APIs
- PostgreSQL
- Gunicorn (Production server)

### Deployment
- Frontend deployed on **Vercel**
- Backend deployed on **Render**
- Environment variables configured securely

---

## ✨ Key Features

- User Registration & Login
- JWT-based Authentication
- Protected API Routes
- Create Food Donation Posts
- View Available Donations
- Secure Backend Integration
- Production-ready deployment setup

---

## 🔐 Authentication Flow

1. User registers or logs in.
2. Backend generates a JWT token.
3. Token is stored on the client side.
4. Protected routes require a valid token.
5. Unauthorized requests are blocked.

---
## 🚀 Running the Project Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
flask run/ python app.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
