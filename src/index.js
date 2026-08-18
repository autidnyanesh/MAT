import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { AuthProvider } from "./context/AuthContext";
import { ApplicationProvider } from "./context/ApplicationContext";
import { MenuProvider } from "./context/MenuContext";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ApplicationProvider>
        <MenuProvider>
          <App />
        </MenuProvider>
      </ApplicationProvider>
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();