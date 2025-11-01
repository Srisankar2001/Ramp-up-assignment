import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Item } from './item/item';
import { Context } from './context';
import { HttpClientModule } from '@angular/common/http';
import { AppService } from './app-service';
import { CommonModule } from '@angular/common';
import { Notification } from './notification/notification';
import { RecordClass } from './record/record';

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
    RecordClass,
  ],
  providers: [AppService, Context],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('frontend');
  isShow = signal<boolean>(false);

  constructor(private readonly context: Context) {}

  setNavShow = effect(() => {
    if (this.context.getUserId() !== '') {
      this.isShow.set(true);
    } else {
      this.isShow.set(false);
    }
  });
}
