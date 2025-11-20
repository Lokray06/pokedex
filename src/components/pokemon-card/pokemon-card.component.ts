import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../app/models/pokemon.interface';
import { ThemeService } from '../../app/services/theme.service';
import { TypeBadgeComponent } from '../shared/type-badge.component';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule, TypeBadgeComponent],
  template: `
    <div class="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-white/40 overflow-hidden h-full"
         (click)="select.emit(pokemon)">
      <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 opacity-50 z-0 group-hover:scale-150 transition-transform duration-500"></div>
      <span class="absolute top-3 left-4 text-xs font-black text-gray-300 z-10">#{{pokemon.id | number:'3.0-0'}}</span>
      <button (click)="$event.stopPropagation(); toggleCompare.emit(pokemon)" 
              class="absolute top-2 right-2 z-20 p-1.5 rounded-full hover:bg-gray-100 text-gray-300 hover:text-indigo-600 transition-colors"
              [class.text-indigo-600]="isComparing"
              [class.bg-indigo-50]="isComparing">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>
      <div class="relative z-10 h-32 flex items-center justify-center mb-2">
         <img [src]="themeService.getSpriteUrl(pokemon)" 
              loading="lazy"
              class="h-full w-auto object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" 
              style="image-rendering: pixelated;">
      </div>
      <div class="relative z-10 text-center">
        <h2 class="text-lg font-bold capitalize text-gray-800 leading-tight mb-1">{{pokemon.name}}</h2>
        <div class="flex justify-center gap-1 mt-1">
          <app-type-badge *ngFor="let t of pokemon.types" [type]="t.type.name"></app-type-badge>
        </div>
      </div>
    </div>
  `
})
export class PokemonCardComponent {
  @Input({required: true}) pokemon!: Pokemon;
  @Input() isComparing = false;
  @Output() select = new EventEmitter<Pokemon>();
  @Output() toggleCompare = new EventEmitter<Pokemon>();
  themeService = inject(ThemeService);
}