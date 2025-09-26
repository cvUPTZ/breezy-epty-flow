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
  Shield,
  Rocket,
  Building2,
  MapPin,
  BarChart3,
  CheckCircle,
  Clock,
  ThumbsUp,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';

const StartupPitchPresentation: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const formatCurrency = (amount: number, short = false) => {
    if (short) {
        if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const slides = [
    // Slide 1: Title
    {
      title: "PITCH DECK STRATÉGIQUE",
      subtitle: "SportDataAnalytics SARL - Plateforme SaaS Football Algeria + Formation Intégrée",
      content: (
        <div className="text-center space-y-4">
          <Rocket className="h-20 w-20 mx-auto text-primary" />
          <h2 className="text-3xl font-bold text-foreground">De la Validation Algérienne à la Domination Régionale</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Valider un modèle économique viable sur le marché algérien avant une expansion maîtrisée.
          </p>
        </div>
      )
    },
    // Slide 2: Opportunity
    {
      title: "🎯 L'OPPORTUNITÉ ALGÉRIENNE",
      subtitle: "Un marché de 2.16M DZD/an, protégé par des barrières réglementaires et culturelles.",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Analyse Bottom-Up du Marché</h3>
                <Card><CardContent className="p-3"><p><strong>Basic (Ligue 2, Académies):</strong> 5 clubs cibles @ 72k DZD = 360k DZD</p></CardContent></Card>
                <Card><CardContent className="p-3"><p><strong>Professional (Ligue 1):</strong> 8 clubs cibles @ 144k DZD = 1,152k DZD</p></CardContent></Card>
                <Card><CardContent className="p-3"><p><strong>Premium (Top Ligue 1):</strong> 3 clubs cibles @ 216k DZD = 648k DZD</p></CardContent></Card>
                <p className="font-bold text-right">Total Addressable: 2,160,000 DZD</p>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Catalyseurs de Croissance</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li><strong>Conformité réglementaire obligatoire:</strong> Loi 25-11 (mise à jour 2024).</li>
                    <li><strong>Professionnalisation accélérée:</strong> Standards FIFA/CAF requis.</li>
                    <li><strong>Budgets formation disponibles:</strong> 15-25k DZD/club validés.</li>
                    <li><strong>Relations institutionnelles établies:</strong> FAF/LFP endorsement en cours.</li>
                </ul>
            </div>
        </div>
      )
    },
    // Slide 3: Solution
    {
      title: "💡 LA SOLUTION VALIDÉE",
      subtitle: "SaaS + Formation = Adoption Garantie & Switching Costs Élevés.",
      content: (
        <div className="space-y-4">
            <h3 className="text-center text-xl font-bold mb-6">Proposition de Valeur Prouvée: "First-Mover + Community Moat + Data Propriétaire"</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card><CardContent className="p-4 text-center"><CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" /><strong>Avantage premier-entrant:</strong> 18 mois d'avance sur la conformité locale.</CardContent></Card>
                <Card><CardContent className="p-4 text-center"><Users className="h-8 w-8 mx-auto text-blue-500 mb-2" /><strong>Formation intégrée:</strong> Switching costs élevés via certification staff.</CardContent></Card>
                <Card><CardContent className="p-4 text-center"><BarChart3 className="h-8 w-8 mx-auto text-purple-500 mb-2" /><strong>Data moat en construction:</strong> Données propriétaires clubs algériens.</CardContent></Card>
                <Card><CardContent className="p-4 text-center"><HeartHandshake className="h-8 w-8 mx-auto text-red-500 mb-2" /><strong>Communauté locale:</strong> Relations FAF/LFP, support AR/FR.</CardContent></Card>
            </div>
        </div>
      )
    },
    // Slide 4: Competitive Advantage
    {
        title: "🏆 AVANTAGES CONCURRENTIELS DÉFENDABLES",
        subtitle: "Un positionnement unique qui rend la concurrence directe difficile et coûteuse.",
        content: (
            <div className="space-y-4">
                 <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left p-2">Critère</th><th className="text-center p-2">SportDataAnalytics</th><th className="text-center p-2">Stats Perform/Opta</th><th className="text-center p-2">Sportradar</th></tr></thead>
                    <tbody>
                        <tr className="border-b"><td>Conformité Algérie</td><td className="text-center text-green-600 font-bold">Haute (native)</td><td className="text-center text-red-600">Faible (solvable)</td><td className="text-center text-red-600">Faible (solvable)</td></tr>
                        <tr className="border-b"><td>Expertise Locale</td><td className="text-center text-green-600 font-bold">Haute (FAF/LFP)</td><td className="text-center text-red-600">Faible</td><td className="text-center text-red-600">Faible</td></tr>
                        <tr className="border-b"><td>Support AR/FR</td><td className="text-center text-green-600 font-bold">Native</td><td className="text-center text-red-600">Limité</td><td className="text-center text-red-600">Limité</td></tr>
                         <tr className="border-b"><td>Pricing Local</td><td className="text-center text-green-600 font-bold">Optimisé DZD</td><td className="text-center text-red-600">Premium USD/EUR</td><td className="text-center text-red-600">Premium USD/EUR</td></tr>
                    </tbody>
                </table>
                <h3 className="font-semibold text-lg pt-4">Moats Défendables en Construction:</h3>
                <p className="text-muted-foreground"><strong>Data Moat</strong> (données propriétaires), <strong>Community Moat</strong> (staff formé), <strong>Network Moat</strong> (relations FAF/LFP), <strong>Integration Moat</strong> (workflow local).</p>
            </div>
        )
    },
    // Slide 5: Traction
    {
      title: "📊 TRACTION MESURÉE & KPIs",
      subtitle: "Un pipeline commercial qualifié et des métriques de validation en cours.",
      content: (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
                <h3 className="font-semibold text-lg">Métriques de Validation Produit (Pilotes)</h3>
                <p><strong>Taux d'Activation:</strong> >60% (Objectif)</p>
                <p><strong>DAU/MAU Ratio:</strong> >20% (Objectif)</p>
                <p><strong>Time to Value:</strong> &lt;7 jours (Objectif)</p>
                <p><strong>Feature Adoption:</strong> >50% (Objectif)</p>
            </div>
             <div className="space-y-3">
                <h3 className="font-semibold text-lg">Pipeline Commercial Validé</h3>
                <p className="flex items-center gap-2"><CheckCircle className="text-green-500" /> 3 clubs pilotes actifs</p>
                <p className="flex items-center gap-2"><CheckCircle className="text-green-500" /> 2 LOI signées (clubs Ligue 1)</p>
                <p className="flex items-center gap-2"><CheckCircle className="text-green-500" /> 12 clubs intéressés (pipeline qualifié)</p>
                <p className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Meetings FAF planifiées</p>
            </div>
        </div>
      )
    },
    // Slide 6: Business Model
    {
      title: "💰 MODÈLE ÉCONOMIQUE RÉVISÉ",
      subtitle: "Structure de revenus 75% SaaS / 25% Services avec des Unit Economics saines.",
      content: (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
                <h3 className="font-semibold text-lg">Revenus Récurrents (SaaS)</h3>
                <p><strong>Basic:</strong> 6,000 DZD/mois (LTV 432k)</p>
                <p><strong>Professional:</strong> 12,000 DZD/mois (LTV 864k)</p>
                <p><strong>Premium:</strong> 18,000 DZD/mois (LTV 1.3M)</p>
            </div>
            <div className="space-y-3">
                <h3 className="font-semibold text-lg">Formation & Services</h3>
                <p><strong>Formation initiale:</strong> 20,000 DZD (switching cost)</p>
                <p><strong>Certification annuelle:</strong> 10,000 DZD (recurring)</p>
                <p><strong>Consulting tactique:</strong> 25,000 DZD/mission</p>
            </div>
            <div className="md:col-span-2">
                <h3 className="font-semibold text-lg pt-4 text-center">Ratio LTV:CAC moyen de 20:1</h3>
            </div>
        </div>
      )
    },
    // Slide 7: Financials
    {
      title: "📈 PROJECTIONS FINANCIÈRES RÉVISÉES",
      subtitle: "Phase 1: Validation & Profitabilité (Marché Algérien Seulement)",
      content: (
          <div className="space-y-4">
            <table className="w-full text-sm text-center">
                <thead><tr className="border-b"><th className="p-2">Année</th><th className="p-2">Clients</th><th className="p-2">ARR (DZD)</th><th className="p-2">Résultat Net</th></tr></thead>
                <tbody>
                    <tr className="border-b"><td>1</td><td>3</td><td>{formatCurrency(432000)}</td><td className="text-red-500">{formatCurrency(-1800000)}</td></tr>
                    <tr className="border-b"><td>2</td><td>6</td><td>{formatCurrency(864000)}</td><td className="text-red-500">{formatCurrency(-1100000)}</td></tr>
                    <tr className="border-b"><td>3</td><td>9</td><td>{formatCurrency(1296000)}</td><td className="text-red-500">{formatCurrency(-400000)}</td></tr>
                    <tr className="border-b"><td>4</td><td>11</td><td>{formatCurrency(1584000)}</td><td className="text-green-500">{formatCurrency(150000)}</td></tr>
                    <tr className="border-b"><td>5</td><td>11</td><td>{formatCurrency(1584000)}</td><td className="text-green-500">{formatCurrency(500000)}</td></tr>
                </tbody>
            </table>
            <p className="text-center text-muted-foreground font-semibold">⚠️ Le marché algérien représente une opportunité de validation et de cash-flow, pas de croissance explosive. Expansion régionale requise post-Série A.</p>
          </div>
      )
    },
    // Slide 8: The Ask
    {
      title: "💼 FINANCEMENT REQUIS",
      subtitle: "Levée Seed : 1,2M DZD (9,252 USD)",
      content: (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-semibold text-lg mb-3">Utilisation des Fonds</h3>
                <p><strong>Développement Produit (30%):</strong> Finalisation MVP</p>
                <p><strong>Équipe Commerciale (40%):</strong> Account managers dédiés</p>
                <p><strong>Marketing/Traction (20%):</strong> Acquisition clients pilotes</p>
                <p><strong>Infrastructure (10%):</strong> Hébergement & sécurité</p>
            </div>
            <Card className="bg-muted">
                <CardHeader><CardTitle>Sources</CardTitle></CardHeader>
                <CardContent>
                    <p><strong>Investisseur Lead (50%):</strong> 600k DZD</p>
                    <p><strong>ANSEJ/Subventions (30%):</strong> 360k DZD</p>
                    <p><strong>Apport Fondateurs (20%):</strong> 240k DZD</p>
                </CardContent>
            </Card>
        </div>
      )
    },
    // Slide 9: Team
    {
        title: "👥 ÉQUIPE FONDATRICE & CONSEIL",
        subtitle: "Une équipe complémentaire avec une expertise terrain et un réseau établi.",
        content: (
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg mb-3">Fondateurs</h3>
                    <p><strong>CEO/Commercial:</strong> 8+ ans Business Dev Tech, Réseau Football Algérien.</p>
                    <p><strong>CTO/Technique:</strong> 10+ ans SaaS/Cloud, Expert Sécurité/Compliance.</p>
                    <p><strong>Directeur Formation:</strong> 6+ ans Formation Pro, Certifié CAF/UEFA.</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-3">Advisory Board Stratégique</h3>
                    <p>✅ Expert Juridique Loi 25-11</p>
                    <p>✅ Ex-International Algérien</p>
                    <p>✅ Dirigeant Club Professionnel</p>
                    <p>✅ Investisseur Tech Local</p>
                </div>
            </div>
        )
    },
    // Slide 10: Conclusion/Ask
    {
        title: "✅ DEMANDE D'INVESTISSEMENT",
        subtitle: "Investissement Seed de 1,2M DZD pour 20% d'equity.",
        content: (
            <div className="text-center space-y-4">
                <p className="text-lg">Nous vous invitons à rejoindre notre aventure pour valider et scaler l'analyse football en Afrique du Nord.</p>
                <h3 className="font-semibold text-xl pt-4">Milestones de Validation sur 24 mois:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <p><strong>6 mois:</strong> 3 clients payants</p>
                    <p><strong>12 mois:</strong> 6 clients + 50k DZD MRR</p>
                    <p><strong>18 mois:</strong> 9 clients + break-even approché</p>
                    <p><strong>24 mois:</strong> 11 clients + profitabilité</p>
                </div>
                <div className="pt-6">
                    <Button size="lg">Rejoignez-nous pour construire le futur de l'analyse football</Button>
                </div>
            </div>
        )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pitch Deck Stratégique (V11.0)</h1>
          <p className="text-muted-foreground">
            {slides[currentSlide].title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{currentSlide + 1} / {slides.length}</Badge>
        </div>
      </div>

      <Card className="min-h-[500px]">
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
