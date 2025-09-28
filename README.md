# 🎯 HabitBuddy - PWA Habit Tracker

> **Discipline Through Practice** - A Sanskrit-inspired habit tracking application built with Angular, Firebase, and FastAPI.

## 🌐 Live Application

- **Frontend:** https://abhyatus.web.app
- **Backend API:** https://vercel-backend-48uqipo4b-rams-projects-5a6c8b73.vercel.app
- **API Docs:** https://vercel-backend-48uqipo4b-rams-projects-5a6c8b73.vercel.app/docs

## ✨ Features

### 🔐 Authentication
- **Google Sign-In** - One-click authentication
- **Email/Password** - Traditional signup/signin
- **Route Protection** - All app features require authentication
- **User Isolation** - Each user sees only their own data

### 📱 PWA Capabilities
- **Offline Support** - Works without internet connection
- **Installable** - Add to home screen
- **Real-time Updates** - Live data synchronization
- **Push Notifications** - Habit reminders

### 🎯 Habit Management
- **Create Habits** - Set goals and track progress
- **Check-ins** - Mark daily completions
- **Streak Tracking** - Current and longest streaks
- **Badge System** - Achievements and milestones
- **Reminders** - Custom notification schedules
- **Statistics** - Progress analytics and insights

### 📊 Data & Analytics
- **Real-time Database** - Firestore integration
- **Calendar View** - Visual habit tracking
- **Statistics Dashboard** - Progress overview
- **Export Data** - Backup and migration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI
- Vercel CLI (for backend deployment)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd habit-buddy

# Install dependencies
npm install

# Install Firebase packages
npm install firebase @angular/fire

# Install CLI tools
npm install -g firebase-tools vercel
```

### Firebase Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** → **Google Sign-In**
3. Enable **Firestore Database**
4. Copy Firebase config to `projects/habit-buddy/src/environments/environment.ts`
5. Login to Firebase CLI: `firebase login`
6. Set project: `firebase use your-project-id`

### Local Development
```bash
# Start frontend development server
ng serve

# Start backend API (optional - using Firestore directly)
cd vercel-backend
python main.py
```

### Production Deployment
```bash
# Deploy frontend to Firebase Hosting
npm run build
firebase deploy --only hosting

# Deploy backend to Vercel
cd vercel-backend
vercel --prod
```

## 🏗️ Architecture

### Frontend (Angular + Firebase)
```
Angular PWA
├── FirestoreHabitService (Direct Firestore)
├── AuthService (Firebase Auth)
├── Real-time updates (onSnapshot)
├── Offline support (Service Worker)
└── Route guards (Authentication)
```

### Backend (FastAPI + Vercel)
```
FastAPI REST API
├── Firestore integration
├── Firebase token verification
├── Pydantic validation
└── CRUD operations
```

### Database (Firestore)
```
users/{userId}/habits/{habitId}
├── title: string
├── daysTarget: number
├── color: string
├── createdAt: timestamp
├── checkIns: object
├── reminder: object
└── badge: object
```

## 📁 Project Structure

```
habit-buddy/
├── projects/habit-buddy/          # Angular frontend
│   ├── src/app/
│   │   ├── components/           # UI components
│   │   ├── features/            # Feature modules
│   │   └── shared/              # Shared services & models
│   └── src/environments/        # Environment configs
├── vercel-backend/              # FastAPI backend
│   ├── main.py                 # API endpoints
│   ├── requirements.txt        # Python dependencies
│   └── vercel.json            # Vercel configuration
├── deploy.sh                   # Deployment script
├── firebase.json              # Firebase configuration
└── angular.json               # Angular configuration
```

## 🔧 Technology Stack

### Frontend
- **Angular 17** - Modern web framework
- **Firebase** - Authentication & Database
- **Angular Fire** - Firebase integration
- **Lucide Angular** - Icon library
- **SCSS** - Styling
- **PWA** - Progressive Web App

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Firebase Admin SDK** - Server-side Firebase
- **Vercel** - Serverless deployment

### Database
- **Firestore** - NoSQL document database
- **Real-time** - Live data synchronization
- **Security Rules** - User data isolation

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - Email/password signin
- `POST /api/auth/signup` - Email/password signup
- `POST /api/auth/google` - Google signin

### Habit Management
- `GET /api/habits` - Get user habits
- `POST /api/habits` - Create new habit
- `PUT /api/habits/{id}` - Update habit
- `DELETE /api/habits/{id}` - Delete habit
- `POST /api/habits/{id}/check-in` - Add check-in
- `DELETE /api/habits/{id}/check-in/{date}` - Remove check-in

### Statistics
- `GET /api/habits/stats` - Get habit statistics
- `GET /api/habits/{id}/stats` - Get specific habit stats

## 🛡️ Security Features

- **Firebase Authentication** - Secure user management
- **Firestore Security Rules** - Database access control
- **JWT Token Validation** - API authentication
- **CORS Configuration** - Cross-origin security
- **User Data Isolation** - Private data per user

## 📱 PWA Features

- **Service Worker** - Offline functionality
- **App Manifest** - Installable app
- **Push Notifications** - Habit reminders
- **Background Sync** - Data synchronization
- **Responsive Design** - Mobile-first approach

## 🚀 Deployment

### Frontend (Firebase Hosting)
- **URL:** https://abhyatus.web.app
- **Features:** PWA, Real-time updates, Offline support
- **Authentication:** Google Sign-In
- **Database:** Direct Firestore access

### Backend (Vercel)
- **URL:** https://vercel-backend-48uqipo4b-rams-projects-5a6c8b73.vercel.app
- **Documentation:** Auto-generated API docs
- **Health Check:** `/health` endpoint
- **Database:** Firestore integration

## 🔄 Development Workflow

1. **Local Development** - `ng serve` for frontend
2. **Firebase Emulators** - Test locally
3. **Build & Test** - `npm run build`
4. **Deploy Frontend** - `firebase deploy --only hosting`
5. **Deploy Backend** - `vercel --prod`

## 📖 Additional Documentation

- `FIREBASE_SETUP_COMPLETE.md` - Firebase configuration
- `DEPLOYMENT_SUCCESS.md` - Deployment details
- `API_SCHEMA_ANALYSIS.md` - API structure
- `FIREBASE_BACKEND_COMPLETE.md` - Backend integration

## ⚠️ Important Notes

1. **Authentication Required** - Users must login to access app features
2. **User Data Isolation** - Each user's habits are private
3. **PWA Optimized** - Works offline and installable
4. **Firebase Free Tier** - Optimized for free tier usage
5. **Real-time Updates** - Live data synchronization

## 🎉 Production Ready

Your HabitBuddy application is production-ready with:
- ✅ Secure authentication
- ✅ User data isolation
- ✅ PWA capabilities
- ✅ Real-time database
- ✅ Offline support
- ✅ Production deployment

**Live at:** https://abhyatus.web.app