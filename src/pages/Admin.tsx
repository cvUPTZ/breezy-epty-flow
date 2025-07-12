import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Settings, Activity, Calendar, BarChart3, Video } from 'lucide-react';
import { VoiceCollaborationManager } from '@/components/admin/VoiceCollaborationManager';

const Admin: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your application settings and monitor system status</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="voice">Voice Rooms</TabsTrigger>
          <TabsTrigger value="video">Video Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="space-y-6">
          <VoiceCollaborationManager />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium">Active Users</h3>
                  <p className="text-4xl font-bold">42</p>
                  <p className="text-sm text-gray-500">Last updated: 5 minutes ago</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium">System Load</h3>
                  <p className="text-4xl font-bold">78%</p>
                  <p className="text-sm text-gray-500">Optimal performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Manage user accounts and permissions</p>
              <Button>Add New User</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Analysis Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Monitor and manage video analysis jobs</p>
              <Button>View Job Queue</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
