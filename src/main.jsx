import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import '../styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode data-testid="react-strict-mode">
    <BrowserRouter data-testid="browser-router">
      <App data-testid="main-app" />
    </BrowserRouter>
  </React.StrictMode>
);