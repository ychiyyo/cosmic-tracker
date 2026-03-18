import { useState, useEffect, useRef } from 'react';
import type { Ticket, TicketStatus, Epic } from './types';
import { Board } from './components/Board';
import { AddTicketModal } from './components/AddTicketModal';
import { AddEpicModal } from './components/AddEpicModal';
import { EpicSidebar } from './components/EpicSidebar';
import { Plus, Download, Upload } from 'lucide-react';
import './App.css';

function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEpicModalOpen, setIsEpicModalOpen] = useState(false);
  const [activeEpicId, setActiveEpicId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const gistId = import.meta.env.VITE_GIST_ID;
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;

  // Fetch initial data from Gist
  useEffect(() => {
    async function fetchTickets() {
      if (!gistId || !githubToken) {
        console.warn("Missing Gist credentials. Falling back to empty state.");
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        const data = await res.json();
        const content = data.files['tickets.json']?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            setTickets(parsed);
          } else {
            setTickets(parsed.tickets || []);
            setEpics(parsed.epics || []);
          }
        }
      } catch (err) {
        console.error("Error fetching tickets from Gist:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, [gistId, githubToken]);

  // Sync data to Gist whenever tickets change (skip initial empty loads)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return; // Skip save on mount
    }
    if (isLoading) return; // Don't save while we are still loading the initial state

    async function saveTickets() {
      if (!gistId || !githubToken) return;
      try {
        await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: {
              'tickets.json': {
                content: JSON.stringify({ tickets, epics }, null, 2)
              }
            }
          })
        });
      } catch (err) {
        console.error("Error saving tickets to Gist:", err);
      }
    }
    
    // Simple debounce so we aren't spamming the API on rapid moves
    const timeoutId = setTimeout(saveTickets, 1000);
    return () => clearTimeout(timeoutId);
  }, [tickets, epics, gistId, githubToken, isLoading]);

  const handleAddTicket = (newTicket: Omit<Ticket, 'id' | 'createdAt'>) => {
    const ticket: Ticket = {
      ...newTicket,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setTickets(prev => [...prev, ticket]);
  };

  const handleAddEpic = (newEpic: Omit<Epic, 'id'>) => {
    const epic: Epic = {
      ...newEpic,
      id: crypto.randomUUID()
    };
    setEpics(prev => [...prev, epic]);
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
        } else {
          setTickets(data.tickets || []);
          setEpics(data.epics || []);
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
        <EpicSidebar 
          epics={epics} 
          activeEpicId={activeEpicId}
          onSelectEpic={setActiveEpicId}
          onAddClick={() => setIsEpicModalOpen(true)}
        />
        
        <div className="board-container">
          {isLoading ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Syncing from Cloud...
            </div>
          ) : (
            <Board 
              tickets={tickets.filter(t => !activeEpicId || t.epicId === activeEpicId)} 
              onMoveTicket={handleMoveTicket}
              onDeleteTicket={handleDeleteTicket}
            />
          )}
        </div>
      </main>

      <AddTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTicket}
        epics={epics}
        defaultEpicId={activeEpicId}
      />

      <AddEpicModal
        isOpen={isEpicModalOpen}
        onClose={() => setIsEpicModalOpen(false)}
        onAdd={handleAddEpic}
      />
    </div>
  );
}

export default App;
