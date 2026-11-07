import { BadRequestException } from '@nestjs/common';
import { BookingStatus } from '../../../common/enums';

const NEXT: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: [BookingStatus.Confirmed, BookingStatus.Cancelled],
  confirmed: [BookingStatus.InProgress, BookingStatus.Cancelled],
  in_progress: [BookingStatus.Completed, BookingStatus.Cancelled],
  completed: [],
  cancelled: [],
};

export function assertBookingTransition(
  current: BookingStatus,
  next: BookingStatus,
): void {
  if (current === next) {
    return;
  }
  if (!NEXT[current].includes(next)) {
    throw new BadRequestException(
      `Cannot move a booking from ${current} to ${next}`,
    );
  }
}
