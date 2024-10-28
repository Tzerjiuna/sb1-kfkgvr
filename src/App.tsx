import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentGateway from './components/PaymentGateway';
import './i18n';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentGateway />} />
      </Routes>
    </Router>
  );
}

export default App;