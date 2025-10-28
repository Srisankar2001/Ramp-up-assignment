import { Component, OnInit } from '@angular/core';
import { Vechile } from '../model/vechile.model';
import { Context } from '../context';
import { Router } from '@angular/router';
import { AppService } from '../app-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  constructor(private router: Router, private context: Context, private appService: AppService) {}
  vechiles: any[] = [];
  fetchVechiles() {
    this.appService.getVehicles(1, 10).subscribe({
      next: (data) => (this.vechiles = data),
      error: (err) => console.error(err),
    });
  }

  ngOnInit(): void {
    if (this.context.getUserId() === '') {
      this.router.navigate(['']);
    } else {
      this.fetchVechiles();
    }
  }
}
