import { NotificationMessage } from '../infrastructure/admin.entities';

export const NOTIFICATION_QUEUE = 'notifications';
export const NOTIFICATION_DISPATCHER = Symbol('NOTIFICATION_DISPATCHER');

export type NotificationJob = {
  notificationId: string;
};

export interface NotificationDispatcher {
  dispatch(message: NotificationMessage): Promise<void>;
}
