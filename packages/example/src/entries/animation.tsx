import React from 'react';
import ReactDOM from 'react-dom/client';
import AnimationExample from '../components/animation';

const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>动画示例</h1>
      <AnimationExample />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
