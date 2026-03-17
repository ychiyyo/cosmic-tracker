import type { Ticket, TicketStatus } from '../types';
import { Clock, GripHorizontal } from 'lucide-react';
import './TicketCard.css';

interface Props {
  ticket: Ticket;
  onMove?: (id: string, newStatus: TicketStatus) => void;
  onDelete?: (id: string) => void;
}

export function TicketCard({ ticket, onDelete }: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('ticketId', ticket.id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const dateStr = new Date(ticket.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric'
  });

  return (
    <div 
      className="ticket-card glass-panel"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="ticket-header">
        <span className={`status-dot status-${ticket.status}`}></span>
        <div className="ticket-actions">
           {onDelete && (
             <button onClick={() => onDelete(ticket.id)} className="delete-btn" title="Delete Ticket">
               &times;
             </button>
           )}
        </div>
      </div>
      <h4 className="ticket-title">{ticket.title}</h4>
      {ticket.description && (
        <p className="ticket-desc">{ticket.description}</p>
      )}
      <div className="ticket-footer">
        <span className="ticket-date">
          <Clock size={12} /> {dateStr}
        </span>
        <GripHorizontal size={14} className="drag-handle" />
      </div>
    </div>
  );
}
