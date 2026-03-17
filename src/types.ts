export type TicketStatus = 'backlog' | 'in-progress' | 'done';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: number;
}
