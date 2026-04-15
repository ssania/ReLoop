# ReLoop

ReLoop UMass is a full-stack web application designed to support students at the University of Massachusetts Amherst and the broader Five College community. Students frequently move between apartments due to semester transitions, internships, study abroad programs, and graduation. As a result, they often need to buy or sell furniture, textbooks, electronics, and other everyday items quickly and affordably. Additionally, students searching for housing often struggle to find centralized, reliable, and student-relevant housing information.

Currently, students rely on general platforms such as Facebook Marketplace and Craigslist, which are not specifically designed for student communities and lack verification mechanisms. ReLoop UMass addresses this issue by providing a platform where marketplace access requires login through verified @umass.edu email accounts, ensuring a secure student-only environment.

## System Services

The system combines two primary services:

### Public Housing Information Hub
Allows anyone to explore housing information around campus.

### Verified Student Marketplace
Allows only verified university users to buy and sell items within the community.

## Goal of the Platform

The platform aims to improve affordability, sustainability, and convenience by enabling students to reuse items and easily access housing information within the Five College ecosystem.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ssania/ReLoop.git
cd ReLoop
```

### 2. Start the backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:5002`.

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> The app runs on mock data by default — no database or external credentials needed.

---

## Project Structure

```
ReLoop/
├── backend/
│   ├── config/         # S3 upload configuration
│   ├── controllers/    # Route handler logic
│   ├── models/         # Mongoose schemas + mock data wrappers
│   ├── routes/         # Express route definitions
│   ├── mockData.js     # In-memory seed data (used while DB is not connected)
│   └── server.js       # Express app entry point
└── frontend/
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── context/    # React Context (global state)
    │   └── pages/      # Page-level components
    └── index.html
```