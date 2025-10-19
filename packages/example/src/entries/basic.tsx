import React from 'react';
import ReactDOM from 'react-dom/client';
import BasicExample from '../components/basic';
const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>基础示例 - React Timeline Editor</h1>
      <BasicExample />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
