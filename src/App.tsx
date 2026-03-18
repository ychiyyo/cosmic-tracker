import { useState, useEffect, useRef } from 'react';
import type { Ticket, TicketStatus, Epic } from './types';
import { Board } from './components/Board';
import { AddTicketModal } from './components/AddTicketModal';
import { AddEpicModal } from './components/AddEpicModal';
import { Plus, Download, Upload, ArrowLeft } from 'lucide-react';
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
          // Handle both old array format and new {tickets, epics} format
          if (Array.isArray(parsed)) {
            setEpics(parsed); // Existing items are treated as Projects
          } else if (parsed && typeof parsed === 'object') {
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

  const handleAddEpic = (newEpic: Omit<Epic, 'id' | 'createdAt'>) => {
    const epic: Epic = {
      ...newEpic,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    };
    setEpics(prev => [...prev, epic]);
  };

  const handleMoveItem = (id: string, newStatus: TicketStatus) => {
    if (activeEpicId) {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } else {
      setEpics(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    }
  };
  
  const handleDeleteItem = (id: string) => {
    if (activeEpicId) {
      setTickets(prev => prev.filter(t => t.id !== id));
    } else {
      setEpics(prev => prev.filter(e => e.id !== id));
      // Also cleanup child stories
      setTickets(prev => prev.filter(t => t.epicId !== id));
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify(tickets, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cosmic-tracker-${activeEpicId ? 'stories' : 'projects'}.json`;
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
        } else if (data && typeof data === 'object') {
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

  const currentEpic = epics.find(e => e.id === activeEpicId);

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-brand">
          {activeEpicId ? (
            <button className="back-btn" onClick={() => setActiveEpicId(undefined)} title="Back to Projects">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="logo-orb"></div>
          )}
          <h1>{activeEpicId ? currentEpic?.title : 'Cosmic Tracker'}</h1>
          {activeEpicId && <span className="epic-badge">Project</span>}
        </div>
        <div className="header-actions">
          <button className="icon-btn" onClick={handleExport} title="Export">
            <Download size={18} />
          </button>
          <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Import">
            <Upload size={18} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImport} 
            accept=".json" 
            style={{ display: 'none' }} 
          />
          <button 
            className="new-ticket-btn" 
            onClick={() => activeEpicId ? setIsModalOpen(true) : setIsEpicModalOpen(true)}
          >
            <Plus size={18} />
            <span>{activeEpicId ? 'New Story' : 'New Project'}</span>
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {isLoading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Syncing from Cloud...
          </div>
        ) : (
          <Board 
            items={activeEpicId ? tickets.filter(t => t.epicId === activeEpicId) : epics} 
            isEpic={!activeEpicId}
            onEpicClick={setActiveEpicId}
            onMoveItem={handleMoveItem}
            onDeleteItem={handleDeleteItem}
          />
        )}
      </main>

      <AddTicketModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTicket}
        epicId={activeEpicId}
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
