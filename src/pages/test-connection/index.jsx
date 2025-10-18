import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const TestConnection = () => {
  const [status, setStatus] = useState('testing');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const runTest = async () => {
    setStatus('testing');
    setError(null);
    
    try {
      console.log('🔍 Starting connection test...');
      
      // Test 1: Basic health check
      const healthResponse = await fetch('http://localhost:8001/api/health');
      console.log('Health check response:', healthResponse.status);
      
      if (!healthResponse.ok) {
        throw new Error(`Backend not responding: ${healthResponse.status}`);
      }
      
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
      
      // Test 2: Google Sheets data
      const dataResponse = await fetch('http://localhost:8001/api/sheets/raw');
      console.log('Data response:', dataResponse.status);
      
      if (!dataResponse.ok) {
        throw new Error(`Data endpoint failed: ${dataResponse.status}`);
      }
      
      const sheetsData = await dataResponse.json();
      console.log('Sheets data:', sheetsData);
      
      setData({
        health: healthData,
        sheets: sheetsData,
        recordCount: sheetsData.data?.length || 0
      });
      
      setStatus('success');
      
    } catch (err) {
      console.error('Test failed:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Backend Connection Test
            </h1>
            <p className="text-text-secondary">
              Testing connection to Google Sheets backend
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Button onClick={runTest} disabled={status === 'testing'}>
              {status === 'testing' ? (
                <>
                  <Icon name="Loader2" size={20} className="animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" size={20} />
                  Test Again
                </>
              )}
            </Button>
          </div>

          {/* Status Display */}
          <div className="text-center mb-8">
            {status === 'testing' && (
              <div className="text-warning">
                <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4" />
                <p className="text-lg">Testing connection...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-success">
                <Icon name="CheckCircle" size={48} className="mx-auto mb-4" />
                <p className="text-lg font-semibold">✅ Connection Successful!</p>
                <p className="text-sm">Loaded {data?.recordCount || 0} records from Google Sheets</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-destructive">
                <Icon name="XCircle" size={48} className="mx-auto mb-4" />
                <p className="text-lg font-semibold">❌ Connection Failed</p>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Data Display */}
          {data && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h3 className="font-semibold text-success mb-2">Backend Status</h3>
                  <p className="text-sm">Server: Running ✅</p>
                  <p className="text-sm">Records: {data.recordCount}</p>
                  <p className="text-sm">Last Sync: {data.health?.dataStatus?.lastSync || 'N/A'}</p>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h3 className="font-semibold text-primary mb-2">Google Sheets</h3>
                  <p className="text-sm">Status: Connected ✅</p>
                  <p className="text-sm">Data: Available</p>
                  <p className="text-sm">Format: CSV Parsed</p>
                </div>
              </div>

              {data.sheets?.data && data.sheets.data.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Sample Data (First 3 Records)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2">Student Name</th>
                          <th className="text-left py-2">Email</th>
                          <th className="text-left py-2">Course</th>
                          <th className="text-left py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sheets.data.slice(0, 3).map((item, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-2">{item.studentName || 'N/A'}</td>
                            <td className="py-2">{item.email || 'N/A'}</td>
                            <td className="py-2">{item.course || 'N/A'}</td>
                            <td className="py-2">{item.status || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="text-center">
                <Button 
                  onClick={() => window.location.href = '/google-sheets-data'}
                  variant="default"
                  size="lg"
                >
                  <Icon name="ArrowRight" size={20} />
                  Go to Full Data View
                </Button>
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          {status === 'error' && (
            <div className="mt-8 bg-muted/50 rounded-lg p-6">
              <h3 className="font-semibold mb-4">Troubleshooting Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Make sure backend server is running: <code className="bg-muted px-2 py-1 rounded">node test-server.js</code></li>
                <li>Check if you see "✅ Successfully loaded X records from Google Sheets" in terminal</li>
                <li>Try opening <a href="http://localhost:8001/api/health" target="_blank" className="text-primary underline">http://localhost:8001/api/health</a> directly</li>
                <li>Check browser console (F12) for error messages</li>
                <li>Restart both backend server and React app</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestConnection;