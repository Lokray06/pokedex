import { Component, Input, Output, EventEmitter, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PokemonDataService } from '../../app/services/pokemon-data.service';
import { ThemeService } from '../../app/services/theme.service';
import { EvolutionStep, EvolutionNode } from '../../app/models/pokemon.interface';

@Component({
	selector: 'app-evolution-chain',
	standalone: true,
	imports: [CommonModule],
	template: `
		<div class="py-6 overflow-x-auto">
			<h3 class="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Evolution Chain</h3>
			
			<div class="flex items-center gap-4 min-w-max">
				<ng-container *ngFor="let step of evolutionSteps; let last = last">
					
					<div class="flex flex-col items-center cursor-pointer group" (click)="select.emit(step.id)">
						<div class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-100 flex items-center justify-center mb-2 border-2 border-transparent group-hover:border-indigo-500 transition-all">
							<!-- Using getSprite(step.id) which now calls the correct ThemeService method -->
							<img [src]="getSprite(step.id)" 
								class="w-16 h-16 sm:w-20 sm:h-20 object-contain pixelated group-hover:scale-110 transition-transform"
								loading="lazy">
							<span *ngIf="currentId === step.id" class="absolute -top-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Current</span>
						</div>
						<span class="font-bold text-sm capitalize text-gray-700 group-hover:text-indigo-600">{{step.name}}</span>
					</div>

					<div *ngIf="!last" class="flex flex-col items-center px-2">
						<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
						</svg>
						<span class="text-[10px] font-bold text-gray-400 mt-1" *ngIf="evolutionSteps[evolutionSteps.indexOf(step)+1]?.min_level">
							Lvl {{evolutionSteps[evolutionSteps.indexOf(step)+1].min_level}}
						</span>
					</div>

				</ng-container>

				<div *ngIf="evolutionSteps.length === 0" class="text-gray-400 italic">
					No evolution data available.
				</div>
			</div>
		</div>
	`,
	styles: [`.pixelated { image-rendering: pixelated; }`]
})
export class EvolutionChainComponent implements OnChanges {
	@Input() chainUrl: string | null = null;
	@Input() currentId: number = 0;
	@Output() select = new EventEmitter<number>();

	dataService = inject(PokemonDataService);
	themeService = inject(ThemeService);
	evolutionSteps: EvolutionStep[] = [];

	ngOnChanges(changes: SimpleChanges) {
		if (changes['chainUrl'] && this.chainUrl) {
			this.loadChain(this.chainUrl);
		}
	}

	// FIX: Use the new method getSpriteUrlById for simple ID-based fetching
	getSprite(id: number) {
		return this.themeService.getSpriteUrlById(id);
	}

	loadChain(url: string) {
		this.dataService.fetchEvolutionChain(url).subscribe({
			next: (res) => {
				this.evolutionSteps = [];
				this.traverseChain(res.chain);
			},
			error: () => console.error("Failed to load evolution")
		});
	}

	traverseChain(node: EvolutionNode) {
		const id = this.getIdFromUrl(node.species.url);
		const details = node.evolution_details[0];

		this.evolutionSteps.push({
			name: node.species.name,
			id: id,
			min_level: details?.min_level,
			trigger: details?.trigger?.name,
			item: details?.item?.name
		});

		if (node.evolves_to && node.evolves_to.length > 0) {
			node.evolves_to.forEach(child => this.traverseChain(child));
		}
	}

	getIdFromUrl(url: string): number {
		const parts = url.split('/');
		return parseInt(parts[parts.length - 2], 10);
	}
}