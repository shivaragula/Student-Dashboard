import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import DataSyncIndicator from '../../components/ui/DataSyncIndicator';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import SimpleDataTest from '../../components/SimpleDataTest';
import apiService from '../../services/api';

const GoogleSheetsData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('enrollmentDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [metadata, setMetadata] = useState({});

  // Fetch Google Sheets data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching Google Sheets data from API...');
      
      const response = await apiService.fetchData('/api/sheets/raw');
      console.log('📊 API Response:', response);
      
      const sheetsData = response.data || [];
      const sheetsMetadata = response.metadata || {};
      
      console.log('📊 Sheets Data Length:', sheetsData.length);
      console.log('📊 Sample Data:', sheetsData.slice(0, 2));
      console.log('📊 Metadata:', sheetsMetadata);
      
      setData(sheetsData);
      setMetadata(sheetsMetadata);
      
      if (sheetsData.length === 0) {
        console.warn('⚠️ No data received from Google Sheets API');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ Failed to fetch Google Sheets data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter and sort data
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.course?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      item.status?.toLowerCase() === filterStatus.toLowerCase();
    
    const matchesCategory = filterCategory === 'all' || 
      item.category?.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    let aVal = a[sortBy] || '';
    let bVal = b[sortBy] || '';
    
    // Handle different data types
    if (sortBy === 'enrollmentDate') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else if (sortBy === 'progress') {
      aVal = parseInt(aVal) || 0;
      bVal = parseInt(bVal) || 0;
    }
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Get unique values for filters
  const uniqueStatuses = [...new Set(data.map(item => item.status).filter(Boolean))];
  const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleSync = async () => {
    try {
      await apiService.syncGoogleSheets();
      await fetchData(); // Refresh data after sync
    } catch (err) {
      console.error('Sync failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <TabNavigation />
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <TabNavigation />
      
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary">Google Sheets Data</h1>
              <p className="text-sm text-text-secondary mt-1">
                Complete view of all data from Google Sheets
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <DataSyncIndicator />
              <Button onClick={handleSync} variant="outline" size="sm">
                <Icon name="RefreshCw" size={16} />
                Sync Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Stats */}
      <div className="bg-card border-b border-border px-6 py-3">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <Icon name="Database" size={16} className="text-primary" />
            <span className="text-text-secondary">Total Records:</span>
            <span className="font-semibold text-text-primary">{data.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Filter" size={16} className="text-secondary" />
            <span className="text-text-secondary">Filtered:</span>
            <span className="font-semibold text-text-primary">{filteredData.length}</span>
          </div>
          {metadata.lastSync && (
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} className="text-success" />
              <span className="text-text-secondary">Last Sync:</span>
              <span className="font-semibold text-text-primary">
                {new Date(metadata.lastSync).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-6 bg-card border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
            <Input
              placeholder="Search students, courses, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
          
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
          
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="enrollmentDate-desc">Newest First</option>
            <option value="enrollmentDate-asc">Oldest First</option>
            <option value="studentName-asc">Name A-Z</option>
            <option value="studentName-desc">Name Z-A</option>
            <option value="progress-desc">Progress High-Low</option>
            <option value="progress-asc">Progress Low-High</option>
          </Select>
        </div>
      </div>

      {/* Simple Test Panel */}
      <SimpleDataTest />
      
      {/* Quick Manual Test */}
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span className="font-medium">Quick Manual Test</span>
          </div>
          <p className="text-sm text-text-secondary mb-3">
            If the automatic test above doesn't work, try these manual tests:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('http://localhost:8001/api/health', '_blank')}
            >
              Test Backend Health
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('http://localhost:8001/api/sheets/raw', '_blank')}
            >
              Test Google Sheets Data
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                fetch('http://localhost:8001/api/health')
                  .then(r => r.json())
                  .then(d => alert(`✅ Success! Records: ${d.dataStatus?.totalRecords || 0}`))
                  .catch(e => alert(`❌ Failed: ${e.message}`));
              }}
            >
              Test in Console
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="p-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm cursor-pointer hover:bg-muted" onClick={() => handleSort('studentName')}>
                    <div className="flex items-center space-x-1">
                      <span>Student</span>
                      {sortBy === 'studentName' && (
                        <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Course</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm cursor-pointer hover:bg-muted" onClick={() => handleSort('enrollmentDate')}>
                    <div className="flex items-center space-x-1">
                      <span>Enrolled</span>
                      {sortBy === 'enrollmentDate' && (
                        <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm cursor-pointer hover:bg-muted" onClick={() => handleSort('progress')}>
                    <div className="flex items-center space-x-1">
                      <span>Progress</span>
                      {sortBy === 'progress' && (
                        <Icon name={sortOrder === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                      )}
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Payment</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary text-sm">Contact</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={item.id || index} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-text-primary text-sm">{item.studentName || 'N/A'}</div>
                        <div className="text-xs text-text-secondary">{item.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-primary">{item.course || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-secondary">{item.category || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm text-text-secondary">{item.enrollmentDate || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(item.progress || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-secondary">{item.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Active' ? 'text-success bg-success/10' :
                        item.status === 'Completed' ? 'text-primary bg-primary/10' :
                        'text-text-secondary bg-muted'
                      }`}>
                        {item.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.paymentStatus === 'Paid' ? 'text-success bg-success/10' :
                        item.paymentStatus === 'Pending' ? 'text-warning bg-warning/10' :
                        'text-destructive bg-destructive/10'
                      }`}>
                        {item.paymentStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs text-text-secondary">
                        {item.phone && <div>📞 {item.phone}</div>}
                        {item.address && <div>📍 {item.address}</div>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <div className="text-sm text-text-secondary">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <Icon name="ChevronLeft" size={16} />
                Previous
              </Button>
              <span className="text-sm text-text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <Icon name="ChevronRight" size={16} />
              </Button>
            </div>
          </div>
        </div>

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12">
            <Icon name="Search" size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-medium text-text-primary mb-2">No data found</h3>
            <p className="text-text-secondary mb-4">
              {error ? 'Failed to load data from Google Sheets.' : 'No records match your search criteria.'}
            </p>
            
            {error && (
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-destructive mb-2">Error Details:</p>
                  <code className="text-xs text-destructive bg-destructive/5 p-2 rounded block">
                    {error}
                  </code>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={fetchData} variant="default">
                    <Icon name="RefreshCw" size={16} />
                    Retry Connection
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('http://localhost:8001/api/health', '_blank')} 
                    variant="outline"
                  >
                    <Icon name="ExternalLink" size={16} />
                    Test Backend
                  </Button>
                  
                  <Button 
                    onClick={() => window.open('http://localhost:8001/api/debug/sheets-url', '_blank')} 
                    variant="outline"
                  >
                    <Icon name="FileText" size={16} />
                    Test Google Sheets
                  </Button>
                </div>
                
                <div className="text-xs text-text-secondary max-w-lg mx-auto">
                  <p className="mb-2">Troubleshooting steps:</p>
                  <ol className="text-left space-y-1">
                    <li>1. Make sure backend server is running on port 8001</li>
                    <li>2. Check if Google Sheets URL is accessible</li>
                    <li>3. Verify your internet connection</li>
                    <li>4. Check browser console for errors (F12)</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleSheetsData;