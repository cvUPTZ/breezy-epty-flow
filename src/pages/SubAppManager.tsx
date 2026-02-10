import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Trash2, ExternalLink, Package, Loader2, AppWindow } from 'lucide-react';

interface SubApp {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  status: string;
  entry_path: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export default function SubAppManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const { data: subApps = [], isLoading } = useQuery({
    queryKey: ['sub-apps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_apps')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SubApp[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (app: SubApp) => {
      // Delete storage files
      const { data: files } = await supabase.storage
        .from('sub-apps')
        .list(app.storage_path);

      if (files && files.length > 0) {
        const paths = files.map(f => `${app.storage_path}/${f.name}`);
        await supabase.storage.from('sub-apps').remove(paths);
      }

      const { error } = await supabase.from('sub_apps').delete().eq('id', app.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sub-apps'] });
      toast.success('Sub-app supprimée');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !user) return;
    if (!file.name.endsWith('.zip')) {
      toast.error('Veuillez uploader un fichier ZIP');
      return;
    }
    if (!form.name || !form.slug) {
      toast.error('Nom et slug sont requis');
      return;
    }
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      toast.error('Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets');
      return;
    }

    setIsUploading(true);
    try {
      // Read zip file
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);

      const storagePath = `apps/${form.slug}`;
      const files = Object.entries(zip.files).filter(([, f]) => !f.dir);

      // MIME type helper
      const getContentType = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
          'html': 'text/html',
          'css': 'text/css',
          'js': 'application/javascript',
          'json': 'application/json',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'gif': 'image/gif',
          'svg': 'image/svg+xml',
          'ico': 'image/x-icon',
          'txt': 'text/plain',
          'xml': 'text/xml',
          'pdf': 'application/pdf',
          'zip': 'application/zip',
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
      };

      // Upload each file from the zip
      let uploadCount = 0;
      for (const [path, zipFile] of files) {
        const content = await zipFile.async('blob');
        const filePath = `${storagePath}/${path}`;
        const contentType = getContentType(path);

        const { error } = await supabase.storage
          .from('sub-apps')
          .upload(filePath, content, {
            upsert: true,
            contentType: contentType
          });

        if (error) {
          console.error(`Failed to upload ${path}:`, error);
        } else {
          uploadCount++;
        }
      }

      // Detect entry point
      let entryPath = 'index.html';
      const fileNames = files.map(([p]) => p);
      if (!fileNames.includes('index.html')) {
        // Check for index.html in subdirectories
        const indexFile = fileNames.find(f => f.endsWith('/index.html') || f.endsWith('\\index.html'));
        if (indexFile) entryPath = indexFile;
      }

      // Create database record
      const { error: dbError } = await supabase.from('sub_apps').insert({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        storage_path: storagePath,
        entry_path: entryPath,
        uploaded_by: user.id,
      });

      if (dbError) throw dbError;

      toast.success(`Sub-app "${form.name}" uploadée (${uploadCount} fichiers)`);
      setForm({ name: '', slug: '', description: '' });
      setDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sub-apps'] });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Erreur lors de l\'upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sub-Applications</h1>
              <p className="text-muted-foreground">Gérez les applications React intégrées</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  Uploader une app
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Uploader une Sub-Application</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom de l'application</Label>
                    <Input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Mon Application"
                    />
                  </div>
                  <div>
                    <Label>Slug (URL)</Label>
                    <Input
                      value={form.slug}
                      onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                      placeholder="mon-app"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Accessible sur /apps/{form.slug || 'mon-app'}
                    </p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Description de l'application..."
                    />
                  </div>
                  <div>
                    <Label>Fichier ZIP (build React)</Label>
                    <Input ref={fileInputRef} type="file" accept=".zip" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload le dossier dist/ buildé de soccer-controller-log-main en ZIP
                    </p>
                  </div>
                  <Button onClick={handleUpload} disabled={isUploading} className="w-full gap-2">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? 'Upload en cours...' : 'Uploader'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : subApps.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Aucune sub-application</p>
                <p className="text-sm text-muted-foreground">Uploadez votre première app React en ZIP</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subApps.map(app => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AppWindow className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{app.name}</CardTitle>
                      </div>
                      <Badge variant={app.status === 'active' ? 'default' : 'secondary'}>
                        {app.status}
                      </Badge>
                    </div>
                    <CardDescription>{app.description || 'Pas de description'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Route: <code className="bg-muted px-1 rounded">/apps/{app.slug}</code>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Entrée: <code className="bg-muted px-1 rounded">{app.entry_path}</code>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploadé le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                      </p>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" asChild className="gap-1">
                          <a href={`/apps/${app.slug}`} target="_blank" rel="noopener">
                            <ExternalLink className="w-3 h-3" />
                            Ouvrir
                          </a>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => deleteMutation.mutate(app)}
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
