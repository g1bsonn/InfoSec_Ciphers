// src/components/JeffersonConfig.tsx
import React, { memo } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import type { JeffersonConfigType, ActionType } from '../types';

interface JeffersonConfigProps {
  config: JeffersonConfigType;
  setConfig: React.Dispatch<React.SetStateAction<JeffersonConfigType>>;
  action: ActionType;
}

const JeffersonConfig = memo(({ config, setConfig, action }: JeffersonConfigProps) => {
  const handleSliderChange = (field: 'num_disks' | 'key_row', value: number[]) => {
    setConfig(prev => ({
      ...prev,
      encrypt: { ...prev.encrypt, [field]: value[0] }
    }));
  };

  const handleInputChange = (field: 'num_disks' | 'key_row', value: number) => {
    setConfig(prev => ({
      ...prev,
      encrypt: { ...prev.encrypt, [field]: value }
    }));
  };

  const handleDecryptIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfig(prev => ({
      ...prev,
      decrypt: { ...prev.decrypt, decrypt_id: value ? parseInt(value) : null }
    }));
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-bold">Jefferson Configuration</h3>
      
      {action === "encrypt" ? (
        <>
          {/* Number of Disks */}
          <div>
            <Label>Number of Disks (10-50)</Label>
            <div className="flex items-center gap-4">
              <Slider 
                min={10}
                max={50}
                value={[config.encrypt.num_disks]}
                onValueChange={(value) => handleSliderChange("num_disks", value)}
                className="flex-1"
              />
              <Input 
                type="number"
                min={10}
                max={50}
                value={config.encrypt.num_disks}
                onChange={(e) => {
                  const value = Math.min(50, Math.max(10, parseInt(e.target.value) || 36));
                  handleInputChange("num_disks", value);
                }}
                className="w-20"
              />
            </div>
          </div>

          {/* Key Row */}
          <div>
            <Label>Key Row (0-25)</Label>
            <div className="flex items-center gap-4">
              <Slider 
                min={0}
                max={25}
                value={[config.encrypt.key_row]}
                onValueChange={(value) => handleSliderChange("key_row", value)}
                className="flex-1"
              />
              <Input 
                type="number"
                min={0}
                max={25}
                value={config.encrypt.key_row}
                onChange={(e) => {
                  const value = Math.min(25, Math.max(0, parseInt(e.target.value) || 5));
                  handleInputChange("key_row", value);
                }}
                className="w-20"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div>
            <Label>Decrypt ID</Label>
            <Input 
              type="number"
              value={config.decrypt.decrypt_id ?? ''}
              onChange={handleDecryptIdChange}
              placeholder="Enter ID from encryption"
            />
          </div>
          
          {config.history.length > 0 && (
            <div>
              <Label>Saved IDs</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {config.history.map((id, index) => (
                  <Button
                    key={index}
                    variant={config.decrypt.decrypt_id === id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      decrypt: { ...prev.decrypt, decrypt_id: id }
                    }))}
                  >
                    {id}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default JeffersonConfig;