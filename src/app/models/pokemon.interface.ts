// ==========================================================================
// FILE: src/app/models/pokemon.interface.ts
// ==========================================================================

export interface NamedAPIResource {
  name: string;
  url: string;
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { slot: number; type: NamedAPIResource }[];
  stats: { base_stat: number; stat: NamedAPIResource }[];
  abilities: { ability: NamedAPIResource; is_hidden: boolean }[];
  sprites: any;
  cries?: { latest: string; legacy: string };
}

export interface PokemonSpecies {
  id: number;
  flavor_text_entries: { flavor_text: string; language: NamedAPIResource }[];
  evolution_chain: { url: string };
}

export interface EvolutionChainResponse {
  chain: EvolutionNode;
}

export interface EvolutionNode {
  species: NamedAPIResource;
  evolves_to: EvolutionNode[];
  evolution_details: any[];
}

// Flattened structure for display
export interface EvolutionStep {
  name: string;
  id: number;
  min_level?: number;
  trigger?: string;
  item?: string;
}

export type ThemeColor = 'classic' | 'dark' | 'gameboy' | 'water';
export type SpriteMode = 'official' | 'gen1' | 'gen3' | 'gen4' | 'gen5-anim' | 'home';
