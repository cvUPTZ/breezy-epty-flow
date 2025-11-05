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
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: 'Aucun fichier sélectionné',
        description: 'Veuillez sélectionner au moins un fichier',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    const totalFiles = files.length;
    let successCount = 0;
    let errorCount = 0;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileIndex(i + 1);
        const baseProgress = (i / totalFiles) * 100;
        
        setProgress(baseProgress + 10);
        setStatus(`Lecture du document ${i + 1}/${totalFiles}: ${file.name}...`);

        try {
          let fileContent = '';
          
          if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            toast({
              title: 'Format non supporté',
              description: `${file.name} doit être en TXT ou MD`,
              variant: 'destructive'
            });
            errorCount++;
            continue;
          }

          const reader = new FileReader();
          fileContent = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });

          setProgress(baseProgress + 30);
          setStatus(`Analyse IA du document ${i + 1}/${totalFiles}...`);

          const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
            'analyze-business-document',
            {
              body: {
                documentContent: fileContent,
                documentType,
                title: file.name.replace(/\.[^/.]+$/, '')
              }
            }
          );

          if (analysisError) throw analysisError;

          setProgress(baseProgress + 70);
          setStatus(`Sauvegarde du document ${i + 1}/${totalFiles}...`);

          const { error: dbError } = await supabase
            .from('business_documents')
            .insert({
              title: file.name.replace(/\.[^/.]+$/, ''),
              document_type: documentType,
              user_id: user.user.id,
              status: 'completed',
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
          successCount++;

        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          errorCount++;
        }
      }

      setProgress(100);
      setStatus('Terminé!');

      toast({
        title: 'Upload terminé',
        description: `${successCount} document(s) uploadé(s) avec succès${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`
      });

      setTimeout(() => {
        setFiles([]);
        setProgress(0);
        setStatus('');
        setCurrentFileIndex(0);
        setIsProcessing(false);
        onOpenChange(false);
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Échec de l\'upload',
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
            <Label htmlFor="file-upload">Fichiers (Upload Multiple)</Label>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              >
                {files.length > 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium">{files.length} fichier(s) sélectionné(s)</p>
                    <div className="max-h-16 overflow-y-auto w-full">
                      {files.map((f, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground truncate">
                          {f.name} ({(f.size / 1024).toFixed(2)} KB)
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquer pour sélectionner des fichiers
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TXT, MD (formats texte) - Multiple autorisé
                    </p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".txt,.md"
                  multiple
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
            <Button onClick={handleUpload} disabled={files.length === 0 || isProcessing}>
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
