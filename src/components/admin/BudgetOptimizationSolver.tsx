
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Target, 
  Settings, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Zap,
  Users,
  Timer
} from 'lucide-react';
import { toast } from 'sonner';

interface OptimizationParams {
  maxBudgetPerMatch: number;
  minQualityScore: number;
  maxComplexityScore: number;
  prioritizeEfficiency: boolean;
}

interface OptimizedResult {
  trackersMinimum: number;
  trackersOptimal: number;
  replacements: number;
  playersToTrack: number;
  totalCost: number;
  qualityScore: number;
  efficiencyScore: number;
  feasible: boolean;
}

interface BudgetOptimizationSolverProps {
  currentConfig: {
    trackersMinimum: number;
    trackersOptimal: number;
    replacements: number;
    playersToTrack: number;
  };
  onConfigUpdate: (config: {
    trackersMinimum: number;
    trackersOptimal: number;
    replacements: number;
    playersToTrack: number;
  }) => void;
  calculateCost: (config: any) => { totalCost: number; breakdown: any };
  calculateEfficiency: (config: any) => any;
}

const BudgetOptimizationSolver: React.FC<BudgetOptimizationSolverProps> = ({
  currentConfig,
  onConfigUpdate,
  calculateCost,
  calculateEfficiency
}) => {
  const [optimizationParams, setOptimizationParams] = useState<OptimizationParams>({
    maxBudgetPerMatch: 50000, // DZD
    minQualityScore: 75,
    maxComplexityScore: 800,
    prioritizeEfficiency: true
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [bestResults, setBestResults] = useState<OptimizedResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<OptimizedResult | null>(null);

  // Manual parameter editing
  const [manualConfig, setManualConfig] = useState(currentConfig);

  const simulateConfiguration = useCallback((config: typeof currentConfig): OptimizedResult => {
    const cost = calculateCost({
      trackersOptimal: config.trackersOptimal,
      replacements: config.replacements,
      playersToTrack: config.playersToTrack
    });
    
    const efficiency = calculateEfficiency({
      trackersOptimal: config.trackersOptimal,
      replacements: config.replacements,
      playersToTrack: config.playersToTrack
    });

    // Calculate quality score based on coverage and redundancy
    const coverageScore = Math.min(100, (config.trackersOptimal / config.playersToTrack) * 100);
    const redundancyScore = config.trackersOptimal > config.trackersMinimum ? 20 : 0;
    const replacementScore = config.replacements > 0 ? 15 : 0;
    const qualityScore = (coverageScore * 0.7) + redundancyScore + replacementScore;

    // Calculate efficiency score
    const costEfficiency = Math.max(0, 100 - (cost.totalCost / 1000));
    const resourceEfficiency = (config.playersToTrack / config.trackersOptimal) * 20;
    const efficiencyScore = (costEfficiency + resourceEfficiency) / 2;

    return {
      trackersMinimum: config.trackersMinimum,
      trackersOptimal: config.trackersOptimal,
      replacements: config.replacements,
      playersToTrack: config.playersToTrack,
      totalCost: cost.totalCost,
      qualityScore: Math.round(qualityScore),
      efficiencyScore: Math.round(efficiencyScore),
      feasible: cost.totalCost <= optimizationParams.maxBudgetPerMatch && 
                qualityScore >= optimizationParams.minQualityScore
    };
  }, [calculateCost, calculateEfficiency, optimizationParams]);

  const runOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    const results: OptimizedResult[] = [];

    // Genetic Algorithm-like approach
    const configurations = [];
    
    // Generate initial population
    for (let trackers = 2; trackers <= 6; trackers++) {
      for (let players = 18; players <= 24; players += 2) {
        for (let replacements = 0; replacements <= 2; replacements++) {
          configurations.push({
            trackersMinimum: Math.max(2, trackers - 1),
            trackersOptimal: trackers,
            replacements,
            playersToTrack: players
          });
        }
      }
    }

    // Simulate each configuration with progress updates
    for (let i = 0; i < configurations.length; i++) {
      const config = configurations[i];
      const result = simulateConfiguration(config);
      
      if (result.feasible) {
        results.push(result);
      }

      setOptimizationProgress(Math.round((i + 1) / configurations.length * 100));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Sort by composite score
    const sortedResults = results.sort((a, b) => {
      if (optimizationParams.prioritizeEfficiency) {
        return (b.efficiencyScore * 0.6 + b.qualityScore * 0.4) - 
               (a.efficiencyScore * 0.6 + a.qualityScore * 0.4);
      } else {
        return (b.qualityScore * 0.6 + b.efficiencyScore * 0.4) - 
               (a.qualityScore * 0.6 + a.efficiencyScore * 0.4);
      }
    });

    setBestResults(sortedResults.slice(0, 5)); // Top 5 results
    setIsOptimizing(false);
    
    if (sortedResults.length > 0) {
      toast.success(`Optimisation terminée! ${sortedResults.length} configurations viables trouvées.`);
    } else {
      toast.warning('Aucune configuration viable trouvée avec les paramètres actuels.');
    }
  };

  const applyOptimizedConfig = (result: OptimizedResult) => {
    onConfigUpdate({
      trackersMinimum: result.trackersMinimum,
      trackersOptimal: result.trackersOptimal,
      replacements: result.replacements,
      playersToTrack: result.playersToTrack
    });
    
    setSelectedResult(result);
    toast.success('Configuration appliquée avec succès!');
  };

  const applyManualConfig = () => {
    onConfigUpdate(manualConfig);
    toast.success('Configuration manuelle appliquée!');
  };

  return (
    <div className="space-y-6">
      {/* Optimization Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Paramètres d'Optimisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxBudget">Budget Maximum par Match (DZD)</Label>
              <Input
                id="maxBudget"
                type="number"
                value={optimizationParams.maxBudgetPerMatch}
                onChange={(e) => setOptimizationParams({
                  ...optimizationParams,
                  maxBudgetPerMatch: Number(e.target.value)
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="minQuality">Score Qualité Minimum (%)</Label>
              <div className="px-2">
                <Slider
                  value={[optimizationParams.minQualityScore]}
                  onValueChange={([value]) => setOptimizationParams({
                    ...optimizationParams,
                    minQualityScore: value
                  })}
                  max={100}
                  min={50}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>50%</span>
                  <span>{optimizationParams.minQualityScore}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button 
              onClick={runOptimization} 
              disabled={isOptimizing}
              className="flex items-center gap-2"
            >
              {isOptimizing ? (
                <>
                  <Timer className="h-4 w-4 animate-spin" />
                  Optimisation en cours...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Lancer l'Optimisation
                </>
              )}
            </Button>
            
            {isOptimizing && (
              <div className="flex-1 ml-4">
                <Progress value={optimizationProgress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {optimizationProgress}% completé
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Results */}
      {bestResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Meilleures Configurations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedResult === result ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedResult(result)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        #{index + 1}
                      </Badge>
                      {result.feasible ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        applyOptimizedConfig(result);
                      }}
                    >
                      Appliquer
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Trackers</p>
                      <p className="font-semibold">{result.trackersMinimum}/{result.trackersOptimal}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Joueurs</p>
                      <p className="font-semibold">{result.playersToTrack}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coût Total</p>
                      <p className="font-semibold">{result.totalCost.toLocaleString()} DZD</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scores</p>
                      <p className="font-semibold">Q:{result.qualityScore}% E:{result.efficiencyScore}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Manuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="manualTrackersMin">Trackers Minimum</Label>
              <Input
                id="manualTrackersMin"
                type="number"
                min="1"
                max="10"
                value={manualConfig.trackersMinimum}
                onChange={(e) => setManualConfig({
                  ...manualConfig,
                  trackersMinimum: Number(e.target.value)
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="manualTrackersOptimal">Trackers Optimal</Label>
              <Input
                id="manualTrackersOptimal"
                type="number"
                min="1"
                max="10"
                value={manualConfig.trackersOptimal}
                onChange={(e) => setManualConfig({
                  ...manualConfig,
                  trackersOptimal: Number(e.target.value)
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="manualReplacements">Remplacements</Label>
              <Input
                id="manualReplacements"
                type="number"
                min="0"
                max="5"
                value={manualConfig.replacements}
                onChange={(e) => setManualConfig({
                  ...manualConfig,
                  replacements: Number(e.target.value)
                })}
              />
            </div>
            
            <div>
              <Label htmlFor="manualPlayers">Joueurs à Suivre</Label>
              <Input
                id="manualPlayers"
                type="number"
                min="18"
                max="24"
                value={manualConfig.playersToTrack}
                onChange={(e) => setManualConfig({
                  ...manualConfig,
                  playersToTrack: Number(e.target.value)
                })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={applyManualConfig}>
              <Calculator className="h-4 w-4 mr-2" />
              Appliquer Configuration
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Coût estimé: {calculateCost(manualConfig).totalCost.toLocaleString()} DZD
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetOptimizationSolver;
