export type TicketStatus = 'backlog' | 'in-progress' | 'done';

export interface Epic {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  epicId?: string;
  createdAt: number;
}
