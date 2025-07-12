
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  FileText,
  PieChart,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';

interface BusinessGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  deadline: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface RevenueStream {
  id: string;
  name: string;
  description: string;
  monthlyRevenue: number;
  growth: number;
  status: 'active' | 'planned' | 'discontinued';
}

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

const BusinessPlanManagement: React.FC = () => {
  const [businessGoals, setBusinessGoals] = useState<BusinessGoal[]>([
    {
      id: '1',
      title: 'Expand to 5 New Markets',
      description: 'Launch our sports tracking platform in 5 new geographical markets',
      target: '5 markets',
      deadline: '2024-12-31',
      status: 'in-progress'
    },
    {
      id: '2',
      title: 'Reach 10,000 Active Users',
      description: 'Grow our user base to 10,000 active monthly users',
      target: '10,000 users',
      deadline: '2024-10-31',
      status: 'in-progress'
    }
  ]);

  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([
    {
      id: '1',
      name: 'Subscription Plans',
      description: 'Monthly and yearly subscription plans for teams and organizations',
      monthlyRevenue: 15000,
      growth: 12.5,
      status: 'active'
    },
    {
      id: '2',
      name: 'Enterprise Licenses',
      description: 'Custom enterprise solutions for large organizations',
      monthlyRevenue: 25000,
      growth: 8.3,
      status: 'active'
    },
    {
      id: '3',
      name: 'Video Analysis Services',
      description: 'Professional video analysis and reporting services',
      monthlyRevenue: 8000,
      growth: 15.2,
      status: 'active'
    }
  ]);

  const [financialMetrics, setFinancialMetrics] = useState<FinancialMetric[]>([
    { id: '1', name: 'Monthly Recurring Revenue', value: 48000, unit: '$', trend: 'up', change: 12.5 },
    { id: '2', name: 'Customer Acquisition Cost', value: 85, unit: '$', trend: 'down', change: -8.2 },
    { id: '3', name: 'Customer Lifetime Value', value: 1250, unit: '$', trend: 'up', change: 15.3 },
    { id: '4', name: 'Churn Rate', value: 5.2, unit: '%', trend: 'down', change: -2.1 },
    { id: '5', name: 'Gross Margin', value: 75.5, unit: '%', trend: 'stable', change: 0.5 }
  ]);

  const [newGoal, setNewGoal] = useState<Partial<BusinessGoal>>({});
  const [newRevenueStream, setNewRevenueStream] = useState<Partial<RevenueStream>>({});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
      case 'planned':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'discontinued':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const addBusinessGoal = () => {
    if (newGoal.title && newGoal.description) {
      const goal: BusinessGoal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        target: newGoal.target || '',
        deadline: newGoal.deadline || '',
        status: 'pending'
      };
      setBusinessGoals([...businessGoals, goal]);
      setNewGoal({});
    }
  };

  const addRevenueStream = () => {
    if (newRevenueStream.name && newRevenueStream.description) {
      const stream: RevenueStream = {
        id: Date.now().toString(),
        name: newRevenueStream.name,
        description: newRevenueStream.description,
        monthlyRevenue: newRevenueStream.monthlyRevenue || 0,
        growth: newRevenueStream.growth || 0,
        status: 'planned'
      };
      setRevenueStreams([...revenueStreams, stream]);
      setNewRevenueStream({});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Management</h1>
          <p className="text-gray-600">Manage your business plan, model, and financial metrics</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="goals">Business Goals</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Model</TabsTrigger>
          <TabsTrigger value="financial">Financial Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{businessGoals.length}</div>
                <p className="text-xs text-muted-foreground">
                  {businessGoals.filter(g => g.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${revenueStreams.reduce((sum, stream) => sum + stream.monthlyRevenue, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {revenueStreams.filter(s => s.status === 'active').length} active streams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(revenueStreams.reduce((sum, stream) => sum + stream.growth, 0) / revenueStreams.length).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Average monthly growth</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Model Canvas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Key Partnerships</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Sports organizations</li>
                    <li>• Technology partners</li>
                    <li>• Video analytics providers</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Value Propositions</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time match tracking</li>
                    <li>• Advanced analytics</li>
                    <li>• Team collaboration tools</li>
                  </ul>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Customer Segments</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Professional sports teams</li>
                    <li>• Amateur leagues</li>
                    <li>• Educational institutions</li>
                  </ul>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Business Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Goal Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="Enter goal title"
                    value={newGoal.title || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-target">Target</Label>
                  <Input
                    id="goal-target"
                    placeholder="e.g., 10,000 users"
                    value={newGoal.target || ''}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-description">Description</Label>
                <Textarea
                  id="goal-description"
                  placeholder="Describe the goal"
                  value={newGoal.description || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline">Deadline</Label>
                <Input
                  id="goal-deadline"
                  type="date"
                  value={newGoal.deadline || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <Button onClick={addBusinessGoal} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Business Goal
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {businessGoals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{goal.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Target: {goal.target}</span>
                        <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Streams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stream-name">Stream Name</Label>
                  <Input
                    id="stream-name"
                    placeholder="Enter revenue stream name"
                    value={newRevenueStream.name || ''}
                    onChange={(e) => setNewRevenueStream({ ...newRevenueStream, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stream-revenue">Monthly Revenue ($)</Label>
                  <Input
                    id="stream-revenue"
                    type="number"
                    placeholder="0"
                    value={newRevenueStream.monthlyRevenue || ''}
                    onChange={(e) => setNewRevenueStream({ ...newRevenueStream, monthlyRevenue: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stream-description">Description</Label>
                <Textarea
                  id="stream-description"
                  placeholder="Describe the revenue stream"
                  value={newRevenueStream.description || ''}
                  onChange={(e) => setNewRevenueStream({ ...newRevenueStream, description: e.target.value })}
                />
              </div>
              <Button onClick={addRevenueStream} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Revenue Stream
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {revenueStreams.map((stream) => (
              <Card key={stream.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{stream.name}</h3>
                        <Badge className={getStatusColor(stream.status)}>
                          {stream.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{stream.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">${stream.monthlyRevenue.toLocaleString()}/month</span>
                        <span className="text-green-600">+{stream.growth}% growth</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Financial Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {financialMetrics.map((metric) => (
                  <Card key={metric.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-sm">{metric.name}</h3>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold">
                        {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit !== '$' ? metric.unit : ''}
                      </span>
                    </div>
                    <p className={`text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change >= 0 ? '+' : ''}{metric.change}% from last month
                    </p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {revenueStreams.map((stream) => {
                    const percentage = (stream.monthlyRevenue / revenueStreams.reduce((sum, s) => sum + s.monthlyRevenue, 0)) * 100;
                    return (
                      <div key={stream.id} className="flex items-center justify-between">
                        <span className="text-sm">{stream.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-blue-500 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Business Plan Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Business Plan 2024.pdf</span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Financial Projections.xlsx</span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Market Analysis.pdf</span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessPlanManagement;
