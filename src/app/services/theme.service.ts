import { Injectable, signal } from '@angular/core';
import { Pokemon, ThemeColor, SpriteMode } from '../models/pokemon.interface';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  currentTheme = signal<ThemeColor>('classic');
  currentSpriteMode = signal<SpriteMode>('official');

  constructor() {
    const savedTheme = localStorage.getItem('poke_theme') as ThemeColor;
    if (savedTheme) this.currentTheme.set(savedTheme);
    const savedSprite = localStorage.getItem('poke_sprite') as SpriteMode;
    if (savedSprite) this.currentSpriteMode.set(savedSprite);
  }

  setTheme(theme: ThemeColor) {
    this.currentTheme.set(theme);
    localStorage.setItem('poke_theme', theme);
  }

  setSpriteMode(mode: SpriteMode) {
    this.currentSpriteMode.set(mode);
    localStorage.setItem('poke_sprite', mode);
  }

  getThemeClass() {
    const t = this.currentTheme();
    switch (t) {
      case 'dark': return 'bg-gray-900 text-gray-100';
      case 'gameboy': return 'bg-[#8bac0f] text-[#0f380f]';
      case 'water': return 'bg-blue-500 text-white';
      default: return 'bg-red-600 text-gray-900';
    }
  }

  getHeaderClass() {
    const t = this.currentTheme();
    if (t === 'classic') return 'bg-red-700 text-white border-red-800';
    if (t === 'dark') return 'bg-gray-800 text-white border-gray-700';
    if (t === 'gameboy') return 'bg-[#8bac0f] text-[#0f380f] border-[#306230]';
    if (t === 'water') return 'bg-blue-600 text-white border-blue-800';
    return 'bg-red-700 text-white';
  }

  /**
   * Gets a default sprite URL based only on the Pokemon ID and current mode.
   * This is used for simple lists and components that do not have the full Pokemon object, 
   * like the Evolution Chain, and it always defaults to the non-variant version.
   */
  getSpriteUrlById(id: number): string {
    const mode = this.currentSpriteMode();
    switch (mode) {
      case 'gen1': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/${id}.png`;
      case 'gen3': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${id}.png`;
      case 'gen4': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/platinum/${id}.png`;
      case 'gen5-anim': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
      case 'home': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
      default: // 'official' mode default
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    }
  }

  /**
   * Determines the final sprite URL based on the current mode, shiny status, and gender.
   * It maps the SpriteMode to the corresponding nested structure within the Pokemon object's 
   * sprites property to support variations across all generations/styles where available.
   * * @param pokemon The Pokemon data object.
   * @param isShiny Whether to fetch the shiny sprite (defaults to false).
   * @param gender The desired gender ('male' or 'female') (defaults to 'male').
   * @returns The constructed sprite URL.
   */
  getSpriteUrl(pokemon: Pokemon, isShiny: boolean = false, gender: 'male' | 'female' = 'male'): string {
    const mode = this.currentSpriteMode();
    const sprites = pokemon.sprites as any; // Cast for easier nested access

    // 1. Map the current SpriteMode to the corresponding sprite container object
    let spriteContainer: any;

    // Handle 'other' styles (Official and Home)
    if (mode === 'official') {
      spriteContainer = sprites.other['official-artwork'];
    } else if (mode === 'home') {
      spriteContainer = sprites.other.home;
    }
    // Handle 'version' styles (Generations)
    else if (mode === 'gen5-anim') {
      spriteContainer = sprites.versions['generation-v']['black-white'].animated;
    } else if (mode === 'gen4') {
      spriteContainer = sprites.versions['generation-iv'].platinum;
    } else if (mode === 'gen3') {
      spriteContainer = sprites.versions['generation-iii'].emerald;
    } else if (mode === 'gen1') {
      spriteContainer = sprites.versions['generation-i']['red-blue'];
    }

    // If the container is null or undefined for the specific mode, fall back to the reliable official artwork
    if (!spriteContainer) {
      spriteContainer = sprites.other['official-artwork'];
    }

    // 2. Determine the exact sprite key to use (prioritizing specific variant)
    let spriteKey: string;
    if (gender === 'female' && spriteContainer['front_female']) {
      // Only try female if the container has a 'front_female' key
      spriteKey = isShiny ? 'front_shiny_female' : 'front_female';
    } else {
      spriteKey = isShiny ? 'front_shiny' : 'front_default';
    }

    // 3. Try to get the specific sprite URL
    let spriteUrl = spriteContainer[spriteKey];

    // 4. Fallback logic: if the specific URL is null (e.g., shiny female is missing)
    if (!spriteUrl) {
      // Fall back to the non-gendered/default version of the same shiny state
      const fallbackKey = isShiny ? 'front_shiny' : 'front_default';
      spriteUrl = spriteContainer[fallbackKey];
    }

    // 5. Final safety check: if everything failed (no default, no shiny, no female)
    if (!spriteUrl) {
      // Fall back to the most reliable default: the official artwork front_default, which should always exist for a valid ID.
      const officialArt = sprites.other['official-artwork'];
      spriteUrl = officialArt?.front_default;
    }

    // 6. If still no URL, use a placeholder
    if (!spriteUrl) {
      return `https://placehold.co/96x96/cccccc/000000?text=%23${pokemon.id}`;
    }

    return spriteUrl;
  }
}