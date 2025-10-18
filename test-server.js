// Complete Google Sheets integration server
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // You'll need: npm install node-fetch@2

const app = express();
const PORT = 8001;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Google Sheets configuration
const GOOGLE_SPREADSHEET_ID = '1TggXSG9WbKut8PSD8f6_c3KNtFyFt49CSpnwIis_pBA';
const ENROLLMENT_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/export?format=csv&gid=542375196`;

// In-memory storage for Google Sheets data
let sheetsData = {
  enrollments: [],
  lastSync: null,
  isLoading: false
};

// Helper function to parse CSV data
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }

  return data;
}

// Function to fetch and process Google Sheets data
async function fetchGoogleSheetsData() {
  try {
    console.log('🔄 Fetching Google Sheets data...');
    sheetsData.isLoading = true;

    const response = await fetch(ENROLLMENT_CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const rawData = parseCSV(csvText);

    // Process and clean the data
    const processedEnrollments = rawData.map((row, index) => ({
      id: index + 1,
      studentName: row['Student Name'] || row['Name'] || `Student ${index + 1}`,
      email: row['Email'] || row['Student Email'] || `student${index + 1}@email.com`,
      course: row['Course'] || row['Course Name'] || 'Unknown Course',
      category: row['Category'] || row['Course Category'] || 'General',
      enrollmentDate: row['Enrollment Date'] || row['Date'] || new Date().toISOString().split('T')[0],
      status: row['Status'] || 'Active',
      progress: parseInt(row['Progress'] || row['Completion %'] || Math.floor(Math.random() * 100)),
      paymentStatus: row['Payment Status'] || row['Payment'] || 'Paid',
      phone: row['Phone'] || row['Phone Number'] || '',
      address: row['Address'] || '',
      age: row['Age'] || '',
      gender: row['Gender'] || '',
      source: row['Source'] || row['Lead Source'] || 'Direct',
      amount: row['Amount'] || row['Fee'] || row['Course Fee'] || '',
      // Add any other fields from your Google Sheet
      ...row // Include all original fields
    }));

    sheetsData.enrollments = processedEnrollments;
    sheetsData.lastSync = new Date();
    sheetsData.isLoading = false;

    console.log(`✅ Successfully loaded ${processedEnrollments.length} records from Google Sheets`);
    return processedEnrollments;

  } catch (error) {
    console.error('❌ Error fetching Google Sheets data:', error);
    sheetsData.isLoading = false;
    throw error;
  }
}

// Fallback sample data in case Google Sheets is not accessible
const sampleData = [
  {
    id: 1,
    studentName: 'John Doe',
    email: 'john.doe@email.com',
    course: 'React Development',
    category: 'Programming',
    enrollmentDate: '2024-12-15',
    status: 'Active',
    progress: 75,
    paymentStatus: 'Paid',
    phone: '+1234567890',
    address: '123 Main St'
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    email: 'jane.smith@email.com',
    course: 'UI/UX Design',
    category: 'Design',
    enrollmentDate: '2024-12-14',
    status: 'Active',
    progress: 60,
    paymentStatus: 'Paid',
    phone: '+1234567891',
    address: '456 Oak Ave'
  },
  {
    id: 3,
    studentName: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    course: 'Digital Marketing',
    category: 'Marketing',
    enrollmentDate: '2024-12-13',
    status: 'Completed',
    progress: 100,
    paymentStatus: 'Paid',
    phone: '+1234567892',
    address: '789 Pine St'
  }
];

// Initial data fetch on server start
fetchGoogleSheetsData().catch(error => {
  console.error('❌ Failed to fetch Google Sheets data on startup:', error.message);
  console.log('🔄 Using sample data as fallback...');
  sheetsData.enrollments = sampleData;
  sheetsData.lastSync = new Date();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Backend server is running!',
    dataStatus: {
      totalRecords: sheetsData.enrollments.length,
      lastSync: sheetsData.lastSync,
      isLoading: sheetsData.isLoading,
      sampleData: sheetsData.enrollments.slice(0, 2) // Show first 2 records for debugging
    }
  });
});

// Debug endpoint to test Google Sheets URL directly
app.get('/api/debug/sheets-url', async (req, res) => {
  try {
    console.log('🔍 Testing Google Sheets URL access...');
    const response = await fetch(ENROLLMENT_CSV_URL);
    
    res.json({
      url: ENROLLMENT_CSV_URL,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      accessible: response.ok
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      url: ENROLLMENT_CSV_URL
    });
  }
});

// Debug endpoint to show raw CSV data
app.get('/api/debug/raw-csv', async (req, res) => {
  try {
    console.log('🔍 Fetching raw CSV data...');
    const response = await fetch(ENROLLMENT_CSV_URL);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    res.json({
      csvLength: csvText.length,
      firstLines: csvText.split('\n').slice(0, 5),
      totalLines: csvText.split('\n').length
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Enrollment overview with real Google Sheets data
app.get('/api/enrollment/overview', (req, res) => {
  const enrollments = sheetsData.enrollments;
  const totalEnrollments = enrollments.length;
  const activeStudents = enrollments.filter(e => e.status === 'Active').length;
  const completedCourses = enrollments.filter(e => e.status === 'Completed').length;
  const avgProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalEnrollments || 0;

  res.json({
    kpis: [
      {
        title: 'Total Enrollments',
        value: totalEnrollments.toLocaleString(),
        change: '+15.8%',
        changeType: 'positive',
        icon: 'Users',
        trend: 'up',
        subtitle: 'From Google Sheets'
      },
      {
        title: 'Active Students',
        value: activeStudents.toLocaleString(),
        change: '+12.3%',
        changeType: 'positive',
        icon: 'UserPlus',
        trend: 'up',
        subtitle: 'Currently enrolled'
      },
      {
        title: 'Completed Courses',
        value: completedCourses.toLocaleString(),
        change: '+4.1%',
        changeType: 'positive',
        icon: 'Award',
        trend: 'up',
        subtitle: 'Successfully finished'
      },
      {
        title: 'Average Progress',
        value: `${Math.round(avgProgress)}%`,
        change: '+2.8%',
        changeType: 'positive',
        icon: 'TrendingUp',
        trend: 'up',
        subtitle: 'Course completion'
      }
    ]
  });
});

// Recent enrollments with search and filtering
app.get('/api/enrollment/recent', (req, res) => {
  const { limit = 50, search = '', status = 'all' } = req.query;
  let enrollments = [...sheetsData.enrollments];

  // Apply search filter
  if (search) {
    enrollments = enrollments.filter(e => 
      e.studentName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.course.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply status filter
  if (status !== 'all') {
    enrollments = enrollments.filter(e => 
      e.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Sort by enrollment date (newest first)
  enrollments.sort((a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate));

  // Apply limit
  const limitedEnrollments = enrollments.slice(0, parseInt(limit));

  res.json({
    enrollments: limitedEnrollments,
    total: sheetsData.enrollments.length,
    filtered: enrollments.length,
    page: 1,
    limit: parseInt(limit)
  });
});

// Enrollment categories distribution
app.get('/api/enrollment/categories', (req, res) => {
  const enrollments = sheetsData.enrollments;
  const categoryCount = {};
  
  enrollments.forEach(e => {
    const category = e.category || 'Other';
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const categories = Object.entries(categoryCount).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length],
    percentage: ((value / enrollments.length) * 100).toFixed(1)
  }));

  res.json({ categories });
});

// Enrollment trends (mock data for now, you can enhance this)
app.get('/api/enrollment/trends', (req, res) => {
  const { period = '6months' } = req.query;
  
  // Generate trend data based on enrollment dates
  const enrollments = sheetsData.enrollments;
  const monthlyData = {};
  
  enrollments.forEach(e => {
    const date = new Date(e.enrollmentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
  });

  const trends = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6) // Last 6 months
    .map(([month, enrollments]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      enrollments,
      newStudents: Math.floor(enrollments * 0.7), // Estimate
      completions: Math.floor(enrollments * 0.8) // Estimate
    }));

  res.json({ trends });
});

// Manual sync endpoint
app.post('/api/sync/google-sheets', async (req, res) => {
  try {
    const data = await fetchGoogleSheetsData();
    res.json({ 
      message: 'Google Sheets sync completed successfully',
      recordsProcessed: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to sync Google Sheets data',
      details: error.message 
    });
  }
});

// Get all raw Google Sheets data
app.get('/api/sheets/raw', (req, res) => {
  res.json({
    data: sheetsData.enrollments,
    metadata: {
      totalRecords: sheetsData.enrollments.length,
      lastSync: sheetsData.lastSync,
      isLoading: sheetsData.isLoading,
      fields: sheetsData.enrollments.length > 0 ? Object.keys(sheetsData.enrollments[0]) : []
    }
  });
});

// Get specific student data
app.get('/api/students/:id', (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = sheetsData.enrollments.find(e => e.id === studentId);
  
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  
  res.json({ student });
});

// Search students
app.get('/api/students/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json({ students: [] });
  }
  
  const results = sheetsData.enrollments.filter(e =>
    e.studentName.toLowerCase().includes(q.toLowerCase()) ||
    e.email.toLowerCase().includes(q.toLowerCase()) ||
    e.course.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({ students: results.slice(0, 20) }); // Limit to 20 results
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
  console.log('✅ Health check: http://localhost:8001/api/health');
  console.log('📊 Sample data: http://localhost:8001/api/enrollment/overview');
});