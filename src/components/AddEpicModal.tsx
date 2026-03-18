import React, { useState } from 'react';
import type { Epic } from '../types';
import './AddEpicModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (epic: Omit<Epic, 'id'>) => void;
}

const COLORS = [
  '#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'
];

export function AddEpicModal({ isOpen, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd({
      name: name.trim(),
      description: description.trim(),
      color
    });
    
    setName('');
    setDescription('');
    setColor(COLORS[0]);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>New Project / Epic</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="epic-form">
          <div className="form-group">
            <label htmlFor="epic-name">Project Name</label>
            <input 
              id="epic-name"
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Website Redesign"
              autoFocus
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="epic-description">Description</label>
            <textarea 
              id="epic-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Color Tag</label>
            <div className="color-selector">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-btn ${color === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>Create Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
