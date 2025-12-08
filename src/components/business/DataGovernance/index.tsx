import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { 
  Database, 
  GitCompare, 
  Lightbulb, 
  Globe,
  BarChart3
} from 'lucide-react';
import { MasterReferenceManager } from './MasterReferenceManager';
import { ReconciliationDashboard } from './ReconciliationDashboard';
import { StrategicHypothesesManager } from './StrategicHypothesesManager';

export function DataGovernanceHub() {
  const [activeTab, setActiveTab] = useState('reference');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Centre de Gouvernance des Données
        </h1>
        <p className="text-muted-foreground mt-2">
          Centralisez vos données de référence, gérez la cohérence entre documents et suivez vos hypothèses stratégiques
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="reference" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Données de Référence</span>
            <span className="sm:hidden">Référence</span>
          </TabsTrigger>
          <TabsTrigger value="reconciliation" className="gap-2">
            <GitCompare className="h-4 w-4" />
            <span className="hidden sm:inline">Réconciliation</span>
            <span className="sm:hidden">Réconcil.</span>
          </TabsTrigger>
          <TabsTrigger value="hypotheses" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Hypothèses</span>
            <span className="sm:hidden">Hypo.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reference">
          <MasterReferenceManager />
        </TabsContent>

        <TabsContent value="reconciliation">
          <ReconciliationDashboard />
        </TabsContent>

        <TabsContent value="hypotheses">
          <StrategicHypothesesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { MasterReferenceManager } from './MasterReferenceManager';
export { ReconciliationDashboard } from './ReconciliationDashboard';
export { StrategicHypothesesManager } from './StrategicHypothesesManager';
