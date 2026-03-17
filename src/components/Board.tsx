import type { Ticket, TicketStatus } from '../types';
import { Column } from './Column';
import './Board.css';

interface Props {
  tickets: Ticket[];
  onMoveTicket: (id: string, newStatus: TicketStatus) => void;
  onDeleteTicket: (id: string) => void;
}

export function Board({ tickets, onMoveTicket, onDeleteTicket }: Props) {
  
  const getTicketsByStatus = (status: TicketStatus) => {
    return tickets.filter(t => t.status === status).sort((a, b) => b.createdAt - a.createdAt);
  };

  return (
    <div className="board">
      <Column 
        status="backlog" 
        title="Ideas & Backlog" 
        tickets={getTicketsByStatus('backlog')} 
        onMoveTicket={onMoveTicket}
        onDeleteTicket={onDeleteTicket}
      />
      <Column 
        status="in-progress" 
        title="In Progress" 
        tickets={getTicketsByStatus('in-progress')} 
        onMoveTicket={onMoveTicket}
        onDeleteTicket={onDeleteTicket}
      />
      <Column 
        status="done" 
        title="Done" 
        tickets={getTicketsByStatus('done')} 
        onMoveTicket={onMoveTicket}
        onDeleteTicket={onDeleteTicket}
      />
    </div>
  );
}
