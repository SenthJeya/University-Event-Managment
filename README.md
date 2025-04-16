# University Event Management System

A web application designed to streamline event management in a university setting. This system allows lecturers and students to propose events, which must be approved sequentially by the Head of Department (HOD), the Dean, and finally, the Vice Chancellor (VC). 

## Features

- **Role-Based User Management**: 
  - Admin creates user accounts for roles: Dean, Head Of Department, Vice Chancellor, Academic Staff, and Students.
- **Event Approval Workflow**:
  - Multi-level approval process: Head Of Department → Dean → Vice Chancellor.
- **Faculty and Department Organization**:
  - Faculties and departments are managed within the system, each having unique Head Of Departments and Deans.
- **Secure Authentication**:
  - User authentication using JWT.
- **Modern UI**:
  - Built with React and styled for user-friendly interaction.
  
## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB installed locally or a MongoDB Atlas account
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SenthJeya/University-Event-Managment
   cd university-event-management

2. Install dependencies:
	npm install

3. Set up the .env file: Create a .env file in the root directory and configure the following variables:
	
	MONGO_URI=your-mongodb-uri
	JWT_SECRET=your-secret-key
	PORT=5000
	
4. Start the development server:

	npm run dev

5. Access the application at http://localhost:5000.

Project Structure
	
📦university-event-management
 ┣ 📂backend
 ┃ ┣ 📂models
 ┃ ┣ 📂routes
 ┃ ┣ 📂controllers
 ┃ ┣ server.js
 ┣ 📂frontend
 ┃ ┣ 📂components
 ┃ ┣ 📂pages
 ┃ ┣ App.jsx
 ┣ .env
 ┣ package.json
 ┗ README.md
 
 
