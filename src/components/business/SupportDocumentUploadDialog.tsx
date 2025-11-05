import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SupportDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SupportDocumentUploadDialog({ 
  open, 
  onOpenChange, 
  onSuccess 
}: SupportDocumentUploadDialogProps) {
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
        description: 'Veuillez sélectionner au moins un document de support',
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
        setStatus(`Traitement ${i + 1}/${totalFiles}: ${file.name}...`);

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

          setProgress(baseProgress + 60);
          setStatus(`Sauvegarde ${i + 1}/${totalFiles}...`);

          // Save support document without AI analysis
          const { error: dbError } = await supabase
            .from('business_documents')
            .insert({
              title: file.name.replace(/\.[^/.]+$/, ''),
              document_type: 'supporting_document',
              user_id: user.user.id,
              status: 'completed',
              is_supporting_document: true,
              content: {
                originalContent: fileContent,
                uploadedAt: new Date().toISOString(),
                fileName: file.name,
                description: 'Document de support pour enrichir le contexte business'
              },
              metadata: {
                fileSize: file.size,
                fileType: file.type
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
        title: 'Documents de support uploadés',
        description: `${successCount} document(s) ajouté(s) à la knowledge base${errorCount > 0 ? `, ${errorCount} échec(s)` : ''}`
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
          <DialogTitle>Documents de Support (Knowledge Base)</DialogTitle>
          <DialogDescription>
            Uploadez plusieurs documents pour enrichir le contexte et la knowledge base. Ces documents seront utilisés pour améliorer l'analyse globale et la détection d'incohérences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Fichiers (Upload Multiple)</Label>
            <div className="mt-2">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
              >
                {files.length > 0 ? (
                  <div className="flex flex-col items-center gap-2 px-4 max-w-full">
                    <FileText className="h-8 w-8 text-primary" />
                    <p className="text-sm font-medium">{files.length} document(s) sélectionné(s)</p>
                    <div className="max-h-20 overflow-y-auto w-full text-center">
                      {files.map((f, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground truncate">
                          {f.name} ({(f.size / 1024).toFixed(1)} KB)
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Cliquer pour sélectionner des documents
                    </p>
                    <p className="text-xs text-muted-foreground">
                      TXT, MD - Upload multiple autorisé
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      Rapports, analyses, notes, études complémentaires...
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
              Ces documents enrichiront la knowledge base et seront utilisés lors de l'analyse globale pour identifier les incohérences entre tous vos documents business.
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
                  Uploader ({files.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}