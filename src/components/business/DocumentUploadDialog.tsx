import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'business_plan' | 'business_model_canvas' | 'market_study';
  onSuccess: () => void;
}

export function DocumentUploadDialog({ 
  open, 
  onOpenChange, 
  documentType,
  onSuccess 
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez sélectionner un fichier et entrer un titre',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setStatus('Lecture du document...');

    try {
      let fileContent = '';
      
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        toast({
          title: 'Format non supporté pour l\'instant',
          description: 'Veuillez convertir votre document en TXT ou MD pour l\'analyse',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      const reader = new FileReader();
      fileContent = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
      });

      setProgress(30);
      setStatus('Analyse du document avec l\'IA...');

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-business-document',
        {
          body: {
            documentContent: fileContent,
            documentType,
            title
          }
        }
      );

      if (analysisError) throw analysisError;

      setProgress(70);
      setStatus('Sauvegarde du document...');

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { error: dbError } = await supabase
        .from('business_documents')
        .insert({
          title,
          document_type: documentType,
          user_id: user.user.id,
          status: 'completed',
          is_supporting_document: false,
          content: {
            originalContent: fileContent,
            analysis: analysisData.analysis,
            uploadedAt: new Date().toISOString(),
            fileName: file.name
          },
          metadata: {
            fileSize: file.size,
            fileType: file.type,
            analysisTimestamp: analysisData.timestamp
          }
        });

      if (dbError) throw dbError;

      setProgress(100);
      setStatus('Terminé!');

      toast({
        title: 'Document analysé avec succès',
        description: `Le document "${title}" a été uploadé et analysé`
      });

      setTimeout(() => {
        setFile(null);
        setTitle('');
        setProgress(0);
        setStatus('');
        setIsProcessing(false);
        onOpenChange(false);
        onSuccess();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Échec de l\'upload du document',
        variant: 'destructive'
      });
      setIsProcessing(false);
      setProgress(0);
      setStatus('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Uploader un Document</DialogTitle>
          <DialogDescription>
            Uploadez un document {documentType.replace(/_/g, ' ')} pour analyse IA automatique
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Titre du Document</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mon business plan..."
              disabled={isProcessing}
            />
          </div>

          <div>
            <Label htmlFor="file-upload">Fichier</Label>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquer pour sélectionner un fichier
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TXT, MD (formats texte)
                    </p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".txt,.md"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>

          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="ml-2">
                <div className="space-y-2">
                  <p className="text-sm">{status}</p>
                  <Progress value={progress} className="w-full" />
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Le document sera analysé automatiquement par l'IA pour détecter les problèmes de logique business, 
              analytiques, financiers, décisionnels et incohérences.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={!file || !title.trim() || isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Uploader & Analyser
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
