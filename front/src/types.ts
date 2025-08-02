// src/types.ts
export interface EnigmaConfigType {
  rotors: string[];
  reflector: string;
  ring_settings: number[];
  initial_positions: string;
  plugboard_pairs: string[][];
}

export interface JeffersonEncryptConfig {
  num_disks: number;
  key_row: number;
}

export interface JeffersonDecryptConfig {
  decrypt_id: number | null;
}

export type CipherType = "enigma" | "jefferson";
export type ActionType = "encrypt" | "decrypt";

export type JeffersonConfigType = {
  encrypt: JeffersonEncryptConfig;
  decrypt: JeffersonDecryptConfig;
  history: number[]; // История всех encrypt_id
};