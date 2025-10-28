import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Context } from '../context';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  constructor(private router: Router, private context: Context) {}
  userId: string = '';
  error: string | null = null;

  ngOnInit(): void {
    this.userId = '';
    this.context.setUserId('');
  }

  onReset() {
    this.userId = '';
  }

  onSubmit(event?:Event) {
    event?.preventDefault()
    if (this.userId.trim() === '') {
      this.error = 'User ID Field is Empty';
    } else {
      this.context.setUserId(this.userId.trim());
      console.log(this.context.getUserId());
      this.router.navigate(['/home']);
    }
  }
}
