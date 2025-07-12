
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Star,
  Video,
  Mic,
  Play,
  Eye,
  Timer,
  UserCheck
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
      title: "⚽ RealTime Football Tracker",
      subtitle: "Plateforme collaborative de suivi de matchs en temps réel",
      content: (
        <div className="text-center space-y-8">
          <div className="relative mx-auto w-32 h-32 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
            <Play className="h-16 w-16 text-white" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">FootballTracker Pro</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Solution complète de suivi et analyse de matchs en temps réel avec collaboration multi-utilisateurs
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Multiple</div>
              <div className="text-sm text-muted-foreground">Trackers Simultanés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Temps Réel</div>
              <div className="text-sm text-muted-foreground">Suivi Live</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">Intégré</div>
              <div className="text-sm text-muted-foreground">Video + Voice</div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Core Platform Features
    {
      title: "🎯 Fonctionnalités Principales",
      subtitle: "Une plateforme complète pour le suivi de matchs professionnel",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Eye className="h-6 w-6 text-blue-500" />
              Suivi en Temps Réel
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Multiple trackers simultanés sur un même match
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Enregistrement d'événements en temps réel
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Synchronisation automatique entre utilisateurs
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                Interface tactile optimisée pour tablettes
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Video className="h-6 w-6 text-green-500" />
              Analyse Intégrée
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Intégration vidéo YouTube et upload direct
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Détection automatique joueurs/ballon (IA)
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Statistiques avancées et heatmaps
              </li>
              <li className="flex items-start gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                Rapports automatiques post-match
              </li>
            </ul>
          </div>
        </div>
      )
    },

    // Slide 3: Collaboration Features
    {
      title: "🤝 Collaboration et Gestion",
      subtitle: "Outils professionnels pour équipes d'analyse",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Mic className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Voice Chat</h4>
                <p className="text-sm text-muted-foreground">Communication en temps réel</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Multi-Tracker</h4>
                <p className="text-sm text-muted-foreground">Plusieurs analystes simultanés</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <UserCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Gestion Rôles</h4>
                <p className="text-sm text-muted-foreground">Admin/Tracker/Manager</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Timer className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Chrono Sync</h4>
                <p className="text-sm text-muted-foreground">Synchronisation temporelle</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-semibold mb-4 text-foreground">Capacités Techniques</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm">
                <li>✅ Interface tactile responsive</li>
                <li>✅ Sauvegarde temps réel Supabase</li>
                <li>✅ Notifications push système</li>
                <li>✅ Gestion absences/remplacements</li>
              </ul>
              <ul className="space-y-2 text-sm">
                <li>✅ Export données CSV/JSON</li>
                <li>✅ Authentification sécurisée</li>
                <li>✅ Monitoring batterie/connexion</li>
                <li>✅ Interface piano pour événements</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Market Opportunity
    {
      title: "🌍 Opportunité Marché",
      subtitle: "Digitalisation du football professionnel algérien",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Marché Cible
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Clubs Ligue 1/2</span>
                  <span className="font-semibold">56 clubs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Centres Formation</span>
                  <span className="font-semibold">50+ centres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Académies Privées</span>
                  <span className="font-semibold">100+ académies</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Fédérations Régionales</span>
                  <span className="font-semibold">48 wilayas</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Problèmes Résolus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Analyse manuelle:</strong> Erreurs et lenteur
                  </div>
                  <div className="text-sm">
                    <strong>Pas de collaboration:</strong> Travail isolé
                  </div>
                  <div className="text-sm">
                    <strong>Outils coûteux:</strong> Solutions internationales
                  </div>
                  <div className="text-sm">
                    <strong>Pas d'intégration:</strong> Données fragmentées
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Avantages Concurrentiels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-sm">
                    <strong>Temps réel:</strong> Collaboration instantanée
                  </div>
                  <div className="text-sm">
                    <strong>Abordable:</strong> Modèle SaaS accessible
                  </div>
                  <div className="text-sm">
                    <strong>Complet:</strong> Video + Analytics + Voice
                  </div>
                  <div className="text-sm">
                    <strong>Local:</strong> Support et formation DZ
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-6 rounded-lg">
            <h4 className="font-semibold mb-3 text-foreground">Proposition de Valeur Unique</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>🎯 Solution Collaborative:</strong> Première plateforme permettant à plusieurs analystes de travailler simultanément sur le même match
              </div>
              <div>
                <strong>💰 Modèle Accessible:</strong> Pay-per-use ou abonnement mensuel adapté aux budgets locaux
              </div>
              <div>
                <strong>🤝 Formation Incluse:</strong> Support technique et formation des équipes d'analyse
              </div>
              <div>
                <strong>🚀 Innovation Continue:</strong> Nouvelles fonctionnalités basées sur les besoins terrain
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 5: Business Model
    {
      title: "💼 Modèle Économique",
      subtitle: "Revenus récurrents et services à valeur ajoutée",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Sources de Revenus</h4>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Abonnements SaaS</span>
                      <Badge variant="default">Récurrent</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(45000)}/club/mois
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Accès plateforme complète + support
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Pay-per-Match</span>
                      <Badge variant="secondary">Flexible</Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(8000)}/match
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Pour clubs occasionnels
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Formation & Consulting</span>
                      <Badge variant="outline">Service</Badge>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(120000)}/formation
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Formation analystes + setup
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Projections (36 mois)</h4>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">An 1 (10 clubs)</div>
                      <div className="text-xl font-bold">{formatCurrency(5400000)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">An 2 (25 clubs)</div>
                      <div className="text-xl font-bold">{formatCurrency(13500000)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">An 3 (40 clubs)</div>
                      <div className="text-xl font-bold">{formatCurrency(21600000)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Marge Brute</div>
                      <div className="text-xl font-bold text-green-600">80%</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Développement Platform</span>
                    <span className="font-medium">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Commercial & Marketing</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Support & Formation</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6 rounded-lg">
            <h4 className="font-semibold mb-3 text-foreground">Métriques Clés de Performance</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">12 mois</div>
                <div className="text-sm text-muted-foreground">Time to Break-even</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">5%</div>
                <div className="text-sm text-muted-foreground">Churn mensuel</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">85%</div>
                <div className="text-sm text-muted-foreground">Satisfaction client</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">3.2</div>
                <div className="text-sm text-muted-foreground">Matches/club/mois</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 6: Technology & Architecture
    {
      title: "⚡ Architecture Technique",
      subtitle: "Stack moderne pour performance et scalabilité",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Technologies Utilisées</h3>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Frontend</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• React 18 + TypeScript</li>
                    <li>• Tailwind CSS + Shadcn/ui</li>
                    <li>• React Query (TanStack)</li>
                    <li>• Framer Motion</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Backend & Database</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Supabase (PostgreSQL)</li>
                    <li>• Real-time subscriptions</li>
                    <li>• Row Level Security (RLS)</li>
                    <li>• Edge Functions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Services Externes</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• LiveKit (Voice/Video)</li>
                    <li>• Python AI Detection</li>
                    <li>• YouTube API</li>
                    <li>• Roboflow Vision AI</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-foreground">Capacités Développées</h3>
              
              <div className="space-y-4">
                <Card className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Temps Réel</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Synchronisation multi-utilisateurs</li>
                      <li>• Notifications push instantanées</li>
                      <li>• Gestion déconnexions/reconnexions</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Interface Pro</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Interface tactile optimisée</li>
                      <li>• Piano virtuel pour événements</li>
                      <li>• Drag & drop intuitif</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">Analytics Avancés</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Heatmaps et visualisations</li>
                      <li>• Statistiques temps réel</li>
                      <li>• Export multi-formats</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-semibold mb-3 text-foreground">Architecture Scalable</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>🚀 Performance:</strong> Interface responsive supportant 10+ trackers simultanés par match
              </div>
              <div>
                <strong>🔒 Sécurité:</strong> Authentification JWT, chiffrement données, audit complet
              </div>
              <div>
                <strong>📱 Multi-device:</strong> Web responsive, PWA mobile, support tablettes
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 7: Roadmap & Investment
    {
      title: "🚀 Roadmap & Financement",
      subtitle: "Plan de développement et besoins d'investissement",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Phase 1: MVP Opérationnel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-bold text-green-600">
                  ✅ TERMINÉ
                </div>
                <ul className="text-sm space-y-1">
                  <li>✓ Plateforme multi-tracker</li>
                  <li>✓ Intégration vidéo/voice</li>
                  <li>✓ Interface tactile</li>
                  <li>✓ Analytics de base</li>
                  <li>✓ Tests alpha avec 3 clubs</li>
                </ul>
                <div className="pt-2">
                  <Badge variant="default">Opérationnel</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Phase 2: Commercialisation (6 mois)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(4500000)}
                </div>
                <ul className="text-sm space-y-1">
                  <li>• 10 premiers clients payants</li>
                  <li>• Équipe commerciale (3 pers)</li>
                  <li>• Support technique 24/7</li>
                  <li>• Formations clubs</li>
                  <li>• Amélioration IA détection</li>
                </ul>
                <div className="pt-2">
                  <Badge variant="secondary">En cours</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-purple-500" />
                  Phase 3: Scale National (12 mois)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-bold text-primary">
                  {formatCurrency(8500000)}
                </div>
                <ul className="text-sm space-y-1">
                  <li>• 40+ clubs actifs</li>
                  <li>• Partenariat FAF</li>
                  <li>• Mobile app native</li>
                  <li>• IA prédictive avancée</li>
                  <li>• Expansion Maghreb</li>
                </ul>
                <div className="pt-2">
                  <Badge variant="outline">Planifié</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Utilisation des Fonds (Phase 2+3)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Développement Produit</span>
                  <span className="font-medium">35%</span>
                </div>
                <Progress value={35} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Équipe Commerciale & Marketing</span>
                  <span className="font-medium">30%</span>
                </div>
                <Progress value={30} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Support & Formation Clients</span>
                  <span className="font-medium">20%</span>
                </div>
                <Progress value={20} className="h-3" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Infrastructure & Opérations</span>
                  <span className="font-medium">15%</span>
                </div>
                <Progress value={15} className="h-3" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Objectifs 24 Mois</h4>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">Clubs Actifs</span>
                    <span className="font-semibold">40+ clubs</span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">ARR (Annual Recurring Revenue)</span>
                    <span className="font-semibold">{formatCurrency(21600000)}</span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">Équipe</span>
                    <span className="font-semibold">12 employés</span>
                  </div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="flex justify-between">
                    <span className="text-sm">Matchs Trackés/Mois</span>
                    <span className="font-semibold">120+ matchs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 rounded-lg text-center">
            <h4 className="text-xl font-semibold mb-2 text-foreground">Recherche de Financement Série A</h4>
            <div className="text-3xl font-bold text-primary mb-2">
              {formatCurrency(13000000)}
            </div>
            <p className="text-muted-foreground mb-4">
              Pour accélérer la commercialisation et conquérir le marché algérien
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="default">Business Angels Sports</Badge>
              <Badge variant="secondary">Fonds d'Investissement</Badge>
              <Badge variant="outline">Subventions Innovation</Badge>
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
            FootballTracker Pro - Plateforme collaborative de suivi de matchs
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
