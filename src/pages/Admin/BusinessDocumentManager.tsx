import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, PlusCircle, Trash2, Eye, Edit, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BusinessPlanBuilder } from '@/components/business/BusinessPlanBuilder';
import { BusinessModelCanvasBuilder } from '@/components/business/BusinessModelCanvasBuilder';
import { MarketStudyBuilder } from '@/components/business/MarketStudyBuilder';
import { Badge } from '@/components/ui/badge';
import { DocumentUploadDialog } from '@/components/business/DocumentUploadDialog';
import { DocumentAnalysisView } from '@/components/business/DocumentAnalysisView';
import { GlobalAnalysisView } from '@/components/business/GlobalAnalysisView';
import { SupportDocumentUploadDialog } from '@/components/business/SupportDocumentUploadDialog';

type DocumentType = 'business_plan' | 'business_model_canvas' | 'market_study';

interface BusinessDocument {
  id: string;
  title: string;
  document_type: DocumentType;
  status: string;
  created_at: string;
  updated_at: string;
  content: any;
}

export default function BusinessDocumentManager() {
  const [activeTab, setActiveTab] = useState<DocumentType>('business_plan');
  const [selectedDocument, setSelectedDocument] = useState<BusinessDocument | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [supportDocsDialogOpen, setSupportDocsDialogOpen] = useState(false);
  const [viewingAnalysis, setViewingAnalysis] = useState(false);
  const [viewingGlobalAnalysis, setViewingGlobalAnalysis] = useState(false);
  const [globalAnalysisData, setGlobalAnalysisData] = useState<any>(null);
  const [isLoadingGlobalAnalysis, setIsLoadingGlobalAnalysis] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['business-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .eq('is_supporting_document', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BusinessDocument[];
    },
  });

  const { data: supportDocuments } = useQuery({
    queryKey: ['support-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('business_documents')
        .select('*')
        .eq('is_supporting_document', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('business_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-documents'] });
      toast({ title: 'Document deleted successfully' });
    },
  });

  const filteredDocuments = documents?.filter(doc => doc.document_type === activeTab) || [];

  const getDocumentIcon = (type: DocumentType) => {
    return <FileText className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      in_progress: 'bg-blue-500',
      completed: 'bg-green-500',
      archived: 'bg-gray-400',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const handleNewDocument = () => {
    setSelectedDocument(null);
    setIsBuilding(true);
  };

  const handleEditDocument = (doc: BusinessDocument) => {
    setSelectedDocument(doc);
    setIsBuilding(true);
  };

  const handleViewAnalysis = (doc: BusinessDocument) => {
    setSelectedDocument(doc);
    setViewingAnalysis(true);
  };

  const handleCloseBuilder = () => {
    setIsBuilding(false);
    setSelectedDocument(null);
    queryClient.invalidateQueries({ queryKey: ['business-documents'] });
  };

  const handleCloseAnalysis = () => {
    setViewingAnalysis(false);
    setSelectedDocument(null);
  };

  const handleGlobalAnalysis = async () => {
    setIsLoadingGlobalAnalysis(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-all-documents');
      
      if (error) throw error;
      
      if (data.success) {
        setGlobalAnalysisData(data);
        setViewingGlobalAnalysis(true);
        toast({
          title: 'Analyse globale terminée',
          description: `${data.documentsAnalyzed} documents analysés avec succès`,
        });
      } else {
        throw new Error(data.error || 'Erreur lors de l\'analyse');
      }
    } catch (error) {
      console.error('Global analysis error:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Échec de l\'analyse globale',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingGlobalAnalysis(false);
    }
  };

  const handleCloseGlobalAnalysis = () => {
    setViewingGlobalAnalysis(false);
    setGlobalAnalysisData(null);
  };

  if (viewingGlobalAnalysis && globalAnalysisData) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleCloseGlobalAnalysis}>
            ← Retour à la liste
          </Button>
        </div>
        <GlobalAnalysisView 
          analysis={globalAnalysisData.analysis} 
          documentsCount={globalAnalysisData.documentsAnalyzed}
        />
      </div>
    );
  }

  if (viewingAnalysis && selectedDocument?.content?.analysis) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="outline" onClick={handleCloseAnalysis}>
            ← Retour à la liste
          </Button>
        </div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold">{selectedDocument.title}</h2>
          <p className="text-muted-foreground">Analyse IA du document</p>
        </div>
        <DocumentAnalysisView analysis={selectedDocument.content.analysis} />
      </div>
    );
  }

  if (isBuilding) {
    return (
      <div className="container mx-auto p-6">
        {activeTab === 'business_plan' && (
          <BusinessPlanBuilder document={selectedDocument} onClose={handleCloseBuilder} />
        )}
        {activeTab === 'business_model_canvas' && (
          <BusinessModelCanvasBuilder document={selectedDocument} onClose={handleCloseBuilder} />
        )}
        {activeTab === 'market_study' && (
          <MarketStudyBuilder document={selectedDocument} onClose={handleCloseBuilder} />
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Business Document Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your business plans, canvases, and market studies
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DocumentType)}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="business_plan">Business Plans</TabsTrigger>
            <TabsTrigger value="business_model_canvas">Business Model Canvas</TabsTrigger>
            <TabsTrigger value="market_study">Market Studies</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleGlobalAnalysis} 
              variant="secondary" 
              className="gap-2"
              disabled={isLoadingGlobalAnalysis || !documents || documents.length === 0}
            >
              <FileText className="h-4 w-4" />
              {isLoadingGlobalAnalysis ? 'Analyse en cours...' : 'Analyse Globale'}
            </Button>
            <Button 
              onClick={() => setSupportDocsDialogOpen(true)} 
              variant="outline" 
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Knowledge Base ({supportDocuments?.length || 0})
            </Button>
            <Button onClick={() => setUploadDialogOpen(true)} variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload & Analyser
            </Button>
            <Button onClick={handleNewDocument} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              New {activeTab === 'business_plan' ? 'Business Plan' : 
                   activeTab === 'business_model_canvas' ? 'Canvas' : 'Market Study'}
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : filteredDocuments.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                {getDocumentIcon(activeTab)}
                <div>
                  <h3 className="text-lg font-semibold">No documents yet</h3>
                  <p className="text-muted-foreground">
                    Create your first {activeTab.replace(/_/g, ' ')} to get started
                  </p>
                </div>
                <Button onClick={handleNewDocument} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create Document
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {getDocumentIcon(doc.document_type)}
                        <h3 className="font-semibold truncate">{doc.title}</h3>
                      </div>
                      <Badge className={getStatusColor(doc.status)}>
                        {doc.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p>Created: {new Date(doc.created_at).toLocaleDateString()}</p>
                      <p>Updated: {new Date(doc.updated_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex gap-2">
                      {doc.content?.analysis && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewAnalysis(doc)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Analyse
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEditDocument(doc)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        documentType={activeTab}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['business-documents'] })}
      />

      <SupportDocumentUploadDialog
        open={supportDocsDialogOpen}
        onOpenChange={setSupportDocsDialogOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['support-documents'] })}
      />
    </div>
  );
}