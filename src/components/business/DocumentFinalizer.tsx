import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  Wand2, 
  FileText, 
  AlertCircle, 
  Loader2,
  Download,
  ArrowLeft,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface AnalysisIssue {
  category: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  recommendation: string;
}

interface AnalysisData {
  summary: string;
  overallScore: number;
  strengths: string[];
  issues: AnalysisIssue[];
  recommendations: string[];
}

interface BusinessDocument {
  id: string;
  title: string;
  document_type: string;
  status: string;
  content: {
    analysis?: AnalysisData;
    [key: string]: any;
  };
}

interface DocumentFinalizerProps {
  document: BusinessDocument;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentFinalizer({ document, onClose, onSuccess }: DocumentFinalizerProps) {
  const [selectedRecommendations, setSelectedRecommendations] = useState<number[]>([]);
  const [selectedIssues, setSelectedIssues] = useState<number[]>([]);
  const [additionalContext, setAdditionalContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('select');
  const { toast } = useToast();

  const analysis = document.content?.analysis;

  if (!analysis) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">Aucune analyse disponible</h3>
        <p className="text-muted-foreground mt-2">
          Ce document n'a pas encore été analysé. Veuillez d'abord lancer une analyse.
        </p>
        <Button variant="outline" onClick={onClose} className="mt-4">
          Retour
        </Button>
      </Card>
    );
  }

  const toggleRecommendation = (index: number) => {
    setSelectedRecommendations(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleIssue = (index: number) => {
    setSelectedIssues(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const selectAllRecommendations = () => {
    setSelectedRecommendations(analysis.recommendations.map((_, i) => i));
  };

  const selectAllIssues = () => {
    setSelectedIssues(analysis.issues.map((_, i) => i));
  };

  const handleGenerate = async () => {
    if (selectedRecommendations.length === 0 && selectedIssues.length === 0) {
      toast({
        title: 'Sélection requise',
        description: 'Veuillez sélectionner au moins une recommandation ou un problème à corriger.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + 10, 90));
    }, 500);

    try {
      const selectedRecs = selectedRecommendations.map(i => analysis.recommendations[i]);
      const selectedIss = selectedIssues.map(i => analysis.issues[i]);

      const { data, error } = await supabase.functions.invoke('apply-document-recommendations', {
        body: {
          documentId: document.id,
          documentType: document.document_type,
          currentContent: document.content,
          selectedRecommendations: selectedRecs,
          selectedIssues: selectedIss,
          additionalContext,
        },
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (error) throw error;

      if (data.success) {
        setGeneratedContent(data.finalDocument);
        setActiveTab('preview');
        toast({
          title: 'Document généré avec succès',
          description: 'Prévisualisez et validez le document final.',
        });
      } else {
        throw new Error(data.error || 'Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Échec de la génération',
        variant: 'destructive',
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleSaveFinal = async () => {
    if (!generatedContent) return;

    try {
      const { error } = await supabase
        .from('business_documents')
        .update({
          content: {
            ...document.content,
            ...generatedContent,
            previousVersions: [
              ...(document.content.previousVersions || []),
              { 
                content: document.content, 
                savedAt: new Date().toISOString(),
                version: (document.content.previousVersions?.length || 0) + 1
              }
            ],
            finalizedAt: new Date().toISOString(),
          },
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: 'Document finalisé',
        description: 'Le document a été mis à jour avec les corrections appliquées.',
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la sauvegarde du document',
        variant: 'destructive',
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive';
      case 'high': return 'bg-orange-500/10 text-orange-500';
      case 'medium': return 'bg-warning/10 text-warning';
      case 'low': return 'bg-info/10 text-info';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{document.title}</h2>
            <p className="text-muted-foreground">Finalisation et Application des Recommandations</p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          Score: {analysis.overallScore}/100
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="select">1. Sélection</TabsTrigger>
          <TabsTrigger value="context">2. Contexte</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedContent}>3. Prévisualisation</TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6 mt-6">
          {/* Recommendations Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Recommandations à Appliquer
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez les recommandations que vous souhaitez intégrer
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={selectAllRecommendations}>
                  Tout sélectionner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        selectedRecommendations.includes(index) 
                          ? 'bg-primary/5 border-primary/30' 
                          : 'bg-background hover:bg-muted/50'
                      }`}
                      onClick={() => toggleRecommendation(index)}
                    >
                      <Checkbox
                        checked={selectedRecommendations.includes(index)}
                        onCheckedChange={() => toggleRecommendation(index)}
                      />
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Issues Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Problèmes à Corriger
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez les problèmes identifiés à résoudre
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={selectAllIssues}>
                  Tout sélectionner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <Accordion type="multiple" className="w-full">
                  {analysis.issues.map((issue, index) => (
                    <AccordionItem key={index} value={`issue-${index}`}>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedIssues.includes(index)}
                          onCheckedChange={() => toggleIssue(index)}
                          className="ml-2"
                        />
                        <AccordionTrigger className="flex-1 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <span className="font-medium text-sm">{issue.title}</span>
                            <Badge className={getSeverityColor(issue.severity)} variant="outline">
                              {issue.severity}
                            </Badge>
                          </div>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent className="pl-10">
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground">{issue.description}</p>
                          <div className="bg-primary/5 p-2 rounded border border-primary/10">
                            <span className="font-semibold">Correction suggérée: </span>
                            {issue.recommendation}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedRecommendations.length} recommandation(s) et {selectedIssues.length} problème(s) sélectionné(s)
            </div>
            <Button onClick={() => setActiveTab('context')}>
              Continuer
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="context" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contexte Additionnel
              </CardTitle>
              <CardDescription>
                Ajoutez des informations complémentaires pour affiner la génération du document final
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Décrivez tout contexte supplémentaire, contraintes spécifiques, ou orientations stratégiques à prendre en compte lors de la finalisation du document..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                rows={6}
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">Exemples de contexte utile:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Nouvelles données de marché ou tendances</li>
                  <li>Contraintes budgétaires ou temporelles</li>
                  <li>Feedback des parties prenantes</li>
                  <li>Changements réglementaires</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résumé de la Génération</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{selectedRecommendations.length}</div>
                  <div className="text-sm text-muted-foreground">Recommandations</div>
                </div>
                <div className="p-4 bg-orange-500/5 rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">{selectedIssues.length}</div>
                  <div className="text-sm text-muted-foreground">Corrections</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{additionalContext ? '✓' : '—'}</div>
                  <div className="text-sm text-muted-foreground">Contexte</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {isGenerating && (
            <Card>
              <CardContent className="py-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Génération du document en cours...</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Application des recommandations et corrections...
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab('select')}>
              Retour
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Générer le Document Final
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6 mt-6">
          {generatedContent && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Document Finalisé
                  </CardTitle>
                  <CardDescription>
                    Prévisualisez les modifications apportées avant de sauvegarder
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96 border rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(generatedContent, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>

              {generatedContent.appliedChanges && (
                <Card>
                  <CardHeader>
                    <CardTitle>Modifications Appliquées</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {generatedContent.appliedChanges.map((change: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveTab('context')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="outline" onClick={handleGenerate} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Régénérer
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exporter
                  </Button>
                  <Button onClick={handleSaveFinal} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Valider et Sauvegarder
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
