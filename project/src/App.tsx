import React, { useState, useEffect } from 'react';
import { TaskManager } from './components/TaskManager';
import { Auth } from './components/Auth';
import { ClipboardList } from 'lucide-react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [showTaskManager, setShowTaskManager] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Vérifier si l'application est chargée dans un iframe
    setIsIframe(window !== window.parent);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Si c'est un iframe, afficher directement le gestionnaire de tâches
  if (isIframe) {
    if (!user) {
      return <Auth onAuthSuccess={() => setUser(auth.currentUser)} />;
    }
    return <TaskManager onClose={() => {}} />;
  }

  if (!user) {
    return <Auth onAuthSuccess={() => setUser(auth.currentUser)} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {!showTaskManager ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <button
            onClick={() => setShowTaskManager(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <ClipboardList size={24} />
            <span>Ouvrir le gestionnaire de tâches</span>
          </button>
        </div>
      ) : (
        <TaskManager onClose={() => setShowTaskManager(false)} />
      )}
    </div>
  );
}

export default App;