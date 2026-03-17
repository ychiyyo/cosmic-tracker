import React from 'react';
import type { Ticket, TicketStatus } from '../types';
import { TicketCard } from './TicketCard';
import './Column.css';

interface Props {
  status: TicketStatus;
  title: string;
  tickets: Ticket[];
  onMoveTicket: (ticketId: string, newStatus: TicketStatus) => void;
  onDeleteTicket: (ticketId: string) => void;
}

export function Column({ status, title, tickets, onMoveTicket, onDeleteTicket }: Props) {
  
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
      onMoveTicket(ticketId, status);
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
        <span className="ticket-count">{tickets.length}</span>
      </div>
      <div className="column-content">
        {tickets.map(ticket => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket} 
            onMove={onMoveTicket}
            onDelete={onDeleteTicket}
          />
        ))}
      </div>
    </div>
  );
}
