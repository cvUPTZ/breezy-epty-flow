import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Zap, DollarSign, Key, Heart, MessageSquare, Truck, BarChart2 } from 'lucide-react';

const BusinessModelCanvasPage: React.FC = () => {
  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground space-y-2">
        {children}
      </CardContent>
    </Card>
  );

  const PhaseTitle: React.FC<{ title: string }> = ({ title }) => <h4 className="font-bold text-base text-foreground mb-1">{title}</h4>;

  return (
    <div className="container mx-auto py-12 px-4 md:px-6 bg-gray-50/50">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">BUSINESS MODEL CANVAS RÉVISÉ</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          SportDataAnalytics SARL - Approche Séquentielle Fondée sur les Données (Version 11.0)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Col 1 */}
        <div className="space-y-4">
          <Section title="Partenaires Clés" icon={<Briefcase className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Validation (2025-27)" />
            <ul className="list-disc pl-4">
              <li><strong>Institutionnels:</strong> FAF, LFP, DTN</li>
              <li><strong>Tech Local:</strong> ISSAL NET, Chargily Pay</li>
              <li><strong>Conseil:</strong> Cabinet Hadj-Ali</li>
              <li><strong>Réseau:</strong> ESSTS, Ex-internationaux</li>
            </ul>
            <PhaseTitle title="Phase 2: Expansion (Post-2027)" />
            <ul className="list-disc pl-4">
              <li><strong>Fédérations:</strong> FRMF (Maroc), FTF (Tunisie)</li>
              <li><strong>Tech Scalable:</strong> AWS/Azure, Intégrateurs locaux</li>
            </ul>
          </Section>
        </div>

        {/* Col 2 */}
        <div className="space-y-4">
          <Section title="Activités Clés" icon={<Zap className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Modèle 'High-Touch'" />
            <ul className="list-disc pl-4">
              <li>Développement produit focalisé (MVP football)</li>
              <li>Vente consultative intensive</li>
              <li>Formation intégrée obligatoire</li>
            </ul>
            <PhaseTitle title="Phase 2: Modèle Scalable" />
            <ul className="list-disc pl-4">
              <li>Platform Engineering (multi-tenant)</li>
              <li>Marketing Digital Ciblé</li>
              <li>APIs RESTful pour intégrations</li>
            </ul>
          </Section>
          <Section title="Ressources Clés" icon={<Key className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Assets Fondamentaux" />
            <ul className="list-disc pl-4">
              <li>Équipe locale experte (CEO, CTO, Dir. Formation)</li>
              <li>Infrastructure technique conforme (Loi 25-11)</li>
              <li>Propriété Intellectuelle (méthodologie, UI)</li>
              <li>Relations institutionnelles (Endorsements)</li>
            </ul>
          </Section>
        </div>

        {/* Col 3 */}
        <div className="space-y-4">
          <Section title="Propositions de Valeur" icon={<Heart className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Clubs Algériens" />
            <p className="font-semibold text-foreground">"La seule solution qui comprend le football algérien et garantit votre conformité légale"</p>
            <ul className="list-disc pl-4">
              <li>Conformité Loi 25-11 garantie</li>
              <li>Formation intégrée obligatoire</li>
              <li>Expertise football local (AR/FR)</li>
              <li>Support premium sur site</li>
            </ul>
          </Section>
        </div>

        {/* Col 4 */}
        <div className="space-y-4">
          <Section title="Relations Clients" icon={<MessageSquare className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Intensives & Personnalisées" />
            <ul className="list-disc pl-4">
              <li>Account Management dédié (1 pour 8-10 clubs)</li>
              <li>Formation présentielle obligatoire</li>
              <li>Community Building (événements, ambassadeurs)</li>
            </ul>
            <PhaseTitle title="Phase 2: Modèle Hybride" />
            <ul className="list-disc pl-4">
              <li>Self-Service pour nouveaux marchés</li>
              <li>High-Touch pour grands comptes</li>
            </ul>
          </Section>
          <Section title="Canaux" icon={<Truck className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Distribution Directe" />
            <ul className="list-disc pl-4">
              <li>Vente Directe B2B (80%)</li>
              <li>Partenariats Institutionnels (15%)</li>
              <li>Références Inter-Clubs (5%)</li>
            </ul>
            <PhaseTitle title="Phase 2: Canaux Scalables" />
             <ul className="list-disc pl-4">
                <li>Digital Marketing (SEO/SEM)</li>
                <li>Partner Channel (intégrateurs)</li>
             </ul>
          </Section>
        </div>

        {/* Col 5 */}
        <div className="space-y-4">
          <Section title="Segments Clientèle" icon={<Users className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Marché Validé" />
            <p><strong>Cibles:</strong> Ligue 1 (16 clubs), Ligue 2 (32 clubs), Centres FAF (8), Académies (15-20)</p>
            <p><strong>SOM réaliste:</strong> 15 clubs sur 5 ans</p>
            <p className="font-bold text-foreground">Priorité Très Haute: 6 Top Clubs Ligue 1</p>
            <PhaseTitle title="Phase 2: Expansion" />
            <ul className="list-disc pl-4">
              <li>Clubs Football Maroc (Botola Pro)</li>
              <li>Médias Sportifs MENA (API)</li>
              <li>Développeurs (API)</li>
            </ul>
          </Section>
        </div>

        {/* Bottom Row */}
        <div className="lg:col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Section title="Structure des Coûts" icon={<BarChart2 className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Coûts Fixes Dominants" />
            <p><strong>Point d'équilibre:</strong> 17-18 clients ou 2.55M DZD ARR (Année 4-5)</p>
            <ul className="list-disc pl-4">
              <li><strong>Salaires Équipe (63%):</strong> 160k DZD/mois</li>
              <li><strong>Infrastructure Tech (10%):</strong> 25k DZD/mois</li>
              <li><strong>Marketing & Ventes (14%):</strong> 35k DZD/mois</li>
            </ul>
          </Section>
          <Section title="Flux de Revenus" icon={<DollarSign className="h-5 w-5 text-primary" />}>
            <PhaseTitle title="Phase 1: Mix Prévisible" />
            <p><strong>ARR Objectif An 5:</strong> 2.363M DZD</p>
            <ul className="list-disc pl-4">
              <li><strong>Abonnements SaaS (70%):</strong> Basic (6k), Professional (12k), Premium (18k) DZD/mois</li>
              <li><strong>Formation & Certification (25%)</strong></li>
              <li><strong>Services Professionnels (5%)</strong></li>
            </ul>
          </Section>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelCanvasPage;
