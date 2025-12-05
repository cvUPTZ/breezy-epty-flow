import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Lightbulb, 
  BarChart3,
  Building2,
  Briefcase,
  Award,
  Globe,
  Layers,
  Heart,
  Handshake,
  Truck,
  PiggyBank,
  Activity
} from 'lucide-react';

interface DocumentRendererProps {
  documentType: string;
  content: any;
  title: string;
}

export function DocumentRenderer({ documentType, content, title }: DocumentRendererProps) {
  switch (documentType) {
    case 'business_plan':
      return <BusinessPlanRenderer content={content} title={title} />;
    case 'business_model_canvas':
      return <BusinessModelCanvasRenderer content={content} title={title} />;
    case 'market_study':
      return <MarketStudyRenderer content={content} title={title} />;
    default:
      return <GenericDocumentRenderer content={content} title={title} />;
  }
}

// Business Plan Renderer
function BusinessPlanRenderer({ content, title }: { content: any; title: string }) {
  const sections = [
    { key: 'executiveSummary', title: 'Résumé Exécutif', icon: Award },
    { key: 'companyDescription', title: 'Description de l\'Entreprise', icon: Building2 },
    { key: 'productsServices', title: 'Produits & Services', icon: Layers },
    { key: 'marketAnalysis', title: 'Analyse de Marché', icon: TrendingUp },
    { key: 'competitiveAnalysis', title: 'Analyse Concurrentielle', icon: Target },
    { key: 'marketingStrategy', title: 'Stratégie Marketing', icon: Globe },
    { key: 'operationalPlan', title: 'Plan Opérationnel', icon: Briefcase },
    { key: 'managementTeam', title: 'Équipe de Direction', icon: Users },
    { key: 'financialProjections', title: 'Projections Financières', icon: DollarSign },
    { key: 'fundingRequirements', title: 'Besoins de Financement', icon: PiggyBank },
  ];

  return (
    <div className="space-y-8 p-6 bg-background">
      {/* Document Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <Badge variant="outline" className="text-sm">Business Plan</Badge>
        {content.finalizedAt && (
          <p className="text-sm text-muted-foreground mt-2">
            Finalisé le {new Date(content.finalizedAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>

      {/* Table of Contents */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h2 className="font-semibold mb-3 text-lg">Table des Matières</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          {sections.map((section, i) => (
            content[section.key] && (
              <li key={section.key} className="hover:text-foreground cursor-pointer">
                {section.title}
              </li>
            )
          ))}
        </ol>
      </div>

      {/* Sections */}
      {sections.map((section, index) => {
        const sectionContent = content[section.key];
        if (!sectionContent) return null;

        const Icon = section.icon;
        return (
          <section key={section.key} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {index + 1}. {section.title}
              </h2>
            </div>
            <div className="pl-13 ml-5 border-l-2 border-muted pl-6">
              <RenderContent content={sectionContent} />
            </div>
          </section>
        );
      })}

      {/* Applied Changes Summary */}
      {content.appliedChanges && content.appliedChanges.length > 0 && (
        <section className="mt-8 bg-success/5 border border-success/20 rounded-lg p-4">
          <h3 className="font-semibold text-success mb-2">Modifications Appliquées</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {content.appliedChanges.map((change: string, i: number) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// Business Model Canvas Renderer
function BusinessModelCanvasRenderer({ content, title }: { content: any; title: string }) {
  const canvasBlocks = [
    { key: 'keyPartners', title: 'Partenaires Clés', icon: Handshake, color: 'bg-purple-500/10 border-purple-500/30' },
    { key: 'keyActivities', title: 'Activités Clés', icon: Activity, color: 'bg-blue-500/10 border-blue-500/30' },
    { key: 'keyResources', title: 'Ressources Clés', icon: Layers, color: 'bg-blue-500/10 border-blue-500/30' },
    { key: 'valuePropositions', title: 'Propositions de Valeur', icon: Heart, color: 'bg-red-500/10 border-red-500/30' },
    { key: 'customerRelationships', title: 'Relations Clients', icon: Users, color: 'bg-green-500/10 border-green-500/30' },
    { key: 'channels', title: 'Canaux', icon: Truck, color: 'bg-green-500/10 border-green-500/30' },
    { key: 'customerSegments', title: 'Segments Clients', icon: Target, color: 'bg-orange-500/10 border-orange-500/30' },
    { key: 'costStructure', title: 'Structure des Coûts', icon: PiggyBank, color: 'bg-amber-500/10 border-amber-500/30' },
    { key: 'revenueStreams', title: 'Sources de Revenus', icon: DollarSign, color: 'bg-emerald-500/10 border-emerald-500/30' },
  ];

  return (
    <div className="space-y-8 p-6 bg-background">
      {/* Document Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <Badge variant="outline" className="text-sm">Business Model Canvas</Badge>
        {content.finalizedAt && (
          <p className="text-sm text-muted-foreground mt-2">
            Finalisé le {new Date(content.finalizedAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {canvasBlocks.slice(0, 7).map((block) => {
          const blockContent = content[block.key];
          if (!blockContent) return null;

          const Icon = block.icon;
          return (
            <div 
              key={block.key} 
              className={`rounded-lg border p-4 ${block.color}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-5 w-5" />
                <h3 className="font-semibold">{block.title}</h3>
              </div>
              <div className="text-sm space-y-2">
                <RenderCanvasContent content={blockContent} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row - Cost & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {canvasBlocks.slice(7).map((block) => {
          const blockContent = content[block.key];
          if (!blockContent) return null;

          const Icon = block.icon;
          return (
            <div 
              key={block.key} 
              className={`rounded-lg border p-4 ${block.color}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-5 w-5" />
                <h3 className="font-semibold">{block.title}</h3>
              </div>
              <div className="text-sm space-y-2">
                <RenderCanvasContent content={blockContent} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Applied Changes Summary */}
      {content.appliedChanges && content.appliedChanges.length > 0 && (
        <section className="mt-8 bg-success/5 border border-success/20 rounded-lg p-4">
          <h3 className="font-semibold text-success mb-2">Modifications Appliquées</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {content.appliedChanges.map((change: string, i: number) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// Market Study Renderer
function MarketStudyRenderer({ content, title }: { content: any; title: string }) {
  const sections = [
    { key: 'introduction', title: 'Introduction', icon: Lightbulb },
    { key: 'marketOverview', title: 'Vue d\'Ensemble du Marché', icon: Globe },
    { key: 'marketSize', title: 'Taille du Marché', icon: BarChart3 },
    { key: 'targetAudience', title: 'Public Cible', icon: Users },
    { key: 'competitorAnalysis', title: 'Analyse des Concurrents', icon: Target },
    { key: 'trends', title: 'Tendances du Marché', icon: TrendingUp },
    { key: 'opportunities', title: 'Opportunités', icon: Award },
    { key: 'threats', title: 'Menaces', icon: Activity },
    { key: 'recommendations', title: 'Recommandations', icon: Briefcase },
    { key: 'conclusion', title: 'Conclusion', icon: DollarSign },
  ];

  return (
    <div className="space-y-8 p-6 bg-background">
      {/* Document Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        <Badge variant="outline" className="text-sm">Étude de Marché</Badge>
        {content.finalizedAt && (
          <p className="text-sm text-muted-foreground mt-2">
            Finalisé le {new Date(content.finalizedAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>

      {/* Executive Summary if available */}
      {content.executiveSummary && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Synthèse
          </h2>
          <p className="text-muted-foreground leading-relaxed">{content.executiveSummary}</p>
        </div>
      )}

      {/* Key Metrics */}
      {(content.tam || content.sam || content.som) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.tam && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(content.tam)}</div>
              <div className="text-sm text-muted-foreground">TAM (Total Addressable Market)</div>
            </div>
          )}
          {content.sam && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(content.sam)}</div>
              <div className="text-sm text-muted-foreground">SAM (Serviceable Addressable Market)</div>
            </div>
          )}
          {content.som && (
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary">{formatCurrency(content.som)}</div>
              <div className="text-sm text-muted-foreground">SOM (Serviceable Obtainable Market)</div>
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      {sections.map((section, index) => {
        const sectionContent = content[section.key];
        if (!sectionContent) return null;

        const Icon = section.icon;
        return (
          <section key={section.key} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {section.title}
              </h2>
            </div>
            <div className="pl-13 ml-5 border-l-2 border-muted pl-6">
              <RenderContent content={sectionContent} />
            </div>
          </section>
        );
      })}

      {/* Applied Changes Summary */}
      {content.appliedChanges && content.appliedChanges.length > 0 && (
        <section className="mt-8 bg-success/5 border border-success/20 rounded-lg p-4">
          <h3 className="font-semibold text-success mb-2">Modifications Appliquées</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {content.appliedChanges.map((change: string, i: number) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// Generic Document Renderer
function GenericDocumentRenderer({ content, title }: { content: any; title: string }) {
  return (
    <div className="space-y-6 p-6 bg-background">
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
        {content.finalizedAt && (
          <p className="text-sm text-muted-foreground mt-2">
            Finalisé le {new Date(content.finalizedAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
      <RenderContent content={content} />
    </div>
  );
}

// Helper Components
function RenderContent({ content }: { content: any }) {
  if (typeof content === 'string') {
    return <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-2">
        {content.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary mt-1.5">•</span>
            <span className="text-muted-foreground">
              {typeof item === 'string' ? item : <RenderContent content={item} />}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof content === 'object' && content !== null) {
    // Skip internal fields
    const skipFields = ['analysis', 'previousVersions', 'finalizedAt', 'lastFinalized', 'appliedChanges', 'coherenceScore', 'finalizationSummary'];
    
    return (
      <div className="space-y-4">
        {Object.entries(content)
          .filter(([key]) => !skipFields.includes(key))
          .map(([key, value]) => {
            if (value === null || value === undefined) return null;
            
            const formattedKey = key
              .replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .trim();

            return (
              <div key={key} className="space-y-1">
                <h4 className="font-medium text-foreground">{formattedKey}</h4>
                <RenderContent content={value} />
              </div>
            );
          })}
      </div>
    );
  }

  return <span className="text-muted-foreground">{String(content)}</span>;
}

function RenderCanvasContent({ content }: { content: any }) {
  if (typeof content === 'string') {
    return <p className="text-muted-foreground">{content}</p>;
  }

  if (Array.isArray(content)) {
    return (
      <ul className="space-y-1">
        {content.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof content === 'object' && content !== null) {
    return (
      <div className="space-y-2">
        {Object.entries(content).map(([key, value]) => (
          <div key={key}>
            <span className="font-medium">{key}: </span>
            <span className="text-muted-foreground">
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(content)}</span>;
}

function formatCurrency(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return String(value);
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B €`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M €`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K €`;
  }
  return `${num.toFixed(0)} €`;
}
