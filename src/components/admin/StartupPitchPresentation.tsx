
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Globe, 
  Target, 
  Zap,
  Shield,
  Trophy,
  Rocket,
  Building2,
  MapPin,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

const StartupPitchPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const slides = [
    // Slide 1: Introduction
    {
      title: "🏆 Football Analytics Revolution",
      subtitle: "Transforming Algerian Football Through AI-Powered Analytics",
      content: (
        <div className="text-center space-y-8">
          <div className="relative mx-auto w-32 h-32 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
            <Trophy className="h-16 w-16 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">FootballTracker AI</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Solution complète d'analyse footballistique adaptée au marché algérien
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">140+</div>
              <div className="text-sm text-muted-foreground">Clubs Cibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2M+</div>
              <div className="text-sm text-muted-foreground">Joueurs Licenciés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2.5B</div>
              <div className="text-sm text-muted-foreground">DZD Marché</div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Problem & Solution
    {
      title: "🎯 Problématique & Solution",
      subtitle: "Répondre aux défis du football algérien moderne",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Défis Actuels
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                Analyse manuelle chronophage et imprécise
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                Solutions internationales inadaptées et coûteuses
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                Manque d'outils de formation pour jeunes talents
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                Données fragmentées et non exploitables
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Notre Solution
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Plateforme IA complète et automatisée
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Prix adaptés au marché local
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Formation intégrée et support local
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Analytics en temps réel et prédictifs
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // Slide 3: Technology Stack
    {
      title: "⚡ Architecture Technologique",
      subtitle: "Stack moderne et scalable",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Frontend</h4>
                <p className="text-sm text-muted-foreground">React + TypeScript</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Shield className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Backend</h4>
                <p className="text-sm text-muted-foreground">Supabase + Python</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">IA/ML</h4>
                <p className="text-sm text-muted-foreground">TensorFlow + OpenCV</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Cloud</h4>
                <p className="text-sm text-muted-foreground">Vercel + AWS</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-semibold mb-4 text-foreground">Fonctionnalités Clés</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                <li>✅ Détection automatique des événements</li>
                <li>✅ Analyse vidéo en temps réel</li>
                <li>✅ Tracking multi-joueurs</li>
                <li>✅ Interface collaborative</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li>✅ Rapports statistiques avancés</li>
                <li>✅ API intégrable</li>
                <li>✅ Support mobile et desktop</li>
                <li>✅ Conformité RGPD</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Market Analysis
    {
      title: "🌍 Analyse de Marché",
      subtitle: "Opportunité massive sur le marché algérien",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Marché Local
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Clubs Professionnels</span>
                  <span className="font-semibold">140+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Wilayas Couvertes</span>
                  <span className="font-semibold">48</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Joueurs Licenciés</span>
                  <span className="font-semibold">2M+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taille Marché</span>
                  <span className="font-semibold">2.5B DZD</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Segments Cibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clubs Ligue 1</span>
                    <Badge>20 clubs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clubs Ligue 2</span>
                    <Badge>36 clubs</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Académies</span>
                    <Badge>50+ centres</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fédérations</span>
                    <Badge>FAF + Ligues</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Croissance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">An 1</span>
                    <span className="font-semibold">15 clubs</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">An 2</span>
                    <span className="font-semibold">35 clubs</span>
                  </div>
                  <Progress value={70} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">An 3</span>
                    <span className="font-semibold">50+ clubs</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-6 rounded-lg">
            <h4 className="font-semibold mb-3 text-foreground">Avantages Concurrentiels</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>🎯 Spécialisation Locale:</strong> Solution adaptée aux spécificités du football algérien
              </div>
              <div>
                <strong>💰 Prix Compétitifs:</strong> 70% moins cher que solutions internationales
              </div>
              <div>
                <strong>🤝 Support Local:</strong> Équipe technique et commerciale en Algérie
              </div>
              <div>
                <strong>🚀 Innovation Continue:</strong> R&D locale avec universités partenaires
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Business Model & Financials
    {
      title: "💼 Modèle Économique",
      subtitle: "Sources de revenus diversifiées et scalables",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Sources de Revenus</h4>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Abonnements Clubs</span>
                      <Badge variant="default">Récurrent</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(150000)}/mois
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      10-50 clubs × 3,000-30,000 DZD/mois
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Formation & Consulting</span>
                      <Badge variant="secondary">Projet</Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(80000)}/mois
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Formations entraîneurs + consulting
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Licences API</span>
                      <Badge variant="outline">B2B</Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(40000)}/mois
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Intégrations médias + applications
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Projections Financières</h4>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Revenus An 1</div>
                      <div className="text-xl font-bold">{formatCurrency(3240000)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Revenus An 2</div>
                      <div className="text-xl font-bold">{formatCurrency(7560000)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Revenus An 3</div>
                      <div className="text-xl font-bold">{formatCurrency(12960000)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Marge Brute</div>
                      <div className="text-xl font-bold text-green-600">75%</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coûts R&D</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coûts Commercial</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Coûts Opérationnels</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-lg">
            <h4 className="font-semibold mb-3 text-foreground">Métriques Clés</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">18 mois</div>
                <div className="text-sm text-muted-foreground">Break-even</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">15%</div>
                <div className="text-sm text-muted-foreground">Churn mensuel</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">12x</div>
                <div className="text-sm text-muted-foreground">LTV/CAC</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">35%</div>
                <div className="text-sm text-muted-foreground">Marge nette Y3</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: Risk Analysis
    {
      title: "⚠️ Analyse des Risques",
      subtitle: "Identification et stratégies de mitigation",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Risques Identifiés</h3>
            
            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">Risque Technologique</span>
                  <Badge variant="secondary">Moyen</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Évolution rapide des technologies IA
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Risque Marché</span>
                  <Badge variant="destructive">Élevé</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Adoption lente du digital par les clubs
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Risque Financier</span>
                  <Badge variant="outline">Faible</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Fluctuations du taux de change DZD
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Risque Concurrentiel</span>
                  <Badge variant="secondary">Moyen</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Entrée de géants tech internationaux
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">Stratégies de Mitigation</h3>
            
            <div className="space-y-4">
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Innovation Continue</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Veille technologique constante</li>
                    <li>• Partenariats R&D avec universités</li>
                    <li>• Équipe de développement agile</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Adoption Progressive</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Programme de formation gratuit</li>
                    <li>• Support technique dédié</li>
                    <li>• Démonstrations régulières</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-indigo-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-indigo-500" />
                    <span className="font-medium">Diversification</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Multiples sources de revenus</li>
                    <li>• Expansion géographique prévue</li>
                    <li>• Services complémentaires</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Avantages Défensifs</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>✓ Premier entrant sur le marché algérien</li>
                <li>✓ Données propriétaires et algorithmes</li>
                <li>✓ Relations établies avec FAF</li>
                <li>✓ Coûts de changement élevés pour clients</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Roadmap & Funding
    {
      title: "🚀 Roadmap & Financement",
      subtitle: "Plan de développement et besoins en capital",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Phase 1: Lancement (6 mois)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(2500000)}
                </div>
                <ul className="text-sm space-y-1">
                  <li>✓ Finalisation MVP</li>
                  <li>✓ 5 clubs pilotes</li>
                  <li>✓ Équipe de 8 personnes</li>
                  <li>✓ Certification FAF</li>
                </ul>
                <div className="pt-2">
                  <Badge variant="default">En cours</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Phase 2: Expansion (12 mois)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(5000000)}
                </div>
                <ul className="text-sm space-y-1">
                  <li>• 25 clubs clients</li>
                  <li>• Expansion 3 wilayas</li>
                  <li>• Équipe de 15 personnes</li>
                  <li>• Fonctionnalités avancées</li>
                </ul>
                <div className="pt-2">
                  <Badge variant="secondary">Planifié</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-purple-500" />
                  Phase 3: Scale (18 mois)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(8000000)}
                </div>
                <ul className="text-sm space-y-1">
                  <li>• 50+ clubs clients</li>
                  <li>• Couverture nationale</li>
                  <li>• Équipe de 25 personnes</li>
                  <li>• Expansion régionale</li>
                </ul>
                <div className="pt-2">
                  <Badge variant="outline">Futur</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Utilisation des Fonds</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">R&D et Développement</span>
                  <span className="font-medium">40%</span>
                </div>
                <Progress value={40} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Marketing et Commercial</span>
                  <span className="font-medium">25%</span>
                </div>
                <Progress value={25} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Recrutement</span>
                  <span className="font-medium">20%</span>
                </div>
                <Progress value={20} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Infrastructure</span>
                  <span className="font-medium">10%</span>
                </div>
                <Progress value={10} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fonds de Roulement</span>
                  <span className="font-medium">5%</span>
                </div>
                <Progress value={5} className="h-3" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Métriques de Succès</h4>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">Clients Actifs</span>
                    <span className="font-semibold">50+ clubs</span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">ARR (Annual Recurring Revenue)</span>
                    <span className="font-semibold">{formatCurrency(15000000)}</span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">Part de Marché</span>
                    <span className="font-semibold">35%</span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">Équipe</span>
                    <span className="font-semibold">25 employés</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-lg text-center">
            <h4 className="text-xl font-semibold mb-2 text-foreground">Recherche de Financement</h4>
            <div className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(15500000)}
            </div>
            <p className="text-muted-foreground mb-4">
              Série A pour accélérer la croissance et la pénétration du marché
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="default">Subventions Publiques</Badge>
              <Badge variant="secondary">Investisseurs Privés</Badge>
              <Badge variant="outline">Business Angels</Badge>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Présentation Startup</h1>
          <p className="text-muted-foreground">
            Pitch complet pour le Ministère des Startups
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentSlide + 1} / {slides.length}</Badge>
        </div>
      </div>

      <Card className="min-h-[600px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{slides[currentSlide].title}</CardTitle>
          <p className="text-muted-foreground">{slides[currentSlide].subtitle}</p>
        </CardHeader>
        <CardContent className="p-8">
          {slides[currentSlide].content}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
        >
          Précédent
        </Button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>

        <Button
          variant="outline"
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
};

export default StartupPitchPresentation;
