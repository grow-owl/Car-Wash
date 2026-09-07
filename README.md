# Auto Spa & Detailing Enterprise Management System

A production-ready full-stack enterprise web application designed for car wash centers, auto spas, and detailing studios. Built with **Node.js, Express, MongoDB Atlas, Cloudinary CDN, Vite, React, and Vanilla CSS Design System**.

---

## Architectural Overview

```
car-wash/
├── client/                     # Vite + React Modern Frontend
│   ├── public/                 # Static assets, Web Manifest, PWA icons
│   ├── src/
│   │   ├── components/         # Modular UI (Navbar, Modals, Sliders, Sidebar)
│   │   ├── pages/              # Core pages (Home, BookingFlow, AdminDashboard, CustomerPortal, TrackBooking)
│   │   ├── utils/              # Clean text sanitizers, currency formatters
│   │   ├── api.js              # Centralized Axios API client with interceptors
│   │   ├── theme.css           # Global design system & token definitions
│   │   └── App.jsx             # Hash-based native mobile routing
│   └── vite.config.js          # Fast bundler & Rollup optimization
│
├── server/                     # Node.js + Express REST API Backend
│   ├── middleware/             # JWT & Session Admin Authentication guards
│   ├── models/                 # Mongoose schemas (Services, Bookings, Customers, Leads, etc.)
│   ├── routes/                 # REST controllers (Bookings, CRM, Services, Analytics, Marketing)
│   ├── seed.js                 # Positive net profit & catalog database seeder
│   ├── db.js                   # MongoDB Atlas connection manager
│   └── index.js                # Express app entry with CORS & rate-limiting
│
├── .gitignore                  # Security rules preventing leak of secrets & builds
└── README.md                   # System documentation
```

---

## Key Features & Business Capabilities

### 1. Dynamic Catalog & Cloudinary CDN Integration
- **Owner Controlled Catalog:** Services and packages are dynamically synchronized with MongoDB Atlas. Changes made in the Admin Dashboard immediately reflect across the customer landing page and booking wizards.
- **High-Speed CDN Delivery:** All media and photos are delivered via Cloudinary CDN, featuring automated format optimization (WebP/AVIF) and responsive compression.
- **PC Photo Upload:** Studio owners can upload vehicle & service photos straight from desktop or mobile camera to Cloudinary with automatic resizing.

### 2. 3-Step Instant Booking Flow
- **Step 1: Service Selection:** Pick custom standalone service combinations or pre-made detailing packages.
- **Step 2: Vehicle Sizing:** Select Hatchback, Sedan, SUV, Luxury, or Off-road truck.
- **Step 3: Bay Slot & Instant Confirmation:** Choose wash date, open bay slot, fill customer contact and vehicle registration, and confirm appointment with ₹0 upfront payment (`Pay After Service` mode).
- **Digital Bay Ticket & Invoice:** Instant generation of printable digital receipt with unique tracking ID (`CW-XXXX`).

### 3. Live Wash Bay Tracker
- Real-time 6-stage vehicle progress tracking (`Booked` → `Arrived` → `Washing` → `Drying & Polish` → `Ready for Delivery` → `Completed`).
- Direct tracking code lookup with bay technician details and WhatsApp status updates.

### 4. Enterprise Admin Dashboard
- **Financial Analytics:** Live metrics for Total Revenue, Operational Expenses, Net Positive Profit, Bay Utilization, and Average Order Value (AOV).
- **Service Management:** Full CRUD operations for service catalog, pricing multipliers, duration, and Cloudinary photo presets.
- **CRM & Customer Database:** Search customers by phone or vehicle number, track wash history, lifetime spend, and custom notes.
- **Staff & Payroll Management:** Technician attendance, designated bay assignments, and commission tracking.
- **Lead Recovery Engine:** Automated capture of abandoned booking drafts and quote enquiries for targeted WhatsApp remarketing.

---

## Environment Setup

### 1. Server Configuration (`server/.env`)
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/carwash?retryWrites=true&w=majority
OWNER_DASHBOARD_URL=http://localhost:5173/#admin-login-x97k
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret_key
ADMIN_DEFAULT_USER=admin
ADMIN_DEFAULT_PASS=Admin@Password123
ADMIN_SECRET_SLUG=admin-login-x97k
```

### 2. Client Configuration (`client/.env`)
Create `client/.env` based on `client/.env.example`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ADMIN_SECRET_PATH=#admin-login-x97k
```

---

## Running Locally

### 1. Backend Server
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser to view the customer interface, or visit **`http://localhost:5173/#admin-login-x97k`** to access the Owner Portal.

---

## Production Build & Verification

```bash
cd client
npm run build
```

---

## Production Deployment
- **Frontend:** Deploy `client/` to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
- **Backend:** Deploy `server/` to [Render](https://render.com), [Railway](https://railway.app), or [AWS EC2](https://aws.amazon.com).
