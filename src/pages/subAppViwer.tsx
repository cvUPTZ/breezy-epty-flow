import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertCircle, ExternalLink } from 'lucide-react';

interface SubApp {
  id: string;
  name: string;
  slug: string;
  status: string;
  entry_path: string;
  storage_path: string;
}

export default function SubAppViewer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: app, isLoading, error } = useQuery({
    queryKey: ['sub-app', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_apps')
        .select('*')
        .eq('slug', slug!)
        .eq('status', 'active')
        .single();
      if (error) throw error;
      return data as SubApp;
    },
    enabled: !!slug,
  });

  const iframeSrc = app
    ? `${supabase.storage.from('sub-apps').getPublicUrl(`${app.storage_path}/${app.entry_path}`).data.publicUrl}?t=${new Date().getTime()}`
    : '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold">Application introuvable</h2>
        <p className="text-muted-foreground">La sub-application "{slug}" n'existe pas ou est inactive.</p>
        <Button onClick={() => navigate('/admin/sub-apps')} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour au gestionnaire
        </Button>
      </div>
    );
  }

  console.log('Loading sub-app:', app.name, 'from:', iframeSrc);

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-2 border-b bg-card">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="h-4 w-px bg-border" />
        <span className="font-medium text-sm">{app.name}</span>
        <span className="ml-auto text-[10px] text-muted-foreground bg-secondary px-1 rounded mr-2">ver 2.6</span>
        <Button
          size="sm"
          onClick={() => window.open(iframeSrc, '_blank', 'noopener,noreferrer')}
          className="gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Lancer l'application (Plein écran)
        </Button>
      </div>

      <div className="flex-1 relative">
        <iframe
          src={iframeSrc}
          className="w-full h-full border-0"
          title={app.name}
        />
        {/* Overlay helper for Lovable environment */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-12 bg-background/5 text-center">
          <div className="pointer-events-auto bg-card p-6 border rounded-lg shadow-xl max-w-md space-y-4">
            <h3 className="font-bold text-lg">Problème d'affichage ?</h3>
            <p className="text-sm text-muted-foreground">
              Certaines fonctionnalités (scripts, authentification) peuvent être bloquées dans cet aperçu.
            </p>
            <Button
              className="w-full gap-2"
              onClick={() => window.open(iframeSrc, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir dans un nouvel onglet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
