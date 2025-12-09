import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';


//app.js is the main component which is the root component of the application
//it is the entry point of the application
//it is the first component which is rendered in the DOM


const root = ReactDOM.createRoot(document.getElementById('root'));
// ReactDOM = puts those components into the actual HTML page
// React → ReactDOM → Browser DOM

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>

  //React StrictMode
  //You now get warnings in the console if React finds issues.
);