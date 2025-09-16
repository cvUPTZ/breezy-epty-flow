
import React from 'react';
import { useSpecializedAssignments } from './hooks/useSpecializedAssignments';
import SpecializedAssignmentForm from './components/SpecializedAssignmentForm';
import AssignmentMatrix from './components/AssignmentMatrix';

/**
 * @interface SpecializedTrackerAssignmentProps
 * @description Props for the SpecializedTrackerAssignment component.
 * @property {string} matchId - The ID of the match for which to manage assignments.
 * @property {any[]} homeTeamPlayers - The roster of players for the home team.
 * @property {any[]} awayTeamPlayers - The roster of players for the away team.
 */
interface SpecializedTrackerAssignmentProps {
  matchId: string;
  homeTeamPlayers: any[];
  awayTeamPlayers: any[];
}

/**
 * @component SpecializedTrackerAssignment
 * @description A container component that orchestrates the UI for managing specialized tracker assignments.
 * It uses the `useSpecializedAssignments` hook to manage state and logic, and composes the
 * `SpecializedAssignmentForm` and `AssignmentMatrix` components to provide the full interface.
 * @param {SpecializedTrackerAssignmentProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const SpecializedTrackerAssignment: React.FC<SpecializedTrackerAssignmentProps> = ({
  matchId,
  homeTeamPlayers,
  awayTeamPlayers
}) => {
  const {
    trackerUsers,
    assignments,
    loading,
    createAssignment,
    deleteAssignment
  } = useSpecializedAssignments(matchId);

  return (
    <div className="space-y-6">
      <SpecializedAssignmentForm
        trackerUsers={trackerUsers}
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        assignments={assignments}
        loading={loading}
        onCreateAssignment={createAssignment}
      />
      
      <AssignmentMatrix
        homeTeamPlayers={homeTeamPlayers}
        awayTeamPlayers={awayTeamPlayers}
        assignments={assignments}
        onDeleteAssignment={deleteAssignment}
      />
    </div>
  );
};

export default SpecializedTrackerAssignment;
