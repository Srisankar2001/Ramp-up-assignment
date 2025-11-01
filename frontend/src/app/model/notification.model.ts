export interface NotificationModel {
  type: string;
  date: string;
  time: string;
  age?: number;
  status: boolean;
  fileName?: string;
  errors?: string[];
}
