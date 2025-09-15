import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Zap, DollarSign, Key, Heart, MessageSquare, Truck, BarChart2 } from 'lucide-react';

const BusinessModelCanvasPage: React.FC = () => {
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
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Fédération Algérienne de Football (FAF)</li>
                <li>Regional Leagues</li>
                <li>Professional Football Clubs</li>
                <li>Training Centers & Academies</li>
                <li>Technology Providers (LiveKit, Supabase)</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Zap className="h-5 w-5 text-primary" /> Key Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Platform Development & Maintenance</li>
                  <li>Real-time Data Tracking & Analysis</li>
                  <li>User Training & Support</li>
                  <li>Sales & Marketing</li>
                  <li>R&D for AI/ML Features</li>
              </ul>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Key className="h-5 w-5 text-primary" /> Key Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Proprietary Software Platform</li>
                <li>Skilled Development Team</li>
                <li>Network of Trained Match Trackers</li>
                <li>Cloud Infrastructure (Supabase, LiveKit)</li>
                <li>Strategic Partnerships</li>
              </ul>
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
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                <li><strong>Real-time Collaboration:</strong> First platform in Algeria for simultaneous multi-user match tracking.</li>
                <li><strong>Affordable & Accessible:</strong> SaaS model tailored to local club budgets.</li>
                <li><strong>All-in-One Solution:</strong> Combines video analysis, voice chat, and live data tracking.</li>
                <li><strong>Data-Driven Decisions:</strong> Empowers coaches with advanced analytics and visualizations.</li>
                 <li><strong>Local Support:</strong> On-the-ground training and technical support in Algeria.</li>
              </ul>
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
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Dedicated Account Managers</li>
                <li>On-site & Remote Training</li>
                <li>Priority Support (Premium/Enterprise)</li>
                <li>Community Forum & Workshops</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Truck className="h-5 w-5 text-primary" /> Channels</CardTitle>
            </CardHeader>
            <CardContent>
               <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Direct Sales Team</li>
                <li>Partnerships with FAF and Leagues</li>
                <li>Digital Marketing (Social Media, SEO)</li>
                <li>Web Platform & App Stores</li>
                <li>Word-of-mouth & Referrals</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-primary" /> Customer Segments</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Professional Clubs (Ligue 1 & 2)</li>
                <li>Football Academies</li>
                <li>Professional Coaches & Analysts</li>
                <li>National & Regional Federations</li>
                <li>Scouting Agencies</li>
              </ul>
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
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Salaries (Development, Support, Sales)</li>
                        <li>Cloud Infrastructure & API Costs</li>
                        <li>Marketing & Advertising Expenses</li>
                        <li>Office & Administrative Costs</li>
                        <li>R&D Investment</li>
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="h-5 w-5 text-primary" /> Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Monthly/Annual SaaS Subscriptions (Premium)</li>
                        <li>Pay-per-Match Fees</li>
                        <li>Enterprise Licensing & Customization Fees</li>
                        <li>Training & Certification Programs</li>
                        <li>Data API Access (Future)</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelCanvasPage;
