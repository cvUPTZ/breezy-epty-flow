import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * @component CanvasBox
 * @description A small, reusable sub-component for displaying a single block of the Business Model Canvas.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the canvas block.
 * @param {string[]} props.items - An array of strings to be listed within the block.
 * @returns {React.FC} A React functional component.
 */
const CanvasBox: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="border p-4 rounded-lg h-full">
    <h3 className="font-semibold text-sm mb-2 text-primary">{title}</h3>
    <ul className="text-xs text-muted-foreground space-y-1">
      {items.map((item, index) => (
        <li key={index}>• {item}</li>
      ))}
    </ul>
  </div>
);

/**
 * @component BusinessModelCanvasView
 * @description A read-only component that displays the Business Model Canvas in its standard
 * grid layout. The data is hardcoded and provides a static snapshot of the business model.
 * @returns {React.FC} A React functional component.
 */
const BusinessModelCanvasView: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Model Canvas - sportdataanalytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 grid-rows-6 gap-2 h-[600px]">
          {/* Top Row */}
          <div className="col-span-2 row-span-4">
            <CanvasBox
              title="Partenaires Clés"
              items={[
                "FAF / DTN (Institutionnel)",
                "Clubs Pilotes (CRB, ESS)",
                "Fournisseurs Tech (ISSAL NET)",
                "Fournisseurs Paiement (Chargily)"
              ]}
            />
          </div>
          <div className="col-span-2 row-span-2">
            <CanvasBox
              title="Activités Clés"
              items={[
                "Développement Plateforme SaaS",
                "Collecte de Données Terrain",
                "Support & Formation Client"
              ]}
            />
          </div>
          <div className="col-span-4 row-span-4">
            <CanvasBox
              title="Proposition de Valeur"
              items={[
                "Solution 100% Locale & Conforme (Loi 18-07)",
                "Alternative Accessible aux Outils Internationaux",
                "Outil de Transparence (Anti-corruption)",
                "Support Terrain et Expertise Locale"
              ]}
            />
          </div>
          <div className="col-span-2 row-span-2">
             <CanvasBox
              title="Relations Clients"
              items={[
                "Support Dédié Premium",
                "Onboarding & Formation Continue",
                "Partenariats Institutionnels"
              ]}
            />
          </div>
          <div className="col-span-2 row-span-4">
            <CanvasBox
              title="Segments de Clientèle"
              items={[
                "Clubs Pro (Ligue 1 & 2)",
                "Académies FAF",
                "Académies Privées",
                "Médias & Analystes"
              ]}
            />
          </div>

          {/* Middle Row */}
          <div className="col-span-2 row-span-2">
            <CanvasBox
              title="Ressources Clés"
              items={[
                "Plateforme Technologique",
                "Réseau de Trackers",
                "Partenariat Exclusif FAF",
                "Base de Données propriétaire"
              ]}
            />
          </div>
          <div className="col-span-2 row-span-2">
            <CanvasBox
              title="Canaux"
              items={[
                "Vente Directe B2B",
                "Endorsement FAF/DTN",
                "Marketing Digital Ciblé"
              ]}
            />
          </div>

          {/* Bottom Row */}
          <div className="col-span-6 row-span-2">
            <CanvasBox
              title="Structure des Coûts"
              items={[
                "Développement & R&D",
                "Salaires (Trackers, Ventes, Support)",
                "Marketing & Ventes",
                "Infrastructure & Hébergement"
              ]}
            />
          </div>
          <div className="col-span-6 row-span-2">
            <CanvasBox
              title="Flux de Revenus"
              items={[
                "Licences SaaS B2B (Paiement Annuel)",
                "Services à Valeur Ajoutée (Intégrité, Formation)",
                "Consulting & Rapports Personnalisés"
              ]}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessModelCanvasView;
