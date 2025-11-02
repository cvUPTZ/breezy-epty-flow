import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, User } from 'lucide-react';

interface ScoutReport {
  id: string;
  player_id: string | null;
  performance_rating: number | null;
  recommendation: string | null;
  match_context: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  detailed_notes: string | null;
  report_date: string | null;
  scouted_players?: {
    name: string;
    position: string | null;
    current_club: string | null;
  } | null;
}

interface ReportCardProps {
  report: ScoutReport;
  onViewDetails?: (reportId: string) => void;
}

export const ReportCard = ({ report, onViewDetails }: ReportCardProps) => {
  const getRecommendationStyle = (recommendation: string) => {
    switch (recommendation) {
      case 'sign': 
        return 'bg-success text-success-foreground hover:bg-success/90';
      case 'monitor': 
        return 'bg-warning text-warning-foreground hover:bg-warning/90';
      case 'reject': 
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      default: 
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRatingStyle = (rating: number) => {
    if (rating >= 8) return 'text-success';
    if (rating >= 6) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-border">
      <CardHeader className="space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-muted-foreground" />
              {report.scouted_players?.name || 'Unknown Player'}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {report.scouted_players?.position} • {report.scouted_players?.current_club}
            </p>
            {report.match_context && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {report.match_context}
              </p>
            )}
          </div>
          <div className="text-right space-y-2">
            <div className={`text-2xl font-bold ${getRatingStyle(report.performance_rating || 0)}`}>
              {report.performance_rating || 0}/10
            </div>
            <Badge className={getRecommendationStyle(report.recommendation || 'unknown')}>
              {report.recommendation || 'Unknown'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          {report.report_date ? new Date(report.report_date).toLocaleDateString() : 'No date'}
        </div>

        {report.strengths && report.strengths.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-success">Strengths</h4>
            <div className="flex flex-wrap gap-2">
              {report.strengths.map((strength, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs border-success/30 bg-success/5 text-success"
                >
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {report.weaknesses && report.weaknesses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-destructive">Weaknesses</h4>
            <div className="flex flex-wrap gap-2">
              {report.weaknesses.map((weakness, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs border-destructive/30 bg-destructive/5 text-destructive"
                >
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {report.detailed_notes && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-foreground">Notes</h4>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {report.detailed_notes}
            </p>
          </div>
        )}

        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => onViewDetails(report.id)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Full Report
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
