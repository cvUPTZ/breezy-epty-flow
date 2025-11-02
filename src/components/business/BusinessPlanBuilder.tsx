import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface BusinessPlanBuilderProps {
  document: any;
  onClose: () => void;
}

export function BusinessPlanBuilder({ document, onClose }: BusinessPlanBuilderProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(document?.title || '');
  const [status, setStatus] = useState(document?.status || 'draft');
  const [content, setContent] = useState(document?.content || {
    executiveSummary: '',
    companyDescription: '',
    marketAnalysis: '',
    organization: '',
    productLine: '',
    marketingStrategy: '',
    financialProjections: '',
    fundingRequest: '',
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const payload = {
        title,
        document_type: 'business_plan' as const,
        status,
        content,
        user_id: user.id,
      };

      if (document?.id) {
        const { error } = await supabase
          .from('business_documents')
          .update(payload)
          .eq('id', document.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_documents')
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: 'Business plan saved successfully' });
      onClose();
    },
  });

  const updateField = (field: string, value: string) => {
    setContent({ ...content, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => saveMutation.mutate()} className="gap-2">
          <Save className="h-4 w-4" />
          Save Business Plan
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Business Plan Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter business plan title"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="executiveSummary">Executive Summary</Label>
            <Textarea
              id="executiveSummary"
              value={content.executiveSummary}
              onChange={(e) => updateField('executiveSummary', e.target.value)}
              placeholder="Summarize your business concept, mission, and key success factors..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="companyDescription">Company Description</Label>
            <Textarea
              id="companyDescription"
              value={content.companyDescription}
              onChange={(e) => updateField('companyDescription', e.target.value)}
              placeholder="Describe your company, its legal structure, and what makes it unique..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="marketAnalysis">Market Analysis</Label>
            <Textarea
              id="marketAnalysis"
              value={content.marketAnalysis}
              onChange={(e) => updateField('marketAnalysis', e.target.value)}
              placeholder="Analyze your target market, industry trends, and competitive landscape..."
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="organization">Organization & Management</Label>
            <Textarea
              id="organization"
              value={content.organization}
              onChange={(e) => updateField('organization', e.target.value)}
              placeholder="Describe your organizational structure and management team..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="productLine">Product/Service Line</Label>
            <Textarea
              id="productLine"
              value={content.productLine}
              onChange={(e) => updateField('productLine', e.target.value)}
              placeholder="Detail your products or services, their benefits, and lifecycle..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="marketingStrategy">Marketing & Sales Strategy</Label>
            <Textarea
              id="marketingStrategy"
              value={content.marketingStrategy}
              onChange={(e) => updateField('marketingStrategy', e.target.value)}
              placeholder="Outline your marketing approach, sales strategy, and customer acquisition..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="financialProjections">Financial Projections</Label>
            <Textarea
              id="financialProjections"
              value={content.financialProjections}
              onChange={(e) => updateField('financialProjections', e.target.value)}
              placeholder="Provide revenue forecasts, expense budgets, and profitability projections..."
              rows={6}
            />
          </div>

          <div>
            <Label htmlFor="fundingRequest">Funding Request (if applicable)</Label>
            <Textarea
              id="fundingRequest"
              value={content.fundingRequest}
              onChange={(e) => updateField('fundingRequest', e.target.value)}
              placeholder="Specify funding requirements, intended use, and return on investment..."
              rows={4}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}