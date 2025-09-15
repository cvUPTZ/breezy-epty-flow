import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Zap, DollarSign, Key, Heart, MessageSquare, Truck, BarChart2, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const initialCanvasData = {
  keyPartnerships: [
    'Fédération Algérienne de Football (FAF)',
    'Regional Leagues',
    'Professional Football Clubs',
    'Training Centers & Academies',
    'Technology Providers (LiveKit, Supabase)',
  ],
  keyActivities: [
    'Platform Development & Maintenance',
    'Real-time Data Tracking & Analysis',
    'User Training & Support',
    'Sales & Marketing',
    'R&D for AI/ML Features',
  ],
  keyResources: [
    'Proprietary Software Platform',
    'Skilled Development Team',
    'Network of Trained Match Trackers',
    'Cloud Infrastructure (Supabase, LiveKit)',
    'Strategic Partnerships',
  ],
  valuePropositions: [
    'Real-time Collaboration: First platform in Algeria for simultaneous multi-user match tracking.',
    'Affordable & Accessible: SaaS model tailored to local club budgets.',
    'All-in-One Solution: Combines video analysis, voice chat, and live data tracking.',
    'Data-Driven Decisions: Empowers coaches with advanced analytics and visualizations.',
    'Local Support: On-the-ground training and technical support in Algeria.',
  ],
  customerRelationships: [
    'Dedicated Account Managers',
    'On-site & Remote Training',
    'Priority Support (Premium/Enterprise)',
    'Community Forum & Workshops',
  ],
  channels: [
    'Direct Sales Team',
    'Partnerships with FAF and Leagues',
    'Digital Marketing (Social Media, SEO)',
    'Web Platform & App Stores',
    'Word-of-mouth & Referrals',
  ],
  customerSegments: [
    'Professional Clubs (Ligue 1 & 2)',
    'Football Academies',
    'Professional Coaches & Analysts',
    'National & Regional Federations',
    'Scouting Agencies',
  ],
  costStructure: [
    'Salaries (Development, Support, Sales)',
    'Cloud Infrastructure & API Costs',
    'Marketing & Advertising Expenses',
    'Office & Administrative Costs',
    'R&D Investment',
  ],
  revenueStreams: [
    'Monthly/Annual SaaS Subscriptions (Premium)',
    'Pay-per-Match Fees',
    'Enterprise Licensing & Customization Fees',
    'Training & Certification Programs',
    'Data API Access (Future)',
  ],
};

const BusinessModelCanvas: React.FC = () => {
  const [canvasData, setCanvasData] = useState(initialCanvasData);

  const handleItemChange = (section: keyof typeof initialCanvasData, index: number, value: string) => {
    const updatedSection = [...canvasData[section]];
    updatedSection[index] = value;
    setCanvasData({ ...canvasData, [section]: updatedSection });
  };

  const handleAddItem = (section: keyof typeof initialCanvasData) => {
    const updatedSection = [...canvasData[section], ''];
    setCanvasData({ ...canvasData, [section]: updatedSection });
  };

  const handleRemoveItem = (section: keyof typeof initialCanvasData, index: number) => {
    const updatedSection = canvasData[section].filter((_, i) => i !== index);
    setCanvasData({ ...canvasData, [section]: updatedSection });
  };

  const renderEditableList = (section: keyof typeof initialCanvasData) => (
    <div className="space-y-2">
      {canvasData[section].map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(section, index, e.target.value)}
            className="w-full"
          />
          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(section, index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => handleAddItem(section)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Item
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Business Model Canvas</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A strategic management template for developing new or documenting existing business models.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="h-5 w-5 text-primary" /> Key Partnerships</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableList('keyPartnerships')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Zap className="h-5 w-5 text-primary" /> Key Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableList('keyActivities')}
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Key className="h-5 w-5 text-primary" /> Key Resources</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableList('keyResources')}
            </CardContent>
          </Card>
        </div>

        {/* Center Column */}
        <div className="space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Heart className="h-5 w-5 text-primary" /> Value Propositions</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableList('valuePropositions')}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><MessageSquare className="h-5 w-5 text-primary" /> Customer Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableList('customerRelationships')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Truck className="h-5 w-5 text-primary" /> Channels</CardTitle>
            </CardHeader>
            <CardContent>
               {renderEditableList('channels')}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" /> Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEditableList('customerSegments')}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><BarChart2 className="h-5 w-5 text-primary" /> Cost Structure</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderEditableList('costStructure')}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="h-5 w-5 text-primary" /> Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderEditableList('revenueStreams')}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelCanvas;
