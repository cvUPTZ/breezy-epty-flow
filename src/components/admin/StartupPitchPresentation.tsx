
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Globe, 
  Shield, 
  Zap,
  Building2,
  BarChart3,
  MapPin,
  Clock,
  Award,
  Lightbulb,
  Rocket,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  PlayCircle,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Camera,
  Mic,
  Brain,
  Network,
  Settings,
  Trophy,
  Flag,
  Calendar,
  Banknote
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
    {
      title: "Vue d'ensemble",
      subtitle: "Plateforme d'Analyse Sportive IA pour le Football Algérien",
      content: "overview"
    },
    {
      title: "Architecture Technique",
      subtitle: "Stack Technologique et Innovation",
      content: "tech"
    },
    {
      title: "Modèle d'Affaires",
      subtitle: "Stratégie Revenue et Positionnement",
      content: "business"
    },
    {
      title: "Projections Financières",
      subtitle: "Croissance et Rentabilité",
      content: "financial"
    },
    {
      title: "Analyse de Marché",
      subtitle: "Opportunités en Algérie et Expansion",
      content: "market"
    },
    {
      title: "Gestion des Risques",
      subtitle: "Mitigation et Stratégies de Contingence",
      content: "risks"
    },
    {
      title: "Feuille de Route",
      subtitle: "Étapes Clés et Besoins en Financement",
      content: "roadmap"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Flag className="h-8 w-8" />
            FootballAI Analytics
          </h1>
          <p className="text-green-100 mt-1">Révolutionner l'Analyse Sportive en Algérie</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-white/20 text-white border-white/30">
            Slide {currentSlide + 1} / {slides.length}
          </Badge>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={prevSlide} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              ←
            </Button>
            <Button variant="outline" size="sm" onClick={nextSlide} className="bg-white/20 border-white/30 text-white hover:bg-white/30">
              →
            </Button>
          </div>
        </div>
      </div>

      {/* Slide Progress */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        ></div>
      </div>

      {/* Current Slide Title */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{slides[currentSlide].title}</h2>
            <p className="text-gray-600">{slides[currentSlide].subtitle}</p>
          </div>
        </CardContent>
      </Card>

      {/* Slide Content */}
      <div className="min-h-[600px]">
        {/* Overview Slide */}
        {currentSlide === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-yellow-600" />
                  Vision & Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">🎯 Notre Vision</h4>
                  <p className="text-gray-600">
                    Devenir la plateforme de référence pour l'analyse sportive intelligente 
                    au Maghreb, en commençant par révolutionner le football algérien.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">🚀 Notre Mission</h4>
                  <p className="text-gray-600">
                    Démocratiser l'analyse sportive avancée grâce à l'IA, permettant à tous 
                    les clubs - des plus modestes aux plus prestigieux - d'accéder à des outils 
                    de performance de niveau mondial.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-purple-600" />
                  Proposition de Valeur Unique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">Solution Complète</h5>
                    <p className="text-sm text-gray-600">De la capture vidéo à l'analyse prédictive</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">IA Adaptée au Football Local</h5>
                    <p className="text-sm text-gray-600">Algorithmes entraînés sur le jeu algérien</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">Accessibilité Financière</h5>
                    <p className="text-sm text-gray-600">Prix adaptés au marché local</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium">Support Local</h5>
                    <p className="text-sm text-gray-600">Formation et assistance en arabe/français</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  Métriques Clés Actuelles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">95%</div>
                    <p className="text-sm text-gray-600">Précision IA</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">28</div>
                    <p className="text-sm text-gray-600">Clubs Pilotes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">3x</div>
                    <p className="text-sm text-gray-600">Plus Rapide</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">70%</div>
                    <p className="text-sm text-gray-600">Économies Coûts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tech Architecture Slide */}
        {currentSlide === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-purple-600" />
                    Intelligence Artificielle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-600" />
                    <span>Détection d'objets (YOLO v8)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-green-600" />
                    <span>Tracking multi-objets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                    <span>Analyse comportementale</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-red-600" />
                    <span>Prédiction de performance</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-6 w-6 text-blue-600" />
                    Infrastructure Cloud
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600" />
                    <span>Supabase (PostgreSQL)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-purple-600" />
                    <span>Processing GPU distribué</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span>Sécurité niveau entreprise</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span>Temps réel (WebRTC)</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-6 w-6 text-green-600" />
                    Interface Utilisateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    <span>React + TypeScript</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-purple-600" />
                    <span>Commandes vocales</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span>Interface adaptative</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-green-600" />
                    <span>PWA multi-plateforme</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Avantages Techniques Concurrentiels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">🚀 Performance</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Traitement vidéo en temps réel (< 100ms latence)</li>
                      <li>• Détection d'événements avec 95% de précision</li>
                      <li>• Scalabilité automatique selon la charge</li>
                      <li>• Support multi-caméras synchronisées</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg">🔧 Innovation</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Interface "Piano" pour saisie rapide</li>
                      <li>• Collaboration vocale temps réel</li>
                      <li>• IA adaptée aux styles de jeu locaux</li>
                      <li>• Analytics avancés avec visualisations 3D</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Business Model Slide */}
        {currentSlide === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="h-6 w-6 text-green-600" />
                    Sources de Revenus
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <h5 className="font-medium">Abonnements SaaS</h5>
                        <p className="text-sm text-gray-600">Clubs professionnels</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">60%</div>
                        <div className="text-xs text-gray-500">du CA</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h5 className="font-medium">Formation & Consulting</h5>
                        <p className="text-sm text-gray-600">Entraîneurs, analystes</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">25%</div>
                        <div className="text-xs text-gray-500">du CA</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <h5 className="font-medium">Services Premium</h5>
                        <p className="text-sm text-gray-600">Analyses personnalisées</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">15%</div>
                        <div className="text-xs text-gray-500">du CA</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    Segments Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-4">
                      <h5 className="font-medium">Clubs Professionnels</h5>
                      <p className="text-sm text-gray-600">Ligue 1, Ligue 2 (140 clubs)</p>
                      <p className="text-xs text-green-600">ARPU: 25,000 DZD/mois</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-4">
                      <h5 className="font-medium">Centres de Formation</h5>
                      <p className="text-sm text-gray-600">Académies, écoles (200+)</p>
                      <p className="text-xs text-blue-600">ARPU: 12,000 DZD/mois</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-medium">Fédérations</h5>
                      <p className="text-sm text-gray-600">FAF, ligues régionales</p>
                      <p className="text-xs text-purple-600">ARPU: 100,000 DZD/mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Stratégie Go-to-Market</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-green-600 font-bold">1</span>
                    </div>
                    <h4 className="font-semibold">Phase Pilote</h4>
                    <p className="text-sm text-gray-600">
                      Partenariats avec 5 clubs majeurs d'Alger pour validation produit
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <h4 className="font-semibold">Expansion Régionale</h4>
                    <p className="text-sm text-gray-600">
                      Déploiement à Oran, Constantine et autres grandes villes
                    </p>
                  </div>
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-purple-600 font-bold">3</span>
                    </div>
                    <h4 className="font-semibold">Expansion Maghreb</h4>
                    <p className="text-sm text-gray-600">
                      Extension vers Maroc, Tunisie avec adaptations locales
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Projections Slide */}
        {currentSlide === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center">Année 1</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(18000000)}</div>
                  <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Clients:</span>
                      <span className="font-medium">25 clubs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coûts:</span>
                      <span className="font-medium">{formatCurrency(15000000)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Résultat:</span>
                      <span className="font-bold text-green-600">{formatCurrency(3000000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center">Année 2</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="text-3xl font-bold text-blue-600">{formatCurrency(45000000)}</div>
                  <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Clients:</span>
                      <span className="font-medium">65 clubs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coûts:</span>
                      <span className="font-medium">{formatCurrency(32000000)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Résultat:</span>
                      <span className="font-bold text-blue-600">{formatCurrency(13000000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-center">Année 3</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-3">
                  <div className="text-3xl font-bold text-purple-600">{formatCurrency(85000000)}</div>
                  <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Clients:</span>
                      <span className="font-medium">120 clubs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coûts:</span>
                      <span className="font-medium">{formatCurrency(55000000)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Résultat:</span>
                      <span className="font-bold text-purple-600">{formatCurrency(30000000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    Métriques de Croissance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Taux de Croissance CA</span>
                        <span className="text-sm font-medium">150% YoY</span>
                      </div>
                      <Progress value={150} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Marge Brute</span>
                        <span className="text-sm font-medium">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Taux de Rétention</span>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                      <Progress value={92} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                    Besoins en Financement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600">{formatCurrency(150000000)}</div>
                    <p className="text-sm text-gray-600">Levée de fonds Série A</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Développement produit:</span>
                      <span className="font-medium">{formatCurrency(60000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Marketing & Ventes:</span>
                      <span className="font-medium">{formatCurrency(45000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Infrastructure:</span>
                      <span className="font-medium">{formatCurrency(30000000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fonds de roulement:</span>
                      <span className="font-medium">{formatCurrency(15000000)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Market Analysis Slide */}
        {currentSlide === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-green-600" />
                    Marché Algérien
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">140+</div>
                      <p className="text-xs text-gray-600">Clubs Professionnels</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">48</div>
                      <p className="text-xs text-gray-600">Wilayas</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">2M+</div>
                      <p className="text-xs text-gray-600">Joueurs Licenciés</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">2.5B</div>
                      <p className="text-xs text-gray-600">Marché DZD</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <h5 className="font-medium">Opportunités Clés:</h5>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Digitalisation accélérée post-COVID</li>
                      <li>• Investissements FAF en technologie</li>
                      <li>• Nouvelle génération d'entraîneurs</li>
                      <li>• Pression concurrentielle internationale</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                    Expansion Régionale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-3">
                      <h5 className="font-medium">Maroc</h5>
                      <p className="text-sm text-gray-600">160 clubs, marché mature</p>
                      <p className="text-xs text-green-600">TAM: 3.2B DZD équivalent</p>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h5 className="font-medium">Tunisie</h5>
                      <p className="text-sm text-gray-600">80 clubs, forte digitalisation</p>
                      <p className="text-xs text-blue-600">TAM: 1.8B DZD équivalent</p>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-3">
                      <h5 className="font-medium">Égypte</h5>
                      <p className="text-sm text-gray-600">200+ clubs, marché premium</p>
                      <p className="text-xs text-purple-600">TAM: 5.5B DZD équivalent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Analyse Concurrentielle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Critère</th>
                        <th className="text-left p-3">Notre Solution</th>
                        <th className="text-left p-3">Concurrents Internationaux</th>
                        <th className="text-left p-3">Solutions Locales</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Prix</td>
                        <td className="p-3">
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            Adapté local
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="destructive">
                            Très élevé
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            Variable
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Technologie IA</td>
                        <td className="p-3">
                          <Badge variant="default" className="bg-blue-100 text-blue-700">
                            Avancée
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="default">
                            Mature
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline">
                            Basique
                          </Badge>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Support Local</td>
                        <td className="p-3">
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            Excellent
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="destructive">
                            Limité
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant="secondary">
                            Moyen
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Risk Management Slide */}
        {currentSlide === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    Risques Identifiés
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-red-500 pl-3">
                      <h5 className="font-medium text-red-700">Risque Technologique</h5>
                      <p className="text-sm text-gray-600">Évolution rapide des technologies IA</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Impact: Élevé</span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Probabilité: Moyenne</span>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 pl-3">
                      <h5 className="font-medium text-orange-700">Risque Marché</h5>
                      <p className="text-sm text-gray-600">Adoption lente par les clubs traditionnels</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Impact: Moyen</span>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Probabilité: Élevée</span>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-yellow-500 pl-3">
                      <h5 className="font-medium text-yellow-700">Risque Financier</h5>
                      <p className="text-sm text-gray-600">Volatilité du dinar algérien</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Impact: Moyen</span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Probabilité: Moyenne</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    Stratégies de Mitigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-green-500 pl-3">
                      <h5 className="font-medium text-green-700">Innovation Continue</h5>
                      <p className="text-sm text-gray-600">R&D 15% du CA, veille technologique</p>
                      <div className="text-xs text-green-600 mt-1">✓ Équipe dédiée R&D</div>
                    </div>
                    
                    <div className="border-l-4 border-blue-500 pl-3">
                      <h5 className="font-medium text-blue-700">Stratégie Pédagogique</h5>
                      <p className="text-sm text-gray-600">Formation gratuite, ambassadeurs clubs</p>
                      <div className="text-xs text-blue-600 mt-1">✓ Programme partenaires</div>
                    </div>
                    
                    <div className="border-l-4 border-purple-500 pl-3">
                      <h5 className="font-medium text-purple-700">Diversification</h5>
                      <p className="text-sm text-gray-600">Revenus multi-devises, hedging</p>
                      <div className="text-xs text-purple-600 mt-1">✓ Expansion internationale</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Plan de Contingence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h4 className="font-semibold text-red-700">Scénario Pessimiste</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Pivot vers formation uniquement</li>
                      <li>• Réduction d'équipe 40%</li>
                      <li>• Focus marché amateur</li>
                      <li>• Runway: 18 mois</li>
                    </ul>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h4 className="font-semibold text-yellow-700">Scénario Réaliste</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Croissance progressive</li>
                      <li>• Expansion sélective</li>
                      <li>• Partenariats stratégiques</li>
                      <li>• Rentabilité: 24 mois</li>
                    </ul>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Rocket className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-700">Scénario Optimiste</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Adoption rapide FAF</li>
                      <li>• Expansion Maghreb Year 2</li>
                      <li>• Acquisition concurrents</li>
                      <li>• IPO possible Year 5</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Roadmap Slide */}
        {currentSlide === 6 && (
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Feuille de Route 2024-2027
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    
                    <div className="relative flex items-start space-x-4 pb-6">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">Q1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">Finalisation MVP & Pilotes</h4>
                        <p className="text-gray-600 mb-2">Perfectionner la plateforme avec 5 clubs pilotes</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Interface utilisateur</Badge>
                          <Badge variant="outline">IA de détection</Badge>
                          <Badge variant="outline">Tests utilisateurs</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start space-x-4 pb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">Q2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">Lancement Commercial</h4>
                        <p className="text-gray-600 mb-2">Déploiement auprès de 25 clubs en Algérie</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Équipe commerciale</Badge>
                          <Badge variant="outline">Marketing digital</Badge>
                          <Badge variant="outline">Support client</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start space-x-4 pb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">Q3</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">Expansion Nationale</h4>
                        <p className="text-gray-600 mb-2">Couverture des principales villes algériennes</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Oran & Constantine</Badge>
                          <Badge variant="outline">Équipes régionales</Badge>
                          <Badge variant="outline">Partenariats FAF</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative flex items-start space-x-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">Q4</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">Préparation Internationale</h4>
                        <p className="text-gray-600 mb-2">Études de marché et adaptations pour le Maghreb</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Analyse Maroc/Tunisie</Badge>
                          <Badge variant="outline">Localisation</Badge>
                          <Badge variant="outline">Levée Série A</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-600" />
                    Équipe & Recrutement
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Équipe actuelle:</span>
                      <span className="font-medium">8 personnes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Objectif fin 2024:</span>
                      <span className="font-medium">25 personnes</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Objectif fin 2025:</span>
                      <span className="font-medium">45 personnes</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <h5 className="font-medium mb-2">Postes clés à pourvoir:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Directeur Commercial</li>
                      <li>• Ingénieurs IA (3)</li>
                      <li>• Responsable Marketing</li>
                      <li>• Support technique (2)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                    Impact Attendu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">500+</div>
                      <p className="text-xs text-gray-600">Emplois créés</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">50M</div>
                      <p className="text-xs text-gray-600">DZD impôts</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">85%</div>
                      <p className="text-xs text-gray-600">Clubs digitalisés</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">1er</div>
                      <p className="text-xs text-gray-600">Région MENA</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <h5 className="font-medium mb-2">Retombées socio-économiques:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Formation de 1000+ professionnels</li>
                      <li>• Rayonnement international du sport algérien</li>
                      <li>• Hub technologique régional</li>
                      <li>• Export de savoir-faire</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-50 to-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="flex items-center gap-2"
            >
              ← Précédent
            </Button>
            
            <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="flex items-center gap-2"
            >
              Suivant →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StartupPitchPresentation;
