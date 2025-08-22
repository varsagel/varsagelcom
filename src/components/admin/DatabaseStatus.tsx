'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Activity, Clock, MemoryStick } from 'lucide-react';

interface HealthCheck {
  status: string;
  timestamp: string;
  responseTime: string;
  version: string;
  environment: string;
  checks: {
    api: {
      status: string;
      responseTime: number;
    };
    database: {
      status: string;
      responseTime: number;
      connected: boolean;
      url?: string;
    };
    memory: {
      status: string;
      usage: {
        rss: number;
        heapTotal: number;
        heapUsed: number;
        external: number;
      };
    };
    uptime: number;
  };
}

interface MonitoringData {
  timestamp: string;
  configuration: {
    database_url_configured: boolean;
    direct_url_configured: boolean;
    database_provider: string;
  };
  environment: {
    node_env: string;
    vercel_env: string;
    vercel_region: string;
  };
  prisma: {
    version: string;
    engine_type: string;
    query_engine_type: string;
  };
  performance: {
    response_time: number;
    memory_usage: {
      rss: number;
      heap_used: number;
      heap_total: number;
    };
    uptime: number;
  };
}

export default function DatabaseStatus() {
  const [healthData, setHealthData] = useState<HealthCheck | null>(null);
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [healthResponse, monitoringResponse] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/monitoring/database')
      ]);
      
      const health = await healthResponse.json();
      const monitoring = await monitoringResponse.json();
      
      setHealthData(health);
      setMonitoringData(monitoring);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch database status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'configured':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'unhealthy':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  if (loading && !healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Status
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(healthData?.status || 'unknown')}`} />
              <div>
                <p className="font-medium">Overall Status</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {healthData?.status || 'Unknown'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="font-medium">Response Time</p>
                <p className="text-sm text-muted-foreground">
                  {healthData?.responseTime || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="font-medium">Uptime</p>
                <p className="text-sm text-muted-foreground">
                  {healthData?.checks.uptime ? formatUptime(healthData.checks.uptime) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* API Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">API Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getStatusColor(healthData?.checks.api.status || 'unknown')}>
                {healthData?.checks.api.status || 'Unknown'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Response: {healthData?.checks.api.responseTime || 0}ms
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Database Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getStatusColor(healthData?.checks.database.status || 'unknown')}>
                {healthData?.checks.database.status || 'Unknown'}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Connected: {healthData?.checks.database.connected ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">
                Provider: {healthData?.checks.database.url || monitoringData?.configuration.database_provider || 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getStatusColor(healthData?.checks.memory.status || 'unknown')}>
                {healthData?.checks.memory.status || 'Unknown'}
              </Badge>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>RSS: {healthData?.checks.memory.usage.rss || 0}MB</p>
                <p>Heap: {healthData?.checks.memory.usage.heapUsed || 0}/{healthData?.checks.memory.usage.heapTotal || 0}MB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Details */}
      {monitoringData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Database</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>URL Configured: {monitoringData.configuration.database_url_configured ? 'Yes' : 'No'}</p>
                  <p>Direct URL: {monitoringData.configuration.direct_url_configured ? 'Yes' : 'No'}</p>
                  <p>Provider: {monitoringData.configuration.database_provider}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Environment</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>Node ENV: {monitoringData.environment.node_env}</p>
                  <p>Vercel ENV: {monitoringData.environment.vercel_env}</p>
                  <p>Region: {monitoringData.environment.vercel_region}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {lastUpdated && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}