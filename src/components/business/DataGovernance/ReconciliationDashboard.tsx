import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  FileWarning,
  GitCompare,
  TrendingDown,
  Loader2,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReconciliationIssue {
  id: string;
  document_id: string | null;
  key_name: string;
  issue_type: string;
  severity: string;
  expected_value: string | null;
  found_value: string | null;
  document_location: string | null;
  description: string | null;
  resolution_status: string | null;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  document_type: string;
}

export function ReconciliationDashboard() {
  const [issues, setIssues] = useState<ReconciliationIssue[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document>>({});
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchIssues();
    fetchDocuments();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('data_reconciliation_issues')
        .select('*')
        .order('severity', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('business_documents')
        .select('id, title, document_type')
        .eq('is_supporting_document', false);

      if (error) throw error;
      const docMap: Record<string, Document> = {};
      (data || []).forEach(doc => {
        docMap[doc.id] = doc;
      });
      setDocuments(docMap);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const runReconciliation = async () => {
    setScanning(true);
    try {
      // Fetch reference data
      const { data: references } = await supabase
        .from('master_reference_data')
        .select('*')
        .eq('is_active', true);

      // Fetch business documents
      const { data: docs } = await supabase
        .from('business_documents')
        .select('*')
        .eq('is_supporting_document', false);

      if (!references || references.length === 0) {
        toast({
          title: 'Aucune référence',
          description: 'Ajoutez des données de référence avant de lancer la réconciliation',
          variant: 'destructive',
        });
        return;
      }

      // Call AI to detect discrepancies
      const { data, error } = await supabase.functions.invoke('reconcile-documents', {
        body: {
          references,
          documents: docs,
        },
      });

      if (error) throw error;

      if (data?.issues && data.issues.length > 0) {
        // Save detected issues
        const { data: userData } = await supabase.auth.getUser();
        const issuesToInsert = data.issues.map((issue: any) => ({
          user_id: userData.user?.id,
          document_id: issue.document_id,
          reference_id: issue.reference_id,
          issue_type: issue.issue_type,
          severity: issue.severity,
          key_name: issue.key_name,
          expected_value: issue.expected_value,
          found_value: issue.found_value,
          document_location: issue.document_location,
          description: issue.description,
        }));

        await supabase.from('data_reconciliation_issues').insert(issuesToInsert);
        
        toast({
          title: 'Réconciliation terminée',
          description: `${data.issues.length} écart(s) détecté(s)`,
        });
      } else {
        toast({
          title: 'Réconciliation terminée',
          description: 'Aucun écart détecté. Vos documents sont cohérents!',
        });
      }

      fetchIssues();
    } catch (error) {
      console.error('Reconciliation error:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la réconciliation',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  const updateIssueStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('data_reconciliation_issues')
        .update({ 
          resolution_status: status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null,
        })
        .eq('id', id);

      if (error) throw error;
      fetchIssues();
      toast({ title: 'Statut mis à jour' });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'high': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
      case 'low': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-muted';
    }
  };

  const getIssueTypeIcon = (type: string) => {
    switch (type) {
      case 'value_mismatch': return <GitCompare className="h-4 w-4" />;
      case 'missing_reference': return <FileWarning className="h-4 w-4" />;
      case 'methodology_conflict': return <TrendingDown className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const openIssues = issues.filter(i => i.resolution_status === 'open');
  const resolvedIssues = issues.filter(i => i.resolution_status === 'resolved');
  const acknowledgedIssues = issues.filter(i => i.resolution_status === 'acknowledged');

  const criticalCount = openIssues.filter(i => i.severity === 'critical').length;
  const highCount = openIssues.filter(i => i.severity === 'high').length;

  const coherenceScore = issues.length === 0 
    ? 100 
    : Math.max(0, 100 - (criticalCount * 20) - (highCount * 10) - (openIssues.length * 2));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" />
            Dashboard de Réconciliation
          </h2>
          <p className="text-muted-foreground">
            Détection et résolution des écarts entre documents
          </p>
        </div>
        <Button onClick={runReconciliation} disabled={scanning}>
          {scanning ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {scanning ? 'Analyse en cours...' : 'Lancer la réconciliation'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{coherenceScore}%</div>
              <p className="text-sm text-muted-foreground mt-1">Score de cohérence</p>
              <Progress value={coherenceScore} className="mt-3 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className={openIssues.length > 0 ? 'border-orange-500/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Écarts ouverts</p>
                <p className="text-3xl font-bold">{openIssues.length}</p>
              </div>
              <AlertTriangle className={`h-10 w-10 ${openIssues.length > 0 ? 'text-orange-500' : 'text-muted-foreground/30'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critiques / Hauts</p>
                <p className="text-3xl font-bold text-destructive">{criticalCount} / {highCount}</p>
              </div>
              <XCircle className={`h-10 w-10 ${criticalCount > 0 ? 'text-destructive' : 'text-muted-foreground/30'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Résolus</p>
                <p className="text-3xl font-bold text-green-600">{resolvedIssues.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      <Card>
        <CardHeader>
          <CardTitle>Écarts Détectés</CardTitle>
          <CardDescription>
            Liste des incohérences entre les documents et les données de référence
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="open">
            <TabsList>
              <TabsTrigger value="open" className="gap-2">
                Ouverts
                {openIssues.length > 0 && (
                  <Badge variant="destructive" className="ml-1">{openIssues.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="acknowledged">En cours ({acknowledgedIssues.length})</TabsTrigger>
              <TabsTrigger value="resolved">Résolus ({resolvedIssues.length})</TabsTrigger>
            </TabsList>

            {['open', 'acknowledged', 'resolved'].map(status => (
              <TabsContent key={status} value={status}>
                <ScrollArea className="h-[400px]">
                  {issues.filter(i => i.resolution_status === status).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Aucun écart dans cette catégorie</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {issues
                        .filter(i => i.resolution_status === status)
                        .map((issue) => (
                          <div 
                            key={issue.id} 
                            className={`p-4 border rounded-lg ${getSeverityColor(issue.severity)}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                {getIssueTypeIcon(issue.issue_type)}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{issue.key_name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {issue.issue_type.replace('_', ' ')}
                                    </Badge>
                                    <Badge className={getSeverityColor(issue.severity)}>
                                      {issue.severity}
                                    </Badge>
                                  </div>
                                  <p className="text-sm mt-1">{issue.description}</p>
                                  <div className="flex gap-4 mt-2 text-sm">
                                    <span>
                                      <strong>Attendu:</strong> {issue.expected_value || '-'}
                                    </span>
                                    <span>
                                      <strong>Trouvé:</strong> {issue.found_value || '-'}
                                    </span>
                                  </div>
                                  {issue.document_id && documents[issue.document_id] && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Document: {documents[issue.document_id].title}
                                      {issue.document_location && ` - ${issue.document_location}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                {status === 'open' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => updateIssueStatus(issue.id, 'acknowledged')}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Prendre en charge
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="default"
                                      onClick={() => updateIssueStatus(issue.id, 'resolved')}
                                    >
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Résoudre
                                    </Button>
                                  </>
                                )}
                                {status === 'acknowledged' && (
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => updateIssueStatus(issue.id, 'resolved')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Marquer résolu
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
