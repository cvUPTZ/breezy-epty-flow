import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Users, TrendingUp, Shield, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

const MarketStudyDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
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
          <h1 className="text-3xl font-bold">Étude de Marché Fondée sur les Données (V12.0)</h1>
          <p className="text-muted-foreground">Analyse Rigoureuse du Marché Algérien</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <div className="space-y-8 print:space-y-6">
        <Section title="1. Résumé Exécutif & Corrections Majeures" icon={<FileText className="w-5 h-5 text-primary" />}>
          <h4>Vision Projet Recadrée</h4>
          <p>SportDataAnalytics vise à devenir le leader incontesté des solutions d'analyse sportive en Algérie en construisant un "moat communautaire". Cette position dominante sur un marché de validation (Phase 1) constitue le tremplin pour une expansion géographique ciblée au Maghreb (Phase 2).</p>
          <p className="font-bold text-red-600">Correction Fondamentale: Abandon des estimations initiales irréalistes ("85M DZD MENA") et présentation d'une analyse fondée sur des données vérifiables du marché algérien.</p>
        </Section>

        <Section title="2. Analyse Bottom-Up du Marché Algérien" icon={<Globe className="w-5 h-5 text-primary" />}>
          <h4>Calcul TAM/SAM/SOM Rigoureux</h4>
          <table className="w-full">
            <thead><tr><th>Catégorie</th><th>Valeur</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>TAM (Total Addressable Market)</td><td>4,480k DZD</td><td>Scénario 100% Adoption</td></tr>
              <tr><td>SAM (Serviceable Addressable Market)</td><td>2,092k DZD</td><td>Clubs Technologiquement Réceptifs</td></tr>
              <tr className="font-bold text-primary"><td>SOM (Serviceable Obtainable Market)</td><td>2,040k DZD</td><td>Objectif Réaliste 5 ans</td></tr>
            </tbody>
          </table>
        </Section>

        <Section title="3. Segmentation Client Validée" icon={<Users className="w-5 h-5 text-primary" />}>
          <h4>Matrice de Priorisation des Segments</h4>
          <ul className="list-disc pl-5">
            <li><strong>Priorité 1:</strong> Ligue 1 Elite (6 clubs) & Centres FAF (8 centres) - Score 30/40</li>
            <li><strong>Priorité 2:</strong> Ligue 1 Standard (10 clubs) - Score 23/40</li>
            <li><strong>Priorité 3:</strong> Ligue 2 Ambitieux (12 clubs) - Score 16/40</li>
          </ul>
        </Section>

        <Section title="4. Analyse Concurrentielle Approfondie" icon={<Shield className="w-5 h-5 text-primary" />}>
            <h4>Analyse des Forces de Porter</h4>
            <ul className="list-disc pl-5">
                <li>Menace Nouveaux Entrants: <strong>MODÉRÉE-ÉLEVÉE</strong></li>
                <li>Pouvoir Négociation Clients: <strong>ÉLEVÉ</strong></li>
                <li>Pouvoir Négociation Fournisseurs: <strong>FAIBLE</strong></li>
                <li>Menace Produits Substituts: <strong>ÉLEVÉE</strong></li>
                <li>Intensité Concurrentielle: <strong>FAIBLE-MODÉRÉE</strong></li>
            </ul>
        </Section>

        <Section title="5. Recommandations Stratégiques" icon={<TrendingUp className="w-5 h-5 text-primary" />}>
            <h4>Conclusions Clés</h4>
            <p>Le marché algérien représente une opportunité de validation crédible mais limitée (TAM réaliste de 4.48M DZD). La profitabilité en Phase 1 seule est peu probable, rendant une stratégie d'expansion Phase 2 nécessaire pour la viabilité économique.</p>
            <h4>Actions Recommandées</h4>
            <ul className="list-disc pl-5">
                <li><strong>Approche Séquentielle Rigoureuse:</strong> Focus absolu sur la validation du product-market fit en Phase 1.</li>
                <li><strong>Modèle Économique Hybride:</strong> SaaS + Formation + Consulting pour maximiser l'ARPU.</li>
                <li><strong>Construction d'un Moat Défensif:</strong> Investissement massif dans les relations institutionnelles et les switching costs.</li>
                <li><strong>Préparation Phase 2 Conditionnelle:</strong> R&D sur une architecture scalable et veille active sur les marchés du Maghreb.</li>
            </ul>
        </Section>
      </div>
    </div>
  );
};

export default MarketStudyDocument;
