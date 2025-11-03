import { Component, OnInit, signal } from '@angular/core';
import { Context } from '../context';
import { Router } from '@angular/router';
import { AppService } from '../app-service';
import { CommonModule } from '@angular/common';
import { Vechile } from '../model/vechile.model';
import { VechileError } from '../model/vechileError.model';
import { vechileInput } from '../model/vechileInput.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  today = new Date().toISOString().split('T')[0];

  vechiles = signal<Vechile[]>([]);
  searchInput = signal('');
  vinInput = signal('');
  limitInput = signal(20);
  totalPage = signal(1);
  page = signal(1);
  limit = signal(20);

  createForm = signal<boolean>(false);
  updateForm = signal<number | null>(null);
  deleteForm = signal<number | null>(null);

  importForm = signal<boolean>(false);
  exportForm = signal<boolean>(false);
  fileInput = signal<File | null>(null);
  ageInput = signal<number | null>(null);

  vechileInput = signal<vechileInput>({
    first_name: '',
    last_name: '',
    email: '',
    car_make: '',
    car_model: '',
    vin: '',
    manufactured_date: '',
  });

  vechileError = signal<VechileError>({
    first_name: null,
    last_name: null,
    email: null,
    car_make: null,
    car_model: null,
    vin: null,
    manufactured_date: null,
  });

  constructor(
    private readonly router: Router,
    private readonly context: Context,
    private readonly appService: AppService
  ) {}

  fetchVechiles(page: number, limit: number) {
    this.appService.getVechiles(page, limit).subscribe({
      next: (data) => {
        this.totalPage.set(data.totalPage);
        this.page.set(data.currentPage);
        this.limit.set(data.limit);
        this.vechiles.set(data.vechileList);
      },
      error: (err) => console.error(err),
    });
  }

  fetchVechilesByModel(model: string, page: number, limit: number) {
    this.appService.getVechilesByModel(model, page, limit).subscribe({
      next: (data) => {
        this.totalPage.set(data.totalPage);
        this.page.set(data.currentPage);
        this.limit.set(data.limit);
        this.vechiles.set(data.vechileList);
      },
      error: (err) => console.error(err),
    });
  }

  fetchVechileByVIN(vin: string) {
    this.appService.getVechileByVIN(vin).subscribe({
      next: (data) => {
        this.vechiles.set([data]);
      },
      error: (err) => console.error(err),
    });
  }

  ngOnInit(): void {
    if (this.context.getUserId() === '') {
      this.router.navigate(['']);
    } else {
      this.fetchVechiles(this.page(), this.limit());
    }
  }

  onVINSearch() {
    const input = this.vinInput() ?? '';
    if (input.trim() !== '') {
      this.fetchVechileByVIN(input);
    } else {
      this.fetchVechiles(this.page(), this.limit());
    }
  }

  onSearch() {
    const input = this.searchInput() ?? '';
    if (input.trim() !== '') {
      this.fetchVechilesByModel(input.trim(), this.page(), this.limit());
    } else {
      this.fetchVechiles(this.page(), this.limit());
    }
  }

  onClick(vin: string) {
    this.router.navigate([`/item/${vin}`]);
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const { name, value } = target;
    this.vechileInput.update((v) => ({ ...v, [name]: value }));
  }

  onReset() {
    this.vechileInput.set({
      first_name: '',
      last_name: '',
      email: '',
      car_make: '',
      car_model: '',
      vin: '',
      manufactured_date: '',
    });

    this.vechileError.set({
      first_name: null,
      last_name: null,
      email: null,
      car_make: null,
      car_model: null,
      vin: null,
      manufactured_date: null,
    });

    this.ageInput.set(null);
    this.fileInput.set(null);

    this.createForm.set(false);
    this.updateForm.set(null);
    this.deleteForm.set(null);
    this.importForm.set(false);
    this.exportForm.set(false);
  }

  onImportSubmit(event?: Event) {
    event?.preventDefault();
    if (this.fileInput()) {
      if (this.fileInput()?.type === 'text/csv' || this.fileInput()?.type === 'text/plain') {
        this.appService.uploadVechile(this.fileInput()!).subscribe({
          next: (response) => {
            alert(response.message);
            this.fileInput.set(null);
            this.importForm.set(false);
          },
          error: (err) => {
            alert(err.response?.message ?? 'Internal Server Error');
          },
        });
      } else {
        alert('Invalid Format File');
      }
    } else {
      alert('No File Selected');
    }
  }

  onExportSubmit(event?: Event) {
    event?.preventDefault();
    if (this.ageInput()) {
      this.appService.downloadVechile(this.ageInput()!).subscribe({
        next: (response) => {
          alert(response.message);
          this.ageInput.set(null);
          this.exportForm.set(false);
        },
        error: (err) => {
          alert(err.response?.message ?? 'Internal Server Error');
        },
      });
    } else {
      alert('Age Field is Empty');
    }
  }

  onUpdate() {
    this.appService.getVechileById(Number(this.updateForm()!)).subscribe({
      next: (data) => {
        this.vechileInput.set({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          car_make: data.car_make,
          car_model: data.car_model,
          vin: data.vin,
          manufactured_date: data.manufactured_date,
        });
      },
      error: (err) => {
        alert('Internal Server Error');
        this.updateForm.set(null);
      },
    });
  }

  validator(): boolean {
    const input = this.vechileInput();
    const errors: any = {};

    if (input.first_name.trim() === '') {
      errors.first_name = 'First Name Field is Empty';
    }

    if (input.last_name.trim() === '') {
      errors.last_name = 'Last Name Field is Empty';
    }

    if (input.email.trim() === '') {
      errors.email = 'Email Field is Empty';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      errors.email = 'Invalid Email Format';
    }

    if (input.car_make.trim() === '') {
      errors.car_make = 'Car Make Field is Empty';
    }

    if (input.car_model.trim() === '') {
      errors.car_model = 'Car Model Field is Empty';
    }

    if (input.vin.trim() === '') {
      errors.vin = 'VIN Field is Empty';
    }

    if (input.manufactured_date.trim() === '') {
      errors.manufactured_date = 'Manufactured Date Field is Empty';
    } else if (new Date() < new Date(input.manufactured_date.trim())) {
      errors.manufactured_date = 'Manufactured Date is Invalid';
    }

    this.vechileError.set({
      first_name: errors.first_name ?? null,
      last_name: errors.last_name ?? null,
      email: errors.email ?? null,
      car_make: errors.car_make ?? null,
      car_model: errors.car_model ?? null,
      vin: errors.vin ?? null,
      manufactured_date: errors.manufactured_date ?? null,
    });

    return Object.values(this.vechileError()).every((val) => val === null);
  }

  onCreateSubmit(event?: Event) {
    event?.preventDefault();
    const valid = this.validator();
    if (valid) {
      this.appService.createVechile(this.vechileInput()).subscribe({
        next: (data) => {
          alert(data.message);
          if (data.success) {
            this.vechileInput.set({
              first_name: '',
              last_name: '',
              email: '',
              car_make: '',
              car_model: '',
              vin: '',
              manufactured_date: '',
            });
            this.createForm.set(false);
            this.fetchVechiles(this.page(), this.limit());
          }
        },
        error: (err) => {
          console.log(err);
          alert(err.data?.message ?? 'Internal Server Error');
        },
      });
    }
  }

  onUpdateSubmit(event?: Event) {
    event?.preventDefault();
    const valid = this.validator();
    if (valid) {
      this.appService.updateVechile(Number(this.updateForm()!), this.vechileInput()).subscribe({
        next: (data) => {
          alert(data.message);
          if (data.success) {
            this.vechileInput.set({
              first_name: '',
              last_name: '',
              email: '',
              car_make: '',
              car_model: '',
              vin: '',
              manufactured_date: '',
            });
            this.updateForm.set(null);
            this.fetchVechiles(this.page(), this.limit());
          }
        },
        error: (err) => {
          alert(err.data?.message ?? 'Internal Server Error');
        },
      });
    }
  }

  onDeleteSubmit(event?: Event) {
    event?.preventDefault();
    this.appService.deleteVechile(Number(this.deleteForm()!)).subscribe({
      next: (data) => {
        if (data.success) {
          alert(data.message);
          this.deleteForm.set(null);
          this.fetchVechiles(this.page(), this.limit());
        }
      },
      error: (err) => {
        alert(err.data?.message ?? 'Internal Server Error');
        this.deleteForm.set(null);
      },
    });
  }

  onPageAdd() {
    if (this.page() < this.totalPage()) {
      this.page.update((i) => i + 1);
      const input = this.searchInput() ?? '';
      if (input.trim() !== '') {
        this.fetchVechilesByModel(input.trim(), this.page(), this.limit());
      } else {
        this.fetchVechiles(this.page(), this.limit());
      }
    }
  }

  onPageSub() {
    if (this.page() > 1) {
      this.page.update((i) => i - 1);
      const input = this.searchInput() ?? '';
      if (input.trim() !== '') {
        this.fetchVechilesByModel(input.trim(), this.page(), this.limit());
      } else {
        this.fetchVechiles(this.page(), this.limit());
      }
    }
  }

  onLimitChange() {
    if (this.limitInput() > 5 && this.limitInput() <= 100) {
      this.limit.set(this.limitInput());
      const input = this.searchInput() ?? '';
      if (input.trim() !== '') {
        this.fetchVechilesByModel(input.trim(), this.page(), this.limit());
      } else {
        this.fetchVechiles(this.page(), this.limit());
      }
    } else {
      this.limitInput.set(this.limit());
    }
  }
}
