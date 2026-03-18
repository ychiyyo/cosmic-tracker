import type { Epic } from '../types';
import { LayoutGrid, Folders, Plus, ChevronRight } from 'lucide-react';
import './EpicSidebar.css';

interface Props {
  epics: Epic[];
  activeEpicId?: string;
  onSelectEpic: (id?: string) => void;
  onAddClick: () => void;
}

export function EpicSidebar({ epics, activeEpicId, onSelectEpic, onAddClick }: Props) {
  return (
    <aside className="epic-sidebar glass-panel">
      <div className="sidebar-header">
        <Folders size={18} />
        <span>Projects</span>
        <button className="add-epic-mini" onClick={onAddClick} title="New Project">
          <Plus size={14} />
        </button>
      </div>

      <nav className="epic-list">
        <button 
          className={`epic-item ${!activeEpicId ? 'active' : ''}`}
          onClick={() => onSelectEpic(undefined)}
        >
          <LayoutGrid size={16} />
          <span>All Tasks</span>
          {!activeEpicId && <ChevronRight size={14} className="active-arrow" />}
        </button>

        <div className="epic-divider" />

        {epics.map(epic => (
          <button 
            key={epic.id}
            className={`epic-item ${activeEpicId === epic.id ? 'active' : ''}`}
            onClick={() => onSelectEpic(epic.id)}
          >
            <div 
              className="epic-color-dot" 
              style={{ backgroundColor: epic.color }} 
            />
            <span className="epic-name">{epic.name}</span>
            {activeEpicId === epic.id && <ChevronRight size={14} className="active-arrow" />}
          </button>
        ))}
      </nav>
    </aside>
  );
}
