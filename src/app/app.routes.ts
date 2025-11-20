// src/app/app.routes.ts

import { Routes } from '@angular/router';
// Import the component that holds the Pokedex UI/template
import { App as PokedexApp } from './app.component'; // NOTE: Assuming your Pokedex logic component class is named 'App' and is in app.component.ts

export const routes: Routes = [
  {
    path: '', // This is the default root path (e.g., http://localhost:4200/)
    component: PokedexApp, // Load the Pokedex component here
    title: 'Pokedex Home'
  },
  // You can add other routes here later (e.g., path: 'about', component: AboutComponent)
];