import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Calendar from './pages/Calendar';
import NotFoundPage from './pages/NotFoundPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'; // Import des icônes

function App() {
  const [darkMode, setDarkMode] = useState(false);

  // Basculer entre les modes sombre et clair
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark'); // Activer le mode sombre
    } else {
      document.documentElement.classList.remove('dark'); // Désactiver le mode sombre
    }
  };

  useEffect(() => {
    // Appliquer le mode sombre si activé au chargement
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`h-screen flex flex-col justify-between ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/pt-mermoz/" element={<Calendar />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>

      {/* Bouton pour basculer entre le mode sombre et clair */}
      <button
        onClick={toggleDarkMode}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gray-200 dark:bg-gray-700 shadow-lg text-xl"
        style={{ zIndex: 1000 }} // S'assurer que le bouton est toujours au-dessus du contenu
      >
        <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="text-yellow-500 dark:text-yellow-300" />
      </button>
    </div>
  );
}

export default App;