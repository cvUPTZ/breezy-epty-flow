import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Users, TrendingUp, Shield, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

const MarketStudyDocument: React.FC = () => {
  const handleExport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-background">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold">Étude de Marché Réaliste</h1>
          <p className="text-muted-foreground">Analyse du marché algérien du football (Version Révisée)</p>
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
            <div className="space-y-6">
              <FileText className="w-20 h-20 mx-auto text-primary" />
              <h1 className="text-4xl font-bold">ANALYSE DE MARCHÉ RÉALISTE</h1>
              <h2 className="text-2xl font-semibold text-muted-foreground">
                Opportunités pour une Plateforme d'Analyse Conforme
              </h2>
              <h3 className="text-xl">Marché du Football Algérien</h3>
            </div>
          </CardContent>
        </Card>

        {/* 1. Résumé Exécutif */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>1. Résumé Exécutif de l'Analyse de Marché</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cette analyse révisée présente une vue conservatrice et réaliste du marché algérien pour une plateforme d'analyse de football.
              Elle identifie une niche de marché viable, protégée par des barrières réglementaires, mais limitée par des facteurs culturels et économiques.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle className="text-base">Marché Accessible</CardTitle></CardHeader>
                    <CardContent>
                        <p className="font-bold text-2xl">18-22 Clubs</p>
                        <p className="text-sm">sur 42 clubs professionnels, plus 3-5 académies FAF.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Avantage Clé</CardTitle></CardHeader>
                    <CardContent>
                        <p className="font-bold text-2xl">Conformité Loi 18-07</p>
                        <p className="text-sm">Notre principal différenciateur face à une concurrence internationale non-conforme et coûteuse.</p>
                    </CardContent>
                </Card>
            </div>
            <p>La stratégie doit se concentrer sur un service premium personnalisé pour un nombre limité de clients plutôt qu'une adoption de masse, modèle économiquement intenable.</p>
          </CardContent>
        </Card>

        {/* 2. Structure et Dynamiques du Marché */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>2. Structure et Dynamiques du Marché</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><CheckCircle className="text-green-500" /> Facteurs Favorables</h3>
                    <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                        <li>Direction FAF favorable à la modernisation.</li>
                        <li>Quelques clubs progressistes ouverts à l'innovation.</li>
                        <li>Présence croissante d'analystes vidéo dans les clubs d'élite.</li>
                        <li>Réformes imposant plus de professionnalisation.</li>
                    </ul>
                </div>
                 <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2"><AlertTriangle className="text-red-500" /> Facteurs Limitants (Critique)</h3>
                    <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                        <li><strong>Culture traditionnelle dominante</strong>, résistante au changement.</li>
                        <li><strong>Budgets contraints</strong>, même pour les clubs professionnels.</li>
                        <li><strong>Manque de formation</strong> des staffs techniques sur les outils digitaux.</li>
                        <li><strong>Infrastructure technique limitée</strong> dans certains clubs.</li>
                        <li><strong>Rotation fréquente</strong> du staff technique (instabilité des investissements).</li>
                    </ul>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Segmentation Prioritaire */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>3. Segmentation Prioritaire Réaliste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Une approche ciblée est essentielle. Les efforts doivent être concentrés sur les segments les plus susceptibles d'adopter la solution.</p>
            <div className="space-y-4">
                <div className="p-4 border-l-4 border-primary bg-primary/10">
                    <h4 className="font-semibold">Segment Primaire: Clubs Ligue 1 Progressistes (60% efforts)</h4>
                    <ul className="text-sm list-disc pl-5 mt-1">
                        <li><strong>Profil:</strong> 4-6 clubs identifiés (CRB, ESS, MCA, USMA).</li>
                        <li><strong>Budget Analyse Possible:</strong> 100k-300k DZD.</li>
                        <li><strong>Notre Tarif:</strong> 150k DZD/an.</li>
                        <li><strong>Timeline Adoption:</strong> 6-12 mois.</li>
                    </ul>
                </div>
                 <div className="p-4 border-l-4 border-secondary bg-secondary/10">
                    <h4 className="font-semibold">Segment Secondaire: Académies FAF (25% efforts)</h4>
                    <ul className="text-sm list-disc pl-5 mt-1">
                        <li><strong>Profil:</strong> 3-5 académies officielles FAF.</li>
                        <li><strong>Budget:</strong> Financement gouvernemental.</li>
                        <li><strong>Notre Tarif:</strong> 75k DZD/an (préférentiel).</li>
                        <li><strong>Timeline Adoption:</strong> 3-6 mois.</li>
                    </ul>
                </div>
                 <div className="p-4 border-l-4 border-accent bg-accent/10">
                    <h4 className="font-semibold">Segment Tertiaire: Ligue 2 Sélective (15% efforts)</h4>
                    <ul className="text-sm list-disc pl-5 mt-1">
                        <li><strong>Profil:</strong> 6-8 clubs ambitieux avec budgets suffisants.</li>
                        <li><strong>Budget Analyse Max:</strong> 50k-100k DZD.</li>
                        <li><strong>Notre Tarif:</strong> 100k DZD/an.</li>
                        <li><strong>Timeline Adoption:</strong> 12-18 mois.</li>
                    </ul>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Analyse Concurrentielle */}
        <Card className="print:break-before-page">
          <CardHeader>
            <CardTitle>4. Analyse Concurrentielle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-semibold">Solutions Internationales (Menace Modérée)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left p-2">Solution</th><th className="text-left p-2">Prix EUR/an</th><th className="text-left p-2">Conformité Loi 18-07</th><th className="text-left p-2">Support Local</th><th className="text-left p-2">Status</th></tr></thead>
                    <tbody>
                        <tr className="border-b"><td>Wyscout</td><td>10,000-30,000</td><td className="text-red-600">❌ Non</td><td className="text-red-600">❌ Anglais</td><td className="text-red-600">Risque légal</td></tr>
                        <tr className="border-b"><td>Hudl</td><td>3,000-15,000</td><td className="text-red-600">❌ Non</td><td className="text-red-600">❌ Anglais</td><td className="text-red-600">Risque légal</td></tr>
                        <tr className="border-b"><td>InStat</td><td>5,000-25,000</td><td className="text-red-600">❌ Non</td><td className="text-red-600">❌ Anglais</td><td className="text-red-600">Risque légal</td></tr>
                    </tbody>
                </table>
            </div>
            <p className="text-sm mt-2"><strong>Réalité du terrain :</strong> Ces solutions perdent des clients en Algérie à cause des problèmes de conformité et de support.</p>

            <h3 className="text-lg font-semibold mt-4">Notre Positionnement Défensif</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <Shield className="text-primary mb-2" />
                        <h4 className="font-semibold">Forteresse Réglementaire</h4>
                        <p className="text-sm">Seule solution certifiée conforme, aujourd'hui et demain.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4">
                        <Users className="text-primary mb-2" />
                        <h4 className="font-semibold">Service Ultra-Personnalisé</h4>
                        <p className="text-sm">Économiquement viable à petite échelle, ce que les géants ne peuvent pas offrir.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4">
                        <Globe className="text-primary mb-2" />
                        <h4 className="font-semibold">Intégration Culturelle</h4>
                        <p className="text-sm">Langue, processus, relations. Nous faisons partie de l'écosystème.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-4">
                        <TrendingUp className="text-primary mb-2" />
                        <h4 className="font-semibold">Partenariats Exclusifs</h4>
                        <p className="text-sm">Relations privilégiées avec FAF, DTN, et les clubs.</p>
                    </CardContent>
                </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketStudyDocument;
