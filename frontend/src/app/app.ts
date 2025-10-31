import { Component, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Item } from './item/item';
import { Context } from './context';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from './app-service';
import { CommonModule } from '@angular/common';
import { Notification } from './notification/notification';

@Component({
  selector: 'app-root',
  imports: [
    HttpClientModule,
    RouterOutlet,
    RouterLink,
    Login,
    Home,
    Item,
    CommonModule,
    Notification,
  ],
  providers: [AppService, Context],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
}
