import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Context {
  userId = signal<string>('');

  setUserId(id: string) {
    this.userId.set(id);
  }

  getUserId() {
    return this.userId();
  }
}
