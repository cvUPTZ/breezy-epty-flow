import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, 
  Bug, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Eye,
  AlertCircle,
  Info,
  XCircle,
  BarChart3,
  Calendar,
  User,
  Globe,
  Server,
  Smartphone,
  Wifi
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissionChecker } from '@/hooks/usePermissionChecker';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ErrorLog {
  id: string;
  user_id?: string | null;
  error_type: string;
  error_category: string;
  error_code?: string | null;
  error_message: string;
  stack_trace?: string | null;
  component_name?: string | null;
  function_name?: string | null;
  url?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  request_id?: string | null;
  metadata: any;
  severity: string;
  status: string;
  resolved_by?: string | null;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  occurrences: number | null;
  first_occurrence: string;
  last_occurrence: string;
  created_at: string;
  updated_at: string;
}

const ErrorManager: React.FC = () => {
  const { hasPermission } = usePermissionChecker();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    error: 0,
    warning: 0,
    info: 0,
    open: 0,
    resolved: 0,
    investigating: 0
  });

  // Permission check
  if (!hasPermission('canViewAnalytics')) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            You don't have permission to view error management.
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    fetchErrors();
  }, []);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('error_logs')
        .select('*')
        .order('last_occurrence', { ascending: false })
        .limit(100);

      if (error) throw error;

      setErrors(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch error logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (errorList: ErrorLog[]) => {
    const stats = {
      total: errorList.length,
      critical: errorList.filter(e => e.severity === 'critical').length,
      error: errorList.filter(e => e.severity === 'error').length,
      warning: errorList.filter(e => e.severity === 'warning').length,
      info: errorList.filter(e => e.severity === 'info').length,
      open: errorList.filter(e => e.status === 'open').length,
      resolved: errorList.filter(e => e.status === 'resolved').length,
      investigating: errorList.filter(e => e.status === 'investigating').length
    };
    setStats(stats);
  };

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.component_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.function_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = filterSeverity === 'all' || error.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || error.status === filterStatus;
    const matchesType = filterType === 'all' || error.error_type === filterType;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const updateErrorStatus = async (errorId: string, status: string, notes?: string) => {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'resolved') {
        updates.resolved_by = (await supabase.auth.getUser()).data.user?.id;
        updates.resolved_at = new Date().toISOString();
        updates.resolution_notes = notes;
      }

      const { error } = await supabase
        .from('error_logs')
        .update(updates)
        .eq('id', errorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Error marked as ${status}`
      });

      fetchErrors();
      setSelectedError(null);
      setResolutionNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update error status",
        variant: "destructive"
      });
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Bug className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'frontend':
        return <Smartphone className="h-4 w-4" />;
      case 'backend':
        return <Server className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'auth':
        return <User className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading error logs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Error Manager</h1>
          <p className="text-muted-foreground">
            Monitor and manage application errors and bugs
          </p>
        </div>
        <Button onClick={fetchErrors} disabled={loading}>
          <BarChart3 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Errors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bug className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.open}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="network">Network</SelectItem>
                <SelectItem value="auth">Auth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Error Logs ({filteredErrors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Component</TableHead>
                <TableHead>Occurrences</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredErrors.map((error) => (
                <TableRow key={error.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(error.severity)}
                      <Badge variant={getSeverityBadgeVariant(error.severity)}>
                        {error.severity}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(error.error_type)}
                      <span className="capitalize">{error.error_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={error.error_message}>
                      {error.error_message}
                    </div>
                  </TableCell>
                  <TableCell>{error.component_name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{error.occurrences || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(error.last_occurrence), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        error.status === 'resolved' ? 'default' :
                        error.status === 'investigating' ? 'secondary' : 'outline'
                      }
                    >
                      {error.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedError(error)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Error Details</DialogTitle>
                          <DialogDescription>
                            Detailed information about this error
                          </DialogDescription>
                        </DialogHeader>
                        
                        {selectedError && (
                          <div className="space-y-6">
                            {/* Error Overview */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Error Information</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>ID:</strong> {selectedError.id}</div>
                                  <div><strong>Type:</strong> {selectedError.error_type}</div>
                                  <div><strong>Category:</strong> {selectedError.error_category}</div>
                                  <div><strong>Code:</strong> {selectedError.error_code || 'N/A'}</div>
                                  <div><strong>Severity:</strong> {selectedError.severity}</div>
                                  <div><strong>Status:</strong> {selectedError.status}</div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Context</h4>
                                <div className="space-y-2 text-sm">
                                  <div><strong>Component:</strong> {selectedError.component_name || 'N/A'}</div>
                                  <div><strong>Function:</strong> {selectedError.function_name || 'N/A'}</div>
                                  <div><strong>URL:</strong> {selectedError.url || 'N/A'}</div>
                                  <div><strong>Occurrences:</strong> {selectedError.occurrences || 0}</div>
                                  <div><strong>First Seen:</strong> {format(new Date(selectedError.first_occurrence), 'MMM dd, yyyy HH:mm')}</div>
                                  <div><strong>Last Seen:</strong> {format(new Date(selectedError.last_occurrence), 'MMM dd, yyyy HH:mm')}</div>
                                </div>
                              </div>
                            </div>

                            {/* Error Message */}
                            <div>
                              <h4 className="font-semibold mb-2">Error Message</h4>
                              <div className="bg-muted p-3 rounded-md text-sm">
                                {selectedError.error_message}
                              </div>
                            </div>

                            {/* Stack Trace */}
                            {selectedError.stack_trace && (
                              <div>
                                <h4 className="font-semibold mb-2">Stack Trace</h4>
                                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                                  {selectedError.stack_trace}
                                </pre>
                              </div>
                            )}

                            {/* Metadata */}
                            {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                              <div>
                                <h4 className="font-semibold mb-2">Metadata</h4>
                                <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                                  {JSON.stringify(selectedError.metadata, null, 2)}
                                </pre>
                              </div>
                            )}

                            {/* Resolution */}
                            {selectedError.status !== 'resolved' && (
                              <div>
                                <h4 className="font-semibold mb-2">Resolution</h4>
                                <div className="space-y-3">
                                  <Textarea
                                    placeholder="Add resolution notes..."
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateErrorStatus(selectedError.id, 'investigating')}
                                      variant="outline"
                                    >
                                      Mark as Investigating
                                    </Button>
                                    <Button
                                      onClick={() => updateErrorStatus(selectedError.id, 'resolved', resolutionNotes)}
                                      disabled={!resolutionNotes.trim()}
                                    >
                                      Mark as Resolved
                                    </Button>
                                    <Button
                                      onClick={() => updateErrorStatus(selectedError.id, 'ignored')}
                                      variant="secondary"
                                    >
                                      Ignore
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Resolution Notes */}
                            {selectedError.resolution_notes && (
                              <div>
                                <h4 className="font-semibold mb-2">Resolution Notes</h4>
                                <div className="bg-muted p-3 rounded-md text-sm">
                                  {selectedError.resolution_notes}
                                </div>
                                {selectedError.resolved_at && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Resolved on {format(new Date(selectedError.resolved_at), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredErrors.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No errors found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorManager;