import React, { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const ConnectionTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing AI connection...');
      
      const response = await api.post('/api/gemini/chat', {
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 50,
        temperature: 0.7
      });

      if (response.data.success) {
        setTestResult({
          status: 'success',
          message: '✅ Connection successful! AI is responding.',
          response: response.data.data.response
        });
        toast.success('Connection test successful! 🎉');
      } else {
        setTestResult({
          status: 'error',
          message: '❌ Backend responded but with error.',
          error: response.data.message
        });
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      setTestResult({
        status: 'error',
        message: '❌ Connection failed.',
        error: error.message,
        details: error.response?.data
      });
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">🔧 Connection Test</h3>
      <p className="text-sm text-gray-600 mb-3">
        Test if your AI backend is working properly
      </p>
      
      <button
        onClick={testConnection}
        disabled={isTesting}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isTesting ? 'Testing...' : 'Test Connection'}
      </button>

      {testResult && (
        <div className={`mt-3 p-3 rounded-lg ${
          testResult.status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-medium ${
            testResult.status === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {testResult.message}
          </p>
          {testResult.response && (
            <p className="text-xs text-green-700 mt-1">
              AI Response: "{testResult.response}"
            </p>
          )}
          {testResult.error && (
            <p className="text-xs text-red-700 mt-1">
              Error: {testResult.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest;
