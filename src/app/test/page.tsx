'use client';

import { api } from '@/lib/api';
import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation1 = api.auth.testRegister.useMutation();
  const mutation2 = api.auth.testRegister.useMutation();

  const testBatchRequest = async () => {
    try {
      setError(null);
      setResult(null);
      
      // Test batch request using tRPC client
      const results = await Promise.all([
        mutation1.mutateAsync({
          email: 'test1@example.com',
          password: 'password123',
          name: 'Test User 1'
        }),
        mutation2.mutateAsync({
          email: 'test2@example.com',
          password: 'password123',
          name: 'Test User 2'
        })
      ]);
      
      setResult(results);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const singleMutation = api.auth.testRegister.useMutation();

  const testSingleRequest = async () => {
    try {
      setError(null);
      setResult(null);
      
      const result = await singleMutation.mutateAsync({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      
      setResult(result);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">tRPC Test Page</h1>
      
      <div className="space-y-4">
        <button 
          onClick={testSingleRequest}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Single Request
        </button>
        
        <button 
          onClick={testBatchRequest}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Batch Request
        </button>
      </div>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}