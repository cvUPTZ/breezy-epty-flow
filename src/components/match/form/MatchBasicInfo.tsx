
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputValidator } from '@/utils/inputValidation';

type MatchStatus = 'draft' | 'scheduled' | 'live' | 'completed';

interface MatchBasicInfoProps {
  formData: {
    name: string;
    description: string;
    homeTeamName: string;
    awayTeamName: string;
    matchDate: string;
    location: string;
    competition: string;
    matchType: string;
    status: MatchStatus;
    notes: string;
  };
  onFormDataChange: (field: string, value: string) => void;
}

const MatchBasicInfo: React.FC<MatchBasicInfoProps> = ({ formData, onFormDataChange }) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input
    const sanitizedValue = InputValidator.sanitizeString(value);
    
    // Validate specific fields
    let error = '';
    if (field === 'homeTeamName' || field === 'awayTeamName') {
      const validation = InputValidator.validateTeamName(sanitizedValue);
      if (!validation.isValid) {
        error = validation.error || '';
      }
    } else if (field === 'name' && sanitizedValue) {
      const validation = InputValidator.validateMatchName(sanitizedValue);
      if (!validation.isValid) {
        error = validation.error || '';
      }
    }

    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));

    // Pass sanitized value to parent
    onFormDataChange(field, sanitizedValue);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="match-name">Match Name (Optional)</Label>
            <Input
              id="match-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Will be auto-generated if empty"
            />
            {validationErrors.name && (
              <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="match-date">Match Date</Label>
            <Input
              id="match-date"
              type="datetime-local"
              value={formData.matchDate}
              onChange={(e) => onFormDataChange('matchDate', e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="home-team-name">Home Team Name</Label>
            <Input
              id="home-team-name"
              value={formData.homeTeamName}
              onChange={(e) => handleInputChange('homeTeamName', e.target.value)}
              placeholder="Enter home team name"
              required
            />
            {validationErrors.homeTeamName && (
              <p className="text-sm text-destructive mt-1">{validationErrors.homeTeamName}</p>
            )}
          </div>
          <div>
            <Label htmlFor="away-team-name">Away Team Name</Label>
            <Input
              id="away-team-name"
              value={formData.awayTeamName}
              onChange={(e) => handleInputChange('awayTeamName', e.target.value)}
              placeholder="Enter away team name"
              required
            />
            {validationErrors.awayTeamName && (
              <p className="text-sm text-destructive mt-1">{validationErrors.awayTeamName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => onFormDataChange('location', e.target.value)}
              placeholder="Stadium or venue"
            />
          </div>
          <div>
            <Label htmlFor="competition">Competition</Label>
            <Input
              id="competition"
              value={formData.competition}
              onChange={(e) => onFormDataChange('competition', e.target.value)}
              placeholder="League, cup, etc."
            />
          </div>
          <div>
            <Label htmlFor="match-type">Match Type</Label>
            <Select value={formData.matchType} onValueChange={(value) => onFormDataChange('matchType', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="cup">Cup</SelectItem>
                <SelectItem value="playoff">Playoff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onFormDataChange('description', e.target.value)}
            placeholder="Additional match details"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value: MatchStatus) => onFormDataChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => onFormDataChange('notes', e.target.value)}
            placeholder="Internal notes"
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchBasicInfo;
