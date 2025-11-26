import { TicketPriority, TicketStatus } from '@/domain/entities/Support';

export const TICKET_TYPES: Array<string> = ['support', 'question', 'refund', 'bug', 'feature', 'other'];

export const PRIORITIES: TicketPriority[] = [
  TicketPriority.LOW,
  TicketPriority.MEDIUM,
  TicketPriority.HIGH,
  TicketPriority.URGENT,
];

export const statusStyles: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800',
  [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
  [TicketStatus.ON_HOLD]: 'bg-purple-100 text-purple-800',
  [TicketStatus.RESOLVED]: 'bg-green-100 text-green-800',
  [TicketStatus.CLOSED]: 'bg-gray-200 text-gray-700',
  [TicketStatus.REJECTED]: 'bg-red-100 text-red-700',
};

export const priorityIndicator: Record<TicketPriority, string> = {
  [TicketPriority.LOW]: 'text-gray-500',
  [TicketPriority.MEDIUM]: 'text-blue-500',
  [TicketPriority.HIGH]: 'text-orange-500',
  [TicketPriority.URGENT]: 'text-red-600',
};
