// src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnigmaConfig from './components/EnigmaConfig';
import JeffersonConfig from './components/JeffersonConfig';
import type { EnigmaConfigType, JeffersonConfigType, CipherType, ActionType } from './types';

const DEFAULT_ENIGMA_CONFIG: EnigmaConfigType = {
  rotors: ["III", "II", "I"],
  reflector: "B",
  ring_settings: [0, 0, 0],
  initial_positions: "AAA",
  plugboard_pairs: [["A", "B"], ["C", "D"]]
};

// Исправленная конфигурация по умолчанию для Джефферсона
const DEFAULT_JEFFERSON_CONFIG: JeffersonConfigType = {
  encrypt: {
    num_disks: 36,
    key_row: 5
  },
  decrypt: {
    decrypt_id: null
  },
  history: []
};

function App() {
  const [cipher, setCipher] = useState<CipherType>("enigma");
  const [input, setInput] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [action, setAction] = useState<ActionType>("encrypt");
  const [loading, setLoading] = useState<boolean>(false);
  const [useConfigFromDB, setUseConfigFromDB] = useState<boolean>(false);
  const [enigmaConfig, setEnigmaConfig] = useState<EnigmaConfigType>(DEFAULT_ENIGMA_CONFIG);
  
  // Исправленная инициализация состояния
  const [jeffersonConfig, setJeffersonConfig] = useState<JeffersonConfigType>(DEFAULT_JEFFERSON_CONFIG);
  
  const [savedConfigs, setSavedConfigs] = useState<string[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string>("");

  // Загрузка списка конфигураций для Энигмы
  const loadConfigs = useCallback(async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/configs');
      if (!response.ok) throw new Error('Failed to load configs');
      const configs: string[] = await response.json();
      setSavedConfigs(configs);
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  }, []);

  // Загрузка конкретной конфигурации (только для Энигмы)
  const loadSpecificConfig = useCallback(async (configName: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/configs/${configName}`);
      if (!response.ok) throw new Error('Config not found');
      const configData: EnigmaConfigType = await response.json();
      setEnigmaConfig(configData);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }, []);

  // Сохранение конфигурации (только для Энигмы)
  const saveConfig = useCallback(async () => {
    const configName = prompt("Enter configuration name:");
    if (!configName) return;
    
    try {
      const newConfig = {...enigmaConfig, name: configName}
      const response = await fetch(`http://127.0.0.1:8000/configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      
      if (!response.ok) throw new Error('Failed to save config');
      alert('Configuration saved successfully!');
      setSavedConfigs(prev => [...prev, configName])
    } catch (error) {
      console.error('Error saving config:', error);
      alert(`Error: ${(error as Error).message}`);
    }
  }, [enigmaConfig]);

  // Обработчик отправки формы
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    
    try {
      let endpoint: string;
      let body: any;
      
      if (cipher === "enigma") {
        if (useConfigFromDB && selectedConfig) {
          endpoint = `http://127.0.0.1:8000/ciphers/enigma/encrypt/from_db`;
          body = {
            config_name: selectedConfig,
            text: input
          };
        } else {
          endpoint = `http://127.0.0.1:8000/ciphers/enigma/encrypt`;
          body = { ...enigmaConfig, text: input };
        }
      } else {
        if (action === "encrypt") {
          endpoint = `http://127.0.0.1:8000/ciphers/jefferson/encrypt`;
          body = {
            num_disks: jeffersonConfig.encrypt.num_disks,
            key_row: jeffersonConfig.encrypt.key_row,
            text: input
          };
        } else {
          endpoint = `http://127.0.0.1:8000/ciphers/jefferson/decrypt`;
          body = {
            text: input,
            decrypt_id: jeffersonConfig.decrypt.decrypt_id
          };
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        // Обработка ошибок для Джефферсона
        if (cipher === "jefferson" && action === "decrypt") {
          const errorData = await response.json();
          throw new Error(errorData.detail?.[0]?.msg || "Decryption failed");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Обработка разных форматов ответов
      if (cipher === "enigma") {
        setOutput(data.encrypted_text);
      } else {
        if (action === "encrypt") {
          setOutput(data.encrypted_text);
          // Сохраняем encrypt_id для последующего дешифрования
          setJeffersonConfig(prev => ({
            ...prev,
            history: [...prev.history, data.encrypt_id],
            decrypt: { ...prev.decrypt, decrypt_id: data.encrypt_id }
          }));
        } else {
          setOutput(data.decrypted_text);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setOutput(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [
    cipher, 
    action, 
    input, 
    enigmaConfig, 
    jeffersonConfig, 
    useConfigFromDB, 
    selectedConfig
  ]);

  // При переключении на дешифрование Джефферсона, используем последний encrypt_id
  useEffect(() => {
    if (cipher === "jefferson" && action === "decrypt" && 
        jeffersonConfig.decrypt.decrypt_id === null && 
        jeffersonConfig.history.length > 0) {
      setJeffersonConfig(prev => ({
        ...prev,
        decrypt: { ...prev.decrypt, decrypt_id: prev.history[prev.history.length - 1] }
      }));
    }
  }, [cipher, action, jeffersonConfig]);

  // Загрузка конфигураций при монтировании
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-3xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Cipher App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cipher Type</Label>
                <Select 
                  value={cipher} 
                  onValueChange={(value: CipherType) => setCipher(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enigma">Enigma</SelectItem>
                    <SelectItem value="jefferson">Jefferson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {cipher === "jefferson" && <div>
                <Label>Action</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={action === "encrypt" ? "default" : "outline"}
                    onClick={() => setAction("encrypt")}
                    className="flex-1"
                  >
                    Encrypt
                  </Button>
                  <Button 
                    type="button"
                    variant={action === "decrypt" ? "default" : "outline"}
                    onClick={() => setAction("decrypt")}
                    className="flex-1"
                  >
                    Decrypt
                  </Button>
                </div>
              </div>}
            </div>

            {/* Управление конфигурациями (только для Энигмы) */}
            {cipher === "enigma" && (
              <div className="space-y-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Saved Configurations</Label>
                    <Select 
                      value={selectedConfig} 
                      onValueChange={setSelectedConfig}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a saved config" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedConfigs.map(config => (
                          <SelectItem key={config} value={config}>{config}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    variant="secondary"
                    onClick={() => selectedConfig && loadSpecificConfig(selectedConfig)}
                    disabled={!selectedConfig}
                  >
                    Load
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={saveConfig}
                  >
                    Save
                  </Button>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    id="use-db-config" 
                    checked={useConfigFromDB} 
                    onCheckedChange={setUseConfigFromDB} 
                  />
                  <Label htmlFor="use-db-config">Use saved configuration</Label>
                </div>
                
                {!useConfigFromDB && (
                  <EnigmaConfig 
                    config={enigmaConfig} 
                    setConfig={setEnigmaConfig} 
                  />
                )}
              </div>
            )}
            
            {cipher === "jefferson" && (
              <JeffersonConfig 
                config={jeffersonConfig} 
                setConfig={setJeffersonConfig}
                action={action}
              />
            )}

            <div>
              <Label htmlFor="input">Input Text</Label>
              <Input 
                id="input"
                value={input} 
                onChange={(e) => {
                  setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''));
                }}
                placeholder="Enter text to process"
                className="mt-1"
              />
            </div>

            <Button 
              className="w-full"
              disabled={loading || !input.trim()}
              onClick={handleSubmit}
            >
              {loading ? "Processing..." : `${cipher === "enigma" ? "Encrypt / Decrypt" : action === 'encrypt' ? "Encrypt" : "Decrypt"} with ${cipher}`}
            </Button>

            <div>
              <Label htmlFor="output">Result</Label>
              <Input 
                id="output"
                value={output} 
                readOnly 
                className="mt-1 font-mono bg-gray-50"
              />
            </div>

            {/* Отображение encrypt_id для Джефферсона после шифрования */}
            {cipher === "jefferson" && action === "encrypt" && jeffersonConfig.decrypt.decrypt_id !== null && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Encrypt ID:</span> {jeffersonConfig.decrypt.decrypt_id}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Save this ID for decryption
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;