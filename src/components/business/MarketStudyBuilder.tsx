import React, { useState } from 'react';
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

interface MarketStudyBuilderProps {
  document: any;
  onClose: () => void;
}

export function MarketStudyBuilder({ document, onClose }: MarketStudyBuilderProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(document?.title || '');
  const [status, setStatus] = useState(document?.status || 'draft');
  const [content, setContent] = useState(document?.content || {
    introduction: '',
    marketOverview: '',
    targetMarket: '',
    competitiveAnalysis: '',
    swotAnalysis: '',
    consumerBehavior: '',
    marketTrends: '',
    opportunities: '',
    threats: '',
    recommendations: '',
    methodology: '',
    dataAnalysis: '',
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const payload = {
        title,
        document_type: 'market_study' as const,
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
      toast({ title: 'Market study saved successfully' });
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
          Save Market Study
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Market Study Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter market study title (e.g., Étude de marché - Industry Name)"
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
            <Label htmlFor="introduction">Introduction</Label>
            <Textarea
              id="introduction"
              value={content.introduction}
              onChange={(e) => updateField('introduction', e.target.value)}
              placeholder="Introduce the purpose and scope of this market study..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="marketOverview">Market Overview (Vue d'ensemble du marché)</Label>
            <Textarea
              id="marketOverview"
              value={content.marketOverview}
              onChange={(e) => updateField('marketOverview', e.target.value)}
              placeholder="Provide an overview of the market size, growth rate, and key characteristics..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="targetMarket">Target Market (Marché cible)</Label>
            <Textarea
              id="targetMarket"
              value={content.targetMarket}
              onChange={(e) => updateField('targetMarket', e.target.value)}
              placeholder="Define your target market segments, demographics, and psychographics..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="competitiveAnalysis">Competitive Analysis (Analyse concurrentielle)</Label>
            <Textarea
              id="competitiveAnalysis"
              value={content.competitiveAnalysis}
              onChange={(e) => updateField('competitiveAnalysis', e.target.value)}
              placeholder="Analyze your competitors, their market share, and positioning..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="swotAnalysis">SWOT Analysis (Forces, Faiblesses, Opportunités, Menaces)</Label>
            <Textarea
              id="swotAnalysis"
              value={content.swotAnalysis}
              onChange={(e) => updateField('swotAnalysis', e.target.value)}
              placeholder="Strengths, Weaknesses, Opportunities, Threats..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="consumerBehavior">Consumer Behavior (Comportement des consommateurs)</Label>
            <Textarea
              id="consumerBehavior"
              value={content.consumerBehavior}
              onChange={(e) => updateField('consumerBehavior', e.target.value)}
              placeholder="Analyze consumer buying patterns, preferences, and decision-making processes..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="marketTrends">Market Trends (Tendances du marché)</Label>
            <Textarea
              id="marketTrends"
              value={content.marketTrends}
              onChange={(e) => updateField('marketTrends', e.target.value)}
              placeholder="Identify current and emerging market trends..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="opportunities">Opportunities (Opportunités)</Label>
            <Textarea
              id="opportunities"
              value={content.opportunities}
              onChange={(e) => updateField('opportunities', e.target.value)}
              placeholder="Outline market opportunities for growth and expansion..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="threats">Threats (Menaces)</Label>
            <Textarea
              id="threats"
              value={content.threats}
              onChange={(e) => updateField('threats', e.target.value)}
              placeholder="Identify potential threats and challenges..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="methodology">Research Methodology (Méthodologie)</Label>
            <Textarea
              id="methodology"
              value={content.methodology}
              onChange={(e) => updateField('methodology', e.target.value)}
              placeholder="Describe the research methods and data collection techniques used..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="dataAnalysis">Data Analysis (Analyse des données)</Label>
            <Textarea
              id="dataAnalysis"
              value={content.dataAnalysis}
              onChange={(e) => updateField('dataAnalysis', e.target.value)}
              placeholder="Present key findings and data analysis results..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="recommendations">Recommendations (Recommandations)</Label>
            <Textarea
              id="recommendations"
              value={content.recommendations}
              onChange={(e) => updateField('recommendations', e.target.value)}
              placeholder="Provide strategic recommendations based on the market study findings..."
              rows={5}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}