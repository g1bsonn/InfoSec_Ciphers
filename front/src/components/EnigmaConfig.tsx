// src/components/EnigmaConfig.tsx
import React, { memo, useCallback } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { EnigmaConfigType } from '../types';

// Константы
const ROTOR_OPTIONS = ["I", "II", "III"];
const REFLECTOR_OPTIONS = ["B", "C"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface EnigmaConfigProps {
  config: EnigmaConfigType;
  setConfig: React.Dispatch<React.SetStateAction<EnigmaConfigType>>;
}

// Мемоизированные компоненты для каждого элемента
const RotorSelector = memo(({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void 
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {ROTOR_OPTIONS.map(rotor => (
        <SelectItem key={rotor} value={rotor}>{rotor}</SelectItem>
      ))}
    </SelectContent>
  </Select>
));

const RingInput = memo(({ 
  value, 
  onChange 
}: { 
  value: number; 
  onChange: (value: number) => void 
}) => (
  <Input 
    type="number" 
    min="0" 
    max="25"
    value={value}
    onChange={(e) => onChange(Number(e.target.value) > 25 ? 25 : Number(e.target.value) || 0)}
  />
));

const PositionSelector = memo(({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void 
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {ALPHABET.map(letter => (
        <SelectItem key={letter} value={letter}>{letter}</SelectItem>
      ))}
    </SelectContent>
  </Select>
));

const PlugboardPair = memo(({ 
  pair, 
  index,
  onChange,
  onRemove
}: { 
  pair: [string, string];
  index: number;
  onChange: (pairIndex: number, plugIndex: number, value: string) => void;
  onRemove: (index: number) => void;
}) => (
  <div className="flex items-center space-x-2">
    <Select
      value={pair[0]}
      onValueChange={(value) => onChange(index, 0, value)}
    >
      <SelectTrigger className="w-16">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ALPHABET.map(letter => (
          <SelectItem key={letter} value={letter}>{letter}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <span>↔</span>
    <Select
      value={pair[1]}
      onValueChange={(value) => onChange(index, 1, value)}
    >
      <SelectTrigger className="w-16">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ALPHABET.map(letter => (
          <SelectItem key={letter} value={letter}>{letter}</SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => onRemove(index)}
    >
      ×
    </Button>
  </div>
));

const EnigmaConfig = ({ config, setConfig }: EnigmaConfigProps) => {
  // Обработчики с мемоизацией
  const handleRotorChange = useCallback((index: number, value: string) => {
    setConfig(prev => {
      const newRotors = [...prev.rotors];
      newRotors[index] = value;
      return { ...prev, rotors: newRotors };
    });
  }, [setConfig]);

  const handleReflectorChange = useCallback((value: string) => {
    setConfig(prev => ({ ...prev, reflector: value }));
  }, [setConfig]);

  const handleRingChange = useCallback((index: number, value: number) => {
    setConfig(prev => {
      const newRings = [...prev.ring_settings];
      newRings[index] = value;
      return { ...prev, ring_settings: newRings };
    });
  }, [setConfig]);

  const handlePositionChange = useCallback((index: number, value: string) => {
    setConfig(prev => {
      const positions = [...prev.initial_positions.split("")];
      positions[index] = value;
      return { ...prev, initial_positions: positions.join("") };
    });
  }, [setConfig]);

  const handlePlugboardChange = useCallback((pairIndex: number, plugIndex: number, value: string) => {
    setConfig(prev => {
      const newPairs = [...prev.plugboard_pairs];
      if (!newPairs[pairIndex]) return prev;
      
      newPairs[pairIndex] = [...newPairs[pairIndex]];
      newPairs[pairIndex][plugIndex] = value;
      return { ...prev, plugboard_pairs: newPairs };
    });
  }, [setConfig]);

  const addPlugboardPair = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      plugboard_pairs: [...prev.plugboard_pairs, ["A", "B"]]
    }));
  }, [setConfig]);

  const removePlugboardPair = useCallback((index: number) => {
    setConfig(prev => ({
      ...prev,
      plugboard_pairs: prev.plugboard_pairs.filter((_, i) => i !== index)
    }));
  }, [setConfig]);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-bold">Enigma Configuration</h3>
      
      {/* Rotors Selection */}
      <div>
        <Label>Rotors (Left to Right)</Label>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => (
            <RotorSelector
              key={index}
              value={config.rotors[index]}
              onChange={(value) => handleRotorChange(index, value)}
            />
          ))}
        </div>
      </div>

      {/* Reflector */}
      <div>
        <Label>Reflector</Label>
        <Select 
          value={config.reflector} 
          onValueChange={handleReflectorChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REFLECTOR_OPTIONS.map(ref => (
              <SelectItem key={ref} value={ref}>{ref}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ring Settings */}
      <div>
        <Label>Ring Settings (0-25)</Label>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((index) => (
            <div key={index}>
              <RingInput 
                value={config.ring_settings[index]} 
                onChange={(value) => handleRingChange(index, value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Initial Positions */}
      <div>
        <Label>Initial Positions</Label>
        <div className="grid grid-cols-3 gap-2">
          {config.initial_positions.split("").map((pos, index) => (
            <PositionSelector
              key={index}
              value={pos}
              onChange={(value) => handlePositionChange(index, value)}
            />
          ))}
        </div>
      </div>

      {/* Plugboard Pairs */}
      <div>
        <Label>Plugboard Pairs (max 10)</Label>
        <div className="space-y-2">
          {config.plugboard_pairs.slice(0, 10).map((pair, index) => (
            <PlugboardPair
              key={index}
              pair={pair as [string, string]}
              index={index}
              onChange={handlePlugboardChange}
              onRemove={removePlugboardPair}
            />
          ))}
          
          {config.plugboard_pairs.length < 10 && (
            <Button variant="secondary" onClick={addPlugboardPair} size="sm">
              + Add Pair
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(EnigmaConfig);