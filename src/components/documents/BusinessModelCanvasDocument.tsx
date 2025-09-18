import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Briefcase, Users, Zap, DollarSign, Key, Heart, MessageSquare, Truck, BarChart2 } from 'lucide-react';

const BusinessModelCanvasDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white text-black">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          body { font-size: 8pt !important; }
          .print\\:break-after-page { page-break-after: always; }
          .print\\:break-before-page { page-break-before: always; }
          .print\\:hidden { display: none !important; }
          .canvas-grid { height: 180mm !important; }
          .canvas-section { font-size: 7pt !important; }
        }
        @media screen {
          .canvas-grid { height: 700px; }
        }
      `}</style>

      {/* Header - Hidden in print */}
      <div className="flex justify-between items-center mb-4 p-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Business Model Canvas</h1>
          <p className="text-gray-600">SportDataAnalytics - Stratégie Révisée</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Imprimer A4
        </Button>
      </div>

      {/* Main Canvas */}
      <div className="canvas-grid grid grid-cols-5 gap-2 mb-8">
        {/* Key Partners */}
        <div className="border-2 border-blue-300 rounded-lg p-2 bg-blue-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <Briefcase className="w-3 h-3 text-blue-600" />
            <h3 className="font-bold text-xs text-blue-800">PARTENAIRES CLÉS</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-white p-2 rounded border">
              <strong className="text-blue-700">Institutionnels</strong>
              <ul className="mt-1 space-y-0.5 text-xs leading-tight">
                <li>• FAF, DTN, LFP</li>
                <li>• Académies FAF</li>
              </ul>
            </div>
            <div className="bg-white p-2 rounded border">
              <strong className="text-blue-700">Technologiques</strong>
              <ul className="mt-1 space-y-0.5 text-xs leading-tight">
                <li>• ISSAL NET (Hébergement)</li>
                <li>• DZSecurity (Backup)</li>
                <li>• ESSTS (Partenariats formation)</li>
              </ul>
            </div>
            <div className="bg-white p-2 rounded border">
              <strong className="text-blue-700">Clubs Pilotes</strong>
              <ul className="mt-1 space-y-0.5 text-xs leading-tight">
                <li>• CR Belouizdad, ES Sétif...</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Activities & Key Resources */}
        <div className="space-y-2 col-span-1">
            <div className="border-2 border-green-300 rounded-lg p-2 bg-green-50 canvas-section h-1/2">
              <div className="flex items-center gap-1 mb-2">
                <Zap className="w-3 h-3 text-green-600" />
                <h3 className="font-bold text-xs text-green-800">ACTIVITÉS CLÉS</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p>• Développement plateforme SaaS B2B conforme</p>
                <p>• Support local & consulting personnalisé</p>
                <p>• Formation et compliance continue</p>
                <p>• Ventes B2B relationnelles</p>
              </div>
            </div>
            <div className="border-2 border-purple-300 rounded-lg p-2 bg-purple-50 canvas-section h-1/2">
              <div className="flex items-center gap-1 mb-2">
                <Key className="w-3 h-3 text-purple-600" />
                <h3 className="font-bold text-xs text-purple-800">RESSOURCES CLÉS</h3>
              </div>
               <div className="space-y-1 text-xs">
                <p>• Plateforme propriétaire conforme</p>
                <p>• Équipe experte locale</p>
                <p>• Conformité légale certifiée (Loi 18-07)</p>
                <p>• Relations institutionnelles</p>
              </div>
            </div>
        </div>

        {/* Value Propositions */}
        <div className="border-4 border-red-400 rounded-lg p-2 bg-red-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-red-800">PROPOSITIONS DE VALEUR</h3>
          </div>
          <div className="space-y-1.5 text-xs text-center">
            <div className="bg-white p-2 rounded border border-red-200">
              <strong className="text-red-800 text-xs">"La seule plateforme d'analyse football 100% conforme Loi 18-07 avec support local premium"</strong>
            </div>
            <ul className="text-left list-disc pl-4 pt-2">
                <li><strong>Conformité garantie</strong> - Hébergement et traitement données exclusivement en Algérie</li>
                <li><strong>Support premium</strong> - Formation sur site, hotline bilingue, account management dédié</li>
                <li><strong>Adaptation culturelle</strong> - Interface AR/FR, compréhension contexte football local</li>
                <li><strong>Pricing accessible</strong> - 75% moins cher que solutions internationales</li>
                <li><strong>Service personnalisé</strong> - Consulting et formation inclus</li>
            </ul>
          </div>
        </div>

        {/* Customer Relationships & Channels */}
        <div className="space-y-2 col-span-1">
            <div className="border-2 border-orange-300 rounded-lg p-2 bg-orange-50 canvas-section h-1/2">
              <div className="flex items-center gap-1 mb-2">
                <MessageSquare className="w-3 h-3 text-orange-600" />
                <h3 className="font-bold text-xs text-orange-800">RELATIONS CLIENTS</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p>• Support premium personnalisé</p>
                <p>• Formation intensive sur site</p>
                <p>• Account management dédié</p>
                <p>• Feedback loops pour développement produit</p>
              </div>
            </div>
            <div className="border-2 border-teal-300 rounded-lg p-2 bg-teal-50 canvas-section h-1/2">
              <div className="flex items-center gap-1 mb-2">
                <Truck className="w-3 h-3 text-teal-600" />
                <h3 className="font-bold text-xs text-teal-800">CANAUX</h3>
              </div>
              <div className="space-y-1 text-xs">
                <p>• Vente Directe Relationnelle (80%)</p>
                <p>• Partenariats Institutionnels (15%)</p>
                <p>• Marketing Digital Ciblé (5%)</p>
              </div>
            </div>
        </div>

        {/* Customer Segments */}
        <div className="border-2 border-indigo-300 rounded-lg p-2 bg-indigo-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <Users className="w-3 h-3 text-indigo-600" />
            <h3 className="font-bold text-xs text-indigo-800">SEGMENTS CLIENTÈLE</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="bg-white p-2 rounded border border-green-300">
              <strong className="text-indigo-800">Clubs Ligue 1 Progressistes</strong>
              <p className="text-xs leading-tight">(4-6 clubs, 60% efforts)</p>
            </div>
            <div className="bg-white p-2 rounded border border-blue-300">
              <strong className="text-indigo-800">Académies FAF</strong>
              <p className="text-xs leading-tight">(3-5 académies, 25% efforts)</p>
            </div>
            <div className="bg-white p-2 rounded border border-purple-300">
              <strong className="text-indigo-800">Ligue 2 Sélective</strong>
              <p className="text-xs leading-tight">(6-8 clubs, 15% efforts)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-2 gap-2">
        {/* Cost Structure */}
        <div className="border-2 border-red-300 rounded-lg p-2 bg-red-50">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-red-800">STRUCTURE DES COÛTS</h3>
          </div>
          <div className="space-y-1 text-xs">
            <p><strong>Année 1 (720k DZD):</strong> Personnel (49%), Marketing (21%), Infrastructure (17%), Opérations (11%)</p>
            <p><strong>Année 5 (1.8M DZD):</strong> Personnel (50%), Marketing (17%), Infrastructure (14%), Opérations (14%)</p>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="border-2 border-green-300 rounded-lg p-2 bg-green-50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h3 className="font-bold text-sm text-green-800">FLUX DE REVENUS</h3>
          </div>
           <div className="space-y-1 text-xs">
            <p>• <strong>Abonnements:</strong> Ligue 1 (150k), Ligue 2 (100k), Académies (75k)</p>
            <p>• <strong>Services:</strong> Analyse de matches, Consulting ponctuel (15-25k)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelCanvasDocument;
