import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../app/models/pokemon.interface';
import { ThemeService } from '../../app/services/theme.service';
import { TypeService } from '../../app/services/type.service';
import { TypeBadgeComponent } from '../shared/type-badge.component';
import { EvolutionChainComponent } from '../evolution-chain/evolution-chain.component';

@Component({
  selector: 'app-pokemon-detail',
  standalone: true,
  imports: [CommonModule, TypeBadgeComponent, EvolutionChainComponent],
  template: `
    <div class="bg-white/90 backdrop-blur rounded-3xl shadow-2xl overflow-hidden animate-fade-in relative">
      
      <button (click)="navigate(-1)" 
              class="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/60 backdrop-blur text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 border border-white/40">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button (click)="navigate(1)" 
              class="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/60 backdrop-blur text-gray-800 p-2 rounded-full shadow-lg transition-all hover:scale-110 border border-white/40">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div class="relative h-48 sm:h-64 flex items-center justify-center p-6" 
           [style.background]="getGradient()">
           <h1 class="absolute top-4 left-6 text-4xl sm:text-6xl font-black text-white/20 z-0 uppercase select-none">{{pokemon.name}}</h1>
           <span class="absolute top-6 right-6 text-2xl font-bold text-white/80">#{{pokemon.id | number:'3.0-0'}}</span>
           <img [src]="themeService.getSpriteUrl(pokemon)" 
                class="h-full w-auto object-contain relative z-10 drop-shadow-2xl filter hover:scale-110 transition-transform duration-500" 
                style="image-rendering: pixelated;">
      </div>

      <div class="p-6 sm:p-10">
        <div class="flex flex-col md:flex-row gap-10">
          <div class="flex-1 space-y-8">
            <div>
              <h2 class="text-3xl font-black capitalize text-gray-800 mb-2">{{pokemon.name}}</h2>
              <p class="text-gray-600 text-lg italic min-h-[3rem]">{{flavorText}}</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-xl text-center">
                <span class="text-gray-400 text-xs font-bold uppercase block mb-1">Height</span>
                <span class="text-xl font-medium text-gray-800">{{pokemon.height / 10}} m</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-xl text-center">
                <span class="text-gray-400 text-xs font-bold uppercase block mb-1">Weight</span>
                <span class="text-xl font-medium text-gray-800">{{pokemon.weight / 10}} kg</span>
              </div>
            </div>

            <div>
               <h3 class="text-sm font-bold text-gray-400 uppercase mb-3">Abilities</h3>
               <div class="flex gap-2 flex-wrap">
                 <span *ngFor="let a of pokemon.abilities" class="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 bg-white">
                   {{a.ability.name | titlecase}}
                   <span *ngIf="a.is_hidden" class="text-xs text-red-500 ml-1">(H)</span>
                 </span>
               </div>
            </div>

             <app-evolution-chain [chainUrl]="evolutionUrl" [currentId]="pokemon.id" (select)="selectEvolution.emit($event)"></app-evolution-chain>

            <div *ngIf="pokemon.cries?.latest">
               <button (click)="playCry(pokemon.cries!.latest)" class="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-bold text-sm">
                  <span>🔊 Play Cry</span>
               </button>
            </div>
          </div>

          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-800 mb-4">Base Stats</h3>
            <div class="space-y-3 mb-8">
              <div *ngFor="let stat of pokemon.stats">
                <div class="flex justify-between text-sm mb-1">
                  <span class="font-bold text-gray-500 uppercase tracking-wider text-xs">{{stat.stat.name | titlecase}}</span>
                  <span class="font-bold text-gray-800">{{stat.base_stat}}</span>
                </div>
                <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full" [style.width.%]="(stat.base_stat / 255) * 100" [style.backgroundColor]="getStatColor(stat.base_stat)"></div>
                </div>
              </div>
            </div>

            <div class="p-5 bg-gray-50 rounded-2xl border border-gray-100">
               <h3 class="text-sm font-bold text-gray-800 uppercase mb-3">Weaknesses & Resistances</h3>
               
               <div class="space-y-3">
                  <div *ngIf="effectiveness.weak4x.length" class="flex items-start gap-2">
                    <span class="text-xs font-bold text-red-600 w-16 mt-1">4x Weak:</span>
                    <div class="flex flex-wrap gap-1 flex-1">
                      <app-type-badge *ngFor="let t of effectiveness.weak4x" [type]="t"></app-type-badge>
                    </div>
                  </div>
                  
                  <div *ngIf="effectiveness.weak2x.length" class="flex items-start gap-2">
                    <span class="text-xs font-bold text-red-500 w-16 mt-1">2x Weak:</span>
                    <div class="flex flex-wrap gap-1 flex-1">
                      <app-type-badge *ngFor="let t of effectiveness.weak2x" [type]="t"></app-type-badge>
                    </div>
                  </div>

                  <div *ngIf="effectiveness.resistHalf.length" class="flex items-start gap-2">
                    <span class="text-xs font-bold text-green-600 w-16 mt-1">0.5x Res:</span>
                    <div class="flex flex-wrap gap-1 flex-1">
                      <app-type-badge *ngFor="let t of effectiveness.resistHalf" [type]="t"></app-type-badge>
                    </div>
                  </div>

                  <div *ngIf="effectiveness.immune.length" class="flex items-start gap-2">
                    <span class="text-xs font-bold text-gray-500 w-16 mt-1">Immune:</span>
                    <div class="flex flex-wrap gap-1 flex-1">
                      <app-type-badge *ngFor="let t of effectiveness.immune" [type]="t"></app-type-badge>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`]
})
export class PokemonDetailComponent implements OnChanges {
  @Input({required: true}) pokemon!: Pokemon;
  @Input() flavorText = '';
  @Input() evolutionUrl: string | null = null;
  
  @Output() navigateId = new EventEmitter<number>();
  @Output() selectEvolution = new EventEmitter<number>();

  themeService = inject(ThemeService);
  typeService = inject(TypeService);
  effectiveness: any = { weak4x: [], weak2x: [], resistHalf: [], resistQuarter: [], immune: [] };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['pokemon']) {
      const types = this.pokemon.types.map(t => t.type.name);
      this.effectiveness = this.typeService.calculateDefense(types);
    }
  }

  navigate(direction: number) {
    let newId = this.pokemon.id + direction;
    if (newId < 1) newId = 1025; 
    this.navigateId.emit(newId);
  }

  getGradient() {
    const c1 = this.typeService.getColor(this.pokemon.types[0].type.name);
    const c2 = this.pokemon.types[1] ? this.typeService.getColor(this.pokemon.types[1].type.name) : '#ffffff';
    return `linear-gradient(135deg, ${c1}dd 0%, ${c2}aa 100%)`;
  }

  getStatColor(val: number) {
    if (val < 50) return '#ef4444';
    if (val < 80) return '#eab308';
    if (val < 110) return '#22c55e';
    return '#06b6d4';
  }

  playCry(url: string) {
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.error(e));
  }
}