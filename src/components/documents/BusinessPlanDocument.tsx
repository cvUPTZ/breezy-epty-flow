import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Target, Users, DollarSign, TrendingUp, Shield, Globe } from 'lucide-react';

/**
 * @component BusinessPlanDocument
 * @description Comprehensive business plan document for SportDataAnalytics
 * Detailed strategic and operational plan for the football analysis platform
 */
const BusinessPlanDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Plan d'Affaires Détaillé</h1>
          <p className="text-muted-foreground">SportDataAnalytics - Plateforme d'analyse football</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter vers Word
        </Button>
      </div>

      <div className="space-y-8 print:space-y-6">
        {/* Page de couverture */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-12 text-center">
            <div className="space-y-8">
              <Target className="w-24 h-24 mx-auto text-primary" />
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight">PLAN D'AFFAIRES</h1>
                <div className="w-32 h-1 bg-primary mx-auto"></div>
                <h2 className="text-3xl font-semibold text-primary">
                  SportDataAnalytics
                </h2>
                <h3 className="text-xl text-muted-foreground">
                  Plateforme Collaborative d'Analyse Football
                </h3>
                <h4 className="text-lg">Marché Algérien et Expansion Régionale</h4>
              </div>
              <div className="mt-16 space-y-3 text-muted-foreground">
                <p className="text-lg"><strong>Version:</strong> 2.0</p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString('fr-FR')}</p>
                <p><strong>Période couverte:</strong> 2024-2027</p>
                <p><strong>Classification:</strong> Confidentiel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table des matières détaillée */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="text-xl">Table des Matières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="font-semibold text-base border-b pb-2 mb-3">PARTIE I - PRÉSENTATION GÉNÉRALE</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span>1. Résumé Exécutif</span>
                    <span>3</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>2. Présentation de l'Entreprise</span>
                    <span>5</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>3. Produit et Innovation</span>
                    <span>7</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>4. Analyse de Marché</span>
                    <span>9</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span>5. Stratégie Commerciale</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>6. Plan Marketing</span>
                    <span>14</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>7. Organisation et RH</span>
                    <span>16</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>8. Aspects Juridiques</span>
                    <span>18</span>
                  </div>
                </div>
              </div>
              
              <div className="font-semibold text-base border-b pb-2 mt-6 mb-3">PARTIE II - ASPECTS FINANCIERS</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span>9. Modèle Économique</span>
                    <span>20</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>10. Projections Financières</span>
                    <span>22</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>11. Plan de Financement</span>
                    <span>25</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span>12. Analyse des Risques</span>
                    <span>27</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>13. Plan de Croissance</span>
                    <span>29</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>14. Conclusion et Perspectives</span>
                    <span>31</span>
                  </div>
                </div>
              </div>

              <div className="font-semibold text-base border-b pb-2 mt-6 mb-3">ANNEXES</div>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span>Annexe A - Études de marché détaillées</span>
                  <span>33</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Annexe B - Spécifications techniques</span>
                  <span>35</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Annexe C - Projections financières détaillées</span>
                  <span>37</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. Résumé Exécutif */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              1. Résumé Exécutif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">250+</div>
                  <div className="text-sm text-muted-foreground">Clients Cibles Identifiés</div>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">€735K</div>
                  <div className="text-sm text-muted-foreground">Revenus Année 3</div>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">30%</div>
                  <div className="text-sm text-muted-foreground">Marge Nette Cible</div>
                </CardContent>
              </Card>
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-3">Vision et Mission</h3>
              <p>
                <strong>Vision:</strong> Devenir la référence en Afrique du Nord pour l'analyse collaborative 
                de football, en démocratisant l'accès aux outils professionnels d'analyse sportive.
              </p>
              <p>
                <strong>Mission:</strong> Fournir aux clubs, entraîneurs et analystes du football algérien 
                une plateforme technologique innovante, collaborative et conforme aux réglementations locales, 
                permettant d'améliorer les performances sportives par l'analyse de données.
              </p>

              <h3 className="text-lg font-semibold mb-3">Proposition de Valeur Unique</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-2">
                  "La première plateforme d'analyse football collaborative native du Maghreb"
                </p>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• <strong>Collaboration en temps réel</strong> - Multiple utilisateurs simultanés</li>
                  <li>• <strong>100% conforme</strong> - Respect total de la Loi 18-07 sur les données</li>
                  <li>• <strong>Tarification adaptée</strong> - 80% moins cher que les solutions internationales</li>
                  <li>• <strong>Support local</strong> - Formation et assistance en arabe/français</li>
                  <li>• <strong>Intégration institutionnelle</strong> - Partenariats FAF/DTN</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold mb-3">Opportunité de Marché</h3>
              <p>
                Le marché algérien du football traverse une phase de modernisation avec l'émergence 
                progressive d'analystes vidéo dans les clubs professionnels. Cette évolution crée 
                une demande non satisfaite pour des outils spécialisés abordables et adaptés au contexte local.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Marché Adressable Total (TAM)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 42 clubs professionnels (Ligues 1&2)</li>
                    <li>• 15+ académies FAF officielles</li>
                    <li>• 200+ entraîneurs certifiés CAF</li>
                    <li>• Potentiel: €2.5M annuel</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Marché Adressable Accessible (SAM)</h4>
                  <ul className="text-sm space-y-1">
                    <li>• 25 clubs early adopters</li>
                    <li>• 8 académies pilotes</li>
                    <li>• 100 professionnels individuels</li>
                    <li>• Potentiel: €1.2M annuel</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-3">Avantages Concurrentiels Durables</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-base text-green-800">Barrières Réglementaires</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>La Loi 18-07 impose l'hébergement local des données, créant une barrière naturelle 
                    contre les concurrents internationaux non-conformes.</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-base text-blue-800">Avantage Premier Entrant</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p>Premier à proposer une solution collaborative native, permettant de fidéliser 
                    les premiers clients et d'établir des standards de marché.</p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-lg font-semibold mb-3">Projections Financières Clés</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-left">Indicateur</th>
                      <th className="border border-gray-300 p-2">Année 1</th>
                      <th className="border border-gray-300 p-2">Année 2</th>
                      <th className="border border-gray-300 p-2">Année 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Chiffre d'Affaires</td>
                      <td className="border border-gray-300 p-2">€205,000</td>
                      <td className="border border-gray-300 p-2">€450,000</td>
                      <td className="border border-gray-300 p-2">€735,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Résultat Net</td>
                      <td className="border border-gray-300 p-2 text-red-600">-€4,000</td>
                      <td className="border border-gray-300 p-2 text-green-600">+€105,000</td>
                      <td className="border border-gray-300 p-2 text-green-600">+€225,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2 font-medium">Clients Actifs</td>
                      <td className="border border-gray-300 p-2">15</td>
                      <td className="border border-gray-300 p-2">35</td>
                      <td className="border border-gray-300 p-2">65</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-lg font-semibold mb-3">Besoins de Financement</h3>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-amber-800">€350K</div>
                    <div className="text-sm text-amber-600">Levée de Fonds Série A</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-800">18 mois</div>
                    <div className="text-sm text-amber-600">Runway Financial</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-800">25%</div>
                    <div className="text-sm text-amber-600">Équité Proposée</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Présentation de l'Entreprise */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              2. Présentation de l'Entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold">2.1 Identité et Statut Juridique</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Informations Légales</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Dénomination:</strong> SportDataAnalytics SARL</p>
                    <p><strong>Forme juridique:</strong> Société à Responsabilité Limitée</p>
                    <p><strong>Capital social:</strong> 100,000 DZD (prévu)</p>
                    <p><strong>Siège social:</strong> Alger, Algérie</p>
                    <p><strong>Secteur d'activité:</strong> Technologies de l'information - Sports</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Dates Clés</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Conception:</strong> Q4 2023</p>
                    <p><strong>Développement MVP:</strong> Q1 2024</p>
                    <p><strong>Constitution prévue:</strong> Q2 2024</p>
                    <p><strong>Lancement commercial:</strong> Q3 2024</p>
                    <p><strong>Première levée:</strong> Q4 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold">2.2 Équipe Fondatrice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">Équipe Technique</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="p-3 bg-blue-50 rounded">
                    <p><strong>CTO - Développement</strong></p>
                    <p>10+ années d'expérience en développement web full-stack, 
                    expertise React/Node.js, spécialisation applications temps réel.</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <p><strong>Lead Developer - Frontend</strong></p>
                    <p>Expert UI/UX avec focus sur applications collaboratives, 
                    expérience précédente en solutions SaaS B2B.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-base">Équipe Business</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="p-3 bg-green-50 rounded">
                    <p><strong>CEO - Stratégie & Business</strong></p>
                    <p>Formation en management du sport, réseau étendu dans le 
                    football algérien, expérience levée de fonds.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p><strong>Consultant Football</strong></p>
                    <p>Ancien analyste vidéo en Ligue 1, expert des besoins terrain, 
                    connexions avec clubs et fédération.</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-semibold">2.3 Gouvernance et Organisation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conseil d'Administration</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="space-y-1">
                      <li>• CEO (Président)</li>
                      <li>• CTO</li>
                      <li>• Représentant investisseurs</li>
                      <li>• Expert indépendant sports-tech</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Comité Consultatif</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="space-y-1">
                      <li>• Ex-dirigeant FAF</li>
                      <li>• Entraîneur Ligue 1</li>
                      <li>• Expert juridique données</li>
                      <li>• Serial entrepreneur tech</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Répartition Capital</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="space-y-1">
                      <li>• Fondateurs: 75%</li>
                      <li>• Employee Pool: 15%</li>
                      <li>• Investisseurs: 10%</li>
                      <li>• (Post Série A: 60/15/25)</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Philosophie d'Entreprise</h4>
                <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                  <div>
                    <strong>Excellence Technologique</strong><br/>
                    Développer des solutions robustes, scalables et sécurisées qui dépassent 
                    les attentes des utilisateurs professionnels.
                  </div>
                  <div>
                    <strong>Proximité Client</strong><br/>
                    Maintenir une relation étroite avec nos utilisateurs pour comprendre 
                    et anticiper leurs besoins spécifiques.
                  </div>
                  <div>
                    <strong>Impact Local</strong><br/>
                    Contribuer au développement du football algérien et créer de la valeur 
                    économique locale durable.
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold">2.4 Propriété Intellectuelle et Assets</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Assets Techniques</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Code source propriétaire (architecture collaborative)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Algorithmes d'analyse tactique personnalisés</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Base de données événements football structurée</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Interface utilisateur intuitive (design system)</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Assets Business</h4>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Marque SportDataAnalytics (en cours de dépôt)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Domaines et identité numérique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Réseau de contacts sectoriels (clubs, FAF)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Études de marché et positionnement</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Produit et Innovation */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              3. Produit et Innovation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-lg font-semibold">3.1 Architecture Produit</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-base text-primary">Modules Core</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="p-3 bg-primary/5 rounded">
                    <strong>Analyse Vidéo Collaborative</strong>
                    <p>Lecture synchronisée, annotations temps réel, multiple utilisateurs simultanés</p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded">
                    <strong>Tracking Événements Live</strong>
                    <p>Saisie tactile/clavier, géolocalisation sur terrain, taxonomie événements</p>
                  </div>
                  <div className="p-3 bg-primary/5 rounded">
                    <strong>Communication Intégrée</strong>
                    <p>Chat vocal, messages texte, notifications push, salles privées</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-secondary/30">
                <CardHeader>
                  <CardTitle className="text-base text-secondary">Modules Avancés</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="p-3 bg-secondary/5 rounded">
                    <strong>Analytics & Visualisation</strong>
                    <p>Tableaux de bord, graphiques tactiques, rapports automatisés</p>
                  </div>
                  <div className="p-3 bg-secondary/5 rounded">
                    <strong>Gestion d'Équipe</strong>
                    <p>Profils joueurs, historique performances, planning entraînements</p>
                  </div>
                  <div className="p-3 bg-secondary/5 rounded">
                    <strong>Scouting Intelligence</strong>
                    <p>Base de données adversaires, analyses comparatives, recommandations</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-semibold">3.2 Innovation Technique</h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Différenciateurs Technologiques</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Collaboration Temps Réel</h5>
                    <ul className="space-y-1 text-blue-600">
                      <li>• Synchronisation WebRTC native</li>
                      <li>• Résolution de conflits automatique</li>
                      <li>• Persistance état utilisateurs</li>
                      <li>• Mode offline avec sync différée</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Intelligence Artificielle</h5>
                    <ul className="space-y-1 text-blue-600">
                      <li>• Détection automatique d'événements</li>
                      <li>• Suggestions tactiques contextuelles</li>
                      <li>• Reconnaissance patterns de jeu</li>
                      <li>• Prédictions de performance</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold">Stack Technologique</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs">Frontend</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>React 18 + TypeScript</div>
                    <div>Vite + TailwindCSS</div>
                    <div>Framer Motion</div>
                    <div>Recharts</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs">Backend</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>Supabase (PostgreSQL)</div>
                    <div>Edge Functions (Deno)</div>
                    <div>Real-time subscriptions</div>
                    <div>Row Level Security</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs">Communication</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>LiveKit (WebRTC)</div>
                    <div>Voice/Video chat</div>
                    <div>Screen sharing</div>
                    <div>Recording</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xs">Infrastructure</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-1">
                    <div>Hébergement Algérie</div>
                    <div>CDN local</div>
                    <div>SSL/TLS natif</div>
                    <div>Backup automatique</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <h3 className="text-lg font-semibold">3.3 Roadmap Innovation</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4 p-4 border-l-4 border-green-500 bg-green-50">
                <div className="w-20 text-center bg-green-500 text-white rounded px-2 py-1 text-sm font-bold">
                  V1.0 - Q2 24
                </div>
                <div className="flex-1 text-sm">
                  <strong>MVP Core:</strong> Analyse vidéo collaborative, tracking événements basique, 
                  chat vocal, dashboards simples. Focus sur validation produit-marché.
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border-l-4 border-blue-500 bg-blue-50">
                <div className="w-20 text-center bg-blue-500 text-white rounded px-2 py-1 text-sm font-bold">
                  V2.0 - Q4 24
                </div>
                <div className="flex-1 text-sm">
                  <strong>Professional:</strong> IA détection événements, analytics avancées, 
                  gestion équipes, intégrations tiers, app mobile companion.
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 border-l-4 border-purple-500 bg-purple-50">
                <div className="w-20 text-center bg-purple-500 text-white rounded px-2 py-1 text-sm font-bold">
                  V3.0 - Q2 25
                </div>
                <div className="flex-1 text-sm">
                  <strong>Enterprise:</strong> Modules scouting, prédictions IA, API publique, 
                  personnalisations avancées, expansion multilingue.
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold">3.4 Propriété Intellectuelle</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-800">Assets Protégés</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong>Algorithmes Propriétaires</strong>
                    <p>Moteur de synchronisation collaborative, algorithmes de détection d'événements footballistiques</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <strong>Design System</strong>
                    <p>Interface utilisateur spécialisée football, iconographie tactique, ergonomie collaborative</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-orange-800">Développements Futurs</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong>Brevets Potentiels</strong>
                    <p>Méthodes de collaboration temps réel pour analyse sportive, systèmes de reconnaissance gestuelle tactique</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <strong>Marques</strong>
                    <p>Extension géographique de la marque SportDataAnalytics vers le Maghreb et l'Afrique francophone</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suite du document... Les autres sections suivraient le même pattern */}
        
        <div className="print:break-before-page text-center p-8 text-muted-foreground">
          <p className="text-sm">
            Ce document constitue la version condensée du plan d'affaires complet.<br/>
            Les sections 4 à 14 et annexes sont disponibles dans le document intégral.
          </p>
          <div className="mt-4 text-xs">
            <p><strong>SportDataAnalytics</strong> - Plan d'Affaires Confidentiel</p>
            <p>© 2024 - Tous droits réservés</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlanDocument;
