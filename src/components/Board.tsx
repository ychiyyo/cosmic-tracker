import type { Ticket, TicketStatus, Epic } from '../types';
import { Column } from './Column';
import './Board.css';

interface Props {
  items: (Ticket | Epic)[];
  isEpic?: boolean;
  onEpicClick: (id: string) => void;
  onMoveItem: (id: string, newStatus: TicketStatus) => void;
  onDeleteItem: (id: string) => void;
}

export function Board({ items, isEpic, onEpicClick, onMoveItem, onDeleteItem }: Props) {
  
  const getItemsByStatus = (status: TicketStatus) => {
    return items.filter(i => i.status === status).sort((a, b) => b.createdAt - a.createdAt);
  };

  return (
    <div className="board">
      <Column 
        status="backlog" 
        title="Ideas & Backlog" 
        items={getItemsByStatus('backlog')} 
        isEpic={isEpic}
        onEpicClick={onEpicClick}
        onMoveItem={onMoveItem}
        onDeleteItem={onDeleteItem}
      />
      <Column 
        status="in-progress" 
        title="In Progress" 
        items={getItemsByStatus('in-progress')} 
        isEpic={isEpic}
        onEpicClick={onEpicClick}
        onMoveItem={onMoveItem}
        onDeleteItem={onDeleteItem}
      />
      <Column 
        status="done" 
        title="Done" 
        items={getItemsByStatus('done')} 
        isEpic={isEpic}
        onEpicClick={onEpicClick}
        onMoveItem={onMoveItem}
        onDeleteItem={onDeleteItem}
      />
    </div>
  );
}
