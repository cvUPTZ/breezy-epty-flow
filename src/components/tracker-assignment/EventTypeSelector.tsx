
// components/tracker-assignment/EventTypeSelector.tsx
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight } from 'lucide-react';
import { EVENT_TYPE_CATEGORIES, type EventType } from '@/types/eventTypes';

interface EventTypeSelectorProps {
  selectedEventTypes: EventType[];
  onEventTypeToggle: (eventType: EventType) => void;
  onCategoryToggle?: (categoryKey: string, selected: boolean) => void;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  selectedEventTypes,
  onEventTypeToggle,
  onCategoryToggle
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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
    const category = EVENT_TYPE_CATEGORIES.find(cat => cat.key === categoryKey);
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
      {EVENT_TYPE_CATEGORIES.map(category => {
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
                  onCheckedChange={(checked) => {
                    handleCategorySelect(category.key, !!checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select all ${category.label} events`}
                  className={someSelected && !allSelected ? 'opacity-50' : ''}
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
                      <span className="text-lg">{event.icon}</span>
                      <span className="flex-1">{event.label}</span>
                      {event.keyboardShortcut && (
                        <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">
                          {event.keyboardShortcut}
                        </kbd>
                      )}
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
