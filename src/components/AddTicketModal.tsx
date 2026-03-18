import React, { useState } from 'react';
import type { Ticket, TicketStatus, Epic } from '../types';
import './AddTicketModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  epics: Epic[];
  defaultEpicId?: string;
}

export function AddTicketModal({ isOpen, onClose, onAdd, epics, defaultEpicId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TicketStatus>('backlog');
  const [epicId, setEpicId] = useState<string | undefined>(defaultEpicId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onAdd({
      title: title.trim(),
      description: description.trim(),
      status,
      epicId
    });
    
    setTitle('');
    setDescription('');
    setStatus('backlog');
    setEpicId(defaultEpicId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Idea / Ticket</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="ticket-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input 
              id="title"
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What's the idea?"
              autoFocus
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea 
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add some details..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <div className="status-selector">
              {(['backlog', 'in-progress', 'done'] as TicketStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  className={`status-btn ${status === s ? 'active' : ''} btn-${s}`}
                  onClick={() => setStatus(s)}
                >
                  <span className={`status-dot status-${s}`}></span>
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="epic-select">Project / Epic</label>
            <select 
              id="epic-select"
              value={epicId || ''}
              onChange={e => setEpicId(e.target.value || undefined)}
              className="epic-dropdown"
            >
              <option value="">No Epic</option>
              {epics.map(epic => (
                <option key={epic.id} value={epic.id}>
                  {epic.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!title.trim()}>Create Ticket</button>
          </div>
        </form>
      </div>
    </div>
  );
}
