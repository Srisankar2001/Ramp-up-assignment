import { Component, OnInit, signal } from '@angular/core';
import { RecordInput } from '../model/recordInput.model';
import { RecordError } from '../model/recordError.model';
import { Context } from '../context';
import { AppService } from '../app-service';
import { Router } from '@angular/router';
import { Record } from '../model/record.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-record',
  imports: [CommonModule, FormsModule],
  templateUrl: './record.html',
  styleUrl: './record.css',
})
export class RecordClass implements OnInit {
  today = new Date().toISOString().split('T')[0];

  vins = signal<string[]>([]);
  records = signal<Record[]>([]);
  selectedVIN = signal<string>('');
  createForm = signal<boolean>(false);
  updateForm = signal<number | null>(null);
  deleteForm = signal<number | null>(null);
  recordInput = signal<RecordInput>({
    vin: '',
    date: '',
    maintenance: '',
  });

  recordError = signal<RecordError>({
    vin: null,
    date: null,
    maintenance: null,
  });

  constructor(
    private readonly router: Router,
    private readonly context: Context,
    private readonly appService: AppService
  ) {}

  fetchRecords() {
    this.appService.getAllRecord().subscribe({
      next: (data) => {
        this.records.set(data);
      },
      error: (err) => {
        this.router.navigate(['/home']);
      },
    });
  }

  fetchVINs() {
    this.appService.getAllVIN().subscribe({
      next: (data: { vin: string }[]) => {
        const vinArray = data.map((item: { vin: string }) => item.vin);
        this.vins.set(vinArray);
      },
      error: (err) => {
        this.router.navigate(['/home']);
      },
    });
  }

  getFilteredRecords() {
    const vin = this.selectedVIN();
    return vin !== '' && vin !== 'Select The VIN'
      ? this.records().filter((r) => r.vin === vin)
      : this.records();
  }

  ngOnInit(): void {
    if (this.context.getUserId() === '') {
      this.router.navigate(['']);
    }
    this.fetchRecords();
    this.fetchVINs();
  }

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const { name, value } = target;
    this.recordInput.update((v) => ({ ...v, [name]: value }));
  }

  onVINChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedVIN.set(value);
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

  onUpdate(vin: string, date: string, maintenance: string) {
    this.recordInput.update((v) => ({
      vin: vin,
      date: date,
      maintenance: maintenance,
    }));
    console.log(this.recordInput());
  }

  validator(): boolean {
    const input = this.recordInput();
    const errors: any = {};
    if (input.vin.trim() === '' || input.vin.trim() === 'Select The VIN') {
      errors.vin = 'VIN Field is Empty';
    }
    if (input.maintenance.trim() === '') {
      errors.maintenance = 'Maintence Field is Empty';
    }

    if (input.date.trim() === '') {
      errors.date = 'Date Field is Empty';
    } else if (new Date() < new Date(input.date.trim())) {
      errors.date = 'Date is Invalid';
    }

    this.recordError.set({
      vin: errors.vin ?? null,
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
            this.recordInput.set({ vin: '', date: '', maintenance: '' });
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
            this.recordInput.set({ vin: '', date: '', maintenance: '' });
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
