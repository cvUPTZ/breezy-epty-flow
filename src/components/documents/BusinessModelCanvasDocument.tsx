import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Briefcase, Users, Zap, DollarSign, Key, Heart, MessageSquare, Truck, BarChart2 } from 'lucide-react';

/**
 * @component BusinessModelCanvasA4
 * @description Business Model Canvas optimized for A4 print layout
 * Based on SportDataAnalytics comprehensive business plan
 */
const BusinessModelCanvasDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="max-w-[210mm] mx-auto bg-white text-black">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
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
          <p className="text-gray-600">SportDataAnalytics - Plateforme d'Analyse Football Algérien</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Imprimer A4
        </Button>
      </div>

      {/* Title Page */}
      <div className="text-center p-8 mb-8 border-2 border-gray-200 print:mb-0 print:break-after-page">
        <Briefcase className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h1 className="text-3xl font-bold mb-2">BUSINESS MODEL CANVAS</h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-blue-600 mb-2">SportDataAnalytics</h2>
        <h3 className="text-lg text-gray-700 mb-4">Plateforme d'Analyse Sportive - Football Algérien</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Forme Juridique:</strong> SARL</p>
          <p><strong>Secteur:</strong> Technologies Sportives (SportTech)</p>
          <p><strong>Marché:</strong> Algérie & Expansion Maghreb</p>
          <p><strong>Version:</strong> 2.0 - {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="canvas-grid grid grid-cols-5 gap-2 mb-8 print:break-before-page">
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
                <li>• FAF (Fédération Algérienne)</li>
                <li>• DTN (Direction Technique)</li>
                <li>• LFP (Ligue Professionnelle)</li>
                <li>• Académies FAF officielles</li>
              </ul>
            </div>
            <div className="bg-white p-2 rounded border">
              <strong className="text-blue-700">Technologiques</strong>
              <ul className="mt-1 space-y-0.5 text-xs leading-tight">
                <li>• ISSAL NET (hébergement local)</li>
                <li>• DZSecurity (backup)</li>
                <li>• Chargily (paiements DZ)</li>
                <li>• ESSTS (formation)</li>
              </ul>
            </div>
            <div className="bg-white p-2 rounded border">
              <strong className="text-blue-700">Clubs Pilotes</strong>
              <ul className="mt-1 space-y-0.5 text-xs leading-tight">
                <li>• CR Belouizdad</li>
                <li>• ES Sétif</li>
                <li>• Centres formation privés</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Activities */}
        <div className="border-2 border-green-300 rounded-lg p-2 bg-green-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <Zap className="w-3 h-3 text-green-600" />
            <h3 className="font-bold text-xs text-green-800">ACTIVITÉS CLÉS</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-green-700">Développement Plateforme</strong>
              <p className="text-xs mt-0.5">SaaS B2B, collaboration temps réel, IA analyse tactique</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-green-700">Collecte & Tracking</strong>
              <p className="text-xs mt-0.5">Équipe trackers formés, données matches temps réel</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-green-700">Support & Formation</strong>
              <p className="text-xs mt-0.5">Onboarding clients, formation terrain, hotline 24/7</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-green-700">Ventes B2B</strong>
              <p className="text-xs mt-0.5">Prospection clubs, partenariats institutionnels</p>
            </div>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="border-4 border-red-400 rounded-lg p-2 bg-red-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <Heart className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-red-800">PROPOSITIONS DE VALEUR</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="bg-white p-2 rounded border border-red-200">
              <strong className="text-red-800 text-xs">100% Locale & Conforme</strong>
              <p className="text-xs mt-0.5">Seule plateforme respectant Loi 18-07, hébergement algérien, support local</p>
            </div>
            
            <div className="bg-white p-2 rounded border border-red-200">
              <strong className="text-red-800 text-xs">Collaboration Temps Réel</strong>
              <p className="text-xs mt-0.5">Première solution multi-analystes synchronisée sur même match</p>
            </div>
            
            <div className="bg-white p-2 rounded border border-red-200">
              <strong className="text-red-800 text-xs">Prix Accessible</strong>
              <p className="text-xs mt-0.5">60-180k DZD vs 30-100k€ solutions internationales (-80%)</p>
            </div>
            
            <div className="bg-white p-2 rounded border border-red-200">
              <strong className="text-red-800 text-xs">Expertise Football Local</strong>
              <p className="text-xs mt-0.5">Compréhension tactique, formation sur site, support AR/FR</p>
            </div>
            
            <div className="bg-white p-2 rounded border border-red-200">
              <strong className="text-red-800 text-xs">Transparence & Intégrité</strong>
              <p className="text-xs mt-0.5">Outil anti-corruption, audit trail, données objectives</p>
            </div>
          </div>
        </div>

        {/* Customer Relationships */}
        <div className="border-2 border-orange-300 rounded-lg p-2 bg-orange-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <MessageSquare className="w-3 h-3 text-orange-600" />
            <h3 className="font-bold text-xs text-orange-800">RELATIONS CLIENTS</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-orange-700">Support Dédié Premium</strong>
              <p className="text-xs mt-0.5">Account managers, hotline 24/7, intervention sur site</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-orange-700">Formation Continue</strong>
              <p className="text-xs mt-0.5">Onboarding 30-60-90 jours, webinaires, certification</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-orange-700">Partnership Institutionnel</strong>
              <p className="text-xs mt-0.5">Relation privilégiée FAF, co-développement features</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-orange-700">Communauté Utilisateurs</strong>
              <p className="text-xs mt-0.5">Forums, best practices, événements sectoriels</p>
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
              <strong className="text-indigo-800">Clubs Ligue 1</strong>
              <ul className="mt-0.5 space-y-0.5 text-xs leading-tight">
                <li>• 16 clubs (priorité absolue)</li>
                <li>• Budget: 500M-2Mrd DZD</li>
                <li>• Tarif: 180k DZD/an</li>
                <li>• Pénétration cible: 88% An5</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border border-blue-300">
              <strong className="text-indigo-800">Clubs Ligue 2</strong>
              <ul className="mt-0.5 space-y-0.5 text-xs leading-tight">
                <li>• 18 clubs professionnels</li>
                <li>• Budget: 200M-800M DZD</li>
                <li>• Tarif: 120k DZD/an</li>
                <li>• Pénétration cible: 78% An5</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border border-purple-300">
              <strong className="text-indigo-800">Académies FAF</strong>
              <ul className="mt-0.5 space-y-0.5 text-xs leading-tight">
                <li>• 10+ centres formation officiels</li>
                <li>• Tarif préférentiel: 90k DZD/an</li>
                <li>• Intégration cursus formation</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border border-orange-300">
              <strong className="text-indigo-800">Académies Privées</strong>
              <ul className="mt-0.5 space-y-0.5 text-xs leading-tight">
                <li>• 200+ centres émergents</li>
                <li>• Version simplifiée: 60k DZD/an</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Resources */}
        <div className="border-2 border-purple-300 rounded-lg p-2 bg-purple-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <Key className="w-3 h-3 text-purple-600" />
            <h3 className="font-bold text-xs text-purple-800">RESSOURCES CLÉS</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-purple-700">Plateforme Propriétaire</strong>
              <p className="text-xs mt-0.5">Code source, architecture collaborative, algorithmes IA</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-purple-700">Équipe Experte</strong>
              <p className="text-xs mt-0.5">CTO senior, experts football, équipe commerciale B2B</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-purple-700">Réseau Trackers</strong>
              <p className="text-xs mt-0.5">Analystes formés, coordinateurs régionaux, expertise terrain</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-purple-700">Conformité & Partenariats</strong>
              <p className="text-xs mt-0.5">Certification Loi 18-07, accords FAF exclusifs</p>
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="border-2 border-teal-300 rounded-lg p-2 bg-teal-50 canvas-section">
          <div className="flex items-center gap-1 mb-2">
            <Truck className="w-3 h-3 text-teal-600" />
            <h3 className="font-bold text-xs text-teal-800">CANAUX</h3>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-teal-700">Vente Directe B2B (70%)</strong>
              <p className="text-xs mt-0.5">Équipe commerciale, cycle 3-6 mois, démos sur site</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-teal-700">Endorsement FAF/DTN (20%)</strong>
              <p className="text-xs mt-0.5">Recommandation officielle, programmes formation</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-teal-700">Marketing Digital (10%)</strong>
              <p className="text-xs mt-0.5">LinkedIn B2B, content marketing, SEO spécialisé</p>
            </div>
            <div className="bg-white p-1.5 rounded border">
              <strong className="text-teal-700">Partenaires & Références</strong>
              <p className="text-xs mt-0.5">Réseau prescripteurs, bouche-à-oreille clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-2 gap-4 mb-8 print:break-before-page">
        {/* Cost Structure */}
        <div className="border-2 border-red-300 rounded-lg p-3 bg-red-50">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 className="w-4 h-4 text-red-600" />
            <h3 className="font-bold text-sm text-red-800">STRUCTURE DES COÛTS</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-white p-2 rounded border">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-red-800">Personnel & Développement</strong>
                <span className="text-red-600 font-bold">40%</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>• Équipe technique: CTO + 4 developers</li>
                <li>• Salaires management & ops</li>
                <li>• Formation continue équipe</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-red-800">Operations & Trackers</strong>
                <span className="text-red-600 font-bold">25%</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>• Réseau trackers (241k DZD/mois)</li>
                <li>• Coordination régionale</li>
                <li>• Formation & certification</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-red-800">Marketing & Commercial</strong>
                <span className="text-red-600 font-bold">20%</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>• Équipe commerciale B2B</li>
                <li>• Marketing digital & événements</li>
                <li>• Relations presse</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-red-800">Technologie & Infrastructure</strong>
                <span className="text-red-600 font-bold">15%</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>• Hébergement ISSAL NET + DZSecurity</li>
                <li>• Licences logicielles & outils</li>
                <li>• Sécurité & conformité</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="border-2 border-green-300 rounded-lg p-3 bg-green-50">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-green-600" />
            <h3 className="font-bold text-sm text-green-800">FLUX DE REVENUS</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="bg-white p-2 rounded border">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-green-800">Abonnements SaaS B2B</strong>
                <span className="text-green-600 font-bold">85%</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>• Ligue 1: 180k DZD/an par club</li>
                <li>• Ligue 2: 120k DZD/an par club</li>
                <li>• Académies FAF: 90k DZD/an</li>
                <li>• Académies privées: 60k DZD/an</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-green-800">Services Premium</strong>
                <span className="text-green-600 font-bold">10%</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>• Formation & certification: 20k DZD</li>
                <li>• Consulting tactique personnalisé</li>
                <li>• Audit intégrité: 15k DZD/mois</li>
              </ul>
            </div>
            
            <div className="bg-white p-2 rounded border">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-green-800">Développements Sur Mesure</strong>
                <span className="text-green-600 font-bold">5%</span>
              </div>
              <ul className="space-y-0.5 text-xs text-gray-600">
                <li>• Customisations spécifiques: 50k+ DZD</li>
                <li>• Intégrations API tierces</li>
                <li>• Modules spécialisés académies</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-white rounded border-2 border-green-400">
            <div className="text-center">
              <div className="text-lg font-bold text-green-800">11,04M DZD</div>
              <div className="text-xs text-green-600">Chiffre d'Affaires Projeté Année 5</div>
              <div className="text-xs text-green-600">Marge EBITDA: 46%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics & Analysis */}
      <Card className="mb-4 print:break-before-page">
        <CardHeader>
          <CardTitle className="text-lg">Métriques Clés & Analyse Stratégique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">KPIs Financiers</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>MRR Année 1:</span>
                    <strong>230k DZD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>MRR Année 5:</span>
                    <strong>920k DZD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CAC Moyen:</span>
                    <strong>18k DZD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>LTV Moyen:</span>
                    <strong>450k DZD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio LTV/CAC:</span>
                    <strong>25:1</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Payback Period:</span>
                    <strong>2-3 mois</strong>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Avantages Concurrentiels</h4>
                <ul className="space-y-0.5 text-xs">
                  <li>• <strong>Premier entrant:</strong> Avantage pionnier sur marché vierge</li>
                  <li>• <strong>Conformité légale:</strong> Seule solution respectant Loi 18-07</li>
                  <li>• <strong>Partenariats exclusifs:</strong> Relations privilégiées FAF/DTN</li>
                  <li>• <strong>Expertise locale:</strong> Compréhension football algérien</li>
                  <li>• <strong>Barrière prix:</strong> 80% moins cher que solutions internationales</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-orange-50 p-3 rounded border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">Plan de Croissance</h4>
                <div className="space-y-2">
                  <div>
                    <strong className="text-orange-700">Phase 1 (An 1):</strong>
                    <p>Validation Product-Market Fit, 3 clubs pilotes, MVP fonctionnel</p>
                  </div>
                  <div>
                    <strong className="text-orange-700">Phase 2 (An 2-3):</strong>
                    <p>Pénétration marché local, 8 clubs L1, endorsement FAF officiel</p>
                  </div>
                  <div>
                    <strong className="text-orange-700">Phase 3 (An 4-5):</strong>
                    <p>Domination marché algérien, préparation expansion Maghreb</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Financement & Exit</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Série A Requise:</span>
                    <strong>5M DZD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Break-even:</span>
                    <strong>Mois 18</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI Projeté (5 ans):</span>
                    <strong>300%+</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Valorisation Exit:</span>
                    <strong>80-150M DZD</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Multiple Revenue:</span>
                    <strong>15-25x</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center p-4 text-gray-600 border-t text-xs">
        <p>
          <strong>SportDataAnalytics SARL</strong> - Business Model Canvas v2.0 - Confidentiel<br/>
          Plateforme d'Analyse Sportive pour le Football Algérien - Siège: Alger, Algérie<br/>
          © 2025 - Tous droits réservés - Document propriétaire
        </p>
      </div>
    </div>
  );
};

export default BusinessModelCanvasDocument;
