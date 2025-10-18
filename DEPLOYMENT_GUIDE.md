# 🚀 Deployment Guide - Student Analytics Dashboard

## Option 1: Vercel (Recommended - Free & Easy)

### Frontend + Backend Deployment

#### Step 1: Prepare for Deployment

1. **Create a production backend file:**
```bash
# Copy test-server.js to server.js for production
cp test-server.js server.js
```

2. **Update package.json for Vercel:**
```json
{
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "server": "node server.js"
  }
}
```

#### Step 2: Create Vercel Configuration

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Deploy to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel --prod
```

4. **Set Environment Variables in Vercel Dashboard:**
- `MONGODB_URI`: Your MongoDB connection string
- `GOOGLE_SPREADSHEET_ID`: Your Google Sheets ID
- `ENROLLMENT_CSV_URL`: Your CSV export URL

---

## Option 2: Netlify + Railway

### Frontend: Netlify (Free)
### Backend: Railway (Free tier available)

#### Frontend Deployment (Netlify):

1. **Build the React app:**
```bash
npm run build
```

2. **Deploy to Netlify:**
- Go to [netlify.com](https://netlify.com)
- Drag & drop the `dist` folder
- Or connect your GitHub repo

3. **Configure environment variables:**
```
VITE_API_BASE_URL=https://your-backend-url.railway.app
```

#### Backend Deployment (Railway):

1. **Create railway.json:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Deploy to Railway:**
- Go to [railway.app](https://railway.app)
- Connect GitHub repo
- Deploy backend folder

---

## Option 3: Heroku (Full-Stack)

### Single App Deployment

1. **Create Heroku app:**
```bash
heroku create your-app-name
```

2. **Add buildpacks:**
```bash
heroku buildpacks:add heroku/nodejs
```

3. **Configure for full-stack:**

Update `package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "vite build",
    "heroku-postbuild": "npm run build"
  }
}
```

4. **Update server.js for static files:**
```javascript
// Add this to server.js
const path = require('path');

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});
```

5. **Deploy:**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## Option 4: DigitalOcean App Platform

### Full-Stack Deployment

1. **Create `.do/app.yaml`:**
```yaml
name: student-analytics-dashboard
services:
- name: web
  source_dir: /
  github:
    repo: your-username/your-repo
    branch: main
  run_command: node server.js
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  routes:
  - path: /
  build_command: npm run build
  env:
  - key: NODE_ENV
    value: production
  - key: MONGODB_URI
    value: ${MONGODB_URI}
  - key: GOOGLE_SPREADSHEET_ID
    value: ${GOOGLE_SPREADSHEET_ID}
```

---

## Option 5: AWS (Advanced)

### Using AWS Amplify + Lambda

#### Frontend (Amplify):
1. Connect GitHub repo to AWS Amplify
2. Configure build settings
3. Deploy automatically on push

#### Backend (Lambda):
1. Convert server.js to Lambda functions
2. Use API Gateway for routing
3. Deploy with AWS SAM or Serverless Framework

---

## 🔧 Pre-Deployment Checklist

### 1. Update Environment Variables

Create `.env.production`:
```env
VITE_API_BASE_URL=https://your-deployed-backend-url.com
VITE_MONGODB_URI=your-production-mongodb-uri
VITE_GOOGLE_SPREADSHEET_ID=1TggXSG9WbKut8PSD8f6_c3KNtFyFt49CSpnwIis_pBA
VITE_ENROLLMENT_CSV_URL=https://docs.google.com/spreadsheets/d/1TggXSG9WbKut8PSD8f6_c3KNtFyFt49CSpnwIis_pBA/export?format=csv&gid=542375196
```

### 2. Update CORS for Production

In `server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://your-frontend-domain.com',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

### 3. Add Production Optimizations

```javascript
// Add to server.js
if (process.env.NODE_ENV === 'production') {
  // Serve static files
  app.use(express.static('dist'));
  
  // Handle React routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}
```

### 4. Build the React App

```bash
npm run build
```

---

## 🎯 Recommended Deployment Strategy

**For Beginners:** Vercel (handles everything automatically)
**For Flexibility:** Netlify + Railway
**For Enterprise:** AWS or DigitalOcean

### Quick Start with Vercel:

1. Push code to GitHub
2. Connect GitHub to Vercel
3. Add environment variables
4. Deploy automatically

Your app will be live at: `https://your-app.vercel.app`

---

## 🔒 Security Considerations

1. **Environment Variables:** Never commit sensitive data
2. **CORS:** Configure properly for production domains
3. **Rate Limiting:** Add API rate limiting for production
4. **HTTPS:** Ensure all connections use HTTPS
5. **MongoDB:** Use MongoDB Atlas with proper authentication

---

## 📊 Monitoring & Analytics

1. **Vercel Analytics:** Built-in performance monitoring
2. **Google Analytics:** Add tracking to your dashboard
3. **Error Tracking:** Consider Sentry for error monitoring
4. **Uptime Monitoring:** Use UptimeRobot or similar

---

## 🚀 Post-Deployment

1. **Test all functionality:** Ensure Google Sheets sync works
2. **Monitor performance:** Check loading times
3. **Set up alerts:** For downtime or errors
4. **Regular backups:** Of your MongoDB data
5. **Update dependencies:** Keep packages current

Your Student Analytics Dashboard will be live and accessible worldwide! 🌍