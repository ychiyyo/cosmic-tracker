export type TicketStatus = 'backlog' | 'in-progress' | 'done';

export interface Epic {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  createdAt: number;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  epicId: string;
  createdAt: number;
}
