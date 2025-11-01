import { Component, effect, OnDestroy, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Context } from '../context';
import { NotificationModel } from '../model/notification.model';
import { CommonModule } from '@angular/common';
import { AppService } from '../app-service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.css'],
})
export class Notification implements OnDestroy {
  private socket!: Socket;
  notifications = signal<NotificationModel[]>([]);
  count = signal<number>(0);
  isOpen = signal<boolean>(false);
  isShow = signal<boolean>(false);

  constructor(private readonly context: Context, private readonly appService: AppService) {}

  private watchUserEffect = effect(() => {
    const userId = this.context.getUserId();
    if (userId) {
      this.connect();
    } else {
      this.disconnect();
    }
  });

  ngOnDestroy(): void {
    this.disconnect();
  }

  connect(): void {
    const userId = this.context.getUserId();
    if (!userId) {
      return;
    }
    this.disconnect();
    this.socket = io(`http://localhost:80/notification`, {
      query: { userId },
      transports: ['websocket'],
    });
    this.isShow.set(true);
    this.listenToNotifications();
  }

  private listenToNotifications(): void {
    this.socket.on('Download-Success-Event', (data) => {
      this.notifications.update((v) => [
        {
          type: 'export',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          age: data.age,
          status: true,
          fileName: data.fileName,
        },
        ...v,
      ]);
      if (!this.isOpen()) this.count.update((i) => i + 1);
    });

    this.socket.on('Download-Failure-Event', (data) => {
      this.notifications.update((v) => [
        {
          type: 'export',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          age: data.age,
          status: false,
        },
        ...v,
      ]);
      if (!this.isOpen()) this.count.update((i) => i + 1);
    });

    this.socket.on('Validation-Failure-Event', (data) => {
      this.notifications.update((v) => [
        {
          type: 'import',
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          status: false,
          fileName: data.fileName,
          errors: data.errors,
        },
        ...v,
      ]);
      if (!this.isOpen()) this.count.update((i) => i + 1);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  onHeaderClick() {
    if (this.isOpen()) {
      this.isOpen.set(false);
    } else {
      this.isOpen.set(true);
      this.count.set(0);
    }
  }

  onError(errors: any) {
    alert(errors.join('\n'));
  }

  onDownload(fileName: string) {
    this.appService.downloadFile(fileName).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        alert('File Not Found');
      },
    });
  }
}
