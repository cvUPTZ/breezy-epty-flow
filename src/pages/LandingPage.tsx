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
  Check,
  Crown,
  Star,
  Share2,
  Lightbulb,
  Building,
  School,
  ChevronRight,
  Activity,
  LineChart
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Target className="h-7 w-7" />,
      title: "Analyse de Match & Performance",
      description: "Enregistrement précis des événements en temps réel avec interface intuitive et synchronisation multi-opérateurs.",
    },
    {
      icon: <Video className="h-7 w-7" />,
      title: "Analyse Vidéo Intégrée",
      description: "Liez les événements aux séquences vidéo pour des revues tactiques approfondies et contextualisées.",
    },
    {
      icon: <Users className="h-7 w-7" />,
      title: "Gestion d'Équipes",
      description: "Administrez effectifs, profils joueurs et schémas tactiques avec des outils de formation avancés.",
    },
    {
      icon: <BarChart3 className="h-7 w-7" />,
      title: "Statistiques & Visualisations",
      description: "Tableaux de bord interactifs, cartes de chaleur, graphiques radar et analyses complètes.",
    },
    {
      icon: <Share2 className="h-7 w-7" />,
      title: "Collaboration d'Équipe",
      description: "Travail simultané multi-analystes avec communication vocale intégrée.",
    },
    {
      icon: <Shield className="h-7 w-7" />,
      title: "Scouting & Détection",
      description: "Outils de détection de talents et rapports de scouting professionnels.",
    }
  ];

  const benefits = [
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Améliorée",
      description: "Identifiez les tendances pour optimiser les stratégies de l'équipe.",
    },
    {
      icon: <Timer className="h-6 w-6" />,
      title: "Analyse Temps Réel",
      description: "Suivi et enregistrement des événements en direct avec collaboration.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Efficacité Opérationnelle",
      description: "Workflows optimisés et outils administratifs avancés.",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Décisions Éclairées",
      description: "Basez vos décisions tactiques sur des données précises.",
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "---",
      period: "/mois",
      description: "Pour les clubs amateurs et académies en développement.",
      icon: <Star className="h-6 w-6" />,
      features: [
        "Jusqu'à 5 matchs par mois",
        "2 analystes",
        "Statistiques de base",
        "Support par email",
      ],
      popular: false,
    },
    {
      name: "Pro",
      price: "---",
      period: "/mois",
      description: "Pour les clubs professionnels et grandes académies.",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Matchs illimités",
        "Jusqu'à 10 analystes",
        "Statistiques avancées",
        "Analyse vidéo complète",
        "Support prioritaire",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Sur devis",
      period: "",
      description: "Solution personnalisée pour fédérations et ligues.",
      icon: <Shield className="h-6 w-6" />,
      features: [
        "Tout du plan Pro",
        "API Access",
        "Formation dédiée",
        "Support 24/7",
      ],
      popular: false,
    }
  ];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-secondary/95 backdrop-blur-md border-b border-secondary-foreground/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Logo Placeholder */}
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary-foreground tracking-tight">
                Tacta
              </h1>
              <p className="text-xs text-secondary-foreground/60">Sports Analytics</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/auth')} 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Se Connecter
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-secondary">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-sm font-medium">
              Football Performance & Data Analysis
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-secondary-foreground">
              Au Service de la
              <span className="text-primary block mt-2">Performance Sportive</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Plateforme complète d'analyse et de gestion pour le football. 
              Scouting, analyse de match et visualisation de données.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 shadow-lg shadow-primary/25"
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Commencer
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6 border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10"
              >
                <Eye className="mr-2 h-5 w-5" />
                Voir la Démo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Nos Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des outils professionnels pour transformer votre approche de l'analyse sportive.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:border-primary/30 group"
              >
                <CardHeader className="pb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <span className="text-primary">{feature.icon}</span>
                  </div>
                  <CardTitle className="text-lg text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary-foreground">
              Avantages Stratégiques
            </h2>
            <p className="text-lg text-secondary-foreground/70 max-w-2xl mx-auto">
              Les bénéfices concrets qui font la différence pour votre équipe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex gap-4 p-6 rounded-xl bg-secondary-foreground/5 border border-secondary-foreground/10 hover:bg-secondary-foreground/10 transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <span className="text-primary">{benefit.icon}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-secondary-foreground/70 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Placeholder */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Tarification
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des forfaits adaptés à vos besoins. Contactez-nous pour plus de détails.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative border transition-all duration-300 ${
                  plan.popular 
                    ? 'border-primary shadow-lg shadow-primary/10 scale-105' 
                    : 'border-border hover:border-primary/30'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary">{plan.icon}</span>
                  </div>
                  <CardTitle className="text-xl text-card-foreground mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-card-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-card-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                    onClick={() => navigate('/auth')}
                  >
                    {plan.price === "Sur devis" ? "Nous Contacter" : "Commencer"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section className="py-20 px-4 bg-secondary">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary-foreground">
            Pour Qui ?
          </h2>
          <p className="text-lg text-secondary-foreground/70 mb-12 max-w-2xl mx-auto">
            Une solution adaptée à tous les acteurs du football.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Coachs", desc: "Analystes tactiques" },
              { icon: School, title: "Académies", desc: "Formation des jeunes" },
              { icon: Building, title: "Clubs Pro", desc: "Performance d'équipe" },
              { icon: LineChart, title: "Analystes", desc: "Data & statistiques" }
            ].map((item, index) => (
              <div 
                key={index} 
                className="p-6 bg-secondary-foreground/5 border border-secondary-foreground/10 rounded-xl hover:bg-secondary-foreground/10 transition-colors"
              >
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-secondary-foreground mb-1">{item.title}</h3>
                <p className="text-secondary-foreground/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="container mx-auto max-w-3xl text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Prêt à Transformer Votre Analyse ?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Rejoignez les clubs qui optimisent leurs performances avec notre plateforme.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
            >
              <UserCheck className="mr-2 h-5 w-5" />
              Créer un Compte
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 px-4 border-t border-secondary-foreground/10">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold">Tacta</span>
              </div>
              <p className="text-secondary-foreground/60 text-sm">
                Au Service de la Performance Sportive
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Services</h4>
              <ul className="space-y-2 text-secondary-foreground/60 text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Analyse Vidéo</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Statistiques</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Scouting</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Support</h4>
              <ul className="space-y-2 text-secondary-foreground/60 text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-sm">Contact</h4>
              <ul className="space-y-2 text-secondary-foreground/60 text-sm">
                <li>tactasports@gmail.com</li>
                <li>0796 63 89 70</li>
                <li>Algérie</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-secondary-foreground/10 mt-8 pt-8 text-center text-secondary-foreground/50 text-sm">
            <p>© {new Date().getFullYear()} Tacta Sports. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
