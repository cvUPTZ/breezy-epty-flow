import { Assignment, Player, TrackerUser, AssignmentRecommendation, AssignmentMetrics, LineType, AssignmentType, TeamType } from './types';
import { LINE_CONFIGURATIONS, TRACKER_SPECIALTIES, EVENT_CATEGORIES } from './constants';
import { AssignmentValidator } from './validation';

export class AssignmentEngine {
  /**
   * Generates assignment recommendations based on match context and available trackers
   */
  static generateRecommendations(
    players: Player[],
    trackers: TrackerUser[],
    existingAssignments: Assignment[],
    matchContext?: {
      formation?: string;
      importance?: 'low' | 'medium' | 'high';
      focus_areas?: string[];
    }
  ): AssignmentRecommendation[] {
    const recommendations: AssignmentRecommendation[] = [];
    const availableTrackers = trackers.filter(t => t.is_active);

    // Calculate current workloads
    const trackerWorkloads = this.calculateTrackerWorkloads(existingAssignments, availableTrackers);

    // Recommend individual assignments for key players
    const keyPlayers = this.identifyKeyPlayers(players, matchContext);
    keyPlayers.forEach(player => {
      const existingPlayerAssignments = existingAssignments.filter(
        a => a.assignment_type === 'individual' && 
        a.player_id === player.id && 
        a.status === 'active'
      );

      if (existingPlayerAssignments.length === 0) {
        const recommendedTracker = this.findBestTracker(
          availableTrackers,
          trackerWorkloads,
          'individual',
          player.position
        );

        if (recommendedTracker) {
          recommendations.push({
            type: 'individual',
            confidence: 0.85,
            recommended_tracker: recommendedTracker,
            reasoning: `Key player ${player.player_name} (${player.position}) should be individually tracked`,
            estimated_workload: 15,
            alternative_trackers: this.findAlternativeTrackers(
              availableTrackers,
              trackerWorkloads,
              recommendedTracker.id,
              'individual'
            )
          });
        }
      }
    });

    // Recommend line assignments
    const lineRecommendations = this.generateLineRecommendations(
      players,
      availableTrackers,
      trackerWorkloads,
      existingAssignments,
      matchContext
    );
    recommendations.push(...lineRecommendations);

    // Recommend video assignments if match context suggests analysis needs
    if (matchContext?.importance === 'high') {
      const videoSpecialists = availableTrackers.filter(
        t => t.specialty === 'specialized' || t.specialty === 'generalist'
      );

      const recommendedVideoTracker = this.findBestTracker(
        videoSpecialists,
        trackerWorkloads,
        'video'
      );

      if (recommendedVideoTracker) {
        recommendations.push({
          type: 'video',
          confidence: 0.75,
          recommended_tracker: recommendedVideoTracker,
          reasoning: 'High importance match would benefit from video analysis',
          estimated_workload: 30,
          alternative_trackers: this.findAlternativeTrackers(
            videoSpecialists,
            trackerWorkloads,
            recommendedVideoTracker.id,
            'video'
          )
        });
      }
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Optimizes assignment distribution across trackers
   */
  static optimizeAssignments(
    assignments: Assignment[],
    trackers: TrackerUser[]
  ): { optimized_assignments: Assignment[]; improvements: string[] } {
    const improvements: string[] = [];
    const optimized = [...assignments];

    // Calculate current distribution efficiency
    const workloads = this.calculateTrackerWorkloads(assignments, trackers);
    const averageWorkload = Object.values(workloads).reduce((sum, w) => sum + w.score, 0) / trackers.length;
    
    // Identify overloaded and underutilized trackers
    const overloaded = Object.entries(workloads)
      .filter(([_, workload]) => workload.score > averageWorkload * 1.5)
      .map(([trackerId]) => trackerId);

    const underutilized = Object.entries(workloads)
      .filter(([_, workload]) => workload.score < averageWorkload * 0.7)
      .map(([trackerId]) => trackerId);

    // Redistribute assignments from overloaded to underutilized trackers
    overloaded.forEach(overloadedTrackerId => {
      const overloadedAssignments = assignments.filter(
        a => a.tracker_user_id === overloadedTrackerId && a.status === 'active'
      );

      // Sort assignments by complexity (simplest first for redistribution)
      const sortedAssignments = overloadedAssignments.sort((a, b) => {
        const scoreA = this.calculateAssignmentComplexity(a);
        const scoreB = this.calculateAssignmentComplexity(b);
        return scoreA - scoreB;
      });

      // Try to move some assignments to underutilized trackers
      sortedAssignments.slice(0, 2).forEach(assignment => {
        const suitableTracker = underutilized.find(trackerId => {
          const tracker = trackers.find(t => t.id === trackerId);
          return tracker && this.isTrackerSuitableForAssignment(tracker, assignment);
        });

        if (suitableTracker) {
          const optimizedIndex = optimized.findIndex(a => a.id === assignment.id);
          if (optimizedIndex !== -1) {
            optimized[optimizedIndex] = {
              ...optimized[optimizedIndex],
              tracker_user_id: suitableTracker
            };
            improvements.push(
              `Redistributed ${assignment.assignment_type} assignment from overloaded tracker to ${suitableTracker}`
            );
          }
        }
      });
    });

    return { optimized_assignments: optimized, improvements };
  }

  /**
   * Calculates comprehensive assignment metrics
   */
  static calculateMetrics(assignments: Assignment[], trackers: TrackerUser[]): AssignmentMetrics {
    const activeAssignments = assignments.filter(a => a.status === 'active');
    const completedAssignments = assignments.filter(a => a.status === 'completed');

    const assignmentDistribution = assignments.reduce((dist, assignment) => {
      dist[assignment.assignment_type] = (dist[assignment.assignment_type] || 0) + 1;
      return dist;
    }, {} as Record<AssignmentType, number>);

    const totalEvents = activeAssignments.reduce(
      (sum, assignment) => sum + assignment.assigned_event_types.length,
      0
    );

    const activeTrackers = new Set(activeAssignments.map(a => a.tracker_user_id)).size;
    const trackerUtilization = activeTrackers / trackers.length;

    return {
      total_assignments: assignments.length,
      active_assignments: activeAssignments.length,
      completion_rate: completedAssignments.length / Math.max(1, assignments.length),
      average_events_per_assignment: totalEvents / Math.max(1, activeAssignments.length),
      tracker_utilization: trackerUtilization,
      assignment_distribution: assignmentDistribution
    };
  }

  /**
   * Groups players by tactical lines based on positions
   */
  static groupPlayersByLines(players: Player[]): Record<LineType, Player[]> {
    const lines: Record<LineType, Player[]> = {
      defense: [],
      midfield: [],
      attack: [],
      fullTeam: []
    };

    players.forEach(player => {
      const position = player.position?.toUpperCase() || '';
      
      // Defensive line
      if (LINE_CONFIGURATIONS.defense.positions.includes(position)) {
        lines.defense.push(player);
      }
      
      // Midfield line
      if (LINE_CONFIGURATIONS.midfield.positions.includes(position)) {
        lines.midfield.push(player);
      }
      
      // Attack line
      if (LINE_CONFIGURATIONS.attack.positions.includes(position)) {
        lines.attack.push(player);
      }

      // Full team includes all outfield players
      if (position !== 'GK') {
        lines.fullTeam.push(player);
      }
    });

    return lines;
  }

  /**
   * Private helper methods
   */
  private static calculateTrackerWorkloads(
    assignments: Assignment[],
    trackers: TrackerUser[]
  ): Record<string, { score: number; count: number; complexity: number }> {
    const workloads: Record<string, { score: number; count: number; complexity: number }> = {};

    trackers.forEach(tracker => {
      const trackerAssignments = assignments.filter(
        a => a.tracker_user_id === tracker.id && a.status === 'active'
      );

      const complexity = trackerAssignments.reduce(
        (sum, assignment) => sum + this.calculateAssignmentComplexity(assignment),
        0
      );

      workloads[tracker.id] = {
        score: complexity,
        count: trackerAssignments.length,
        complexity: complexity / Math.max(1, trackerAssignments.length)
      };
    });

    return workloads;
  }

  private static calculateAssignmentComplexity(assignment: Assignment): number {
    let complexity = 10; // Base complexity

    // Type-based complexity
    const typeComplexity = {
      individual: 10,
      line: 15,
      video: 25,
      formation: 20,
      zone: 12
    };
    complexity += typeComplexity[assignment.assignment_type];

    // Event types complexity
    complexity += assignment.assigned_event_types.length * 2;

    // Priority complexity
    const priorityMultiplier = { low: 1, medium: 1.2, high: 1.5, critical: 2 };
    complexity *= priorityMultiplier[assignment.priority];

    return complexity;
  }

  private static identifyKeyPlayers(
    players: Player[],
    matchContext?: { formation?: string; importance?: string; focus_areas?: string[] }
  ): Player[] {
    // For now, return players in key positions
    const keyPositions = ['ST', 'CF', 'CAM', 'CM', 'CB', 'GK'];
    return players.filter(player => 
      keyPositions.includes(player.position?.toUpperCase() || '')
    ).slice(0, 5); // Limit to top 5 key players
  }

  private static findBestTracker(
    trackers: TrackerUser[],
    workloads: Record<string, { score: number; count: number; complexity: number }>,
    assignmentType: AssignmentType,
    position?: string
  ): TrackerUser | null {
    const sortedTrackers = trackers
      .filter(tracker => {
        const workload = workloads[tracker.id] || { score: 0, count: 0, complexity: 0 };
        const maxAssignments = tracker.specialty ? 
          TRACKER_SPECIALTIES[tracker.specialty].maxConcurrentAssignments : 10;
        
        return workload.count < maxAssignments;
      })
      .sort((a, b) => {
        const workloadA = workloads[a.id] || { score: 0, count: 0, complexity: 0 };
        const workloadB = workloads[b.id] || { score: 0, count: 0, complexity: 0 };
        
        // Prefer specialists for their specialty, then by lowest workload
        const specialtyScoreA = this.getSpecialtyScore(a, assignmentType, position);
        const specialtyScoreB = this.getSpecialtyScore(b, assignmentType, position);
        
        if (specialtyScoreA !== specialtyScoreB) {
          return specialtyScoreB - specialtyScoreA;
        }
        
        return workloadA.score - workloadB.score;
      });

    return sortedTrackers[0] || null;
  }

  private static getSpecialtyScore(
    tracker: TrackerUser,
    assignmentType: AssignmentType,
    position?: string
  ): number {
    if (!tracker.specialty || tracker.specialty === 'generalist') return 5;

    const specialtyConfig = TRACKER_SPECIALTIES[tracker.specialty];
    
    // Video assignments favor specialized trackers
    if (assignmentType === 'video' && tracker.specialty === 'specialized') {
      return 10;
    }

    // Position-based scoring
    if (position) {
      const positionUpper = position.toUpperCase();
      switch (tracker.specialty) {
        case 'defense':
          return LINE_CONFIGURATIONS.defense.positions.includes(positionUpper) ? 10 : 3;
        case 'midfield':
          return LINE_CONFIGURATIONS.midfield.positions.includes(positionUpper) ? 10 : 3;
        case 'attack':
          return LINE_CONFIGURATIONS.attack.positions.includes(positionUpper) ? 10 : 3;
        case 'goalkeeper':
          return positionUpper === 'GK' ? 10 : 1;
      }
    }

    return 5;
  }

  private static findAlternativeTrackers(
    trackers: TrackerUser[],
    workloads: Record<string, { score: number; count: number; complexity: number }>,
    excludeTrackerId: string,
    assignmentType: AssignmentType
  ): TrackerUser[] {
    return trackers
      .filter(t => t.id !== excludeTrackerId && t.is_active)
      .sort((a, b) => {
        const workloadA = workloads[a.id] || { score: 0, count: 0, complexity: 0 };
        const workloadB = workloads[b.id] || { score: 0, count: 0, complexity: 0 };
        return workloadA.score - workloadB.score;
      })
      .slice(0, 3); // Return top 3 alternatives
  }

  private static generateLineRecommendations(
    players: Player[],
    trackers: TrackerUser[],
    workloads: Record<string, { score: number; count: number; complexity: number }>,
    existingAssignments: Assignment[],
    matchContext?: any
  ): AssignmentRecommendation[] {
    const recommendations: AssignmentRecommendation[] = [];
    const playerLines = this.groupPlayersByLines(players);

    // Check each line type for assignment opportunities
    Object.entries(playerLines).forEach(([lineType, linePlayers]) => {
      if (lineType === 'fullTeam') return; // Skip full team for now
      
      const line = lineType as LineType;
      const lineConfig = LINE_CONFIGURATIONS[line];
      
      if (linePlayers.length >= lineConfig.minPlayers) {
        // Check if line already has assignments
        const existingLineAssignments = existingAssignments.filter(
          a => a.assignment_type === 'line' && a.line_type === line && a.status === 'active'
        );

        if (existingLineAssignments.length === 0) {
          const recommendedTracker = this.findBestTracker(
            trackers,
            workloads,
            'line',
            lineType
          );

          if (recommendedTracker) {
            recommendations.push({
              type: 'line',
              confidence: 0.80,
              recommended_tracker: recommendedTracker,
              reasoning: `${lineConfig.label} with ${linePlayers.length} players would benefit from line assignment`,
              estimated_workload: 20,
              alternative_trackers: this.findAlternativeTrackers(
                trackers,
                workloads,
                recommendedTracker.id,
                'line'
              )
            });
          }
        }
      }
    });

    return recommendations;
  }

  private static isTrackerSuitableForAssignment(
    tracker: TrackerUser,
    assignment: Assignment
  ): boolean {
    if (!tracker.is_active) return false;

    // Check specialty compatibility
    if (tracker.specialty && tracker.specialty !== 'generalist') {
      const specialtyConfig = TRACKER_SPECIALTIES[tracker.specialty];
      const hasCompatibleEvents = assignment.assigned_event_types.some(
        event => specialtyConfig.preferredEvents.includes(event)
      );

      // For non-generalists, at least 30% of events should match specialty
      const compatibilityRatio = assignment.assigned_event_types.filter(
        event => specialtyConfig.preferredEvents.includes(event)
      ).length / assignment.assigned_event_types.length;

      return compatibilityRatio >= 0.3;
    }

    return true; // Generalists can handle any assignment
  }
}