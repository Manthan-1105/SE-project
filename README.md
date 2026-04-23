# 💸 SpendSmart — MERN Expense Tracker

A full-featured, beautifully designed expense tracker built with the MERN stack (MongoDB, Express, React, Node.js).

---

## ✨ Features

- 🔐 **Authentication** — Secure JWT-based register/login/logout
- 💳 **Expense Tracking** — Add, edit, delete expenses with rich details
- 🗂 **11 Categories** — Food, Travel, Clothes, Bills, Entertainment, Health, Education, Shopping, Housing, Personal, Other
- 💳 **Payment Methods** — Cash, Card, UPI, Net Banking
- 📊 **Dashboard** — Live stats, charts, recent transactions, budget tracking
- 📅 **Monthly Reports** — Daily spending charts, category breakdowns, all transactions
- 📆 **Yearly Reports** — Month-by-month view and category analysis
- 💡 **Smart Suggestions** — AI-style insights based on your spending patterns
- 🎯 **Budget Management** — Set monthly budget, track usage with visual indicator
- 🔍 **Search & Filter** — Filter by category, date range, keyword
- 📄 **Pagination** — Efficient large-dataset browsing
- 🌙 **Dark UI** — Beautiful dark theme with purple accent
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6, Recharts |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB, Mongoose                 |
| Auth       | JWT, bcryptjs                     |
| Styling    | Custom CSS with CSS Variables     |
| Toasts     | react-hot-toast                   |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** running locally (or a MongoDB Atlas URI)
- **npm** or **yarn**

### 1. Clone / Extract the project

```bash
cd expense-tracker
```

### 2. Install all dependencies

```bash
npm run install-all
```

This installs root, backend, and frontend dependencies.

### 3. Configure environment

The backend `.env` file is pre-configured for local development:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=spendsmart_super_secret_jwt_key_2024_change_this
JWT_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

> ⚠️ **For production**, change `JWT_SECRET` to a long random string and update `MONGO_URI` to your Atlas URI.

### 4. Start the application

```bash
npm start
```

This starts both backend (port 5000) and frontend (port 3000) concurrently.

Or run them separately:

```bash
# Backend only
npm run server

# Frontend only
npm run client
```

### 5. Open in browser

```
http://localhost:3000
```

---

## 📁 Project Structure

```
expense-tracker/
├── package.json              # Root scripts with concurrently
│
├── backend/
│   ├── server.js             # Express app entry point
│   ├── .env                  # Environment variables
│   ├── config/
│   │   └── db.js             # MongoDB connection
│   ├── models/
│   │   ├── User.js           # User schema
│   │   └── Expense.js        # Expense schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── expenseController.js
│   │   └── dashboardController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── expenses.js
│   │   └── dashboard.js
│   └── middleware/
│       └── auth.js           # JWT protect middleware
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            # Routes & providers
        ├── index.js
        ├── index.css         # Global CSS variables & resets
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   ├── api.js        # Axios instance
        │   └── constants.js  # Categories, currencies, helpers
        ├── components/
        │   └── layout/
        │       ├── Layout.js / .css
        │       ├── Sidebar.js / .css
        │       ├── Header.js / .css
        │       └── LoadingScreen.js / .css
        └── pages/
            ├── Login.js / Auth.css
            ├── Register.js
            ├── Dashboard.js / .css
            ├── Expenses.js / .css
            ├── AddExpense.js / .css
            ├── MonthlyReport.js / .css
            ├── Suggestions.js / .css
            └── Profile.js / .css
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint                   | Description         |
|--------|----------------------------|---------------------|
| POST   | /api/auth/register         | Register new user   |
| POST   | /api/auth/login            | Login user          |
| GET    | /api/auth/me               | Get current user    |
| PUT    | /api/auth/update           | Update profile      |
| PUT    | /api/auth/change-password  | Change password     |

### Expenses
| Method | Endpoint                              | Description           |
|--------|---------------------------------------|-----------------------|
| GET    | /api/expenses                         | Get all (with filters)|
| POST   | /api/expenses                         | Create expense        |
| GET    | /api/expenses/:id                     | Get single expense    |
| PUT    | /api/expenses/:id                     | Update expense        |
| DELETE | /api/expenses/:id                     | Delete expense        |
| GET    | /api/expenses/summary/monthly/:y/:m   | Monthly summary       |
| GET    | /api/expenses/summary/yearly/:y       | Yearly summary        |

### Dashboard
| Method | Endpoint                    | Description        |
|--------|-----------------------------|--------------------|
| GET    | /api/dashboard/stats        | Dashboard stats    |
| GET    | /api/dashboard/suggestions  | Smart suggestions  |

---

## 🎨 Design System

The app uses a dark theme with CSS custom properties:

- **Background**: `#0a0a14` primary, `#111120` secondary
- **Cards**: `#16162a`
- **Accent**: `#7c5cfc` (purple)
- **Success**: `#22d3a5`
- **Danger**: `#f43f5e`
- **Fonts**: Syne (display), DM Sans (body)

---

## 🌐 Deploying to Production

### MongoDB Atlas
1. Create a free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Get your connection string and replace `MONGO_URI` in `.env`

### Backend (Render / Railway)
1. Set environment variables
2. Set build command: `npm install`
3. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Build: `npm run build` in `/frontend`
2. Set `REACT_APP_API_URL` if backend is on a different domain
3. Update `proxy` in `frontend/package.json`

---

## 📝 License

MIT — free to use and modify.
