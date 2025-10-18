# 📊 Student Analytics Dashboard

A comprehensive analytics dashboard for student enrollment, revenue intelligence, and renewal analytics with real-time Google Sheets integration.

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![React](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-5.0.0-purple) ![Node.js](https://img.shields.io/badge/Node.js-Backend-green)

## 🚀 Live Demo

**Frontend:** [Your Deployed URL]  
**Backend API:** [Your API URL]

## ✨ Features

### 📈 **Enrollment Overview**
- Real-time KPI cards (Total Enrollments, Active Students, Completion Rate)
- Interactive enrollment trend charts
- Course category distribution
- Advanced filtering and search
- Student progress tracking

### 💰 **Revenue Intelligence**
- Revenue metrics and forecasting
- Payment status monitoring
- LTV (Lifetime Value) ranking
- Financial performance analytics

### 🔄 **Renewal Analytics**
- Customer retention metrics
- Renewal trend analysis
- Priority renewal identification
- Churn prediction insights

### 🔗 **Google Sheets Integration**
- Real-time data sync from Google Sheets
- Automatic CSV parsing and processing
- Manual sync capabilities
- 164+ student records processed

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Google Sheets API** - Data integration
- **CORS** - Cross-origin resource sharing
- **CSV Parser** - Data processing

### **Deployment**
- **Vercel** - Full-stack deployment platform
- **Netlify** - Frontend hosting (alternative)
- **GitHub Actions** - CI/CD pipeline

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ 
- npm or yarn
- Git

### **Installation**

1. **Clone the repository:**
```bash
git clone https://github.com/YOUR_USERNAME/student-analytics-dashboard.git
cd student-analytics-dashboard
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Copy environment template
cp .env.example .env

# Add your Google Sheets configuration
VITE_API_BASE_URL=http://localhost:8001
VITE_GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
VITE_ENROLLMENT_CSV_URL=your_csv_export_url
```

4. **Start the development servers:**

**Backend:**
```bash
npm run dev:server
```

**Frontend:**
```bash
npm start
```

5. **Open your browser:**
- Frontend: `http://localhost:4028`
- Backend API: `http://localhost:8001`

## 📊 Google Sheets Setup

1. **Create a Google Sheet** with student enrollment data
2. **Make it publicly viewable** (View permissions)
3. **Get the spreadsheet ID** from the URL
4. **Get the CSV export URL** for your specific sheet
5. **Update environment variables**

### **Expected Data Format:**
| Student Name | Email | Course | Category | Status | Progress | Payment Status |
|--------------|-------|--------|----------|--------|----------|----------------|
| John Doe | john@email.com | React Dev | Programming | Active | 75 | Paid |

## 🚀 Deployment

### **Option 1: Vercel (Recommended)**
```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

### **Option 2: Netlify**
```bash
# Build the project
npm run build

# Deploy build folder to Netlify
# Drag & drop the 'build' folder to netlify.com
```

### **Environment Variables for Production:**
```
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
ENROLLMENT_CSV_URL=your_csv_export_url
NODE_ENV=production
```

## 📁 Project Structure

```
student-analytics-dashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── enrollment-overview/
│   │   ├── revenue-intelligence/
│   │   ├── renewal-analytics/
│   │   └── google-sheets-data/
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # CSS and Tailwind styles
│   └── utils/              # Utility functions
├── public/                 # Static assets
├── server.js              # Production backend server
├── test-server.js         # Development backend server
└── vercel.json            # Vercel deployment config
```

## 🔧 Available Scripts

```bash
npm start          # Start frontend development server
npm run build      # Build for production
npm run serve      # Preview production build
npm run server     # Start production backend
npm run dev:server # Start development backend
```

## 🌟 Key Features Implemented

- ✅ **Real-time Google Sheets integration**
- ✅ **Responsive design** (mobile-friendly)
- ✅ **Advanced filtering and search**
- ✅ **Interactive data visualizations**
- ✅ **Loading states and error handling**
- ✅ **Professional UI/UX design**
- ✅ **Full-stack architecture**
- ✅ **Production-ready deployment**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Sheets API** for data integration
- **Recharts** for beautiful data visualizations
- **Tailwind CSS** for rapid UI development
- **Vercel** for seamless deployment

## 📞 Contact

**Developer:** Your Name  
**Email:** your.email@example.com  
**LinkedIn:** [Your LinkedIn Profile]  
**Portfolio:** [Your Portfolio URL]

---

⭐ **Star this repository** if you found it helpful!

🐛 **Found a bug?** [Open an issue](https://github.com/YOUR_USERNAME/student-analytics-dashboard/issues)

💡 **Have a feature request?** [Start a discussion](https://github.com/YOUR_USERNAME/student-analytics-dashboard/discussions)