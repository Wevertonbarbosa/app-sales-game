import { Routes } from '@angular/router';
import { GamePage } from './pages/game/game.page';
import { HomePage } from './pages/home/home.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomePage,
  },
  {
    path: 'game',
    component: GamePage,
  },
];
