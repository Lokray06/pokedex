import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Removed 'PokemonStat' from import list as it caused an error and wasn't directly used here.
import { Pokemon, NamedAPIResource, ThemeColor, SpriteMode } from './models/pokemon.interface';
import { ThemeService } from './services/theme.service';
import { PokemonDataService } from './services/pokemon-data.service';
import { TypeService } from './services/type.service';

import { PokemonCardComponent } from '../components/pokemon-card/pokemon-card.component';
import { PokemonDetailComponent } from '../components/pokemon-detail/pokemon-detail.component';
import { TypeBadgeComponent } from '../components/shared/type-badge.component'; // Ensure TypeBadge is imported

@Component({
	selector: 'app-root',
	standalone: true,
	// TypeBadgeComponent must be included here for the template to recognize its properties (like 'size').
	imports: [CommonModule, FormsModule, HttpClientModule, PokemonCardComponent, PokemonDetailComponent, TypeBadgeComponent],
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
						
							<!-- New Random Pokemon Button -->
							<button (click)="goToRandomPokemon()" 
									class="p-2 rounded-full hover:bg-white/20 transition-colors"
									title="Random Pokemon">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
									<path d="M16 8h.01"></path>
									<path d="M8 8h.01"></path>
									<path d="M12 12h.01"></path>
									<path d="M16 16h.01"></path>
									<path d="M8 16h.01"></path>
								</svg>
							</button>

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

					<div class="relative mb-6 mx-auto w-full max-w-sm" (click)="$event.stopPropagation()">
						<input 
								type="text" 
								[(ngModel)]="compareSearchQuery" 
								(input)="onCompareSearchInput()"
								(focus)="showCompareSearchResults = true"
								placeholder="Add Pokemon to Compare..."
								class="pl-9 pr-4 py-2 rounded-xl bg-white/90 border-2 border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base w-full shadow-md"
						>
						<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						
						<div *ngIf="showCompareSearchResults && compareSearchResults.length > 0" 
									class="absolute top-full mt-2 left-0 w-full max-h-60 overflow-y-auto bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-50">
								<div *ngFor="let res of compareSearchResults" 
											(mousedown)="selectCompareSearch(res)"
											class="px-4 py-2 hover:bg-gray-100 cursor-pointer capitalize text-sm flex justify-between items-center border-b border-gray-50 last:border-0">
									<span>{{res.name}}</span>
									<span class="text-xs text-gray-400">Add</span>
								</div>
						</div>
						<div *ngIf="showCompareSearchResults && compareSearchQuery.length > 0 && compareSearchResults.length === 0"
									class="absolute top-full mt-2 left-0 w-full p-3 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 z-50 text-sm text-center text-gray-500">
							No results found.
						</div>
					</div>

					<div class="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 text-gray-800">
						<h2 class="text-2xl font-bold text-gray-800 mb-8 text-center">Comparison Arena</h2>
						
						<div *ngIf="compareList.length < 2" class="text-center py-10 text-gray-500">
							<p class="font-semibold mb-2">Select at least 2 Pokémon to compare stats and perform battle simulations.</p>
							<p class="text-sm">Use the search bar above or the '+' icon on the cards in the main list.</p>
						</div>

						<ng-container *ngIf="compareList.length >= 2">
							
							<!-- Comparison Profiles & Removal -->
							<div class="grid grid-cols-2 gap-4 mb-8 border-b pb-6 border-gray-200 relative">
								<!-- Pokemon 1 -->
								<div class="flex flex-col items-center p-3 rounded-xl transition-shadow relative" 
									[ngClass]="themeService.getThemeClass().includes('dark') ? 'bg-gray-100' : 'bg-gray-50'">
									<button (click)="toggleCompare(compareList[0])" class="absolute top-1 right-1 text-red-400 hover:text-red-600 p-1 rounded-full bg-white/70 shadow z-10">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
									</button>
									<img [src]="themeService.getSpriteUrl(compareList[0])" class="h-24 w-24 object-contain" style="image-rendering: pixelated">
									<h3 class="text-xl font-bold capitalize mt-2 text-center">{{compareList[0].name}}</h3>
									<div class="flex gap-1 mt-1">
<app-type-badge *ngFor="let type of compareList[0].types"
                [type]="type.type.name"
                [size]="'sm'">
</app-type-badge>
									</div>
								</div>
								
								<!-- VS Divider -->
								<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
									<span class="text-2xl font-black text-gray-400 p-2 bg-white rounded-full border-2 border-gray-300 shadow-md">VS</span>
								</div>

								<!-- Pokemon 2 -->
								<div class="flex flex-col items-center p-3 rounded-xl transition-shadow relative"
									[ngClass]="themeService.getThemeClass().includes('dark') ? 'bg-gray-100' : 'bg-gray-50'">
									<button (click)="toggleCompare(compareList[1])" class="absolute top-1 right-1 text-red-400 hover:text-red-600 p-1 rounded-full bg-white/70 shadow z-10">
										<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
									</button>
									<img [src]="themeService.getSpriteUrl(compareList[1])" class="h-24 w-24 object-contain" style="image-rendering: pixelated">
									<h3 class="text-xl font-bold capitalize mt-2 text-center">{{compareList[1].name}}</h3>
									<div class="flex gap-1 mt-1">
										<app-type-badge *ngFor="let type of compareList[1].types" [type]="type.type.name" [size]="'sm'"></app-type-badge>
									</div>
								</div>
							</div>

							<!-- Stat Comparison Table -->
							<h3 class="text-xl font-bold mb-4 border-b border-gray-200 pb-2">Base Stat Showdown</h3>
							<div class="space-y-3">
								<div *ngFor="let stat of statNames">
									<div class="flex justify-between text-xs mb-1">
										<span class="font-bold text-gray-500 uppercase">{{stat}}</span>
									</div>
									
									<div class="grid grid-cols-12 items-center gap-2">
										<!-- Stat 1 Value (Left) -->
										<div class="col-span-3 text-right font-bold text-lg" 
											[ngClass]="getStatValue(compareList[0], stat) > getStatValue(compareList[1], stat) ? 'text-green-600' : 'text-gray-500'">
											{{getStatValue(compareList[0], stat)}}
										</div>

										<!-- Stat Bar (Middle) -->
										<div class="col-span-6 flex items-center h-4 rounded-full bg-gray-200 overflow-hidden">
											<!-- Bar 1 (Green for higher value, Orange for lower or equal) -->
											<div class="h-full" 
												[style.width.%]="getStatWidth(compareList[0], stat)" 
												[ngClass]="getStatValue(compareList[0], stat) > getStatValue(compareList[1], stat) ? 'bg-green-500' : 'bg-orange-500'">
											</div>
											<!-- Bar 2 (Overlay/Remaining) -->
											<div class="h-full" 
												[style.width.%]="getStatWidth(compareList[1], stat)" 
												[ngClass]="getStatValue(compareList[1], stat) > getStatValue(compareList[0], stat) ? 'bg-green-500' : 'bg-orange-500'">
											</div>
										</div>

										<!-- Stat 2 Value (Right) -->
										<div class="col-span-3 text-left font-bold text-lg"
											[ngClass]="getStatValue(compareList[1], stat) > getStatValue(compareList[0], stat) ? 'text-green-600' : 'text-gray-500'">
											{{getStatValue(compareList[1], stat)}}
										</div>
									</div>
									<div class="text-center text-xs italic text-gray-400 mt-1" 
										*ngIf="getStatValue(compareList[0], stat) === getStatValue(compareList[1], stat)">
										(Draw)
									</div>
								</div>
							</div>

							<!-- Type Effectiveness Simulation -->
							<h3 class="text-xl font-bold mt-8 mb-4 border-b border-gray-200 pb-2">Type Effectiveness Test (Move Damage)</h3>
							<div class="flex flex-col md:flex-row gap-4 items-end">
								
								<!-- Attacking Type Selector -->
								<div class="w-full md:w-1/3">
									<label class="block text-sm font-medium text-gray-700 mb-1">Attacking Move Type</label>
									<select [(ngModel)]="selectedAttackingTypeName" 
											class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white border capitalize">
										<option *ngFor="let type of availableTypes" [value]="type.name" class="capitalize">{{type.name}}</option>
									</select>
								</div>

								<!-- Defending Pokemon Selector (defaults to the first in the list) -->
								<div class="w-full md:w-1/3">
									<label class="block text-sm font-medium text-gray-700 mb-1">Defending Pokémon</label>
									<select [(ngModel)]="selectedDefensePokemon" 
											class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white border capitalize">
										<option *ngFor="let mon of compareList" [ngValue]="mon" class="capitalize">{{mon.name}}</option>
									</select>
								</div>

								<button (click)="calculateDamageMultiplier()" 
										class="w-full md:w-1/3 px-6 py-2 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 transition-colors">
									Calculate Multiplier
								</button>
							</div>

							<!-- Result Display -->
							<div *ngIf="damageResult" class="mt-6 p-4 rounded-xl shadow-inner border"
								[ngClass]="{
									'bg-green-100 border-green-400': damageResult.multiplier > 1.5,
									'bg-red-100 border-red-400': damageResult.multiplier < 1,
									'bg-yellow-100 border-yellow-400': damageResult.multiplier > 1 && damageResult.multiplier <= 1.5,
									'bg-gray-100 border-gray-300': damageResult.multiplier === 1 || (damageResult.multiplier > 0.5 && damageResult.multiplier < 1.5)
								}">
								<h4 class="text-xl font-bold mb-2 flex items-center gap-2">
									<span class="text-lg font-normal">Final Damage Multiplier:</span>
									<span class="text-3xl" [ngClass]="{
										'text-green-700': damageResult.multiplier > 1.5,
										'text-red-700': damageResult.multiplier < 1,
										'text-yellow-700': damageResult.multiplier > 1 && damageResult.multiplier <= 1.5,
										'text-gray-700': damageResult.multiplier === 1 || (damageResult.multiplier > 0.5 && damageResult.multiplier < 1.5)
									}">
										{{damageResult.multiplier}}x
									</span>
									<span *ngIf="damageResult.multiplier > 1.5" class="text-green-700 text-sm font-normal font-bold">(SUPER EFFECTIVE!)</span>
									<!-- Explicitly check against the number 0 to fix TS error 2367 -->
									<span *ngIf="damageResult.multiplier === 0" class="text-red-700 text-sm font-normal font-bold">(IMMUNE/NO EFFECT!)</span>
									<span *ngIf="damageResult.multiplier > 0 && damageResult.multiplier < 1" class="text-red-700 text-sm font-normal">(Not Very Effective)</span>
								</h4>
								
								<p class="font-semibold text-sm mt-3">Breakdown:</p>
								<ul class="list-disc list-inside text-sm mt-1 space-y-0.5">
									<li *ngFor="let item of damageResult.breakdown" [ngClass]="{'text-green-600': item.value > 1, 'text-red-600': item.value < 1.5}">
										<span class="uppercase font-medium">[{{item.type}}]</span>: {{item.effect}} (x{{item.value}})
									</li>
								</ul>
							</div>
						</ng-container>
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

	compareSearchQuery = '';
	compareSearchResults: NamedAPIResource[] = [];
	showCompareSearchResults = false;

	showSettings = false;

	// --- Comparison Arena State & Logic ---
	// Stats for the comparison table display
	statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

	// Type Test State
	availableTypes: NamedAPIResource[] = [];
	selectedAttackingTypeName: string = 'normal';
	selectedDefensePokemon: Pokemon | null = null;
	damageResult: { multiplier: number; breakdown: { type: string, effect: string, value: number }[] } | null = null;

	// Mocked Type Effectiveness Chart (Simplified for demo)
	private typeChart: { [key: string]: { superEffective: string[], notEffective: string[], immune: string[] } } = {
		'normal': { superEffective: [], notEffective: ['rock', 'steel'], immune: ['ghost'] },
		'fire': { superEffective: ['grass', 'ice', 'bug', 'steel'], notEffective: ['fire', 'water', 'rock', 'dragon'], immune: [] },
		'water': { superEffective: ['fire', 'ground', 'rock'], notEffective: ['water', 'grass', 'dragon'], immune: [] },
		'grass': { superEffective: ['water', 'ground', 'rock'], notEffective: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'], immune: [] },
		'electric': { superEffective: ['water', 'flying'], notEffective: ['electric', 'grass', 'dragon'], immune: ['ground'] },
		'ice': { superEffective: ['grass', 'ground', 'flying', 'dragon'], notEffective: ['fire', 'water', 'ice', 'steel'], immune: [] },
		'fighting': { superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'], notEffective: ['poison', 'flying', 'psychic', 'bug', 'fairy'], immune: ['ghost'] },
		'poison': { superEffective: ['grass', 'fairy'], notEffective: ['poison', 'ground', 'rock', 'ghost'], immune: ['steel'] },
		'ground': { superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'], notEffective: ['grass', 'bug'], immune: ['flying'] },
		'flying': { superEffective: ['grass', 'fighting', 'bug'], notEffective: ['electric', 'rock', 'steel'], immune: [] },
		'psychic': { superEffective: ['fighting', 'poison'], notEffective: ['psychic', 'steel'], immune: ['dark'] },
		'bug': { superEffective: ['grass', 'psychic', 'dark'], notEffective: ['fighting', 'flying', 'poison', 'ghost', 'steel', 'fairy', 'fire'], immune: [] },
		'rock': { superEffective: ['fire', 'ice', 'flying', 'bug'], notEffective: ['fighting', 'ground', 'steel'], immune: [] },
		'ghost': { superEffective: ['psychic', 'ghost'], notEffective: ['dark'], immune: ['normal'] },
		'dragon': { superEffective: ['dragon'], notEffective: ['steel'], immune: ['fairy'] },
		'steel': { superEffective: ['ice', 'rock', 'fairy'], notEffective: ['fire', 'water', 'electric', 'steel'], immune: [] },
		'fairy': { superEffective: ['fighting', 'dragon', 'dark'], notEffective: ['fire', 'poison', 'steel'], immune: [] },
		'dark': { superEffective: ['psychic', 'ghost'], notEffective: ['fighting', 'dark', 'fairy'], immune: [] },
	};
	// -------------------------------------

	themes: { id: ThemeColor, name: string, bgClass: string }[] = [
		{ id: 'classic', name: 'Pokedex Red', bgClass: 'bg-red-600' },
		{ id: 'dark', name: 'Dark Mode', bgClass: 'bg-gray-900' },
		{ id: 'gameboy', name: 'GameBoy', bgClass: 'bg-green-800' },
		{ id: 'water', name: 'Ocean Blue', bgClass: 'bg-blue-500' }
	];

	spriteModes: { id: SpriteMode, name: string }[] = [
		{ id: 'official', name: 'Modern Art' },
		{ id: 'gen1', name: 'Gen 1 (Pixel)' },
		{ id: 'gen3', name: 'Gen 3 (GBA)' },
		{ id: 'gen4', name: 'Gen 4 (NDS)' },
		{ id: 'gen5-anim', name: 'Gen 5 (Anim)' },
		{ id: 'home', name: '3D Home' }
	];

	ngOnInit() {
		this.loadPage(this.nextUrl!);

		// Initialize available types for the Type Test dropdown
		this.availableTypes = Object.keys(this.typeChart).map(type => ({ name: type, url: '' }));
		this.selectedAttackingTypeName = this.availableTypes[0].name;
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

	onCompareSearchInput() {
		const q = this.compareSearchQuery.toLowerCase().trim();
		if (!q) {
			this.compareSearchResults = [];
			return;
		}
		this.compareSearchResults = this.dataService.allPokemonCache()
			.filter(p => p.name.includes(q))
			.slice(0, 10);
	}

	selectCompareSearch(res: NamedAPIResource) {
		this.compareSearchQuery = '';
		this.showCompareSearchResults = false;

		this.dataService.fetchPokemonDetails(res.name).subscribe({
			next: (pokemon) => {
				if (!this.isInCompare(pokemon.id)) {
					// Add the Pokemon, shifting out the oldest one if the list is full (limit 2 for clean comparison)
					if (this.compareList.length >= 2) {
						this.compareList = [this.compareList[1], pokemon];
					} else {
						this.compareList.push(pokemon);
					}
					// Set the newly added Pokemon as the defender for the type test if it's the 2nd one
					if (this.compareList.length === 2 && !this.selectedDefensePokemon) {
						this.selectedDefensePokemon = pokemon;
					}
				}
			},
			error: (err) => {
				console.error("Could not load Pokemon for comparison", err);
			}
		});
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

	goToRandomPokemon() {
		// Use the size of the cached list (which should contain all available Pokemon)
		const maxId = this.dataService.allPokemonCache().length;
		if (maxId === 0) return; // Prevent navigation if cache hasn't loaded

		// Generate a random ID between 1 and maxId (inclusive)
		const randomId = Math.floor(Math.random() * maxId) + 1;
		this.navigatePokemon(randomId);
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
		this.damageResult = null; // Clear old result on list change
		if (this.isInCompare(pokemon.id)) {
			this.compareList = this.compareList.filter(p => p.id !== pokemon.id);
		} else {
			if (this.compareList.length >= 2) {
				this.compareList = [this.compareList[1], pokemon];
			} else {
				this.compareList.push(pokemon);
			}
		}
		// Ensure the selected defender is still in the list, or update it
		if (this.selectedDefensePokemon && !this.isInCompare(this.selectedDefensePokemon.id)) {
			this.selectedDefensePokemon = this.compareList.length > 0 ? this.compareList[0] : null;
		} else if (!this.selectedDefensePokemon && this.compareList.length > 0) {
			this.selectedDefensePokemon = this.compareList[0];
		}
	}

	isInCompare(id: number) {
		return this.compareList.some(p => p.id === id);
	}

	goHome() {
		this.viewState = 'list';
		this.searchQuery = '';
	}

	// --- New Comparison Methods ---

	getStatValue(pokemon: Pokemon, statName: string): number {
		const stat = pokemon.stats.find(s => s.stat.name === statName);
		return stat ? stat.base_stat : 0;
	}

	getStatWidth(pokemon: Pokemon, statName: string): string {
		const value = this.getStatValue(pokemon, statName);
		const maxValue = 255; // The highest base stat possible (Blissey's HP)
		// Calculate the width as a percentage of the max value
		return `${(value / maxValue) * 100}%`;
	}

	calculateDamageMultiplier() {
		this.damageResult = null;

		const attackingType = this.selectedAttackingTypeName;
		const defendingPokemon = this.selectedDefensePokemon;

		if (!attackingType || !defendingPokemon) {
			return;
		}

		const defendingTypes = defendingPokemon.types.map(t => t.type.name);
		let totalMultiplier = 1;
		const breakdown: { type: string, effect: string, value: number }[] = [];

		// 1. STAB: Same-Type Attack Bonus (1.5x)
		const isStab = defendingPokemon.types.some(t => t.type.name === attackingType);
		if (isStab) {
			totalMultiplier *= 1.5;
			breakdown.push({ type: attackingType, effect: 'Same-Type Attack Bonus (STAB)', value: 1.5 });
		}

		// 2. Type Effectiveness (applies to each defense type)
		for (const defType of defendingTypes) {
			let typeMultiplier = 1 as number;
			let effect = 'Neutral';

			const chart = this.typeChart[attackingType];

			if (chart) {
				if (chart.superEffective.includes(defType)) {
					typeMultiplier = 2;
					effect = 'Super Effective (2x)';
				} else if (chart.notEffective.includes(defType)) {
					typeMultiplier = 0.5;
					effect = 'Not Very Effective (0.5x)';
				} else if (chart.immune.includes(defType)) {
					typeMultiplier = 0;
					effect = 'Immune (0x)';
				}
			}

			totalMultiplier *= typeMultiplier;

			// Only include non-neutral effects in the breakdown
			if (typeMultiplier !== 1) {
				// If it was STAB, ensure we don't duplicate the attacking type entry unless the defense type is the same
				if (!(isStab && defType === attackingType && typeMultiplier === 1.5)) {
					breakdown.push({ type: defType, effect: effect, value: typeMultiplier });
				}
			}
		}

		// If only STAB and all defense types were neutral, add a neutral entry for clarity
		if (breakdown.length === (isStab ? 1 : 0)) {
			// This block ensures we clarify if the only factor was STAB or if it was truly neutral.
			if (!isStab) {
				breakdown.push({ type: 'Defense', effect: 'Neutral Effectiveness (1x)', value: 1 });
			}
		}

		this.damageResult = {
			multiplier: parseFloat(totalMultiplier.toFixed(2)),
			breakdown: breakdown.filter((item, index, self) =>
				index === self.findIndex((t) => (
					t.type === item.type && t.effect === item.effect
				))
			)
		};
	}
}