import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';

interface AnalysisIssue {
  category: 'business_logic' | 'analytics' | 'financial' | 'decisional' | 'incoherence';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  recommendation: string;
}

interface AnalysisData {
  summary: string;
  overallScore: number;
  strengths: string[];
  issues: AnalysisIssue[];
  recommendations: string[];
}

interface DocumentAnalysisViewProps {
  analysis: AnalysisData;
}

export function DocumentAnalysisView({ analysis }: DocumentAnalysisViewProps) {
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      business_logic: 'Logique Business',
      analytics: 'Analytique',
      financial: 'Financier',
      decisional: 'Décisionnel',
      incoherence: 'Incohérence'
    };
    return labels[category] || category;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-info" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-muted';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const issuesByCategory = analysis.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) acc[issue.category] = [];
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, AnalysisIssue[]>);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Score Global d'Analyse</span>
            <span className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}/100
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={analysis.overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de l'Analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Points Forts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Issues by Category */}
      {Object.entries(issuesByCategory).map(([category, issues]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{getCategoryLabel(category)}</span>
              <Badge variant="outline">{issues.length} problème{issues.length > 1 ? 's' : ''}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {issues.map((issue, index) => (
                <AccordionItem key={index} value={`issue-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="font-medium">{issue.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {issue.location}
                        </div>
                      </div>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Description:</h4>
                        <p className="text-sm text-muted-foreground">{issue.description}</p>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                        <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          Recommandation:
                        </h4>
                        <p className="text-sm">{issue.recommendation}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recommandations Prioritaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="flex-1">{recommendation}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
