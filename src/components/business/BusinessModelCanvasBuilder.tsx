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

interface BusinessModelCanvasBuilderProps {
  document: any;
  onClose: () => void;
}

export function BusinessModelCanvasBuilder({ document, onClose }: BusinessModelCanvasBuilderProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState(document?.title || '');
  const [status, setStatus] = useState(document?.status || 'draft');
  const [content, setContent] = useState(document?.content || {
    keyPartners: '',
    keyActivities: '',
    keyResources: '',
    valuePropositions: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: '',
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const payload = {
        title,
        document_type: 'business_model_canvas' as const,
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
      toast({ title: 'Business model canvas saved successfully' });
      onClose();
    },
  });

  const updateField = (field: string, value: string) => {
    setContent({ ...content, [field]: value });
  };

  const canvasBlocks = [
    { id: 'keyPartners', label: 'Key Partners', placeholder: 'Who are your key partners and suppliers?' },
    { id: 'keyActivities', label: 'Key Activities', placeholder: 'What key activities does your value proposition require?' },
    { id: 'keyResources', label: 'Key Resources', placeholder: 'What key resources does your value proposition require?' },
    { id: 'valuePropositions', label: 'Value Propositions', placeholder: 'What value do you deliver to the customer?' },
    { id: 'customerRelationships', label: 'Customer Relationships', placeholder: 'What type of relationship does each customer segment expect?' },
    { id: 'channels', label: 'Channels', placeholder: 'Through which channels do you reach your customers?' },
    { id: 'customerSegments', label: 'Customer Segments', placeholder: 'For whom are you creating value?' },
    { id: 'costStructure', label: 'Cost Structure', placeholder: 'What are the most important costs in your business model?' },
    { id: 'revenueStreams', label: 'Revenue Streams', placeholder: 'For what value are customers willing to pay?' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={() => saveMutation.mutate()} className="gap-2">
          <Save className="h-4 w-4" />
          Save Canvas
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Canvas Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter business model canvas title"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {canvasBlocks.map((block) => (
            <div key={block.id} className="space-y-2">
              <Label htmlFor={block.id} className="text-sm font-semibold">
                {block.label}
              </Label>
              <Textarea
                id={block.id}
                value={content[block.id]}
                onChange={(e) => updateField(block.id, e.target.value)}
                placeholder={block.placeholder}
                rows={6}
                className="resize-none"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}