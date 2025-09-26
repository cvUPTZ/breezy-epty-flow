import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Briefcase, Users, Zap, DollarSign, Key, Heart, MessageSquare, Truck, BarChart2 } from 'lucide-react';

const BusinessModelCanvasDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <div className={`border-2 rounded-lg p-2 canvas-section flex flex-col ${className}`}>
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <h3 className="font-bold text-xs">{title}</h3>
      </div>
      <div className="space-y-1 text-xs flex-grow">
        {children}
      </div>
    </div>
  );

  const PhaseTitle: React.FC<{ title: string }> = ({ title }) => <h4 className="font-semibold text-xs mt-1 text-gray-700">{title}</h4>;


  return (
    <div className="max-w-[210mm] mx-auto bg-white text-black font-sans">
      {/* Print Styles */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          body { font-size: 7pt !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .canvas-grid { height: 180mm !important; }
          .canvas-section { border-width: 1px !important; }
        }
        @media screen {
          .canvas-grid { height: 80vh; }
        }
      `}</style>

      <div className="p-4 print:hidden">
        <div className="flex justify-between items-center mb-2">
            <div>
            <h1 className="text-2xl font-bold">Business Model Canvas Révisé (V11.0)</h1>
            <p className="text-gray-600">SportDataAnalytics SARL - Approche Séquentielle Fondée sur les Données</p>
            </div>
            <Button onClick={handleExport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Imprimer A4
            </Button>
        </div>
        <p className="text-xs text-gray-500">Révisions Stratégiques Clés: Abandon des projections "hockey stick", focus sur validation product-market fit, expansion géographique ciblée.</p>
      </div>

      {/* Main Canvas */}
      <div className="canvas-grid grid grid-cols-5 gap-1 p-2">
        <Section title="PARTENAIRES CLÉS" icon={<Briefcase className="w-3 h-3" />} className="border-blue-300 bg-blue-50">
          <PhaseTitle title="Phase 1: Validation Marché Algérien (2025-2027)" />
          <ul className="list-disc pl-3">
            <li><strong>Institutionnels:</strong> FAF, LFP, DTN</li>
            <li><strong>Tech Local:</strong> ISSAL NET, Chargily Pay</li>
            <li><strong>Réseau Formation:</strong> ESSTS, Ex-internationaux</li>
          </ul>
           <PhaseTitle title="Phase 2: Expansion Maghreb Ciblée (Post-2027)" />
          <ul className="list-disc pl-3">
            <li><strong>Fédérations Cibles:</strong> FRMF (Maroc), FTF (Tunisie)</li>
          </ul>
        </Section>

        <div className="flex flex-col gap-1">
          <Section title="ACTIVITÉS CLÉS" icon={<Zap className="w-3 h-3" />} className="border-green-300 bg-green-50 flex-1">
            <PhaseTitle title="Phase 1: Modèle 'High-Touch'" />
            <ul className="list-disc pl-3">
              <li>Développement Produit Focalisé</li>
              <li>Vente Consultative Intensive</li>
              <li>Formation Intégrée Obligatoire</li>
            </ul>
          </Section>
          <Section title="RESSOURCES CLÉS" icon={<Key className="w-3 h-3" />} className="border-purple-300 bg-purple-50 flex-1">
            <PhaseTitle title="Phase 1: Assets Fondamentaux" />
            <ul className="list-disc pl-3">
              <li>Équipe Locale Experte (3p)</li>
              <li>Infrastructure Technique Conforme</li>
              <li>Relations Institutionnelles</li>
            </ul>
          </Section>
        </div>

        <Section title="PROPOSITIONS DE VALEUR" icon={<Heart className="w-4 h-4" />} className="border-red-400 bg-red-50">
          <PhaseTitle title="Phase 1: Clubs Football Algériens" />
          <p className="font-bold">"La seule solution d'analyse qui comprend le football algérien et garantit votre conformité légale"</p>
          <ul className="list-disc pl-3">
            <li>Conformité Juridique Garantie (Loi 25-11)</li>
            <li>Formation Intégrée Obligatoire</li>
            <li>Expertise Football Local (AR/FR)</li>
          </ul>
        </Section>

        <div className="flex flex-col gap-1">
          <Section title="RELATIONS CLIENTS" icon={<MessageSquare className="w-3 h-3" />} className="border-orange-300 bg-orange-50 flex-1">
            <PhaseTitle title="Phase 1: Relations Intensives" />
            <ul className="list-disc pl-3">
              <li>Account Management Dédié</li>
              <li>Formation Présentielle Obligatoire</li>
              <li>Community Building</li>
            </ul>
          </Section>
          <Section title="CANAUX" icon={<Truck className="w-3 h-3" />} className="border-teal-300 bg-teal-50 flex-1">
            <PhaseTitle title="Phase 1: Distribution Directe" />
            <ul className="list-disc pl-3">
              <li>Vente Directe B2B (80%)</li>
              <li>Partenariats Institutionnels (15%)</li>
              <li>Références Inter-Clubs (5%)</li>
            </ul>
          </Section>
        </div>

        <Section title="SEGMENTS CLIENTÈLE" icon={<Users className="w-3 h-3" />} className="border-indigo-300 bg-indigo-50">
           <PhaseTitle title="Phase 1: Marché Total Adressable Validé" />
           <p><strong>Segmentation Bottom-Up:</strong></p>
           <ul className="list-disc pl-3">
               <li>Ligue 1: 16 clubs (ARPU 180k DZD)</li>
               <li>Ligue 2: 32 clubs (ARPU 90k DZD)</li>
               <li>Centres Formation FAF: 8 centres</li>
           </ul>
           <p className="font-bold">SOM réaliste: 15 clubs sur 5 ans</p>
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-1 p-2">
        <Section title="STRUCTURE DES COÛTS" icon={<BarChart2 className="w-4 h-4" />} className="border-gray-400 bg-gray-100">
            <PhaseTitle title="Phase 1: Structure Coûts Fixes Dominante" />
            <p><strong>Total:</strong> 253k DZD/mois (~3M DZD/an)</p>
            <p><strong>Break-even projeté:</strong> Année 4-5 (17-18 clients)</p>
            <ul className="list-disc pl-3">
                <li>Salaires Équipe: 63%</li>
                <li>Infrastructure Tech: 10%</li>
                <li>Marketing & Ventes: 14%</li>
            </ul>
        </Section>
        <Section title="FLUX DE REVENUS" icon={<DollarSign className="w-4 h-4" />} className="border-gray-400 bg-gray-100">
            <PhaseTitle title="Phase 1: Mix Revenus Prévisible" />
            <p><strong>ARR Objectif Année 5:</strong> 2.363M DZD</p>
            <p><strong>Modèle de Pricing:</strong></p>
            <ul className="list-disc pl-3">
                <li>Basic: 6k DZD/mois</li>
                <li>Professional: 12k DZD/mois</li>
                <li>Premium: 18k DZD/mois</li>
            </ul>
        </Section>
      </div>
    </div>
  );
};

export default BusinessModelCanvasDocument;
