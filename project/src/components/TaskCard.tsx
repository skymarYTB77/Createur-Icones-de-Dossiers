import React from 'react';
import { Task } from './TaskManager';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  onDelete: () => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  return (
    <div className="task-card">
      <button 
        onClick={onDelete}
        className="complete-task-button"
        aria-label="Marquer comme terminée"
      >
        <svg 
          viewBox="0 0 24 24" 
          className="complete-task-icon"
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path className="checkmark" d="M8 12l3 3 5-5" />
        </svg>
      </button>
      <div className="task-content">
        <h4>{task.title}</h4>
        <div className="task-due-date">
          <span>{format(new Date(task.dueDate), 'dd MMMM yyyy', { locale: fr })}</span>
        </div>
      </div>
    </div>
  );
}