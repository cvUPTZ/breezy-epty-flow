import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAssignmentLogs, AssignmentLog } from '@/hooks/useAssignmentLogs';
import { formatDistanceToNow } from 'date-fns';
import { Search, Filter, Eye, User, Clock, Tag } from 'lucide-react';

interface AssignmentLogsViewerProps {
  matchId?: string;
  className?: string;
}

export const AssignmentLogsViewer: React.FC<AssignmentLogsViewerProps> = ({
  matchId,
  className = ""
}) => {
  const { logs, loading, refetch } = useAssignmentLogs(matchId);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.assigner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.assignee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.match_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.assignment_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || log.assignment_type === filterType;
    const matchesAction = filterAction === 'all' || log.assignment_action === filterAction;

    return matchesSearch && matchesType && matchesAction;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'updated': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'deleted': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tracker_assignment': return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      case 'player_assignment': return 'bg-orange-500/10 text-orange-700 border-orange-500/20';
      case 'event_assignment': return 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  const formatAssignmentDetails = (log: AssignmentLog) => {
    const details = log.assignment_details;
    
    if (!details || typeof details !== 'object') return <div className="text-xs text-muted-foreground">No details</div>;
    
    // Show enhanced tracker assignment info if available
    if (log.assignment_type === 'tracker_assignment' && log.tracker_assignment) {
      return (
        <div className="space-y-2">
          {log.tracker_assignment.player_name && (
            <div className="text-sm">
              <span className="font-medium text-primary">Player:</span> {log.tracker_assignment.player_name}
            </div>
          )}
          {log.tracker_assignment.team_name && (
            <div className="text-sm">
              <span className="font-medium text-primary">Team:</span> {log.tracker_assignment.team_name} ({log.tracker_assignment.player_team_id})
            </div>
          )}
          {log.tracker_assignment.assigned_event_types && log.tracker_assignment.assigned_event_types.length > 0 && (
            <div className="text-sm">
              <span className="font-medium text-primary">Event Types:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {log.tracker_assignment.assigned_event_types.map((eventType, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {eventType}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Fallback to standard details display
    const entries = Object.entries(details);
    if (entries.length === 0) return <div className="text-xs text-muted-foreground">No details</div>;
    
    return entries.map(([key, value]) => (
      <div key={key} className="text-xs text-muted-foreground">
        <span className="font-medium">{key}:</span> {Array.isArray(value) ? value.join(', ') : String(value)}
      </div>
    ));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Assignment Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Assignment Logs
          <Badge variant="secondary" className="ml-auto">
            {filteredLogs.length} entries
          </Badge>
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tracker_assignment">Tracker Assignment</SelectItem>
              <SelectItem value="player_assignment">Player Assignment</SelectItem>
              <SelectItem value="event_assignment">Event Assignment</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={refetch}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignment logs found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getActionColor(log.assignment_action)}>
                        {log.assignment_action}
                      </Badge>
                      <Badge className={getTypeColor(log.assignment_type)}>
                        {log.assignment_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Assigner:</span>
                      <span>{log.assigner_name}</span>
                    </div>
                    
                    {log.assignee_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Assignee:</span>
                        <span>{log.assignee_name}</span>
                      </div>
                    )}
                    
                    {log.match_name && (
                      <div className="flex items-center gap-2 text-sm md:col-span-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Match:</span>
                        <span>{log.match_name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-muted/30 rounded p-3">
                    <div className="font-medium text-sm mb-2">Assignment Details:</div>
                    {formatAssignmentDetails(log)}
                  </div>
                  
                  {log.previous_assignment_details && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                      <div className="font-medium text-sm mb-2 text-red-700">Previous Details:</div>
                      <div className="text-xs text-muted-foreground">
                        {Object.entries(log.previous_assignment_details).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {Array.isArray(value) ? value.join(', ') : String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};