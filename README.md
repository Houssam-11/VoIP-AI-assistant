# VAPI AI Voice Assistant for Candidate Interviews

This project is a full-stack AI voice assistant application built to streamline and automate the interview process for candidate screening. It uses **Flask** and **PostgreSQL** on the backend, **React with Vite** on the frontend, and integrates the **Vapi.ai** platform for real-time voice-based conversations.

## 🧠 What Problem Does It Solve?

Traditional interviews are time-consuming and resource-intensive. This assistant simplifies the screening process by:
- Conducting AI-powered interviews in real-time.
- Automatically summarizing key points from conversations.
- Allowing admins to review and manage candidate responses from a dashboard.

## ⚙️ Technologies Used

- **Frontend:** React (Vite), CSS, Vapi Web SDK  
- **Backend:** python, Flask, SQLAlchemy, JWT, PostgreSQL  
- **AI Integration:** Vapi.ai platform

## 🚀 Features

- User registration and login system (JWT)  
- Admin access (predefined)  
- Voice interview via AI agent (Vapi)  
- Summary display post-interview  
- Interview history (WIP)  
- Admin dashboard to manage users (WIP)
- Dataset download for all registered users with their interview summary
- Admin decision for each candidate (accept/deny/postpone)

## 📁 Project Structure

```
├── backend            # Flask backend API
├── frontend           # React frontend application
├── structure.txt      # Project overview and notes
└── README.md
```

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Houssam-11/VoIP-AI-assistant.git
cd VAPI-AI-Voice-Assistant
```

### 2. Backend Setup

```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\\Scripts\\activate
pip install -r requirements.txt  # or install manually: flask, flask_sqlalchemy, flask_jwt_extended, psycopg2-binary
```
add .env file where you store Secret_keys to connect with vapi private api, configure postgres credentials, and add JWT_secret_key : 
```bash
VAPI_API_KEY="VAPI_PRIVATE_API_KEY"
JWT_KEY="YOUR_JWT_KEY" # you can get one by running : "openssl rand -base64 32" in your terminal 
DATABASE_URI="postgresql://name:password@localhost:5432/db_name"
```

then start the backend server:

```bash
python main.py
```

### 3. Frontend Setup
create another .env in your frontend folder : 
```bash
VITE_VAPI_API_KEY="VAPI_PUBLIC_API_KEY"
VITE_ASSISTANT_ID="YOUR_ASSISTANT_ID"
```

in another terminal run : 
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## 🔑 Vapi Platform Setup

1. Create an account at [https://vapi.ai](https://vapi.ai)  
2. Get your API key from the dashboard  
3. Update `.env` in your frontend project with your Vapi credentials

## ✅ Usage

- Register as a user and log in  with your credentials
- Start a voice interview with the AI assistant  
- After the call, view a summary of the conversation  
- Admins can access a dashboard (WIP) to view user data
- Admins can make decision to accept/deny or postpone a candidate application
- Admins can download a dataset of all registered candidates and their call summary

## 🤝 Contributing

Feel free to fork this repo and submit pull requests. Suggestions and improvements are welcome!

## 🙏🏼 Acknowledgement 
This Project was developed in Orange Digital Center Rabat, Maroc, thanks to all members who contributed in this project!
