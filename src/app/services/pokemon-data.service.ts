import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, switchMap, map } from 'rxjs';
import { NamedAPIResource, Pokemon, PokemonSpecies, EvolutionChainResponse } from '../models/pokemon.interface';

@Injectable({ providedIn: 'root' })
export class PokemonDataService {
  private http = inject(HttpClient);
  private baseUrl = 'https://pokeapi.co/api/v2';

  allPokemonCache = signal<NamedAPIResource[]>([]);

  constructor() {
    this.fetchAllPokemonNames();
  }

  fetchAllPokemonNames() {
    this.http.get<{ results: NamedAPIResource[] }>(`${this.baseUrl}/pokemon?limit=1300`)
      .subscribe(res => this.allPokemonCache.set(res.results));
  }

  fetchList(url: string) {
    return this.http.get<{ next: string, results: NamedAPIResource[] }>(url).pipe(
      switchMap(res => {
        const details = res.results.map(r => this.http.get<Pokemon>(r.url));
        return forkJoin(details).pipe(
          map(pokemons => ({ next: res.next, pokemons }))
        );
      })
    );
  }

  fetchPokemonDetails(nameOrId: string | number) {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${nameOrId}`);
  }

  fetchSpecies(id: number) {
    return this.http.get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${id}`);
  }

  fetchEvolutionChain(url: string) {
    return this.http.get<EvolutionChainResponse>(url);
  }
}