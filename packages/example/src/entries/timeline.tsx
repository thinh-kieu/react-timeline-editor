import React from 'react';
import ReactDOM from 'react-dom/client';
import TimelineExample from '../components/timeline';
const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>时间线编辑器示例</h1>
      <TimelineExample />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
