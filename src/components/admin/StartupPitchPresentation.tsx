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
      title: "SportDataAnalytics",
      subtitle: "Votre partenaire technologique pour le football algérien.",
      content: (
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-32 h-32 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center">
            <Shield className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-foreground">La seule plateforme d'analyse football 100% conforme Loi 18-07 avec support local premium</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Une solution simple, souveraine et culturellement adaptée pour les clubs de football algériens.
          </p>
        </div>
      )
    },
    // Slide 2: Problem
    {
      title: "L'Opportunité : Un Marché mal desservi",
      subtitle: "Les solutions actuelles ne répondent pas aux besoins spécifiques du marché algérien.",
      content: (
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Le Problème</h3>
            <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-500 mt-1"/><span><strong>Risque Légal :</strong> Les solutions internationales (Hudl, Wyscout) sont non-conformes à la Loi 18-07 sur la protection des données.</span></li>
                <li className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-500 mt-1"/><span><strong>Coût Exorbitant :</strong> Des tarifs de 3,000 à 30,000 EUR/an, inadaptés aux budgets des clubs algériens.</span></li>
                <li className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-500 mt-1"/><span><strong>Manque de Support :</strong> Pas de support local, pas de formation sur site, et une interface uniquement en langues étrangères.</span></li>
                <li className="flex items-start gap-3"><AlertTriangle className="h-5 w-5 text-red-500 mt-1"/><span><strong>Inadaptation Culturelle :</strong> Ne comprennent pas le contexte et les processus du football local.</span></li>
            </ul>
          </div>
          <Card className="bg-muted">
            <CardHeader><CardTitle>Conséquence</CardTitle></CardHeader>
            <CardContent>
              <p className="text-lg">Les clubs algériens paient cher pour des solutions illégales qui ne répondent pas à leurs vrais besoins, ou renoncent à la technologie.</p>
            </CardContent>
          </Card>
        </div>
      )
    },
    // Slide 3: Solution
    {
      title: "Notre Solution : Simple, Conforme, Proche de vous",
      subtitle: "Une plateforme conçue par des algériens, pour les algériens.",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center"><CardContent className="p-4"><Shield className="h-8 w-8 mx-auto text-green-600 mb-2"/><h4 className="font-semibold">Conformité Garantie</h4><p className="text-xs text-muted-foreground">Hébergement et traitement 100% en Algérie (Loi 18-07).</p></CardContent></Card>
            <Card className="text-center"><CardContent className="p-4"><HeartHandshake className="h-8 w-8 mx-auto text-blue-600 mb-2"/><h4 className="font-semibold">Support Premium</h4><p className="text-xs text-muted-foreground">Formation sur site, hotline bilingue, account manager dédié.</p></CardContent></Card>
            <Card className="text-center"><CardContent className="p-4"><Globe className="h-8 w-8 mx-auto text-purple-600 mb-2"/><h4 className="font-semibold">Adaptation Culturelle</h4><p className="text-xs text-muted-foreground">Interface AR/FR, compréhension du contexte local.</p></CardContent></Card>
            <Card className="text-center"><CardContent className="p-4"><DollarSign className="h-8 w-8 mx-auto text-orange-600 mb-2"/><h4 className="font-semibold">Prix Accessible</h4><p className="text-xs text-muted-foreground">Jusqu'à 75% moins cher que les concurrents non-conformes.</p></CardContent></Card>
        </div>
      )
    },
    // Slide 4: Product
    {
      title: "Le Produit : Focus sur l'Essentiel (V1.0)",
      subtitle: "Une architecture simple et une roadmap réaliste.",
      content: (
          <div className="grid md:grid-cols-2 gap-8">
              <div>
                  <h3 className="text-xl font-semibold mb-3">Modules Clés (Année 1-2)</h3>
                  <ul className="space-y-2 list-disc pl-5">
                      <li><strong>Analyse Vidéo Basique :</strong> Upload, player simple, annotations manuelles, export de clips.</li>
                      <li><strong>Tracking Événements Manuel :</strong> Saisie simple (buts, cartons), stats de base, tableaux de bord.</li>
                      <li><strong>Communication Équipe :</strong> Commentaires partagés, notifications, gestion des accès.</li>
                  </ul>
              </div>
              <div>
                  <h3 className="text-xl font-semibold mb-3">Stack Technologique</h3>
                  <ul className="space-y-2 list-disc pl-5">
                      <li><strong>Frontend:</strong> React.js + interface RTL pour l'arabe</li>
                      <li><strong>Backend:</strong> Node.js + PostgreSQL</li>
                      <li><strong>Hébergement:</strong> Local (ISSAL NET) + Backup DZSecurity</li>
                  </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-xl font-semibold mb-3 mt-4">Roadmap</h3>
                <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                    <span><strong>V1.0 (Q2-Q3 2025):</strong> MVP fonctionnel, 100% conforme.</span>
                    <Badge>À venir</Badge>
                </div>
                 <div className="flex justify-between items-center bg-muted p-3 mt-2 rounded-lg">
                    <span><strong>V2.0 (Q4 2025-Q1 2026):</strong> Rapports, multi-utilisateurs, responsive.</span>
                    <Badge variant="secondary">Planifié</Badge>
                </div>
                 <div className="flex justify-between items-center bg-muted p-3 mt-2 rounded-lg">
                    <span><strong>V3.0 (2026):</strong> API FAF/DTN, templates avancés.</span>
                    <Badge variant="outline">Vision</Badge>
                </div>
              </div>
          </div>
      )
    },
    // Slide 5: Business Model
    {
      title: "Modèle Économique : Service Premium",
      subtitle: "Nous ne vendons pas juste un logiciel, mais un partenariat.",
      content: (
        <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-primary"><CardHeader><CardTitle>Ligue 1</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(150000)}/an</p><p className="text-sm text-muted-foreground">Plateforme + Formation + Support premium</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Ligue 2</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(100000)}/an</p><p className="text-sm text-muted-foreground">Plateforme + Formation + Support standard</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Académies</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(75000)}/an</p><p className="text-sm text-muted-foreground">Tarif préférentiel</p></CardContent></Card>
            <div className="md:col-span-3 text-center text-sm text-muted-foreground">
                <p>+ Services additionnels (Analyse de match, consulting) à 15-25k DZD par mission.</p>
                <p className="font-bold mt-2">Abandon du modèle de tracking systématique, trop coûteux et non viable.</p>
            </div>
        </div>
      )
    },
    // Slide 6: Market
    {
      title: "Le Marché : Une Niche Protégée et Accessible",
      subtitle: "Nous ciblons un segment de marché réaliste et bien identifié.",
      content: (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-3">Marché Cible (18-22 clients)</h3>
                <ul className="space-y-2">
                    <li className="flex items-center gap-2"><strong>Ligue 1:</strong> 4-6 clubs <Progress value={60} className="w-1/2 h-2"/></li>
                    <li className="flex items-center gap-2"><strong>Ligue 2:</strong> 6-8 clubs <Progress value={25} className="w-1/2 h-2"/></li>
                    <li className="flex items-center gap-2"><strong>Académies FAF:</strong> 3-5 académies <Progress value={80} className="w-1/2 h-2"/></li>
                </ul>
                <p className="mt-4"><strong>Potentiel de revenus annuel :</strong> 2.2 - 2.5M DZD</p>
            </div>
             <Card className="bg-muted">
                <CardHeader><CardTitle>Notre Avantage Défensif</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Seule solution certifiée conforme.</li>
                        <li>Service ultra-personnalisé viable à petite échelle.</li>
                        <li>Intégration culturelle profonde (langue, relations).</li>
                        <li>Partenariats institutionnels exclusifs (FAF, DTN).</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      )
    },
    // Slide 7: Financials
    {
      title: "Projections Financières : Croissance Saine",
      subtitle: "Une approche conservatrice pour une rentabilité durable.",
      content: (
          <table className="w-full text-sm text-center">
            <thead>
                <tr className="border-b">
                    <th className="p-2">Année</th><th className="p-2">Clients</th><th className="p-2">Revenus</th><th className="p-2">Coûts</th><th className="p-2">Résultat</th>
                </tr>
            </thead>
            <tbody>
                <tr className="border-b"><td>1</td><td>3-4</td><td>{formatCurrency(450000, true)}</td><td>{formatCurrency(720000, true)}</td><td className="text-red-500">{formatCurrency(-270000, true)}</td></tr>
                <tr className="border-b"><td>2</td><td>7-9</td><td>{formatCurrency(950000, true)}</td><td>{formatCurrency(1100000, true)}</td><td className="text-red-500">{formatCurrency(-150000, true)}</td></tr>
                <tr className="border-b"><td>3</td><td>12-14</td><td>{formatCurrency(1650000, true)}</td><td>{formatCurrency(1400000, true)}</td><td className="text-green-500">{formatCurrency(250000, true)}</td></tr>
                <tr className="border-b"><td>5</td><td>18-22</td><td>{formatCurrency(2350000, true)}</td><td>{formatCurrency(1800000, true)}</td><td className="text-green-500">{formatCurrency(550000, true)}</td></tr>
            </tbody>
            <tfoot>
                <tr><td colSpan={5} className="pt-4 font-bold text-center">Break-even: Mois 22 (avec 8-10 clients)</td></tr>
            </tfoot>
          </table>
      )
    },
    // Slide 8: The Ask
    {
      title: "L'Investissement : 1.8M DZD pour 18 mois",
      subtitle: "Un financement pour atteindre le seuil de rentabilité et la consolidation.",
      content: (
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-3">Utilisation des Fonds</h3>
                <ul className="space-y-2 text-sm">
                    <li><strong>Développement MVP (300k):</strong> Finalisation V1 et V2.</li>
                    <li><strong>Personnel (630k):</strong> Équipe core pour 18 mois.</li>
                    <li><strong>Infrastructure (240k):</strong> Hébergement et services.</li>
                    <li><strong>Marketing & Ventes (360k):</strong> Acquisition des 1ers clients.</li>
                    <li><strong>Opérations & Admin (180k):</strong> Frais de fonctionnement.</li>
                    <li><strong>Réserve (90k):</strong> Buffer de sécurité de 5%.</li>
                </ul>
            </div>
            <Card className="bg-muted">
                <CardHeader><CardTitle>Structure de Financement</CardTitle></CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Equity (1.5M DZD):</strong> Recherche d'investisseurs privés.</li>
                        <li><strong>Dette/Subvention (300k DZD):</strong> ANSEJ, ANDPME, Crédit équipement.</li>
                    </ul>
                    <p className="mt-4"><strong>ROI Attendu :</strong> 15-20% annuel, avec une sortie réaliste à 3-6x les revenus en année 5-7.</p>
                </CardContent>
            </Card>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pitch Deck: SportDataAnalytics</h1>
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
