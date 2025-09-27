// components/tracker-assignment/EventTypeSelector.tsx
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight } from 'lucide-react';
import { FootballAction } from '@/types/tracking-taxonomy';

interface EventTypeSelectorProps {
  selectedEventTypes: FootballAction[];
  onEventTypeToggle: (eventType: FootballAction) => void;
}

// Helper to create the categorized data structure from the enum
const createCategorizedActions = () => {
  const categories: Record<string, { key: string; label: string; color: string; description: string; events: { key: FootballAction, label: string }[] }> = {
    GOALKEEPER: { key: 'GOALKEEPER', label: 'Goalkeeper', color: '#f59e0b', description: 'Actions performed by the goalkeeper.', events: [] },
    DEFENSIVE: { key: 'DEFENSIVE', label: 'Defensive', color: '#3b82f6', description: 'Actions to win back the ball and prevent goals.', events: [] },
    MIDFIELD: { key: 'MIDFIELD', label: 'Midfield', color: '#22c55e', description: 'Actions related to possession, transition, and playmaking.', events: [] },
    OFFENSIVE: { key: 'OFFENSIVE', label: 'Offensive', color: '#ef4444', description: 'Actions focused on creating scoring chances and shooting.', events: [] },
    GAME_EVENT: { key: 'GAME_EVENT', label: 'Game Events', color: '#64748b', description: 'General game occurrences and set pieces.', events: [] },
  };

  for (const [key, value] of Object.entries(FootballAction)) {
    const action = { key: key as FootballAction, label: value };
    if (key.startsWith('GK_')) {
      categories.GOALKEEPER.events.push(action);
    } else if (key.startsWith('DEF_')) {
      categories.DEFENSIVE.events.push(action);
    } else if (key.startsWith('MID_')) {
      categories.MIDFIELD.events.push(action);
    } else if (key.startsWith('ATT_')) {
      categories.OFFENSIVE.events.push(action);
    } else if (key.startsWith('EVENT_')) {
      categories.GAME_EVENT.events.push(action);
    }
  }
  return Object.values(categories);
};

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  selectedEventTypes,
  onEventTypeToggle,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const categorizedActions = useMemo(() => createCategorizedActions(), []);

  const toggleCategory = (categoryKey: string) => {
    const newSet = new Set(expandedCategories);
    if (newSet.has(categoryKey)) {
      newSet.delete(categoryKey);
    } else {
      newSet.add(categoryKey);
    }
    setExpandedCategories(newSet);
  };

  const handleCategorySelect = (categoryKey: string, selected: boolean) => {
    const category = categorizedActions.find(cat => cat.key === categoryKey);
    if (!category) return;

    const eventKeys = category.events.map(e => e.key);
    eventKeys.forEach(eventKey => {
      const isCurrentlySelected = selectedEventTypes.includes(eventKey);
      if (selected && !isCurrentlySelected) {
        onEventTypeToggle(eventKey);
      } else if (!selected && isCurrentlySelected) {
        onEventTypeToggle(eventKey);
      }
    });
  };

  return (
    <div className="space-y-3">
      {categorizedActions.map(category => {
        const allSelected = category.events.every(e => selectedEventTypes.includes(e.key));
        const someSelected = category.events.some(e => selectedEventTypes.includes(e.key));
        
        return (
          <div key={category.key} className="border rounded-lg">
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" 
              onClick={() => toggleCategory(category.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleCategory(category.key);
                }
              }}
              aria-expanded={expandedCategories.has(category.key)}
              aria-label={`Toggle ${category.label} category`}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={allSelected}
                  // `indeterminate` is not a valid prop for the shadcn Checkbox, but the logic is sound.
                  // This visual feature might be omitted, but the functionality remains.
                  onCheckedChange={(checked) => {
                    handleCategorySelect(category.key, !!checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select all ${category.label} events`}
                />
                <Badge style={{ backgroundColor: category.color }} className="text-white">
                  {category.label}
                </Badge>
                <span className="text-sm text-gray-600">({category.events.length})</span>
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${
                expandedCategories.has(category.key) ? 'rotate-90' : ''
              }`} />
            </div>
            
            {expandedCategories.has(category.key) && (
              <div className="px-3 pb-3">
                <p className="text-xs text-gray-500 mb-2">{category.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.events.map(event => (
                    <div
                      key={event.key}
                      className={`p-2 border rounded cursor-pointer text-center text-xs transition-colors flex items-center gap-1 ${
                        selectedEventTypes.includes(event.key)
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => onEventTypeToggle(event.key)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onEventTypeToggle(event.key);
                        }
                      }}
                      aria-label={`Toggle ${event.label} event type`}
                      aria-pressed={selectedEventTypes.includes(event.key)}
                    >
                      <span className="flex-1">{event.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};