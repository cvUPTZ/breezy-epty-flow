import { Assignment, AssignmentConflict, TrackerUser, Player } from './types';
import { VALIDATION_RULES, TRACKER_SPECIALTIES } from './constants';

export class AssignmentValidator {
  /**
   * Validates a single assignment for basic rules
   */
  static validateAssignment(assignment: Assignment): string[] {
    const errors: string[] = [];

    // Basic validation
    if (!assignment.match_id) {
      errors.push('Match ID is required');
    }

    if (!assignment.tracker_user_id) {
      errors.push('Tracker user ID is required');
    }

    if (!assignment.assigned_event_types || assignment.assigned_event_types.length === 0) {
      errors.push('At least one event type must be assigned');
    }

    if (assignment.assigned_event_types.length > VALIDATION_RULES.maxEventTypesPerAssignment) {
      errors.push(`Maximum ${VALIDATION_RULES.maxEventTypesPerAssignment} event types allowed per assignment`);
    }

    // Type-specific validation
    switch (assignment.assignment_type) {
      case 'individual':
        if (!assignment.player_id) {
          errors.push('Player ID is required for individual assignments');
        }
        if (!assignment.player_team_id) {
          errors.push('Player team ID is required for individual assignments');
        }
        break;

      case 'line':
        if (!assignment.player_ids || assignment.player_ids.length < VALIDATION_RULES.minPlayersPerLineAssignment) {
          errors.push(`Line assignments require at least ${VALIDATION_RULES.minPlayersPerLineAssignment} players`);
        }
        if (assignment.player_ids && assignment.player_ids.length > VALIDATION_RULES.maxPlayersPerLineAssignment) {
          errors.push(`Line assignments cannot exceed ${VALIDATION_RULES.maxPlayersPerLineAssignment} players`);
        }
        break;

      case 'video':
        if (!assignment.video_url) {
          errors.push('Video URL is required for video assignments');
        }
        break;

      case 'formation':
        if (!assignment.formation_name) {
          errors.push('Formation name is required for formation assignments');
        }
        if (!assignment.player_positions || assignment.player_positions.length === 0) {
          errors.push('Player positions are required for formation assignments');
        }
        break;

      case 'zone':
        if (!assignment.zone_definition) {
          errors.push('Zone definition is required for zone assignments');
        }
        if (!assignment.zone_name) {
          errors.push('Zone name is required for zone assignments');
        }
        break;
    }

    return errors;
  }

  /**
   * Detects conflicts between assignments
   */
  static detectConflicts(
    newAssignment: Assignment,
    existingAssignments: Assignment[],
    trackers: TrackerUser[]
  ): AssignmentConflict[] {
    const conflicts: AssignmentConflict[] = [];

    // Get tracker for workload analysis
    const tracker = trackers.find(t => t.id === newAssignment.tracker_user_id);
    
    // Check tracker overload
    const trackerAssignments = existingAssignments.filter(
      a => a.tracker_user_id === newAssignment.tracker_user_id && a.status === 'active'
    );

    if (trackerAssignments.length >= VALIDATION_RULES.maxAssignmentsPerTracker) {
      conflicts.push({
        type: 'tracker_overload',
        severity: 'high',
        description: `Tracker has reached maximum assignments (${VALIDATION_RULES.maxAssignmentsPerTracker})`,
        conflicting_assignments: trackerAssignments.map(a => a.id),
        suggested_resolution: 'Assign to a different tracker or complete some existing assignments'
      });
    }

    // Check specialty mismatch
    if (tracker?.specialty && tracker.specialty !== 'generalist') {
      const specialtyConfig = TRACKER_SPECIALTIES[tracker.specialty];
      const hasPreferredEvents = newAssignment.assigned_event_types.some(
        event => specialtyConfig.preferredEvents.includes(event)
      );

      if (!hasPreferredEvents) {
        conflicts.push({
          type: 'player_overlap',
          severity: 'low',
          description: `Assignment events don't match tracker's specialty (${specialtyConfig.label})`,
          conflicting_assignments: [newAssignment.id],
          suggested_resolution: 'Consider assigning to a more suitable specialist or generalist'
        });
      }
    }

    // Check for player overlaps (individual assignments)
    if (newAssignment.assignment_type === 'individual') {
      const playerConflicts = existingAssignments.filter(a => 
        a.assignment_type === 'individual' &&
        a.player_id === newAssignment.player_id &&
        a.player_team_id === newAssignment.player_team_id &&
        a.status === 'active'
      );

      if (playerConflicts.length > 0) {
        const overlappingEvents = newAssignment.assigned_event_types.filter(event =>
          playerConflicts.some(conflict => conflict.assigned_event_types.includes(event))
        );

        if (overlappingEvents.length > 0) {
          conflicts.push({
            type: 'event_overlap',
            severity: 'medium',
            description: `Player is already assigned for events: ${overlappingEvents.join(', ')}`,
            conflicting_assignments: playerConflicts.map(a => a.id),
            suggested_resolution: 'Remove overlapping events or reassign to different players'
          });
        }
      }
    }

    // Check for line assignment overlaps
    if (newAssignment.assignment_type === 'line') {
      const lineConflicts = existingAssignments.filter(a =>
        (a.assignment_type === 'line' || a.assignment_type === 'individual') &&
        a.status === 'active'
      );

      lineConflicts.forEach(conflict => {
        let overlappingPlayers: number[] = [];

        if (conflict.assignment_type === 'line') {
          overlappingPlayers = newAssignment.player_ids.filter(playerId =>
            conflict.player_ids.includes(playerId)
          );
        } else if (conflict.assignment_type === 'individual') {
          if (newAssignment.player_ids.includes(conflict.player_id)) {
            overlappingPlayers = [conflict.player_id];
          }
        }

        if (overlappingPlayers.length > 0) {
          const overlappingEvents = newAssignment.assigned_event_types.filter(event =>
            conflict.assigned_event_types.includes(event)
          );

          if (overlappingEvents.length > 0) {
            conflicts.push({
              type: 'player_overlap',
              severity: 'medium',
              description: `${overlappingPlayers.length} players overlap with existing assignment for events: ${overlappingEvents.join(', ')}`,
              conflicting_assignments: [conflict.id],
              suggested_resolution: 'Adjust player selection or event types to avoid overlap'
            });
          }
        }
      });
    }

    // Check video assignment limits
    if (newAssignment.assignment_type === 'video') {
      const videoAssignments = trackerAssignments.filter(a => a.assignment_type === 'video');
      
      if (videoAssignments.length >= VALIDATION_RULES.maxConcurrentVideoAssignments) {
        conflicts.push({
          type: 'tracker_overload',
          severity: 'medium',
          description: `Tracker has reached maximum video assignments (${VALIDATION_RULES.maxConcurrentVideoAssignments})`,
          conflicting_assignments: videoAssignments.map(a => a.id),
          suggested_resolution: 'Complete existing video assignments or assign to different tracker'
        });
      }
    }

    return conflicts;
  }

  /**
   * Validates tracker workload and capacity
   */
  static validateTrackerWorkload(
    trackerId: string,
    assignments: Assignment[],
    tracker: TrackerUser
  ): { isValid: boolean; warnings: string[]; suggestions: string[] } {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const trackerAssignments = assignments.filter(
      a => a.tracker_user_id === trackerId && a.status === 'active'
    );

    const workloadScore = this.calculateWorkloadScore(trackerAssignments);
    const specialty = tracker.specialty || 'generalist';
    const maxCapacity = TRACKER_SPECIALTIES[specialty].maxConcurrentAssignments;

    // Check assignment count
    if (trackerAssignments.length >= maxCapacity) {
      warnings.push(`Tracker has ${trackerAssignments.length}/${maxCapacity} assignments (at capacity)`);
      suggestions.push('Consider redistributing some assignments or waiting for completion');
    } else if (trackerAssignments.length >= maxCapacity * 0.8) {
      warnings.push(`Tracker approaching capacity: ${trackerAssignments.length}/${maxCapacity} assignments`);
      suggestions.push('Monitor workload closely and prepare backup assignments');
    }

    // Check workload complexity
    if (workloadScore > 100) {
      warnings.push(`High complexity workload (score: ${workloadScore})`);
      suggestions.push('Consider simplifying assignments or reducing event type coverage');
    }

    // Check specialty alignment
    const specialtyConfig = TRACKER_SPECIALTIES[specialty];
    const alignedAssignments = trackerAssignments.filter(assignment =>
      assignment.assigned_event_types.some(event => 
        specialtyConfig.preferredEvents.includes(event)
      )
    );

    const alignmentRatio = alignedAssignments.length / trackerAssignments.length;
    if (alignmentRatio < 0.6 && specialty !== 'generalist') {
      warnings.push(`Low specialty alignment: ${Math.round(alignmentRatio * 100)}% of assignments match ${specialty} specialty`);
      suggestions.push(`Consider reassigning non-${specialty} tasks to more suitable specialists`);
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions
    };
  }

  /**
   * Calculates workload complexity score
   */
  private static calculateWorkloadScore(assignments: Assignment[]): number {
    return assignments.reduce((score, assignment) => {
      let assignmentScore = 0;

      // Base score by type
      switch (assignment.assignment_type) {
        case 'individual': assignmentScore = 10; break;
        case 'line': assignmentScore = 15; break;
        case 'video': assignmentScore = 25; break;
        case 'formation': assignmentScore = 20; break;
        case 'zone': assignmentScore = 12; break;
      }

      // Event type multiplier
      assignmentScore *= Math.max(1, assignment.assigned_event_types.length * 0.5);

      // Priority multiplier
      const priorityMultiplier = {
        low: 1,
        medium: 1.2,
        high: 1.5,
        critical: 2
      };
      assignmentScore *= priorityMultiplier[assignment.priority];

      return score + assignmentScore;
    }, 0);
  }

  /**
   * Validates assignment batch operations
   */
  static validateBatchOperation(
    assignments: Assignment[],
    operation: 'create' | 'update' | 'delete',
    existingAssignments: Assignment[],
    trackers: TrackerUser[]
  ): { isValid: boolean; errors: string[]; conflicts: AssignmentConflict[] } {
    const errors: string[] = [];
    const allConflicts: AssignmentConflict[] = [];

    // Validate each assignment individually
    assignments.forEach((assignment, index) => {
      const assignmentErrors = this.validateAssignment(assignment);
      if (assignmentErrors.length > 0) {
        errors.push(`Assignment ${index + 1}: ${assignmentErrors.join(', ')}`);
      }

      // Check for conflicts if creating
      if (operation === 'create') {
        const conflicts = this.detectConflicts(assignment, existingAssignments, trackers);
        allConflicts.push(...conflicts);
      }
    });

    // Check for conflicts within the batch
    if (operation === 'create') {
      for (let i = 0; i < assignments.length; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
          const conflicts = this.detectConflicts(assignments[i], [assignments[j]], trackers);
          if (conflicts.length > 0) {
            errors.push(`Internal batch conflict between assignments ${i + 1} and ${j + 1}`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0 && allConflicts.filter(c => c.severity === 'high').length === 0,
      errors,
      conflicts: allConflicts
    };
  }
}