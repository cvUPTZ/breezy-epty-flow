import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const ServiceOfferPage: React.FC = () => {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Our Service Offers</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that best fits your club's needs and budget.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Pay-per-Match Plan */}
        <Card className="border-blue-200 flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-600">⚡ Pay-per-Match</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="text-4xl font-bold text-blue-600">
              {formatCurrency(12000)}
              <span className="text-lg font-medium text-muted-foreground">/match</span>
            </div>
            <p className="text-sm text-muted-foreground">Ideal for occasional needs and smaller clubs getting started with data analysis.</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Up to <strong>4 trackers</strong> maximum per match</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Access to all <strong>base statistics</strong> and reports</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Email support</span>
              </li>
            </ul>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </div>
        </Card>

        {/* Premium Plan */}
        <Card className="border-green-400 border-2 flex flex-col relative shadow-lg">
          <Badge variant="default" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600">Most Popular</Badge>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-green-600">💎 Abonnement Premium</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="text-4xl font-bold text-green-600">
              {formatCurrency(85000)}
              <span className="text-lg font-medium text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">The complete solution for professional clubs serious about performance analysis.</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Unlimited</strong> matches</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Up to <strong>8 simultaneous trackers</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Integrated <strong>voice chat</strong> for live collaboration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Advanced analytics</strong>, heatmaps, and visualizations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Priority email and phone support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>On-site team training</strong> included</span>
              </li>
            </ul>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full bg-green-600 hover:bg-green-700">Choose Premium</Button>
          </div>
        </Card>

        {/* Enterprise Plan */}
        <Card className="border-purple-200 flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-purple-600">🏆 Enterprise</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow space-y-6">
            <div className="text-4xl font-bold text-purple-600">
              {formatCurrency(150000)}
              <span className="text-lg font-medium text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">A fully customized, white-glove solution for federations and large clubs.</p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>All Premium features</strong> plus...</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Custom-built features and integrations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Dedicated 24/7 support channel</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>API access for data integration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Continuous training and consultation</span>
              </li>
            </ul>
          </CardContent>
          <div className="p-6 pt-0">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Contact Us</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServiceOfferPage;
