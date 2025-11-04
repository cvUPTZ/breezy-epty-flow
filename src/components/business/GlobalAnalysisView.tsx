import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, FileText, Link2, XCircle } from 'lucide-react';

interface DocumentComparison {
  documentId: string;
  documentTitle: string;
  documentType: string;
  score: number;
  mainFindings: string[];
}

interface GlobalAnalysis {
  summary: string;
  overallQuality: number;
  commonIssues: string[];
  strengths: string[];
  recommendations: string[];
  documentComparison: DocumentComparison[];
  synergies: string[];
  contradictions: string[];
}

interface GlobalAnalysisViewProps {
  analysis: GlobalAnalysis;
  documentsCount: number;
}

export function GlobalAnalysisView({ analysis, documentsCount }: GlobalAnalysisViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Analyse Globale des Documents</CardTitle>
              <p className="text-muted-foreground mt-2">
                {documentsCount} document{documentsCount > 1 ? 's' : ''} analysé{documentsCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor(analysis.overallQuality)}`}>
                {analysis.overallQuality}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Score Global</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-base leading-relaxed whitespace-pre-line">
              {analysis.summary}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Forces Communes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-base">{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Problèmes Récurrents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis.commonIssues.map((issue, index) => (
              <li key={index} className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <span className="text-base">{issue}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Synergies */}
      {analysis.synergies && analysis.synergies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-blue-600" />
              Synergies Identifiées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.synergies.map((synergy, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Link2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base">{synergy}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Contradictions */}
      {analysis.contradictions && analysis.contradictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Contradictions Détectées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.contradictions.map((contradiction, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-base">{contradiction}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Document Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comparaison des Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.documentComparison.map((doc, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{doc.documentTitle}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {doc.documentType.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <Badge className={getScoreBadgeColor(doc.score)}>
                    Score: {doc.score}/100
                  </Badge>
                </div>
                <ul className="space-y-2 ml-4">
                  {doc.mainFindings.map((finding, idx) => (
                    <li key={idx} className="text-sm list-disc">{finding}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recommandations Prioritaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="font-bold text-primary flex-shrink-0">{index + 1}.</span>
                <span className="text-base">{recommendation}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
