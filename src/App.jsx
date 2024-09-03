import React from 'react';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Calendar from './pages/Calendar';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pt-mermoz/" element={<Calendar />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
