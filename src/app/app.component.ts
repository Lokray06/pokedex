import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { Pokemon, NamedAPIResource, ThemeColor, SpriteMode } from './models/pokemon.interface';
import { ThemeService } from './services/theme.service';
import { PokemonDataService } from './services/pokemon-data.service';
import { TypeService } from './services/type.service';

import { PokemonCardComponent } from '../components/pokemon-card/pokemon-card.component';
import { PokemonDetailComponent } from '../components/pokemon-detail/pokemon-detail.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, PokemonCardComponent, PokemonDetailComponent],
  template: `
    <div [class]="themeService.getThemeClass()" class="min-h-screen transition-colors duration-300 font-sans">
      
      <header class="sticky top-0 z-50 shadow-lg border-b-4 transition-colors duration-300"
              [ngClass]="themeService.getHeaderClass()">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3 cursor-pointer group" (click)="goHome()">
            <div class="w-8 h-8 relative animate-spin-slow group-hover:animate-spin">
               <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-md">
                 <circle cx="50" cy="50" r="45" fill="white" stroke="currentColor" stroke-width="5"/>
                 <path d="M 5,50 A 45,45 0 0,1 95,50" fill="currentColor" opacity="0.5"/>
                 <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" stroke-width="5"/>
                 <circle cx="50" cy="50" r="15" fill="white" stroke="currentColor" stroke-width="5"/>
                 <circle cx="50" cy="50" r="5" fill="currentColor"/>
               </svg>
            </div>
            <h1 class="text-2xl font-black tracking-tighter uppercase hidden sm:block">
              Pokedex
            </h1>
          </div>

          <div class="flex items-center gap-3">
             <div class="relative">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (input)="onSearchInput()"
                (focus)="showSearchResults = true"
                placeholder="Search (Gen 1-9)..."
                class="pl-9 pr-4 py-1.5 rounded-full bg-white/20 border border-white/30 text-inherit placeholder-current/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm w-32 focus:w-64 transition-all"
              >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              
              <div *ngIf="showSearchResults && searchResults.length > 0" 
                   class="absolute top-full mt-2 left-0 w-64 max-h-80 overflow-y-auto bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-50">
                 <div *ngFor="let res of searchResults" 
                      (click)="selectGlobalSearch(res)"
                      class="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize text-sm flex justify-between items-center border-b border-gray-50 last:border-0">
                    <span>{{res.name}}</span>
                    <span class="text-xs text-gray-400">Go</span>
                 </div>
              </div>
            </div>

            <button *ngIf="compareList.length > 0" 
                    (click)="viewState = 'compare'"
                    class="relative p-2 rounded-full hover:bg-white/20 transition-colors"
                    title="Compare Pokemon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span class="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-1.5 rounded-full shadow-sm">
                {{compareList.length}}
              </span>
            </button>

            <button (click)="showSettings = !showSettings" class="p-2 rounded-full hover:bg-white/20 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div *ngIf="showSettings" class="bg-white/95 backdrop-blur text-gray-800 border-b border-gray-200 p-4 animate-slide-down shadow-inner">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <h3 class="font-bold text-sm uppercase tracking-wider text-gray-500 mb-3">Visual Theme</h3>
               <div class="flex gap-2 flex-wrap">
                 <button *ngFor="let t of themes" (click)="themeService.setTheme(t.id)" [class.ring-2]="themeService.currentTheme() === t.id" class="px-4 py-2 rounded-lg text-sm font-medium transition-all text-white shadow-sm" [ngClass]="t.bgClass">{{t.name}}</button>
               </div>
             </div>
             <div>
               <h3 class="font-bold text-sm uppercase tracking-wider text-gray-500 mb-3">Sprite Style</h3>
               <div class="flex gap-2 flex-wrap">
                 <button *ngFor="let s of spriteModes" (click)="themeService.setSpriteMode(s.id)" [class.ring-2]="themeService.currentSpriteMode() === s.id" class="px-3 py-2 rounded border border-gray-200 text-xs font-semibold hover:bg-gray-50">{{s.name}}</button>
               </div>
             </div>
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]" (click)="showSearchResults = false">
        
        <div *ngIf="loading" class="flex flex-col items-center justify-center h-64">
           <div class="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin opacity-50"></div>
           <p class="mt-4 font-medium">Loading Data...</p>
        </div>

        <ng-container *ngIf="viewState === 'list' && !loading">
           <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
             <app-pokemon-card *ngFor="let mon of visiblePokemon" 
                               [pokemon]="mon" 
                               [isComparing]="isInCompare(mon.id)"
                               (select)="selectPokemon($event)"
                               (toggleCompare)="toggleCompare($event)">
             </app-pokemon-card>
           </div>
           
           <div class="mt-10 flex justify-center" *ngIf="nextUrl">
             <button (click)="loadMore()" [disabled]="loadingMore" class="px-8 py-3 bg-white/20 border-2 border-current rounded-full font-bold hover:bg-white/30 disabled:opacity-50 transition-all">
               {{ loadingMore ? 'Loading...' : 'Load More Pokemon' }}
             </button>
           </div>
        </ng-container>

        <div *ngIf="viewState === 'detail' && selectedPokemon">
          <button (click)="viewState = 'list'" class="mb-6 flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all font-medium w-fit">
            <span>← Back to Pokedex</span>
          </button>
          
          <app-pokemon-detail 
              [pokemon]="selectedPokemon" 
              [flavorText]="selectedFlavorText"
              [evolutionUrl]="selectedEvolutionUrl"
              (navigateId)="navigatePokemon($event)"
              (selectEvolution)="navigatePokemon($event)">
          </app-pokemon-detail>
        </div>

        <div *ngIf="viewState === 'compare'" class="animate-fade-in">
           <button (click)="viewState = 'list'" class="mb-6 flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all font-medium w-fit">
            <span>← Back to List</span>
          </button>

          <div class="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Comparison Arena</h2>
            
            <div *ngIf="compareList.length < 2" class="text-center py-10 text-gray-500">
              <p>Select at least 2 Pokemon from the list to compare them.</p>
            </div>

            <div *ngIf="compareList.length >= 1" class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div *ngFor="let mon of compareList" class="relative">
                 <button (click)="toggleCompare(mon)" class="absolute top-0 right-0 text-red-400 hover:text-red-600">
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                 <div class="flex flex-col items-center mb-6">
                    <img [src]="themeService.getSpriteUrl(mon)" class="h-32 w-32 object-contain" style="image-rendering: pixelated">
                    <h3 class="text-xl font-bold capitalize mt-2">{{mon.name}}</h3>
                 </div>
                 <div class="space-y-3">
                    <div *ngFor="let stat of mon.stats">
                      <div class="flex justify-between text-xs mb-1">
                        <span class="font-bold text-gray-500 uppercase">{{stat.stat.name}}</span>
                        <span class="font-bold">{{stat.base_stat}}</span>
                      </div>
                      <div class="h-2 bg-gray-200 rounded-full">
                         <div class="h-full rounded-full" [style.width.%]="(stat.base_stat / 255) * 100" [style.backgroundColor]="themeService.getSpriteUrl(mon).includes('shiny') ? 'gold' : '#06b6d4'"></div>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .animate-spin-slow { animation: spin 8s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animate-slide-down { animation: slideDown 0.2s ease-out forwards; transform-origin: top; }
    @keyframes slideDown { from { opacity: 0; transform: scaleY(0.9); } to { opacity: 1; transform: scaleY(1); } }
    /* Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
  `]
})
export class App implements OnInit {
  themeService = inject(ThemeService);
  dataService = inject(PokemonDataService);
  typeService = inject(TypeService);

  viewState: 'list' | 'detail' | 'compare' = 'list';
  visiblePokemon: Pokemon[] = [];
  compareList: Pokemon[] = [];
  
  selectedPokemon: Pokemon | null = null;
  selectedFlavorText = 'Loading...';
  selectedEvolutionUrl: string | null = null;
  
  loading = true;
  loadingMore = false;
  nextUrl: string | null = 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=50';

  searchQuery = '';
  searchResults: NamedAPIResource[] = [];
  showSearchResults = false;
  showSettings = false;

  themes: {id: ThemeColor, name: string, bgClass: string}[] = [
    { id: 'classic', name: 'Pokedex Red', bgClass: 'bg-red-600' },
    { id: 'dark', name: 'Dark Mode', bgClass: 'bg-gray-900' },
    { id: 'gameboy', name: 'GameBoy', bgClass: 'bg-green-800' },
    { id: 'water', name: 'Ocean Blue', bgClass: 'bg-blue-500' }
  ];

  spriteModes: {id: SpriteMode, name: string}[] = [
    { id: 'official', name: 'Modern Art' },
    { id: 'gen1', name: 'Gen 1 (Pixel)' },
    { id: 'gen3', name: 'Gen 3 (GBA)' },
    { id: 'gen5-anim', name: 'Gen 5 (Anim)' },
    { id: 'home', name: '3D Home' }
  ];

  ngOnInit() {
    this.loadPage(this.nextUrl!);
  }

  loadPage(url: string) {
    this.dataService.fetchList(url).subscribe({
      next: (data) => {
        this.visiblePokemon = [...this.visiblePokemon, ...data.pokemons];
        this.nextUrl = data.next;
        this.loading = false;
        this.loadingMore = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  loadMore() {
    if (this.nextUrl && !this.loadingMore) {
      this.loadingMore = true;
      this.loadPage(this.nextUrl);
    }
  }

  onSearchInput() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.searchResults = [];
      return;
    }
    this.searchResults = this.dataService.allPokemonCache()
      .filter(p => p.name.includes(q))
      .slice(0, 10);
  }

  selectGlobalSearch(res: NamedAPIResource) {
    this.searchQuery = '';
    this.showSearchResults = false;
    this.loading = true;
    this.viewState = 'detail';
    this.fetchAndSelect(res.name);
  }

  selectPokemon(pokemon: Pokemon) {
    this.selectedPokemon = pokemon;
    this.viewState = 'detail';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.loadDetails(pokemon.id);
  }

  navigatePokemon(id: number) {
    this.loading = true;
    this.fetchAndSelect(id);
  }

  fetchAndSelect(idOrName: number | string) {
    this.dataService.fetchPokemonDetails(idOrName).subscribe({
      next: (pokemon) => {
        this.selectedPokemon = pokemon;
        this.viewState = 'detail';
        this.loading = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.loadDetails(pokemon.id);
      },
      error: () => this.loading = false
    });
  }

  loadDetails(id: number) {
    this.selectedFlavorText = 'Loading...';
    this.selectedEvolutionUrl = null;

    this.dataService.fetchSpecies(id).subscribe(species => {
      const entry = species.flavor_text_entries.find(e => e.language.name === 'en');
      this.selectedFlavorText = entry ? entry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
      this.selectedEvolutionUrl = species.evolution_chain.url;
    });
  }

  toggleCompare(pokemon: Pokemon) {
    if (this.isInCompare(pokemon.id)) {
      this.compareList = this.compareList.filter(p => p.id !== pokemon.id);
    } else {
      if (this.compareList.length >= 2) {
        this.compareList = [this.compareList[1], pokemon];
      } else {
        this.compareList.push(pokemon);
      }
    }
  }

  isInCompare(id: number) {
    return this.compareList.some(p => p.id === id);
  }

  goHome() {
    this.viewState = 'list';
    this.searchQuery = '';
  }
}