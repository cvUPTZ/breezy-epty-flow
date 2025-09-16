
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * @interface AbsenceSummaryDashboardProps
 * @description Props for the AbsenceSummaryDashboard component.
 * @property {number} totalTrackers - The total number of trackers in the system.
 * @property {number} activeTrackers - The number of currently active trackers.
 * @property {number} absentTrackers - The number of trackers marked as absent.
 * @property {number} averageResponseTime - The average response time for tracker actions, in seconds.
 */
interface AbsenceSummaryDashboardProps {
  totalTrackers: number;
  activeTrackers: number;
  absentTrackers: number;
  averageResponseTime: number;
}

/**
 * @component AbsenceSummaryDashboard
 * @description A dashboard component that provides a high-level summary of tracker network health,
 * displaying key metrics like active vs. absent trackers and overall status.
 * @param {AbsenceSummaryDashboardProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const AbsenceSummaryDashboard: React.FC<AbsenceSummaryDashboardProps> = ({
  totalTrackers,
  activeTrackers,
  absentTrackers,
  averageResponseTime
}) => {
  const getHealthStatus = () => {
    const activePercentage = (activeTrackers / totalTrackers) * 100;
    if (activePercentage >= 90) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (activePercentage >= 70) return { status: 'Good', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'Needs Attention', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const healthStatus = getHealthStatus();

  const stats = [
    {
      title: 'Total Trackers',
      value: totalTrackers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Active Trackers',
      value: activeTrackers,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Absent Trackers',
      value: absentTrackers,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Avg Response Time',
      value: `${averageResponseTime}s`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tracker Network Health</span>
          <Badge className={`${healthStatus.color} ${healthStatus.bgColor} border-0`}>
            {healthStatus.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              className="text-center p-4 rounded-lg border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-2`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AbsenceSummaryDashboard;
