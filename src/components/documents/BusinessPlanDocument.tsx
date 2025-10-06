import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Target, Users, DollarSign, TrendingUp, Shield, Globe } from 'lucide-react';

const BusinessPlanDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
    <Card className={`print:shadow-none print:border-0 print:break-before-page ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">{icon} {title}</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none">
        {children}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">PLAN D'AFFAIRES RÉVISÉ (V10.0)</h1>
          <p className="text-muted-foreground">SportDataAnalytics SARL - Basé sur les Données</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <div className="space-y-8 print:space-y-6">
        <Section title="1. Résumé Exécutif" icon={<Target className="w-5 h-5 text-primary" />}>
          <h4>Vision et Mission Affinées</h4>
          <p><strong>Vision:</strong> Devenir le partenaire technologique de référence des clubs de football algériens en construisant un "moat communautaire" basé sur l'expertise locale, les relations institutionnelles et l'intégration profonde.</p>
          <p><strong>Mission:</strong> Accompagner la professionnalisation du football algérien en fournissant une plateforme SaaS complète, conforme à la Loi 25-11, avec des services de formation intégrés.</p>

          <h4>Proposition de Valeur Différenciante</h4>
          <p><strong>"First-Mover Local + Deep Integration = Sustainable Community Moat"</strong></p>

          <h4>Projections Financières Fondées sur les Données</h4>
          <table className="w-full">
            <thead><tr><th>Année</th><th>Clients</th><th>ARR (K DZD)</th><th>Résultat Net</th></tr></thead>
            <tbody>
              <tr><td>1</td><td>6</td><td>900</td><td className="text-red-600">-2,136</td></tr>
              <tr><td>3</td><td>12</td><td>1,800</td><td className="text-red-600">-1,236</td></tr>
              <tr><td>5</td><td>15</td><td>2,363</td><td className="text-green-600">+127</td></tr>
            </tbody>
          </table>
        </Section>

        <Section title="2. Analyse de Marché Rigoureuse" icon={<Globe className="w-5 h-5 text-primary" />}>
          <h4>Correction Méthodologique</h4>
          <p>Abandon des estimations "85M DZD MENA" non-fondées. Focus exclusif sur le marché algérien validable.</p>
          <h4>Marché Adressable Total (TAM) - Algérie Football</h4>
          <p><strong>Ligue 1 (16 clubs):</strong> 2,880k DZD Potentiel</p>
          <p><strong>Ligue 2 (32 clubs):</strong> 2,880k DZD Potentiel</p>
          <p className="font-bold">TOTAL TAM: 5,760k DZD</p>
          <p><strong>SOM (Marché Obtenable) 5 ans:</strong> 2.25M DZD ARR (30% pénétration)</p>
        </Section>

        <Section title="3. Produit & Traction Vérifiable" icon={<TrendingUp className="w-5 h-5 text-primary" />}>
          <h4>État Actuel du Produit (MVP)</h4>
          <p>Fonctionnalités développées: Saisie match temps réel, Dashboard analytics, Exports PDF/Excel, Module conformité Loi 25-11.</p>
          <h4>Métriques de Traction (Pilotes avec 3 clubs)</h4>
          <ul>
            <li><strong>Taux d'activation:</strong> 85%</li>
            <li><strong>Usage hebdomadaire:</strong> 4.2 matches analysés/semaine</li>
            <li><strong>NPS:</strong> +67</li>
            <li><strong>Conversion:</strong> 3/3 LOIs signées</li>
          </ul>
        </Section>

        <Section title="4. Stratégie d'Expansion Ciblée" icon={<Users className="w-5 h-5 text-primary" />}>
          <h4>Phase 1 : Domination Algérie (2025-2027)</h4>
          <p>Objectif: Valider le product-market fit et construire le moat communautaire. Atteindre 15 clients et la rentabilité opérationnelle.</p>
          <h4>Phase 2 : Expansion Maghreb (Post-2027)</h4>
          <p>Stratégie révisée: Focus sur des marchés similaires culturellement. Marché cible prioritaire: Maroc (Botola Pro).</p>
        </Section>

        <Section title="5. Équipe & Gouvernance" icon={<Users className="w-5 h-5 text-primary" />}>
          <h4>Équipe Fondatrice</h4>
          <ul>
            <li><strong>Karim Benaissa - CEO/Commercial:</strong> Ex-Manager Systèmes FAF, réseau clubs.</li>
            <li><strong>Yacine Brahimi - CTO:</strong> Senior Developer, spécialisation SaaS B2B, conformité GDPR.</li>
            <li><strong>Sarah Mekhancha - Directrice Formation:</strong> Ex-Analyste Performance USMA, certification UEFA B.</li>
          </ul>
        </Section>

        <Section title="6. Projections Financières Détaillées" icon={<DollarSign className="w-5 h-5 text-primary" />}>
          <h4>Modèle Unit Economics</h4>
            <p><strong>CAC (Coût Acquisition Client):</strong> 45k DZD</p>
            <p><strong>LTV (Valeur Vie Client):</strong> 450k DZD</p>
            <p className="font-bold"><strong>Ratio LTV/CAC:</strong> 10:1</p>
        </Section>

        <Section title="7. Gestion des Risques" icon={<Shield className="w-5 h-5 text-primary" />}>
            <h4>Risques Majeurs & Mitigations</h4>
            <ul>
                <li><strong>Adoption Lente par les Clubs (Prob: 70%):</strong> Mitigation via pilotes gratuits étendus, endorsement FAF/LFP.</li>
                <li><strong>Entrée d'un Concurrent International (Prob: 40%):</strong> Mitigation via renforcement du moat communautaire, contrats exclusifs.</li>
                <li><strong>Évolution Réglementaire (Prob: 30%):</strong> Mitigation via architecture flexible, veille juridique proactive.</li>
            </ul>
        </Section>

      </div>
    </div>
  );
};

export default BusinessPlanDocument;
