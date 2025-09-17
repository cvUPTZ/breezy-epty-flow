import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Briefcase, Users, Zap, DollarSign, Key, Heart, MessageSquare, Truck, BarChart2 } from 'lucide-react';

/**
 * @component BusinessModelCanvasDocument
 * @description Professional Business Model Canvas document formatted for Word export
 * Complete canvas with detailed analysis for SportDataAnalytics
 */
const BusinessModelCanvasDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-background">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Business Model Canvas</h1>
          <p className="text-muted-foreground">Modèle d'affaires SportDataAnalytics</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter vers Word
        </Button>
      </div>

      <div className="space-y-8 print:space-y-6">
        {/* Page de titre */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-12 text-center">
            <div className="space-y-8">
              <Briefcase className="w-24 h-24 mx-auto text-primary" />
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight">BUSINESS MODEL CANVAS</h1>
                <div className="w-40 h-1 bg-primary mx-auto"></div>
                <h2 className="text-3xl font-semibold text-primary">SportDataAnalytics</h2>
                <h3 className="text-xl text-muted-foreground">
                  Plateforme Collaborative d'Analyse Football
                </h3>
                <h4 className="text-lg">Canevas Stratégique et Opérationnel</h4>
              </div>
              <div className="mt-16 space-y-3 text-muted-foreground">
                <p className="text-lg"><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
                <p><strong>Version:</strong> 2.0</p>
                <p><strong>Marché:</strong> Algérie et Maghreb</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Canvas Principal */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Business Model Canvas - Vue d'Ensemble</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 h-[800px]">
              {/* Colonne 1 - Partenaires Clés */}
              <div className="row-span-2 border-2 border-primary/20 rounded-lg p-4 bg-gradient-to-b from-blue-50 to-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-primary">Partenaires Clés</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <strong className="text-blue-800">Institutionnels</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• FAF (Fédération Algérienne Football)</li>
                      <li>• DTN (Direction Technique Nationale)</li>
                      <li>• LFP (Ligue Football Professionnel)</li>
                      <li>• ANEF (Association Entraîneurs)</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <strong className="text-blue-800">Clubs Pilotes</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Clubs Ligue 1 innovants</li>
                      <li>• Académies FAF officielles</li>
                      <li>• Centres formation privés</li>
                    </ul>
                  </div>
                  <div className="bg-white p-3 rounded shadow-sm">
                    <strong className="text-blue-800">Technologiques</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• ISSAL NET (hébergement local)</li>
                      <li>• Supabase (infrastructure)</li>
                      <li>• LiveKit (communication)</li>
                      <li>• Chargily (paiements DZ)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Colonne 2 - Activités et Ressources */}
              <div className="space-y-4">
                {/* Activités Clés */}
                <div className="border-2 border-green-300 rounded-lg p-4 bg-gradient-to-b from-green-50 to-green-100 h-[380px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-lg text-green-600">Activités Clés</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-green-800">Développement R&D</strong>
                      <p className="text-xs mt-1">Plateforme SaaS collaborative, IA analyse tactique</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-green-800">Support & Formation</strong>
                      <p className="text-xs mt-1">Onboarding clients, formation terrain, hotline</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-green-800">Collecte Données</strong>
                      <p className="text-xs mt-1">Enrichissement base événements, veille tactique</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-green-800">Ventes & Marketing</strong>
                      <p className="text-xs mt-1">Prospection B2B, événements sectoriels, content</p>
                    </div>
                  </div>
                </div>

                {/* Ressources Clés */}
                <div className="border-2 border-purple-300 rounded-lg p-4 bg-gradient-to-b from-purple-50 to-purple-100 h-[380px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Key className="w-5 h-5 text-purple-600" />
                    <h3 className="font-bold text-lg text-purple-600">Ressources Clés</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-purple-800">Plateforme Technique</strong>
                      <p className="text-xs mt-1">Code propriétaire, architecture collaborative, sécurité</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-purple-800">Équipe Experte</strong>
                      <p className="text-xs mt-1">Développeurs senior, experts football, business dev</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-purple-800">Réseau Trackers</strong>
                      <p className="text-xs mt-1">Analystes formés, réseau terrain, expertise locale</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-purple-800">Partenariats Exclusifs</strong>
                      <p className="text-xs mt-1">Accords FAF, clubs partenaires, barrières entrée</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne 3 - Proposition de Valeur */}
              <div className="row-span-2 border-4 border-red-400 rounded-lg p-4 bg-gradient-to-b from-red-50 to-red-100">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-6 h-6 text-red-600" />
                  <h3 className="font-bold text-xl text-red-600">Propositions de Valeur</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400">
                    <strong className="text-red-800 text-base">Solution 100% Locale & Conforme</strong>
                    <p className="text-xs mt-2 text-gray-700">Seule plateforme respectant intégralement la Loi 18-07 sur les données personnelles. Hébergement et support entièrement algériens.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400">
                    <strong className="text-red-800 text-base">Première Collaboration Temps Réel</strong>
                    <p className="text-xs mt-2 text-gray-700">Unique plateforme permettant à plusieurs analystes de travailler simultanément sur le même match avec synchronisation parfaite.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400">
                    <strong className="text-red-800 text-base">Alternative Accessible</strong>
                    <p className="text-xs mt-2 text-gray-700">Tarifs adaptés au marché local, 80% moins cher que les solutions internationales (Hudl, Wyscout, InStat).</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400">
                    <strong className="text-red-800 text-base">Support Terrain & Expertise</strong>
                    <p className="text-xs mt-2 text-gray-700">Formation sur site, support en arabe/français, compréhension profonde du football algérien et maghrébin.</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-400">
                    <strong className="text-red-800 text-base">Outil de Transparence</strong>
                    <p className="text-xs mt-2 text-gray-700">Données objectives pour lutter contre l'arbitraire, mécanismes d'audit, traçabilité complète des analyses.</p>
                  </div>
                </div>
              </div>

              {/* Colonne 4 - Relations et Canaux */}
              <div className="space-y-4">
                {/* Relations Clients */}
                <div className="border-2 border-orange-300 rounded-lg p-4 bg-gradient-to-b from-orange-50 to-orange-100 h-[380px]">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <h3 className="font-bold text-lg text-orange-600">Relations Clients</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-orange-800">Support Dédié Premium</strong>
                      <p className="text-xs mt-1">Account managers, hotline 24/7, intervention sur site</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-orange-800">Formation Continue</strong>
                      <p className="text-xs mt-1">Onboarding personnalisé, webinaires, certification</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-orange-800">Partenariats Institutionnels</strong>
                      <p className="text-xs mt-1">Relation privilégiée FAF, co-développement produits</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-orange-800">Communauté Utilisateurs</strong>
                      <p className="text-xs mt-1">Forums, échanges bonnes pratiques, événements</p>
                    </div>
                  </div>
                </div>

                {/* Canaux */}
                <div className="border-2 border-teal-300 rounded-lg p-4 bg-gradient-to-b from-teal-50 to-teal-100 h-[380px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-teal-600" />
                    <h3 className="font-bold text-lg text-teal-600">Canaux</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-teal-800">Vente Directe B2B</strong>
                      <p className="text-xs mt-1">Équipe commerciale, démos sur site, négociation directe</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-teal-800">Endorsement FAF/DTN</strong>
                      <p className="text-xs mt-1">Recommandation officielle, intégration programmes</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-teal-800">Marketing Digital Ciblé</strong>
                      <p className="text-xs mt-1">LinkedIn B2B, content marketing, SEO spécialisé</p>
                    </div>
                    <div className="bg-white p-2 rounded shadow-sm">
                      <strong className="text-teal-800">Réseau Partenaires</strong>
                      <p className="text-xs mt-1">Revendeurs locaux, consultants sport, prescripteurs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colonne 5 - Segments Clients */}
              <div className="row-span-2 border-2 border-indigo-300 rounded-lg p-4 bg-gradient-to-b from-indigo-50 to-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-lg text-indigo-600">Segments de Clientèle</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded shadow-sm border-l-4 border-green-400">
                    <strong className="text-indigo-800">Clubs Professionnels</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• 16 clubs Ligue 1 (priorité)</li>
                      <li>• 26 clubs Ligue 2</li>
                      <li>• Budgets: 50M-500M DZD</li>
                      <li>• Besoins: analyse pro complète</li>
                    </ul>
                    <div className="mt-2 text-xs bg-green-100 p-1 rounded">
                      <strong>Potentiel:</strong> €450K/an
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm border-l-4 border-blue-400">
                    <strong className="text-indigo-800">Académies FAF</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• 15+ centres formation officiels</li>
                      <li>• Focus développement jeunes</li>
                      <li>• Tarifs éducation préférentiels</li>
                      <li>• Intégration cursus formation</li>
                    </ul>
                    <div className="mt-2 text-xs bg-blue-100 p-1 rounded">
                      <strong>Potentiel:</strong> €140K/an
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm border-l-4 border-purple-400">
                    <strong className="text-indigo-800">Académies Privées</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Centres formation émergents</li>
                      <li>• Investisseurs privés football</li>
                      <li>• Besoins différenciation</li>
                      <li>• Croissance rapide segment</li>
                    </ul>
                    <div className="mt-2 text-xs bg-purple-100 p-1 rounded">
                      <strong>Potentiel:</strong> €80K/an
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm border-l-4 border-orange-400">
                    <strong className="text-indigo-800">Médias & Analystes</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Journalistes sportifs</li>
                      <li>• Consultants TV/Radio</li>
                      <li>• Analystes indépendants</li>
                      <li>• Influenceurs football</li>
                    </ul>
                    <div className="mt-2 text-xs bg-orange-100 p-1 rounded">
                      <strong>Potentiel:</strong> €65K/an
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Structure des Coûts et Flux de Revenus */}
        <Card className="print:break-before-page">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-6 h-[400px]">
              {/* Structure des Coûts */}
              <div className="border-2 border-red-300 rounded-lg p-4 bg-gradient-to-b from-red-50 to-red-100">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-6 h-6 text-red-600" />
                  <h3 className="font-bold text-xl text-red-600">Structure des Coûts</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-red-800">Développement & R&D</strong>
                      <span className="text-red-600 font-bold">45%</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      <li>• Salaires équipe technique (€180K/an)</li>
                      <li>• Infrastructure cloud & sécurité</li>
                      <li>• Licences logicielles & outils dev</li>
                      <li>• Innovation continue & veille tech</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-red-800">Ventes & Support</strong>
                      <span className="text-red-600 font-bold">25%</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      <li>• Équipe commerciale & account managers</li>
                      <li>• Support client 24/7 & formation</li>
                      <li>• Déplacements & événements sectoriels</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-red-800">Marketing & Communication</strong>
                      <span className="text-red-600 font-bold">15%</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      <li>• Marketing digital & content creation</li>
                      <li>• Relations presse & événements</li>
                      <li>• Partenariats & sponsoring</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-red-800">Infrastructure & Hébergement</strong>
                      <span className="text-red-600 font-bold">15%</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      <li>• Hébergement local (ISSAL NET)</li>
                      <li>• CDN & bande passante</li>
                      <li>• Sécurité & sauvegardes</li>
                      <li>• Conformité & audits</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Flux de Revenus */}
              <div className="border-2 border-green-300 rounded-lg p-4 bg-gradient-to-b from-green-50 to-green-100">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <h3 className="font-bold text-xl text-green-600">Flux de Revenus</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-green-800">Licences SaaS B2B</strong>
                      <span className="text-green-600 font-bold">70%</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      <li>• Abonnements annuels clubs (€3K-15K)</li>
                      <li>• Licences académies (€1K-5K)</li>
                      <li>• Paiement anticipé = remises</li>
                      <li>• Revenus récurrents prévisibles</li>
                    </ul>
                    <div className="mt-2 text-xs bg-green-100 p-1 rounded">
                      <strong>Projection Année 3:</strong> €515K
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-green-800">Services à Valeur Ajoutée</strong>
                      <span className="text-green-600 font-bold">20%</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      <li>• Formation & certification analystes</li>
                      <li>• Consulting tactique personnalisé</li>
                      <li>• Audit intégrité & transparence</li>
                      <li>• Développements sur mesure</li>
                    </ul>
                    <div className="mt-2 text-xs bg-green-100 p-1 rounded">
                      <strong>Projection Année 3:</strong> €147K
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded shadow-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-green-800">Rapports & Analytics</strong>
                      <span className="text-green-600 font-bold">10%</span>
                    </div>
                    <ul className="mt-1 space-y-1 text-xs text-gray-600">
                      <li>• Rapports détaillés sur demande</li>
                      <li>• Analyses comparatives sectorielles</li>
                      <li>• Accès API pour intégrations</li>
                      <li>• Données benchmarking (anonymisées)</li>
                    </ul>
                    <div className="mt-2 text-xs bg-green-100 p-1 rounded">
                      <strong>Projection Année 3:</strong> €73K
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded shadow-md border-2 border-green-400">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-800">€735,000</div>
                    <div className="text-sm text-green-600">Chiffre d'Affaires Total Année 3</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analyse Détaillée */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="text-xl">Analyse du Modèle d'Affaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold">Cohérence et Viabilité du Modèle</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-base text-green-800">Forces du Modèle</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p><strong>Récurrence des revenus:</strong> Modèle SaaS avec abonnements annuels garantissant prévisibilité financière</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p><strong>Barrières à l'entrée:</strong> Conformité réglementaire et partenariats institutionnels créent protection naturelle</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p><strong>Scalabilité:</strong> Coûts marginaux faibles pour nouveaux clients, effet de levier technologique</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p><strong>Différenciation durable:</strong> Expertise locale et fonctionnalités collaboratives uniques</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base text-blue-800">Synergies Internes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p>Les partenariats institutionnels (FAF/DTN) renforcent la crédibilité commerciale et facilitent l'adoption par les clubs. La conformité réglementaire stricte devient un avantage concurrentiel face aux solutions internationales.</p>
                    <p className="mt-2">L'expertise locale combinée à la technologie collaborative crée un cercle vertueux d'amélioration continue via les retours utilisateurs.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-base text-orange-800">Points de Vigilance</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p><strong>Dépendance partenariats:</strong> Risque si relations avec FAF/DTN se dégradent</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p><strong>Marché de niche:</strong> Taille limitée du marché algérien nécessite expansion régionale</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></div>
                      <p><strong>Intensité R&D:</strong> Besoin constant d'innovation pour maintenir avance technologique</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-base text-red-800">Scénarios de Risque</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Concurrence agressive:</strong> Entrée d'un géant international avec adaptation locale forcée</p>
                    <p><strong>Évolution réglementaire:</strong> Assouplissement Loi 18-07 réduisant barrière d'entrée</p>
                    <p><strong>Crise économique:</strong> Réduction budgets clubs impactant capacité investissement</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">Recommandations Stratégiques</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <strong>Court terme (6-12 mois)</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Finaliser partenariat FAF/DTN</li>
                    <li>• Sécuriser 5 clients pilotes</li>
                    <li>• Valider modèle tarifaire</li>
                    <li>• Renforcer équipe technique</li>
                  </ul>
                </div>
                <div>
                  <strong>Moyen terme (1-2 ans)</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Expansion segment académies</li>
                    <li>• Développement fonctionnalités IA</li>
                    <li>• Préparation expansion régionale</li>
                    <li>• Diversification revenus services</li>
                  </ul>
                </div>
                <div>
                  <strong>Long terme (2-3 ans)</strong>
                  <ul className="mt-1 space-y-1 text-xs">
                    <li>• Expansion Maghreb/Afrique</li>
                    <li>• Plateformisation (API publique)</li>
                    <li>• Acquisitions stratégiques</li>
                    <li>• IPO ou exit stratégique</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center p-6 text-muted-foreground border-t">
              <p className="text-sm">
                <strong>SportDataAnalytics</strong> - Business Model Canvas v2.0<br/>
                Document confidentiel © 2024 - Tous droits réservés
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessModelCanvasDocument;
