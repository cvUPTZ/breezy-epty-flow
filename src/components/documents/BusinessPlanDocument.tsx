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

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Plan d'Affaires Détaillé</h1>
          <p className="text-muted-foreground">SportDataAnalytics - Stratégie Révisée</p>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exporter
        </Button>
      </div>

      <div className="space-y-8 print:space-y-6">
        {/* Page de couverture */}
        <Card className="print:shadow-none print:border-0">
          <CardContent className="p-12 text-center">
            <div className="space-y-8">
              <Shield className="w-24 h-24 mx-auto text-primary" />
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight">PLAN D'AFFAIRES</h1>
                <div className="w-32 h-1 bg-primary mx-auto"></div>
                <h2 className="text-3xl font-semibold text-primary">
                  SportDataAnalytics
                </h2>
                <h3 className="text-xl text-muted-foreground">
                  La seule plateforme d'analyse football 100% conforme Loi 18-07
                </h3>
              </div>
              <div className="mt-16 space-y-3 text-muted-foreground">
                <p><strong>Version:</strong> 3.0 (Révisée)</p>
                <p><strong>Date:</strong> {new Date('2025-09-18').toLocaleDateString('fr-FR')}</p>
                <p><strong>Période couverte:</strong> 2025-2029</p>
                <p><strong>Classification:</strong> Confidentiel</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 1. Résumé Exécutif */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              1. Résumé Exécutif
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="prose prose-sm max-w-none">
                <h3>Vision & Mission</h3>
                <p><strong>Vision:</strong> Devenir le partenaire technologique de référence pour les clubs de football algériens cherchant une solution d'analyse conforme et culturellement adaptée.</p>
                <p><strong>Mission:</strong> Fournir aux clubs et institutions footballistiques algériennes une plateforme d'analyse simple, conforme à la Loi 18-07, avec un support technique exceptionnel en langue locale.</p>

                <h3>Proposition de Valeur Unique</h3>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800">"La seule plateforme d'analyse football 100% conforme Loi 18-07 avec support local premium"</p>
                </div>

                <h3>Opportunité de Marché</h3>
                <p>Le marché est une niche protégée par des barrières réglementaires. Nous avons identifié un segment réaliste de <strong>18-22 clubs potentiels</strong> sur 42 professionnels, avec un potentiel de revenus maximum de <strong>2.2-2.5M DZD/an</strong>.</p>

                <h3>Projections Financières Corrigées</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left p-1">Année</th><th className="text-left p-1">Revenus (DZD)</th><th className="text-left p-1">Coûts (DZD)</th><th className="text-left p-1">Résultat (DZD)</th></tr></thead>
                        <tbody>
                            <tr><td>1</td><td>450,000</td><td>720,000</td><td className="text-red-600">-270,000</td></tr>
                            <tr><td>3</td><td>1,650,000</td><td>1,400,000</td><td className="text-green-600">250,000</td></tr>
                            <tr><td>5</td><td>2,350,000</td><td>1,800,000</td><td className="text-green-600">550,000</td></tr>
                        </tbody>
                    </table>
                    <p className="text-xs text-center mt-1">Break-even: Mois 22 (8-10 clients)</p>
                </div>

                <h3>Financement Requis</h3>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-center">
                    <p className="text-lg font-bold text-amber-800">{formatCurrency(1800000)} sur 18 mois pour atteindre le break-even.</p>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Analyse de Marché */}
        <Card className="print:break-before-page">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" />2. Analyse de Marché Réaliste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold">Facteurs Favorables</h4>
                        <ul className="list-disc pl-5 text-sm">
                            <li>Direction FAF favorable à la modernisation.</li>
                            <li>Quelques clubs progressistes ouverts à l'innovation.</li>
                            <li>Présence croissante d'analystes vidéo.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold">Facteurs Limitants (Critique)</h4>
                        <ul className="list-disc pl-5 text-sm">
                            <li>Culture traditionnelle résistante au changement.</li>
                            <li>Budgets contraints.</li>
                            <li>Manque de formation des staffs.</li>
                            <li>Infrastructure technique limitée.</li>
                        </ul>
                    </div>
                </div>
                 <div>
                    <h4 className="font-semibold">Segmentation Prioritaire</h4>
                    <ul className="list-disc pl-5 text-sm">
                        <li><strong>Segment Primaire (60% efforts):</strong> 4-6 clubs Ligue 1 progressistes.</li>
                        <li><strong>Segment Secondaire (25% efforts):</strong> 3-5 académies FAF.</li>
                        <li><strong>Segment Tertiaire (15% efforts):</strong> 6-8 clubs Ligue 2 sélectifs.</li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold">Analyse Concurrentielle</h4>
                    <p className="text-sm">Les solutions internationales (Wyscout, Hudl) perdent des clients en Algérie à cause des problèmes de conformité (Loi 18-07) et de support local. Notre positionnement est défensif et axé sur notre conformité certifiée et notre service ultra-personnalisé.</p>
                </div>
            </CardContent>
        </Card>

        {/* 3. Stratégie Produit et Développement */}
        <Card className="print:break-before-page">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />3. Stratégie Produit et Développement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-semibold">Architecture Produit Simplifiée (Modules Core Année 1-2)</h4>
                    <ul className="list-disc pl-5 text-sm">
                        <li><strong>Analyse Vidéo Basique:</strong> Upload, player HTML5, annotations manuelles, export clips.</li>
                        <li><strong>Tracking Événements Manuel:</strong> Interface de saisie, statistiques de base, tableaux de bord simples.</li>
                        <li><strong>Communication Équipe:</strong> Commentaires partagés, notifications, gestion des accès.</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold">Stack Technologique Simple</h4>
                     <ul className="list-disc pl-5 text-sm">
                        <li><strong>Frontend:</strong> React.js + interface RTL pour arabe</li>
                        <li><strong>Backend:</strong> Node.js + PostgreSQL</li>
                        <li><strong>Storage:</strong> Hébergement local ISSAL NET + backup DZSecurity</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold">Roadmap Réaliste</h4>
                     <ul className="list-disc pl-5 text-sm">
                        <li><strong>V1.0 (Q2-Q3 2025):</strong> MVP fonctionnel, 100% conforme.</li>
                        <li><strong>V2.0 (Q4 2025-Q1 2026):</strong> Statistiques, rapports, multi-utilisateurs.</li>
                        <li><strong>V3.0 (2026):</strong> API pour intégrations FAF/DTN.</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessPlanDocument;
