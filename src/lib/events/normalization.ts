export const normalizeEventType = (eventType: string): string => {
  if (!eventType) return 'unknown';
  // Normalize to lowercase and handle common variations
  const trimmed = eventType.toLowerCase().trim();
  switch (trimmed) {
    case 'free-kick':
      return 'freekick';
    case 'yellowcard':
    case 'yellow card':
      return 'card';
    case 'redcard':
    case 'red card':
      return 'redcard';
    case 'sub':
      return 'substitution';
    default:
      return trimmed;
  }
};
