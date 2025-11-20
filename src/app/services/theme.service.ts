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

  getSpriteUrlRaw(id: number): string {
    const mode = this.currentSpriteMode();
    switch (mode) {
      case 'gen1': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/transparent/${id}.png`;
      case 'gen3': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iii/emerald/${id}.png`;
      case 'gen5-anim': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
      case 'home': return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
      default: return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    }
  }

  getSpriteUrl(pokemon: Pokemon): string {
    return this.getSpriteUrlRaw(pokemon.id);
  }
}