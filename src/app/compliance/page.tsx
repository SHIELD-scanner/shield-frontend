"use client";

import { useCompliance } from '@/hooks/useCompliance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CompliancePage() {
  const { data, loading, error, refetch, setNamespace, currentNamespace } = useCompliance();

  if (loading) {
    return (
      <div className="p-10">
        <h2 className="text-2xl font-bold mb-4">Compliance</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <h2 className="text-2xl font-bold mb-4">Compliance</h2>
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => void refetch()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Compliance</h2>
        <div className="flex gap-4 items-center">
          <div className="text-sm text-gray-600">
            Current namespace: <span className="font-medium">{currentNamespace ?? 'acc/default'}</span>
          </div>
          <select 
            value={currentNamespace ?? 'acc/default'}
            onChange={(e) => setNamespace(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="acc/default">acc/default</option>
            <option value="production">production</option>
            <option value="staging">staging</option>
            <option value="development">development</option>
          </select>
          <button 
            onClick={() => void refetch()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {data ? (
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle>Compliance Report - {currentNamespace ?? 'acc/default'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-2xl font-bold text-green-600">{data.score}%</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Framework</div>
                <div className="text-lg font-semibold">{data.framework}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Version</div>
                <div className="text-lg">{data.version}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Status</div>
                <div className={`text-lg capitalize ${
                  data.status === 'passing' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.status}
                </div>
              </div>
            </div>
            {data.lastUpdated && (
              <div className="mt-4 text-sm text-gray-500">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500">No compliance data available.</p>
      )}
    </div>
  );
}
