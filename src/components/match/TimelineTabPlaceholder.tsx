import React from 'react';
// Potentially import types for props, e.g., MatchEvent from '@/types'

/**
 * @interface TimelineTabPlaceholderProps
 * @description Props for the TimelineTabPlaceholder component. Currently empty as it's a placeholder.
 */
interface TimelineTabPlaceholderProps {
  // Example: Pass events data if available
  // events: MatchEvent[];
}

/**
 * @component TimelineTabPlaceholder
 * @description A placeholder component for the match timeline tab. It informs the user that this section will contain
 * a chronological timeline of match events and mentions the required permission.
 * @param {TimelineTabPlaceholderProps} props The props for the component.
 * @returns {JSX.Element} The rendered TimelineTabPlaceholder component.
 */
const TimelineTabPlaceholder: React.FC<TimelineTabPlaceholderProps> = (props) => {
  return (
    <div>
      <h3 className="text-lg font-semibold">Match Timeline</h3>
      <p className="text-sm text-muted-foreground">
        This area will display a chronological timeline of match events. (Requires 'timeline' permission).
      </p>
      {/* TODO: Display actual timeline based on props.events */}
    </div>
  );
};
export default TimelineTabPlaceholder;
