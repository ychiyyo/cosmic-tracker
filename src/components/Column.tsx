import React from 'react';
import type { Ticket, TicketStatus, Epic } from '../types';
import { TicketCard } from './TicketCard';
import './Column.css';

interface Props {
  status: TicketStatus;
  title: string;
  items: (Ticket | Epic)[];
  isEpic?: boolean;
  onEpicClick?: (id: string) => void;
  onMoveItem: (id: string, newStatus: TicketStatus) => void;
  onDeleteItem: (id: string) => void;
}

export function Column({ status, title, items, isEpic, onEpicClick, onMoveItem, onDeleteItem }: Props) {
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const ticketId = e.dataTransfer.getData('ticketId');
    if (ticketId) {
      onMoveItem(ticketId, status);
    }
  };

  return (
    <div 
      className={`column glass-panel status-border-${status}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="column-header">
        <h3 className="column-title">
          <span className={`status-dot status-${status}`}></span>
          {title}
        </h3>
        <span className="ticket-count">{items.length}</span>
      </div>
      <div className="column-content">
        {items.map(item => (
          <TicketCard 
            key={item.id} 
            item={item} 
            isEpic={isEpic}
            onClick={() => onEpicClick?.(item.id)}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
    </div>
  );
}
