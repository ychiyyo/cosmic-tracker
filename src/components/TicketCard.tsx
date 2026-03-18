import type { Ticket, Epic } from '../types';
import { Clock, GripHorizontal, ChevronRight } from 'lucide-react';
import './TicketCard.css';

interface Props {
  item: Ticket | Epic;
  isEpic?: boolean;
  onClick?: () => void;
  onDelete?: (id: string) => void;
}

export function TicketCard({ item, isEpic, onClick, onDelete }: Props) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('ticketId', item.id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('dragging');
  };

  const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric'
  });

  return (
    <div 
      className={`ticket-card glass-panel ${isEpic ? 'epic-card' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => isEpic && onClick?.()}
    >
      <div className="ticket-header">
        <span className={`status-dot status-${item.status}`}></span>
        <div className="ticket-actions">
           {onDelete && (
             <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="delete-btn" title="Delete">
               &times;
             </button>
           )}
        </div>
      </div>
      <h4 className="ticket-title">{item.title}</h4>
      {item.description && (
        <p className="ticket-desc">{item.description}</p>
      )}
      <div className="ticket-footer">
        <span className="ticket-date">
          <Clock size={12} /> {dateStr}
        </span>
        {isEpic ? (
          <ChevronRight size={14} className="drill-down-icon" />
        ) : (
          <GripHorizontal size={14} className="drag-handle" />
        )}
      </div>
    </div>
  );
}
