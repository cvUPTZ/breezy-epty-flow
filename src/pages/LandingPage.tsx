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
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "Conformité Juridique Garantie (Loi 25-11)",
      description: "Notre plateforme est 100% conforme à la loi algérienne sur la protection des données, avec un hébergement local et un audit trail complet pour une tranquillité d'esprit totale.",
      gradient: "from-green-500/10 to-accent/10",
    },
    {
      icon: <Globe className="h-8 w-8 text-blue-500" />,
      title: "Expertise Football Local (Interface AR/FR)",
      description: "Une solution conçue pour le football algérien, avec une interface bilingue (Arabe/Français), des métriques adaptées aux tactiques locales et un support sur site.",
      gradient: "from-blue-500/10 to-secondary/10",
    },
    {
      icon: <UserCheck className="h-8 w-8 text-orange-500" />,
      title: "Formation Intégrée et Obligatoire",
      description: "Nous garantissons l'adoption de l'outil grâce à une formation certifiante obligatoire pour tous les utilisateurs, assurant une utilisation efficace et homogène.",
      gradient: "from-orange-500/10 to-muted/20",
    },
    {
      icon: <Database className="h-8 w-8 text-purple-500" />,
      title: "Données Propriétaires Uniques",
      description: "Construisez un historique de données unique sur le football algérien, créant un avantage concurrentiel durable pour votre club ou organisation.",
      gradient: "from-purple-500/10 to-primary/10",
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Enregistrement d'Événements en Direct",
      description: "Saisissez méticuleusement chaque événement de match en temps réel avec notre interface 'piano' spécialisée et collaborative.",
      gradient: "from-primary/10 to-accent/10",
    },
    {
      icon: <Video className="h-8 w-8 text-red-500" />,
      title: "Analyse Vidéo Intégrée",
      description: "Liez les événements enregistrés aux horodatages vidéo de multiples sources pour une analyse post-match complète et des revues tactiques approfondies.",
      gradient: "from-red-500/10 to-secondary/10",
    },
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      title: "Performance Améliorée",
      description: "Identifiez les points forts, faibles, et tendances pour optimiser les stratégies et performances de l'équipe.",
    },
    {
      icon: <Timer className="h-6 w-6 text-primary" />,
      title: "Analyse en Temps Réel & Collaborative",
      description: "Suivez et enregistrez les événements en direct avec plusieurs analystes, recevez des notifications et communiquez efficacement.",
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "Efficacité Opérationnelle",
      description: "Optimisez les workflows d'analyse grâce aux outils administratifs, assignations spécialisées et gestion des trackers.",
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-primary" />,
      title: "Prise de Décision Éclairée",
      description: "Basez vos décisions tactiques et de développement sur des données précises, des analyses vidéo et des rapports complets.",
    }
  ];

  const pricingPlans = [
    {
      name: "Basic",
      price: "6,000 DZD",
      period: "/mois",
      description: "Idéal pour les clubs de Ligue 2 et les académies.",
      icon: <Star className="h-6 w-6 text-primary" />,
      features: [
        "5 matchs analysés / mois",
        "2 comptes analystes",
        "Statistiques de base",
        "Analyse vidéo simple",
        "Support par email",
      ],
      popular: false,
      cardStyle: "bg-card/60 backdrop-blur-lg border-border hover:border-primary/30 hover:shadow-xl rounded-2xl",
      buttonStyle: "bg-primary hover:bg-primary/90 text-primary-foreground"
    },
    {
      name: "Professional",
      price: "12,000 DZD",
      period: "/mois",
      description: "Pour les clubs de Ligue 1 qui visent la performance.",
      icon: <Crown className="h-6 w-6 text-primary" />,
      features: [
        "20 matchs analysés / mois",
        "5 comptes analystes",
        "Statistiques avancées (heatmaps, etc.)",
        "Analyse vidéo complète",
        "Gestion des formations tactiques",
        "Support prioritaire",
      ],
      popular: true,
      cardStyle: "bg-card border-primary shadow-2xl scale-105 relative rounded-2xl",
      buttonStyle: "bg-primary hover:bg-primary/90 text-primary-foreground"
    },
    {
      name: "Premium",
      price: "18,000 DZD",
      period: "/mois",
      description: "La solution ultime pour les top clubs et les fédérations.",
      icon: <Shield className="h-6 w-8 text-primary" />,
      features: [
        "Matchs et analystes illimités",
        "Tout du plan Professional",
        "Consulting tactique inclus",
        "Accès API",
        "Support sur site et formation continue",
      ],
      popular: false,
      cardStyle: "bg-card/60 backdrop-blur-lg border-border hover:border-primary/30 hover:shadow-xl rounded-2xl",
      buttonStyle: "bg-primary hover:bg-primary/90 text-primary-foreground"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              Sports Data Analytics SDA
            </h1>
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Se Connecter
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-accent/10"></div>
        <div className="container mx-auto text-center max-w-5xl relative">
          <Badge className="mb-6 bg-secondary text-secondary-foreground border-border px-6 py-2 text-sm font-medium">
            Plateforme d'Analyse et Gestion pour le Sport Algérien
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="text-foreground">
              Révolutionnez l'Analyse Sportive
            </span>
            <br />
            <span className="text-primary">
              en Algérie
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-3xl mx-auto">
            Une plateforme tout-en-un conçue pour les réalités du sport algérien. De l'enregistrement détaillé à l'analyse vidéo, transformez vos données en avantage concurrentiel.
          </p>
          <div className="flex gap-6 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              <PlayCircle className="mr-3 h-6 w-6" />
              Commencer Maintenant
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-10 py-4 border-border hover:bg-accent shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Eye className="mr-3 h-6 w-6" />
              Voir la Démo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
                Nos Fonctionnalités Clés Professionnelles
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Découvrez comment notre plateforme transforme l'analyse et la gestion sportive avec des outils de pointe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
            <Card key={index} className={`border border-border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-card/60 backdrop-blur-lg rounded-2xl overflow-hidden`}>
              <CardHeader className="text-center pb-4 pt-8">
                <div className={`mx-auto mb-6 p-4 bg-gradient-to-br ${feature.gradient} rounded-xl w-fit shadow-lg`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-foreground leading-tight">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <p className="text-muted-foreground text-center leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
                Des Tarifs Adaptés au Marché Algérien
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Des solutions conçues pour les clubs, académies et fédérations en Algérie.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`${plan.cardStyle} transition-all duration-300 transform hover:-translate-y-2 overflow-hidden`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-6 py-2 shadow-lg">
                    Le Plus Populaire
                  </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="mx-auto mb-4 p-4 bg-card/80 backdrop-blur-sm rounded-xl w-fit shadow-lg">
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl text-foreground mb-3">{plan.name}</CardTitle>
                  <div className="mb-3">
                    <span className="text-5xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-lg">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed px-4">{plan.description}</p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-card-foreground leading-relaxed">{feature}</span>
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
            <h3 className="text-3xl font-bold mb-8 text-foreground">
                Pourquoi Choisir Notre Modèle ?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Sans Engagement", desc: "Résiliez à tout moment sans frais cachés", color: "blue" },
                { icon: Users, title: "Support Inclus", desc: "Formation et assistance technique comprise", color: "emerald" },
                { icon: Zap, title: "Mises à Jour", desc: "Nouvelles fonctionnalités automatiques", color: "purple" },
                { icon: Database, title: "Vos Données", desc: "Export libre de toutes vos analyses", color: "amber" }
              ].map((item, index) => (
                <div key={index} className="text-center group">
                  <div className={`w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                    <item.icon className={`h-8 w-8 text-primary`} />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2 text-lg">{item.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
                Les Avantages Stratégiques de Notre Plateforme
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Découvrez les bénéfices concrets qui font la différence pour votre équipe et votre organisation.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className={`flex gap-6 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border backdrop-blur-sm bg-card/60 border-border`}>
                <div className="flex-shrink-0 p-3 bg-card/80 backdrop-blur-sm rounded-xl shadow-md">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 leading-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
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
              <div key={index} className="p-8 bg-card/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-border">
                <div className={`w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <item.icon className={`h-10 w-10 text-primary`} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4 leading-tight">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20 px-4 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-4xl font-bold mb-8 text-foreground">
              Technologies de Pointe
          </h2>
          <p className="text-xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed">
            Notre plateforme utilise les dernières technologies web pour offrir une expérience utilisateur exceptionnelle, robuste et sécurisée.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "React", description: "Interface dynamique", color: "blue" },
              { name: "TypeScript", description: "Code fiable", color: "indigo" },
              { name: "Supabase", description: "Backend & BDD scalable", color: "emerald" },
              { name: "Tailwind CSS", description: "Design moderne", color: "purple" }
            ].map((tech, index) => (
              <div key={index} className="p-6 bg-card/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-border">
                <div className={`w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Zap className={`h-8 w-8 text-primary`} />
                </div>
                <h4 className="font-semibold text-foreground mb-2 text-lg">{tech.name}</h4>
                <p className="text-muted-foreground">{tech.description}</p>
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
      <footer className="bg-card text-card-foreground py-16 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold">Sports Data Analytics SDA</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                La plateforme de référence pour l'analyse et la gestion professionnelle sportive.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Services Clés</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Analyse Vidéo & Données</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Collaboration en Temps Réel</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Gestion d'Équipes & Joueurs</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Outils Administratifs</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Tutoriels Vidéo</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Support Client Réactif</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Formations Personnalisées</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-6 text-lg">Contact</h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="hover:text-primary transition-colors">contact@sportsdata.pro</li>
                <li className="hover:text-primary transition-colors">+213 XX XX XX XX</li>
                <li className="hover:text-primary transition-colors">Alger, Algérie</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} Sports Data Analytics SDA. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
