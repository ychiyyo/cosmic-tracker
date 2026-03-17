import { useState, useEffect, useRef } from 'react';
import type { Ticket, TicketStatus } from './types';
import { Board } from './components/Board';
import { AddTicketModal } from './components/AddTicketModal';
import { Plus, Download, Upload } from 'lucide-react';
import './App.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('tickets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: '1',
        title: 'Welcome to your deep space tracker',
        description: 'Drag this ticket to in-progress or done!',
        status: 'backlog',
        createdAt: Date.now()
      }
    ];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  const handleAddTicket = (newTicket: Omit<Ticket, 'id' | 'createdAt'>) => {
    const ticket: Ticket = {
      ...newTicket,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setTickets(prev => [...prev, ticket]);
  };

  const handleMoveTicket = (id: string, newStatus: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };
  
  const handleDeleteTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify(tickets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cosmic-tracker-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setTickets(data);
        }
      } catch (err) {
        console.error("Failed to parse JSON backup");
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-brand">
          <div className="logo-orb"></div>
          <h1>Cosmic Tracker</h1>
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={handleExport} title="Export Backup (JSON)">
            <Download size={18} />
          </button>
          <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Import Backup (JSON)">
            <Upload size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
          <button className="new-ticket-btn" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>New Idea</span>
          </button>
        </div>
      </header>
      
      <main className="app-main">
        <Board 
          tickets={tickets} 
          onMoveTicket={handleMoveTicket}
          onDeleteTicket={handleDeleteTicket}
        />
      </main>

      <AddTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTicket}
      />
    </div>
  );
}

export default App;
