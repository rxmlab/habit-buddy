# HabitBuddy Backend Integration Guide

## 🎯 Overview
This guide will help you integrate the FastAPI backend with your Angular frontend and deploy everything to Firebase using their free tier.

## 📋 What We've Built

### Backend (FastAPI)
- ✅ Complete REST API for habit management
- ✅ Firebase Authentication integration
- ✅ PostgreSQL/SQLite database support
- ✅ Habit CRUD operations
- ✅ Check-in tracking
- ✅ Reminder management
- ✅ Statistics and analytics
- ✅ Badge system
- ✅ Firebase Functions deployment ready

### Frontend Integration
- ✅ API service for backend communication
- ✅ Authentication service with Firebase
- ✅ Updated HabitService with API integration
- ✅ Auth component for user login/signup
- ✅ Fallback to localStorage when offline

## 🚀 Deployment Options

### Option 1: Firebase Free Tier (Recommended)
**Perfect for MVP and small-scale applications**

**Pros:**
- Completely free
- Easy deployment
- Automatic scaling
- Built-in authentication
- CDN hosting

**Limitations:**
- Firebase Functions: 125K invocations/month
- Firebase Hosting: 10GB bandwidth/month
- No PostgreSQL (use SQLite or Firebase Firestore)

**Setup:**
```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Initialize Firebase project
firebase init

# 4. Deploy
firebase deploy
```

### Option 2: Firebase + External Database
**For production applications needing PostgreSQL**

**Setup:**
1. Use Firebase Functions for API
2. Use external PostgreSQL service (Supabase, Railway, etc.)
3. Configure `DATABASE_URL` in Firebase Functions

### Option 3: Vercel/Netlify + External Backend
**Alternative deployment strategy**

## 🔧 Configuration Steps

### 1. Firebase Project Setup
```bash
# Create Firebase project
firebase projects:create habit-buddy-your-project

# Set project
firebase use habit-buddy-your-project

# Enable required services
firebase init hosting
firebase init functions
```

### 2. Environment Configuration

**For Local Development:**
```bash
# Copy environment template
cp backend/env.example backend/.env

# Edit .env file
DATABASE_URL=sqlite:///./habitbuddy.db
DEBUG=True
```

**For Production (Firebase Functions):**
```bash
# Set environment variables
firebase functions:config:set database.url="your_postgresql_url"
firebase functions:config:set app.debug="false"
```

### 3. Database Setup

**Option A: SQLite (Free Tier)**
- No additional setup required
- Data stored in Firebase Functions
- Good for development and small apps

**Option B: PostgreSQL (Production)**
- Use Supabase (free tier: 500MB)
- Use Railway (free tier: 1GB)
- Use Neon (free tier: 3GB)

### 4. Angular Configuration

**Update API Base URL:**
```typescript
// In api.service.ts
private getApiBaseUrl(): string {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000'; // Local development
  } else {
    return 'https://us-central1-your-project-id.cloudfunctions.net/api';
  }
}
```

## 📱 Frontend Integration

### 1. Add Authentication Route
```typescript
// In app.routes.ts
{
  path: 'auth',
  loadComponent: () => import('./components/auth.component').then(m => m.AuthComponent)
}
```

### 2. Update App Component
```typescript
// Add authentication guard
import { AuthService } from './shared/services/auth.service';

@Component({
  // ... existing code
})
export class AppComponent {
  constructor(private authService: AuthService) {
    // Check authentication state
    this.authService.authUser$.subscribe(user => {
      if (!user && !this.isAuthRoute()) {
        this.router.navigate(['/auth']);
      }
    });
  }
}
```

### 3. Update HabitService Usage
```typescript
// Replace existing HabitService with HabitApiService
import { HabitApiService } from './shared/services/habit-api.service';

// In your components
constructor(private habitService: HabitApiService) {}
```

## 🔐 Authentication Flow

### 1. User Registration/Login
- Users sign up with email/password or Google
- Firebase generates ID token
- Token sent to backend for verification
- Backend creates/updates user record

### 2. API Requests
- All API requests include Firebase ID token
- Backend verifies token with Firebase Admin SDK
- User-specific data returned

### 3. Offline Support
- App falls back to localStorage when offline
- Data syncs when connection restored
- Seamless user experience

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,  -- Firebase UID
    email VARCHAR UNIQUE,
    display_name VARCHAR,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Habits Table
```sql
CREATE TABLE habits (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR REFERENCES users(id),
    title VARCHAR NOT NULL,
    days_target INTEGER NOT NULL,
    category_id VARCHAR,
    color VARCHAR NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Check-ins Table
```sql
CREATE TABLE check_ins (
    id VARCHAR PRIMARY KEY,
    habit_id VARCHAR REFERENCES habits(id),
    check_in_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP
);
```

### Reminders Table
```sql
CREATE TABLE reminders (
    id VARCHAR PRIMARY KEY,
    habit_id VARCHAR REFERENCES habits(id),
    time VARCHAR NOT NULL,  -- HH:MM format
    days JSON NOT NULL,     -- Array of day numbers
    window INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
pip install pytest pytest-asyncio
pytest
```

### Frontend Testing
```bash
npm run test
```

### API Testing
```bash
# Test health endpoint
curl https://your-api-url/health

# Test authentication
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
     https://your-api-url/api/habits
```

## 📊 Monitoring and Analytics

### Firebase Analytics
- Built-in user analytics
- Custom events tracking
- Conversion funnels

### Error Monitoring
- Firebase Crashlytics
- Sentry integration
- Custom error logging

## 🚀 Production Checklist

### Backend
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] API endpoints tested
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] CORS properly set

### Frontend
- [ ] API integration tested
- [ ] Authentication flow working
- [ ] Offline fallback tested
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design verified

### Deployment
- [ ] Firebase project configured
- [ ] Functions deployed
- [ ] Hosting deployed
- [ ] Custom domain set (optional)
- [ ] SSL certificate active
- [ ] Performance monitoring enabled

## 🔧 Troubleshooting

### Common Issues

**1. CORS Errors**
```typescript
// Ensure CORS origins are correct in backend
allow_origins=[
  "http://localhost:4200",
  "https://habit-buddy.web.app",
  "https://habit-buddy.firebaseapp.com"
]
```

**2. Authentication Errors**
```typescript
// Check Firebase configuration
// Ensure Firebase Admin SDK is properly initialized
// Verify ID token format
```

**3. Database Connection Issues**
```bash
# Check DATABASE_URL format
# Verify database credentials
# Test connection locally first
```

**4. Deployment Failures**
```bash
# Check Firebase CLI version
# Verify project permissions
# Check function logs: firebase functions:log
```

## 📈 Scaling Considerations

### Free Tier Limits
- Firebase Functions: 125K invocations/month
- Firebase Hosting: 10GB bandwidth/month
- Firebase Auth: Unlimited users
- Firebase Firestore: 1GB storage, 50K reads/day

### Upgrade Path
1. **Spark Plan (Free)** → **Blaze Plan (Pay-as-you-go)**
2. Add PostgreSQL database
3. Implement caching (Redis)
4. Add CDN for static assets
5. Implement rate limiting
6. Add monitoring and alerting

## 🎉 Success Metrics

### Technical Metrics
- API response time < 200ms
- 99.9% uptime
- < 1% error rate
- User authentication success rate > 95%

### Business Metrics
- User registration rate
- Daily active users
- Habit completion rate
- User retention rate

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Angular Documentation](https://angular.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase Functions logs
3. Test API endpoints individually
4. Verify environment configuration

---

**Congratulations!** 🎉 You now have a complete habit tracking application with a robust backend API, user authentication, and Firebase deployment ready for production use!
