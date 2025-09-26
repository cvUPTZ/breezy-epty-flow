import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const ServiceOfferPage: React.FC = () => {
  const plans = [
    {
      name: "Basic",
      price: 6000,
      target: "Ligue 2, académies",
      features: [
        "Analyse de base",
        "2 comptes utilisateurs",
        "Support par email",
      ],
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Professional",
      price: 12000,
      target: "Clubs Ligue 1 moyens",
      features: [
        "Tout du plan Basic",
        "Analyses avancées (heatmaps)",
        "5 comptes utilisateurs",
        "Support prioritaire",
      ],
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
      popular: true,
    },
    {
      name: "Premium",
      price: 18000,
      target: "Top clubs, FAF",
      features: [
        "Tout du plan Professional",
        "Utilisateurs illimités",
        "Consulting tactique",
        "Support sur site",
      ],
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      buttonColor: "bg-purple-600 hover:bg-purple-700",
    },
  ];

  const otherServices = [
      {
          name: "Formation & Certification Obligatoire",
          description: "Pour garantir l'adoption et la maîtrise de l'outil, nous offrons une formation certifiante initiale (2-3 jours) et une recertification annuelle. C'est un pilier de notre offre pour assurer le succès de nos partenaires.",
          price: "À partir de 20,000 DZD",
      },
      {
          name: "Services Professionnels à la Demande",
          description: "Besoin d'une analyse approfondie d'un adversaire, d'un rapport de scouting détaillé ou d'une consultation tactique ponctuelle ? Notre équipe d'experts est à votre disposition.",
          price: "Sur devis",
      }
  ]

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Nos Offres de Services</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Une structure tarifaire claire et adaptée aux réalités du football algérien.
        </p>
      </div>

      <h2 className="text-3xl font-bold text-center mb-8">Abonnements SaaS</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.bgColor} border-2 ${plan.textColor.replace('text-', 'border-')} ${plan.popular ? 'shadow-xl scale-105' : ''}`}>
             {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">Populaire</Badge>}
            <CardHeader>
              <CardTitle className={`text-2xl font-bold ${plan.textColor}`}>{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.target}</p>
            </CardHeader>
            <CardContent className="flex-grow space-y-6">
              <div className={`text-4xl font-bold ${plan.textColor}`}>
                {formatCurrency(plan.price)}
                <span className="text-lg font-medium text-muted-foreground">/mois</span>
              </div>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="p-6 pt-0">
              <Button className={`w-full ${plan.buttonColor}`}>Choisir {plan.name}</Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-bold text-center mb-8">Autres Services Clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {otherServices.map(service => (
                <Card key={service.name}>
                    <CardHeader>
                        <CardTitle>{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <p className="text-lg font-bold">{service.price}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

    </div>
  );
};

export default ServiceOfferPage;
