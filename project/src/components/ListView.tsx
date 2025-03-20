import React from 'react';
import { Task } from './TaskManager';
import { TaskCard } from './TaskCard';

interface ListViewProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
}

export function ListView({ tasks, onDeleteTask }: ListViewProps) {
  return (
    <div className="list-view">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={() => onDeleteTask(task.id)}
        />
      ))}
    </div>
  );
}