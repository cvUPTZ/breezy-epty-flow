import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Video, 
  Timer, 
  Target, 
  Shield, 
  Zap, 
  Eye, 
  TrendingUp,
  PlayCircle,
  UserCheck,
  Database,
  Smartphone,
  Globe,
  Check,
  Crown,
  Star,
  Share2,
  Lightbulb,
  Building,
  School
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "Enregistrement d'Événements en Direct et Précis",
      description: "Saisissez méticuleusement chaque événement de match en temps réel (buts, passes décisives, fautes, remplacements) avec notre interface 'piano' spécialisée. Suivez la position du ballon et des joueurs sur un terrain virtuel, et permettez à plusieurs opérateurs de collaborer sur le même match avec une synchronisation parfaite.",
      gradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
      icon: <Video className="h-8 w-8 text-indigo-600" />,
      title: "Analyse Vidéo Intégrée et Synchronisée",
      description: "Liez les événements enregistrés aux horodatages vidéo de multiples sources (y compris YouTube) pour une analyse post-match complète. Visualisez les actions dans leur contexte pour des revues tactiques approfondies.",
      gradient: "from-indigo-500/10 to-purple-500/10",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Gestion Complète des Équipes et Joueurs",
      description: "Administrez vos effectifs, les profils détaillés des joueurs et les schémas tactiques. Assignez les rôles et les positions avec des outils de gestion de formation avancés pour une préparation de match optimale.",
      gradient: "from-purple-500/10 to-violet-500/10",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-sky-600" />,
      title: "Analyses et Visualisations Puissantes",
      description: "Accédez à des tableaux de bord interactifs avec des indicateurs de performance clés. Générez des cartes de chaleur, des graphiques radar, des chronologies d'événements et des tables statistiques complètes pour analyser les performances individuelles et collectives.",
      gradient: "from-sky-500/10 to-blue-500/10",
    },
    {
      icon: <Share2 className="h-8 w-8 text-violet-600" />,
      title: "Collaboration d'Équipe Optimisée",
      description: "Facilitez le travail simultané de plusieurs analystes sur un même match. Assignez des types d'événements spécifiques à chaque opérateur et utilisez la communication vocale intégrée pour une coordination parfaite.",
      gradient: "from-violet-500/10 to-indigo-500/10",
    },
    {
      icon: <Shield className="h-8 w-8 text-fuchsia-600" />,
      title: "Administration et Contrôle Avancés",
      description: "Gérez les accès avec des rôles d'utilisateurs définis (Admin, Manager, Tracker). Surveillez l'état des dispositifs des trackers (batterie, connexion), gérez les absences et consultez les journaux d'audit pour une sécurité et un contrôle total.",
      gradient: "from-fuchsia-500/10 to-purple-500/10",
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
      title: "Performance Améliorée",
      description: "Identifiez les points forts, faibles, et tendances pour optimiser les stratégies et performances de l'équipe.",
    },
    {
      icon: <Timer className="h-6 w-6 text-emerald-600" />,
      title: "Analyse en Temps Réel & Collaborative",
      description: "Suivez et enregistrez les événements en direct avec plusieurs analystes, recevez des notifications et communiquez efficacement.",
    },
    {
      icon: <Zap className="h-6 w-6 text-purple-600" />,
      title: "Efficacité Opérationnelle",
      description: "Optimisez les workflows d'analyse grâce aux outils administratifs, assignations spécialisées et gestion des trackers.",
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-amber-600" />,
      title: "Prise de Décision Éclairée",
      description: "Basez vos décisions tactiques et de développement sur des données précises, des analyses vidéo et des rapports complets.",
    }
  ];

  const pricingPlans = [
    {
      name: "Basique Algérie",
      price: "15,000 DZD",
      period: "/mois",
      description: "Idéal pour les clubs amateurs et les académies en développement.",
      icon: <Star className="h-6 w-6 text-blue-600" />,
      features: [
        "Jusqu'à 5 matchs par mois",
        "2 analystes",
        "Suivi des événements et statistiques de base",
        "Synchronisation vidéo limitée",
        "Gestion d'équipe",
        "Support par email",
      ],
      popular: false,
      cardStyle: "bg-white/60 backdrop-blur-lg border-slate-200/80 hover:border-blue-300 hover:shadow-xl rounded-2xl",
      buttonStyle: "bg-slate-900 hover:bg-slate-800"
    },
    {
      name: "Performance Algérie",
      price: "45,000 DZD",
      period: "/mois",
      description: "Pour les clubs de Ligue 2, les grands clubs amateurs et les académies.",
      icon: <Crown className="h-6 w-6 text-purple-600" />,
      features: [
        "Jusqu'à 15 matchs par mois",
        "Jusqu'à 8 analystes",
        "Statistiques avancées (cartes de chaleur, radar)",
        "Analyse vidéo complète",
        "Gestion des formations tactiques",
        "Collaboration multi-utilisateurs",
        "Support prioritaire",
      ],
      popular: true,
      cardStyle: "bg-gradient-to-br from-purple-50 to-blue-50 border-purple-300 shadow-2xl scale-105 relative rounded-2xl",
      buttonStyle: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
    },
    {
      name: "Élite Algérie",
      price: "Sur devis",
      period: "",
      description: "Solution complète pour les clubs de Ligue 1 et la Fédération (FAF).",
      icon: <Shield className="h-6 w-8 text-emerald-600" />,
      features: [
        "Tout du plan Performance",
        "Matchs et analystes illimités",
        "Collaboration vocale intégrée",
        "Outils d'administration avancés",
        "Accès API",
        "Support et formation personnalisés",
      ],
      popular: false,
      cardStyle: "bg-white/60 backdrop-blur-lg border-slate-200/80 hover:border-emerald-300 hover:shadow-xl rounded-2xl",
      buttonStyle: "bg-emerald-600 hover:bg-emerald-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              FootballAnalytics Pro
            </h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Se Connecter
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="container mx-auto text-center max-w-5xl relative">
          <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 px-6 py-2 text-sm font-medium">
            Plateforme d'Analyse et Gestion pour le Football Algérien
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Révolutionnez l'Analyse de Match
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              en Algérie
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
            Une plateforme tout-en-un conçue pour les réalités du football algérien. De l'enregistrement détaillé à l'analyse vidéo, transformez vos données en avantage concurrentiel.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <PlayCircle className="mr-3 h-6 w-6" />
              Commencer Maintenant
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-10 py-4 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Eye className="mr-3 h-6 w-6" />
              Voir la Démo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Nos Fonctionnalités Clés Professionnelles
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez comment notre plateforme transforme l'analyse et la gestion football avec des outils de pointe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`border border-slate-200/50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/60 backdrop-blur-lg rounded-2xl overflow-hidden`}>
                <CardHeader className="text-center pb-4 pt-8">
                  <div className={`mx-auto mb-6 p-4 bg-gradient-to-br ${feature.gradient} rounded-xl w-fit shadow-lg`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-slate-900 leading-tight">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <p className="text-slate-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-blue-50/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Des Tarifs Adaptés au Marché Algérien
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Des solutions conçues pour les clubs, académies et fédérations en Algérie.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`${plan.cardStyle} transition-all duration-300 transform hover:-translate-y-2 overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 shadow-lg">
                      Le Plus Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl w-fit shadow-lg">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-slate-900 mb-3">{plan.name}</CardTitle>
                  <div className="mb-3">
                    <span className="text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-slate-600 text-lg">{plan.period}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed px-4">{plan.description}</p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.buttonStyle} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 py-3`}
                    onClick={() => navigate('/auth')}
                  >
                    {plan.price === "Sur devis" ? "Nous Contacter" : "Commencer"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-3xl font-bold mb-8">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Pourquoi Choisir Notre Modèle ?
              </span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Sans Engagement", desc: "Résiliez à tout moment sans frais cachés", color: "blue" },
                { icon: Users, title: "Support Inclus", desc: "Formation et assistance technique comprise", color: "emerald" },
                { icon: Zap, title: "Mises à Jour", desc: "Nouvelles fonctionnalités automatiques", color: "purple" },
                { icon: Database, title: "Vos Données", desc: "Export libre de toutes vos analyses", color: "amber" }
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                    <item.icon className={`h-8 w-8 text-${item.color}-600`} />
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-2 text-lg">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Les Avantages Stratégiques de Notre Plateforme
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Découvrez les bénéfices concrets qui font la différence pour votre équipe et votre organisation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className={`flex gap-6 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border backdrop-blur-sm bg-white/60 border-slate-200/80`}>
                <div className="flex-shrink-0 p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-md">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-50 to-indigo-50/50">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold mb-16">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Une Solution Conçue pour le Football Algérien
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "Clubs Professionnels (Ligue 1 & 2)", desc: "Gagnez un avantage concurrentiel, améliorez le développement des joueurs et professionnalisez vos opérations d'analyse.", color: "blue" },
              { icon: School, title: "Clubs Amateurs & Académies", desc: "Accédez à des outils d'analyse de niveau professionnel à un coût abordable pour développer les talents locaux.", color: "emerald" },
              { icon: Building, title: "Fédérations & DTN (FAF)", desc: "Standardisez la collecte de données, supervisez les talents et supportez les équipes nationales avec des analyses poussées.", color: "purple" },
              { icon: BarChart3, title: "Analystes & Médias", desc: "Exploitez des données riches et des outils pointus pour générer des rapports approfondis et du contenu de qualité.", color: "amber" }
            ].map((item, index) => (
              <div key={index} className="p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-200/80">
                <div className={`w-20 h-20 bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <item.icon className={`h-10 w-10 text-${item.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4 leading-tight">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-bold mb-8">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Technologies de Pointe
            </span>
          </h2>
          <p className="text-xl text-slate-600 mb-16 max-w-3xl mx-auto leading-relaxed">
            Notre plateforme utilise les dernières technologies web pour offrir une expérience utilisateur exceptionnelle, robuste et sécurisée.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "React", description: "Interface dynamique", color: "blue" },
              { name: "TypeScript", description: "Code fiable", color: "indigo" },
              { name: "Supabase", description: "Backend & BDD scalable", color: "emerald" },
              { name: "Tailwind CSS", description: "Design moderne", color: "purple" }
            ].map((tech, index) => (
              <div key={index} className="p-6 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-slate-200/80">
                <div className={`w-16 h-16 bg-gradient-to-br from-${tech.color}-100 to-${tech.color}-50 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Zap className={`h-8 w-8 text-${tech.color}-600`} />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2 text-lg">{tech.name}</h4>
                <p className="text-slate-600">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="container mx-auto max-w-5xl text-center relative">
          <h2 className="text-5xl font-bold text-white mb-8 leading-tight">
            Prêt à Transformer Votre Analyse et Gestion de Match ?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Rejoignez les entraîneurs, analystes et clubs qui optimisent leurs performances avec notre plateforme.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <UserCheck className="mr-3 h-6 w-6" />
              Créer un Compte
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-white border-white/30 hover:bg-white/10 hover:border-white text-lg px-10 py-4 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Nous Contacter
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">FootballAnalytics Pro</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                La plateforme de référence pour l'analyse et la gestion professionnelle de matchs de football.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Services Clés</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Analyse Vidéo & Données</li>
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Collaboration en Temps Réel</li>
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Gestion d'Équipes & Joueurs</li>
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Outils Administratifs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Tutoriels Vidéo</li>
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Support Client Réactif</li>
                <li className="hover:text-blue-300 transition-colors cursor-pointer">Formations Personnalisées</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-blue-300 transition-colors">contact@footballanalytics.pro</li>
                <li className="hover:text-blue-300 transition-colors">+33 1 23 45 67 89</li>
                <li className="hover:text-blue-300 transition-colors">Paris, France</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>© {new Date().getFullYear()} FootballAnalytics Pro. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
