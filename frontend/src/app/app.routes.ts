import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Item } from './item/item';
import { RecordClass } from './record/record';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'home', component: Home },
  { path: 'record', component: RecordClass },
  { path: 'item/:id', component: Item },
];
