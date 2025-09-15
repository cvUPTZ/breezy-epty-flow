import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BusinessPlanManagement from '@/components/admin/BusinessPlanManagement';
import BusinessModelCanvas from '@/components/admin/BusinessModelCanvas';

const DecisionPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="business-plan">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business-plan">Business Plan</TabsTrigger>
          <TabsTrigger value="business-model">Business Model</TabsTrigger>
        </TabsList>
        <TabsContent value="business-plan">
          <BusinessPlanManagement />
        </TabsContent>
        <TabsContent value="business-model">
          <BusinessModelCanvas />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DecisionPage;
