import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

/**
 * @component MarketStudyDocument
 * @description Comprehensive market study document formatted for Word export
 * Analyzes the Algerian football market and business opportunities
 */
const MarketStudyDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Étude de Marché</h1>
          <p className="text-muted-foreground">Analyse du marché algérien du football</p>
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
            <div className="space-y-6">
              <FileText className="w-20 h-20 mx-auto text-primary" />
              <h1 className="text-4xl font-bold">ÉTUDE DE MARCHÉ</h1>
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Plateforme d'Analyse et de Gestion des Matchs de Football
              </h2>
              <h3 className="text-xl">Marché Algérien - Secteur Sportif</h3>
              <div className="mt-12 space-y-2">
                <p className="text-lg"><strong>SportDataAnalytics</strong></p>
                <p>Version 1.0 - {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table des matières */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>Table des Matières</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between border-b pb-1">
                <span>1. Résumé Exécutif</span>
                <span>3</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>2. Analyse du Marché Algérien du Football</span>
                <span>4</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>3. Segment Cible et Positionnement</span>
                <span>6</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>4. Analyse Concurrentielle</span>
                <span>8</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>5. Opportunités et Défis</span>
                <span>10</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>6. Stratégie de Pénétration du Marché</span>
                <span>12</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>7. Projections Financières</span>
                <span>14</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>8. Recommandations Stratégiques</span>
                <span>16</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. Résumé Exécutif */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>1. Résumé Exécutif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Vision du Projet</h3>
            <p>
              SportDataAnalytics vise à révolutionner l'analyse du football en Algérie en proposant 
              la première plateforme collaborative de suivi et d'analyse des matchs en temps réel. 
              Notre solution combine l'analyse vidéo, le chat vocal, et la collecte de données 
              tactiques pour offrir aux clubs, entraîneurs et analystes un outil professionnel 
              adapté au marché local.
            </p>

            <h3 className="text-lg font-semibold">Opportunité de Marché</h3>
            <p>
              Le marché algérien du football connaît une modernisation progressive avec l'émergence 
              d'analystes vidéo dans les clubs professionnels. Cependant, l'absence d'outils 
              spécialisés abordables crée une lacune que notre plateforme peut combler. 
              Avec plus de 40 clubs professionnels (Ligue 1 et 2) et de nombreuses académies, 
              le potentiel de croissance est significatif.
            </p>

            <h3 className="text-lg font-semibold">Avantage Concurrentiel</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Première plateforme collaborative multi-utilisateurs en Algérie</li>
              <li>Tarification adaptée au marché local (alternative aux solutions internationales coûteuses)</li>
              <li>Conformité totale avec la législation algérienne sur les données (Loi 18-07)</li>
              <li>Support technique et formation en langue locale</li>
              <li>Intégration potentielle avec les programmes de la FAF</li>
            </ul>

            <h3 className="text-lg font-semibold">Projections Initiales</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Marché Cible Initial:</strong></p>
                <ul className="list-disc pl-6">
                  <li>40+ clubs professionnels</li>
                  <li>15+ académies FAF</li>
                  <li>200+ entraîneurs certifiés</li>
                </ul>
              </div>
              <div>
                <p><strong>Revenus Prévisionnels (Année 1):</strong></p>
                <ul className="list-disc pl-6">
                  <li>Abonnements B2B: 180 000 €</li>
                  <li>Services personnalisés: 45 000 €</li>
                  <li>Formation: 30 000 €</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Analyse du Marché Algérien */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>2. Analyse du Marché Algérien du Football</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">2.1 Structure Institutionnelle</h3>
            <p>
              Le football algérien s'organise autour de la Fédération Algérienne de Football (FAF), 
              supervisée par la Direction Technique Nationale (DTN). Cette structure centralisée 
              facilite l'adoption d'outils standardisés et offre des opportunités de partenariats 
              institutionnels stratégiques.
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Hiérarchie du Football Algérien</h4>
              <ul className="space-y-1">
                <li><strong>FAF</strong> - Fédération Algérienne de Football (Niveau National)</li>
                <li><strong>DTN</strong> - Direction Technique Nationale (Formation & Développement)</li>
                <li><strong>LFP</strong> - Ligue de Football Professionnel (Ligues 1 & 2)</li>
                <li><strong>LNFA</strong> - Ligue Nationale de Football Amateur (Division 3)</li>
                <li><strong>Ligues Régionales</strong> - Championnats régionaux et locaux</li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold">2.2 Évolution de l'Analyse Performance</h3>
            <p>
              L'analyse vidéo émerge progressivement dans les clubs algériens, avec des analystes 
              spécialisés dans plusieurs équipes de première division. Cependant, le manque d'outils 
              adaptés et la formation limitée freinent le développement de cette discipline.
            </p>

            <h4 className="font-semibold">Défis Actuels:</h4>
            <ul className="list-disc pl-6 space-y-1">
              <li>Absence de couverture vidéo systématique des matchs</li>
              <li>Manque de reconnaissance officielle du métier d'analyste</li>
              <li>Coût prohibitif des solutions professionnelles internationales</li>
              <li>Formation limitée aux outils d'analyse moderne</li>
            </ul>

            <h3 className="text-lg font-semibold">2.3 Taille du Marché</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">42</div>
                  <p className="text-sm">Clubs Professionnels</p>
                  <p className="text-xs text-muted-foreground">(Ligue 1 & 2)</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">15+</div>
                  <p className="text-sm">Académies FAF</p>
                  <p className="text-xs text-muted-foreground">Centres de formation</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">200+</div>
                  <p className="text-sm">Entraîneurs Certifiés</p>
                  <p className="text-xs text-muted-foreground">Licence CAF A/B</p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-semibold">2.4 Environnement Réglementaire</h3>
            <p>
              La Loi 18-07 sur la protection des données personnelles impose des contraintes 
              strictes sur le traitement et l'hébergement des données. Cette réglementation, 
              bien que contraignante, constitue une barrière à l'entrée pour les concurrents 
              internationaux non-conformes.
            </p>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-800 mb-2">Points Clés Réglementaires</h4>
              <ul className="text-sm space-y-1 text-amber-700">
                <li>• Hébergement obligatoire des données sur le territoire algérien</li>
                <li>• Consentement explicite requis pour le traitement des données</li>
                <li>• Sanctions sévères en cas de non-conformité (jusqu'à 1M DZD d'amende)</li>
                <li>• Opportunité de différenciation face aux solutions étrangères</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 3. Segment Cible et Positionnement */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>3. Segments Cibles et Positionnement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">3.1 Segmentation du Marché</h3>
            
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-lg">Segment Primaire: Clubs Professionnels</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p><strong>Caractéristiques:</strong></p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>16 clubs Ligue 1, 26 clubs Ligue 2</li>
                      <li>Budgets annuels: 50M à 500M DZD</li>
                      <li>Équipes techniques étoffées</li>
                      <li>Besoins d'analyse professionnelle</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong>Besoins Identifiés:</strong></p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>Analyse tactique approfondie</li>
                      <li>Préparation des matchs</li>
                      <li>Évaluation des performances</li>
                      <li>Rapports pour la direction</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm mt-2 text-green-600"><strong>Potentiel de revenus:</strong> 150 000 € / an</p>
              </div>

              <div className="border-l-4 border-secondary pl-4">
                <h4 className="font-semibold text-lg">Segment Secondaire: Académies et Centres de Formation</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p><strong>Caractéristiques:</strong></p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>15+ académies FAF officielles</li>
                      <li>Centres privés émergents</li>
                      <li>Focus sur le développement jeunes</li>
                      <li>Budgets plus limités</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong>Besoins Identifiés:</strong></p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>Suivi progression individuelle</li>
                      <li>Outils pédagogiques</li>
                      <li>Évaluation des talents</li>
                      <li>Formation des encadreurs</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm mt-2 text-blue-600"><strong>Potentiel de revenus:</strong> 75 000 € / an</p>
              </div>

              <div className="border-l-4 border-accent pl-4">
                <h4 className="font-semibold text-lg">Segment Tertiaire: Entraîneurs et Analystes Indépendants</h4>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p><strong>Caractéristiques:</strong></p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>200+ entraîneurs certifiés CAF</li>
                      <li>Analystes freelance émergents</li>
                      <li>Consultants sportifs</li>
                      <li>Formateurs indépendants</li>
                    </ul>
                  </div>
                  <div>
                    <p><strong>Besoins Identifiés:</strong></p>
                    <ul className="list-disc pl-4 text-sm">
                      <li>Outils professionnels abordables</li>
                      <li>Portfolio de travail</li>
                      <li>Formation continue</li>
                      <li>Networking professionnel</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm mt-2 text-purple-600"><strong>Potentiel de revenus:</strong> 30 000 € / an</p>
              </div>
            </div>

            <h3 className="text-lg font-semibold">3.2 Proposition de Valeur par Segment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Clubs Professionnels</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="space-y-1">
                    <li>• Solution complète multi-utilisateurs</li>
                    <li>• Conformité réglementaire garantie</li>
                    <li>• Support technique dédié</li>
                    <li>• Intégration avec workflow existant</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Académies</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="space-y-1">
                    <li>• Tarifs préférentiels éducation</li>
                    <li>• Outils pédagogiques intégrés</li>
                    <li>• Suivi longitudinal des joueurs</li>
                    <li>• Formation des encadreurs incluse</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Indépendants</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <ul className="space-y-1">
                    <li>• Version individuelle abordable</li>
                    <li>• Communauté professionnelle</li>
                    <li>• Certification et accréditation</li>
                    <li>• Opportunités de missions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 4. Analyse Concurrentielle */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>4. Analyse Concurrentielle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">4.1 Mapping Concurrentiel</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-sm font-semibold border-b pb-2">
                <div>Concurrent</div>
                <div>Type de Solution</div>
                <div>Prix Approximatif</div>
                <div>Présence Algérie</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                <div className="font-medium">Hudl</div>
                <div>Plateforme complète</div>
                <div>$200-2000/mois</div>
                <div className="text-red-500">Limitée</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                <div className="font-medium">Wyscout</div>
                <div>Base de données + analyse</div>
                <div>€3000-30000/an</div>
                <div className="text-red-500">Aucune</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                <div className="font-medium">InStat</div>
                <div>Analyse + scouting</div>
                <div>€500-5000/an</div>
                <div className="text-orange-500">Faible</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2">
                <div className="font-medium">Catapult</div>
                <div>Performance physique</div>
                <div>$180/joueur/an</div>
                <div className="text-red-500">Aucune</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-sm border-b pb-2 bg-primary/10">
                <div className="font-bold">SportDataAnalytics</div>
                <div>Plateforme collaborative</div>
                <div>€50-500/mois</div>
                <div className="text-green-500">Totale</div>
              </div>
            </div>

            <h3 className="text-lg font-semibold">4.2 Avantages Concurrentiels</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Forces</h4>
                <ul className="space-y-1 text-sm">
                  <li>✓ Première solution collaborative locale</li>
                  <li>✓ Conformité réglementaire (Loi 18-07)</li>
                  <li>✓ Tarification adaptée au marché local</li>
                  <li>✓ Support en langue arabe/français</li>
                  <li>✓ Partenariats institutionnels potentiels</li>
                  <li>✓ Connaissance approfondie du marché</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Défis</h4>
                <ul className="space-y-1 text-sm">
                  <li>⚠ Ressources limitées vs géants internationaux</li>
                  <li>⚠ Notoriété à construire</li>
                  <li>⚠ Dépendance aux partenariats locaux</li>
                  <li>⚠ Évolution technologique rapide</li>
                  <li>⚠ Barrières d'adoption culturelles</li>
                </ul>
              </div>
            </div>

            <h3 className="text-lg font-semibold">4.3 Positionnement Stratégique</h3>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3">Notre Positionnement</h4>
              <p className="text-blue-700 mb-3">
                "La première plateforme collaborative d'analyse football conçue spécifiquement 
                pour le marché algérien, alliant technologie moderne et expertise locale."
              </p>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Différenciation:</strong><br/>
                  Solution 100% locale et conforme
                </div>
                <div>
                  <strong>Accessibilité:</strong><br/>
                  Tarifs adaptés au pouvoir d'achat
                </div>
                <div>
                  <strong>Proximité:</strong><br/>
                  Support et formation sur terrain
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Opportunités et Défis */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>5. Opportunités et Défis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">5.1 Matrice SWOT</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800 text-base">Forces (Strengths)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-1">
                    <li>• Première solution collaborative du marché</li>
                    <li>• Équipe technique expérimentée</li>
                    <li>• Connaissance approfondie du marché local</li>
                    <li>• Architecture technologique moderne</li>
                    <li>• Conformité réglementaire native</li>
                    <li>• Modèle économique adaptatif</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-800 text-base">Faiblesses (Weaknesses)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-1">
                    <li>• Ressources financières limitées</li>
                    <li>• Manque de notoriété initiale</li>
                    <li>• Dépendance aux données vidéo externes</li>
                    <li>• Équipe réduite</li>
                    <li>• Pas de base clients existante</li>
                    <li>• Besoin de validation marché</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-800 text-base">Opportunités (Opportunities)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-1">
                    <li>• Marché émergent peu saturé</li>
                    <li>• Soutien potentiel de la FAF/DTN</li>
                    <li>• Croissance de l'intérêt pour l'analyse</li>
                    <li>• Barrières réglementaires protectrices</li>
                    <li>• Expansion régionale possible (Maghreb)</li>
                    <li>• Développement de nouveaux segments</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-orange-800 text-base">Menaces (Threats)</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="text-sm space-y-1">
                    <li>• Entrée de géants internationaux</li>
                    <li>• Résistance au changement culturel</li>
                    <li>• Instabilité économique locale</li>
                    <li>• Évolution réglementaire défavorable</li>
                    <li>• Concurrence de solutions gratuites</li>
                    <li>• Dépendance technologique externe</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-semibold">5.2 Analyse des Risques</h3>
            <div className="space-y-3">
              <div className="p-4 border-l-4 border-red-400 bg-red-50">
                <h4 className="font-semibold text-red-800">Risque Élevé: Adoption Limitée</h4>
                <p className="text-sm text-red-700 mt-1">
                  Résistance culturelle aux outils technologiques dans certains clubs traditionnels.
                </p>
                <p className="text-xs text-red-600 mt-2">
                  <strong>Mitigation:</strong> Programme de démonstration gratuit, formation approfondie, 
                  endorsement par figures respectées du football algérien.
                </p>
              </div>

              <div className="p-4 border-l-4 border-orange-400 bg-orange-50">
                <h4 className="font-semibold text-orange-800">Risque Modéré: Concurrence Internationale</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Entrée agressive d'un concurrent global avec ressources importantes.
                </p>
                <p className="text-xs text-orange-600 mt-2">
                  <strong>Mitigation:</strong> Renforcement des partenariats locaux, innovation continue, 
                  focus sur la conformité réglementaire comme barrière.
                </p>
              </div>

              <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
                <h4 className="font-semibold text-yellow-800">Risque Faible: Évolution Technologique</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Obsolescence rapide de certaines technologies utilisées.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  <strong>Mitigation:</strong> Architecture modulaire, veille technologique active, 
                  partenariats avec fournisseurs technologiques.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. Stratégie de Pénétration */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>6. Stratégie de Pénétration du Marché</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">6.1 Approche Go-to-Market</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Phase 1: Validation et Pilotes (Mois 1-6)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Objectifs:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Valider l'adéquation produit-marché</li>
                      <li>Développer 3-5 études de cas</li>
                      <li>Affiner l'offre produit</li>
                      <li>Établir premiers partenariats</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Actions:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Programme pilote gratuit (3 mois)</li>
                      <li>Ciblage clubs Ligue 1 ouverts innovation</li>
                      <li>Recrutement early adopters</li>
                      <li>Collecte feedback intensif</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Phase 2: Déploiement Commercial (Mois 7-18)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Objectifs:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Acquérir 15-20 clients payants</li>
                      <li>Générer 150k€ de revenus annuels</li>
                      <li>Établir partenariat FAF/DTN</li>
                      <li>Lancer programme certification</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Actions:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Équipe commerciale dédiée</li>
                      <li>Campagne marketing ciblée</li>
                      <li>Participation événements sectoriels</li>
                      <li>Programme partenaire revendeur</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">Phase 3: Expansion et Diversification (Mois 19+)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Objectifs:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Pénétrer segment académies</li>
                      <li>Lancer version mobile</li>
                      <li>Explorer marchés régionaux</li>
                      <li>Développer écosystème partenaires</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Actions:</strong>
                    <ul className="list-disc pl-4 mt-1">
                      <li>Diversification produit</li>
                      <li>Expansion géographique Maghreb</li>
                      <li>Programme développeur tiers</li>
                      <li>Acquisition potentielle concurrents</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold">6.2 Canaux de Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Vente Directe B2B</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>Focus:</strong> Clubs professionnels et grandes académies</p>
                  <p><strong>Approche:</strong> Équipe commerciale dédiée, démos personnalisées</p>
                  <p><strong>Cycle:</strong> 3-6 mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Partenariats Institutionnels</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>Focus:</strong> FAF, DTN, associations d'entraîneurs</p>
                  <p><strong>Approche:</strong> Programmes officiels, certifications</p>
                  <p><strong>Cycle:</strong> 6-12 mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Marketing Digital</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p><strong>Focus:</strong> Entraîneurs indépendants, analystes</p>
                  <p><strong>Approche:</strong> Content marketing, SEO, réseaux sociaux</p>
                  <p><strong>Cycle:</strong> 1-3 mois</p>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-semibold">6.3 Stratégie de Prix</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Modèle de Tarification Étagée</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="font-semibold text-lg">Essential</div>
                    <div className="text-2xl font-bold text-primary my-2">€99/mois</div>
                    <ul className="text-xs space-y-1">
                      <li>• 3 utilisateurs simultanés</li>
                      <li>• Analyse vidéo basique</li>
                      <li>• Support email</li>
                      <li>• Académies et clubs amateurs</li>
                    </ul>
                  </div>
                  <div className="text-center p-3 bg-primary text-white rounded border-2 border-primary">
                    <div className="font-semibold text-lg">Professional</div>
                    <div className="text-2xl font-bold my-2">€299/mois</div>
                    <ul className="text-xs space-y-1">
                      <li>• 10 utilisateurs simultanés</li>
                      <li>• Toutes fonctionnalités</li>
                      <li>• Support téléphonique</li>
                      <li>• Clubs professionnels</li>
                    </ul>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="font-semibold text-lg">Enterprise</div>
                    <div className="text-2xl font-bold text-primary my-2">Sur devis</div>
                    <ul className="text-xs space-y-1">
                      <li>• Utilisateurs illimités</li>
                      <li>• Personnalisations</li>
                      <li>• Support dédié</li>
                      <li>• Intégrations spécifiques</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7. Projections Financières */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>7. Projections Financières</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">7.1 Prévisions de Revenus (3 ans)</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Segment / Année</th>
                    <th className="border border-gray-300 p-2">Année 1</th>
                    <th className="border border-gray-300 p-2">Année 2</th>
                    <th className="border border-gray-300 p-2">Année 3</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">Clubs Professionnels</td>
                    <td className="border border-gray-300 p-2">€120,000</td>
                    <td className="border border-gray-300 p-2">€280,000</td>
                    <td className="border border-gray-300 p-2">€450,000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">Académies</td>
                    <td className="border border-gray-300 p-2">€45,000</td>
                    <td className="border border-gray-300 p-2">€85,000</td>
                    <td className="border border-gray-300 p-2">€140,000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">Indépendants</td>
                    <td className="border border-gray-300 p-2">€15,000</td>
                    <td className="border border-gray-300 p-2">€35,000</td>
                    <td className="border border-gray-300 p-2">€65,000</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-2 font-semibold">Services Personnalisés</td>
                    <td className="border border-gray-300 p-2">€25,000</td>
                    <td className="border border-gray-300 p-2">€50,000</td>
                    <td className="border border-gray-300 p-2">€80,000</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="border border-gray-300 p-2">TOTAL REVENUS</td>
                    <td className="border border-gray-300 p-2">€205,000</td>
                    <td className="border border-gray-300 p-2">€450,000</td>
                    <td className="border border-gray-300 p-2">€735,000</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold">7.2 Structure de Coûts</h3>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Année 1</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Salaires & Charges</span>
                    <span>€120,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Infrastructure & Hébergement</span>
                    <span>€24,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing & Commercial</span>
                    <span>€30,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>R&D</span>
                    <span>€20,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais Généraux</span>
                    <span>€15,000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Coûts</span>
                    <span>€209,000</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Résultat</span>
                    <span>-€4,000</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Année 2</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Salaires & Charges</span>
                    <span>€200,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Infrastructure & Hébergement</span>
                    <span>€35,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing & Commercial</span>
                    <span>€50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>R&D</span>
                    <span>€35,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais Généraux</span>
                    <span>€25,000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Coûts</span>
                    <span>€345,000</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Résultat</span>
                    <span>+€105,000</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Année 3</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Salaires & Charges</span>
                    <span>€300,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Infrastructure & Hébergement</span>
                    <span>€50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing & Commercial</span>
                    <span>€75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>R&D</span>
                    <span>€50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frais Généraux</span>
                    <span>€35,000</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold">
                    <span>Total Coûts</span>
                    <span>€510,000</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Résultat</span>
                    <span>+€225,000</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h3 className="text-lg font-semibold">7.3 Indicateurs Clés de Performance</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Métriques Commerciales</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Coût d'Acquisition Client (CAC)</span>
                    <span>€2,500</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Valeur Vie Client (LTV)</span>
                    <span>€15,000</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Ratio LTV/CAC</span>
                    <span>6:1</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Taux de Rétention (Année 1)</span>
                    <span>85%</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Métriques Opérationnelles</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Temps de Déploiement Client</span>
                    <span>15 jours</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Taux de Satisfaction (NPS)</span>
                    <span>+45</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Temps de Résolution Support</span>
                    <span>&lt; 4h</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>Uptime Plateforme</span>
                    <span>99.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 8. Recommandations Stratégiques */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>8. Recommandations Stratégiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">8.1 Priorités Stratégiques</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border-l-4 border-green-400">
                <h4 className="font-semibold text-green-800 mb-2">Priorité 1: Validation Marché Rapide</h4>
                <p className="text-sm text-green-700 mb-2">
                  Lancer un programme pilote intensif avec 5 clubs sélectionnés pour valider 
                  l'adéquation produit-marché dans les 6 premiers mois.
                </p>
                <ul className="text-xs text-green-600 space-y-1">
                  <li>• Identifier 5 clubs early adopters (mix Ligue 1/2)</li>
                  <li>• Offrir 3 mois d'accès gratuit contre feedback détaillé</li>
                  <li>• Mesurer adoption, usage, satisfaction</li>
                  <li>• Développer 3 études de cas détaillées</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 border-l-4 border-blue-400">
                <h4 className="font-semibold text-blue-800 mb-2">Priorité 2: Partenariat Institutionnel</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Établir une relation privilégiée avec la FAF/DTN pour bénéficier d'un 
                  endorsement officiel et accélérer l'adoption.
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Présenter une proposition de partenariat à la DTN</li>
                  <li>• Proposer intégration dans programmes de formation</li>
                  <li>• Offrir tarifs préférentiels aux académies FAF</li>
                  <li>• Participer aux événements officiels du football algérien</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 border-l-4 border-purple-400">
                <h4 className="font-semibold text-purple-800 mb-2">Priorité 3: Différenciation Technologique</h4>
                <p className="text-sm text-purple-700 mb-2">
                  Développer des fonctionnalités uniques difficiles à répliquer par la concurrence, 
                  particulièrement autour de la collaboration en temps réel.
                </p>
                <ul className="text-xs text-purple-600 space-y-1">
                  <li>• Perfectionner la synchronisation multi-utilisateurs</li>
                  <li>• Intégrer IA pour suggestions tactiques automatiques</li>
                  <li>• Développer module de formation intégré</li>
                  <li>• Créer API pour intégrations tierces</li>
                </ul>
              </div>
            </div>

            <h3 className="text-lg font-semibold">8.2 Roadmap de Développement</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                <div className="w-16 text-center bg-primary text-white rounded px-2 py-1 text-sm font-bold">
                  Q1 2024
                </div>
                <div className="flex-1">
                  <strong>MVP et Validation</strong> - Lancement version bêta, programme pilote, 
                  premiers retours clients, ajustements produit.
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                <div className="w-16 text-center bg-secondary text-white rounded px-2 py-1 text-sm font-bold">
                  Q2 2024
                </div>
                <div className="flex-1">
                  <strong>Commercialisation</strong> - Lancement officiel, première vague de clients payants, 
                  partenariat FAF, embauche équipe commerciale.
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                <div className="w-16 text-center bg-accent text-white rounded px-2 py-1 text-sm font-bold">
                  Q3 2024
                </div>
                <div className="flex-1">
                  <strong>Expansion Fonctionnelle</strong> - Module académies, version mobile, 
                  intégrations avancées, programme certification.
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
                <div className="w-16 text-center bg-muted text-white rounded px-2 py-1 text-sm font-bold">
                  Q4 2024
                </div>
                <div className="flex-1">
                  <strong>Consolidation</strong> - Optimisation produit, expansion segment individuel, 
                  préparation expansion régionale.
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold">8.3 Facteurs Critiques de Succès</h3>
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Facteurs Internes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Qualité et stabilité du produit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Équipe commerciale performante</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Support client excellent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Innovation continue</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Facteurs Externes</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Soutien institutionnel (FAF/DTN)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Adoption par clubs influents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Évolution favorable réglementation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Stabilité économique locale</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">Conclusion et Perspectives</h3>
              <p className="text-blue-700 mb-4">
                L'analyse du marché algérien révèle une opportunité significative pour SportDataAnalytics. 
                Le timing est optimal avec l'émergence de l'analyse football et le besoin croissant de 
                professionnalisation. Notre approche locale, conforme aux réglementations et adaptée 
                aux besoins spécifiques du marché, constitue un avantage concurrentiel durable.
              </p>
              <p className="text-blue-700 font-medium">
                Le succès reposera sur une exécution rigoureuse de la stratégie de pénétration, 
                l'établissement rapide de partenariats clés, et la capacité à maintenir l'innovation 
                face à une concurrence internationale potentielle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketStudyDocument;