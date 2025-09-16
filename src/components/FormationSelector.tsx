
import React from 'react';
import { Formation } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

/**
 * @interface FormationSelectorProps
 * @description Props for the FormationSelector component.
 * @property {Formation} value - The currently selected formation.
 * @property {function(value: Formation): void} onChange - Callback function triggered when the selection changes.
 * @property {string} [label] - An optional label to display above the selector.
 */
interface FormationSelectorProps {
  value: Formation;
  onChange: (value: Formation) => void;
  label?: string;
}

/**
 * @component FormationSelector
 * @description A reusable dropdown component for selecting a football team formation.
 * It is a controlled component that receives its state via props.
 * @param {FormationSelectorProps} props - The props for the component.
 * @returns {React.FC} A React functional component.
 */
const FormationSelector: React.FC<FormationSelectorProps> = ({ value, onChange, label }) => {
  const formations: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1', '3-4-3'];
  
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select formation" />
        </SelectTrigger>
        <SelectContent>
          {formations.map((formation) => (
            <SelectItem key={formation} value={formation}>
              {formation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FormationSelector;
