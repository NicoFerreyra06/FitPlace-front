# FitPlace Frontend

FitPlace is a modern web application designed for tracking fitness progress and managing workouts. This repository contains the frontend, built using React, Vite, and Tailwind CSS.

## 🚀 Features

- **User Authentication:** Secure login and registration flows.
- **Dashboard:** A central hub to view your fitness statistics and daily activities.
- **Progress Tracking:** Visualize your fitness journey over time.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **HTTP Client:** [Axios](https://axios-http.com/)

## 📦 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v16 or higher is recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd fitplace-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App Locally

To start the development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/` (or another port depending on availability).

### Building for Production

To create a production build, run:

```bash
npm run build
```

This will generate an optimized build in the `dist` directory. You can preview the production build locally using:

```bash
npm run preview
```

## 📂 Project Structure

```
fitplace-frontend/
├── public/            # Static assets
├── src/
│   ├── assets/        # Images, fonts, etc.
│   ├── components/    # Reusable UI components
│   ├── context/       # Global state management (e.g., AuthContext)
│   ├── pages/         # Page components (Dashboard, Login, Register)
│   ├── services/      # API calls and external services
│   ├── App.jsx        # Main application routing
│   ├── index.css      # Global styles (Tailwind imports)
│   └── main.jsx       # Entry point
├── index.html         # Main HTML file
├── package.json       # Project metadata and dependencies
├── tailwind.config.js # Tailwind CSS configuration
└── vite.config.js     # Vite configuration
```
