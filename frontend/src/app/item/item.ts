import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Record } from '../model/record.model';
import { Vechile } from '../model/vechile.model';
import { RecordInput } from '../model/recordInput.model';
import { RecordError } from '../model/recordError.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Context } from '../context';
import { AppService } from '../app-service';

@Component({
  selector: 'app-item',
  imports: [CommonModule, FormsModule],
  templateUrl: './item.html',
  styleUrl: './item.css',
})
export class Item implements OnInit {
  today = new Date().toISOString().split('T')[0];

  vin = signal<string>('');
  vechile = signal<Vechile>({
    id: 0,
    first_name: '',
    last_name: '',
    email: '',
    car_make: '',
    car_model: '',
    vin: '',
    manufactured_date: '',
    age_of_vechile: 0,
  });

  records = signal<Record[]>([]);
  createForm = signal<boolean>(false);
  updateForm = signal<number | null>(null);
  deleteForm = signal<number | null>(null);
  recordInput = signal<RecordInput>({
    vin: '',
    date: '',
    maintenance: '',
  });

  recordError = signal<RecordError>({
    date: null,
    maintenance: null,
  });

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly context: Context,
    private readonly appService: AppService
  ) {}

  fetchRecords() {
    this.appService.getRecordByVIN(this.vin()).subscribe({
      next: (data) => {
        if (data) {
          this.records.set(data.records ?? []);
          this.vechile.set({
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            car_make: data.car_make,
            car_model: data.car_model,
            vin: data.vin,
            manufactured_date: data.manufactured_date,
            age_of_vechile: data.age_of_vechile,
          });
        } else {
          alert("VIN Doesn't Exist");
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.router.navigate(['/home']);
      },
    });
  }

  ngOnInit(): void {
    if (this.context.getUserId() === '') {
      this.router.navigate(['']);
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/home']);
    } else {
      this.vin.set(id);
      this.recordInput.set({ vin: this.vin(), date: '', maintenance: '' });
      this.fetchRecords();
    }
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const { name, value } = target;
    this.recordInput.update((v) => ({ ...v, [name]: value }));
  }

  onReset() {
    this.recordInput.update((v) => ({
      vin: v.vin,
      date: '',
      maintenance: '',
    }));

    this.recordError.set({
      date: null,
      maintenance: null,
    });

    this.createForm.set(false);
    this.updateForm.set(null);
    this.deleteForm.set(null);
  }

  onUpdate(date: string, maintenance: string) {
    this.recordInput.update((v) => ({
      vin: v.vin,
      date: date,
      maintenance: maintenance,
    }));
  }

  validator(): boolean {
    const input = this.recordInput();
    const errors: any = {};
    if (input.maintenance.trim() === '') {
      errors.maintenance = 'Maintence Field is Empty';
    }

    if (input.date.trim() === '') {
      errors.date = 'Date Field is Empty';
    } else if (new Date() < new Date(input.date.trim())) {
      errors.date = 'Date is Invalid';
    }

    this.recordError.set({
      date: errors.date ?? null,
      maintenance: errors.maintenance ?? null,
    });

    return Object.values(this.recordError()).every((val) => val === null);
  }

  onCreateSubmit(event?: Event) {
    event?.preventDefault();
    const valid = this.validator();
    if (valid) {
      this.appService.createRecord(this.recordInput()).subscribe({
        next: (data) => {
          if (data.success) {
            alert(data.message);
            this.createForm.set(false);
            this.fetchRecords();
          }
        },
        error: (err) => {
          alert(err.data?.message ?? 'Internal Server Error');
        },
      });
    }
  }

  onUpdateSubmit(event?: Event) {
    event?.preventDefault();
    const valid = this.validator();
    if (valid) {
      this.appService.updateRecord(Number(this.updateForm()!), this.recordInput()).subscribe({
        next: (data) => {
          if (data.success) {
            alert(data.message);
            this.updateForm.set(null);
            this.fetchRecords();
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
    this.appService.deleteRecord(Number(this.deleteForm()!)).subscribe({
      next: (data) => {
        if (data.success) {
          alert(data.message);
          this.deleteForm.set(null);
          this.fetchRecords();
        }
      },
      error: (err) => {
        alert(err.data?.message ?? 'Internal Server Error');
        this.deleteForm.set(null);
      },
    });
  }
}
