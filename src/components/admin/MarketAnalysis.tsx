import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

const MarketAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Analyse du Marché Algérien
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Opportunité Stratégique : Réforme Numérique</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Alignement avec la FAF :** La FAF a lancé une initiative de numérisation majeure pour lutter contre la corruption.</li>
                <li>• **Plateforme FAFConnect :** L'introduction de FAFConnect (via FIFA Connect) pour la gestion des licences est une preuve de cette volonté.</li>
                <li>• **Partenaire de la Réforme :** Notre solution se positionne comme un outil essentiel pour accompagner cette transition vers la transparence.</li>
                <li>• **Demande Institutionnelle :** La demande pour des outils de gouvernance et de conformité est donc créée par le haut de la pyramide.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Contexte de la "Double Réalité"</h4>
               <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Réalité Officielle :** Projets de réforme, professionnalisation, mise en place de standards.</li>
                <li>• **Réalité de l'Ombre :** Pratiques non-officielles qui influencent fortement le marché.</li>
                <li>• **Implication :** Notre stratégie doit naviguer entre ces deux réalités pour réussir.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Défis Existentiels du Marché</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Corruption et Instabilité</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Instabilité Fédérale :** Enquêtes judiciaires et changements fréquents à la tête de la FAF.</li>
                <li>• **Manque de Transparence :** Gestion opaque des fonds et des contrats.</li>
                <li>• **Risque Partenaire :** La fiabilité des instances officielles comme partenaire est compromise.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Économie de l'Ombre</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Trafic de Matchs :** Des cas avérés de matchs truqués qui dévaluent l'analyse de données.</li>
                <li>• **Paiements "Sous la Table" :** Le plafonnement des salaires encourage les finances parallèles.</li>
                <li>• **Résistance à la Transparence :** Les acteurs habitués à l'opacité peuvent rejeter les outils numériques.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stratégie Go-to-Market (GTM)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold">Phase 1: Validation (Mois 1-12)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Objectif :** Prouver le Product-Market Fit.</li>
                <li>• **Actions :** Partenariat avec 2-3 clubs pilotes (ex: CRB, ESS).</li>
                <li>• **KPI :** Taux d'adoption > 90%, satisfaction > 8/10.</li>
              </ul>
            </div>
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold">Phase 2: Pénétration (Mois 13-24)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Objectif :** Obtenir l'endorsement officiel de la FAF.</li>
                <li>• **Actions :** Expansion systématique en Ligue 1.</li>
                <li>• **KPI :** 50% de part de marché en L1.</li>
              </ul>
            </div>
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold">Phase 3: Domination (Mois 25-36)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Objectif :** Devenir le standard du marché.</li>
                <li>• **Actions :** Expansion agressive en Ligue 2 et académies.</li>
                <li>• **KPI :** 80% L1, 60% L2.</li>
              </ul>
            </div>
             <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold">Phase 4: Expansion (Ans 4-5)</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• **Objectif :** Devenir un acteur régional.</li>
                <li>• **Actions :** Lancement en Tunisie et Maroc.</li>
                <li>• **KPI :** 5 clients dans chaque nouveau pays.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Taille du Marché et Segmentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Marché Total Adressable (TAM)</h4>
              <p className="text-2xl font-bold text-primary">15-20M DZD / an</p>
              <p className="text-sm text-muted-foreground">Croissance annuelle de 15% (CAGR) tirée par les réformes.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Marché Adressable Disponible (SAM)</h4>
              <p className="text-2xl font-bold text-blue-600">8-12M DZD / an</p>
              <p className="text-sm text-muted-foreground">Ciblage des clubs pro (L1/L2) et académies FAF.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketAnalysis;
