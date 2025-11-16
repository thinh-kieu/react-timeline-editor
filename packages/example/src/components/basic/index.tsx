import React, { useState } from 'react';
import './index.less';

const BasicExample: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="basic-example">
      <h2>基础计数器示例</h2>
      <p>当前计数: <strong>{count}</strong></p>
      <div className="button-group">
        <button 
          onClick={() => setCount(count - 1)}
          className="decrement"
        >
          -1
        </button>
        <button 
          onClick={() => setCount(count + 1)}
          className="increment"
        >
          +1
        </button>
        <button 
          onClick={() => setCount(0)}
          className="reset"
        >
          重置
        </button>
      </div>
      <div className="info-panel">
        <h3>React Timeline Editor 功能预览</h3>
        <p>这个示例展示了基础的React组件交互。后续将集成时间线编辑器功能。</p>
        <ul>
          <li>✅ React + TypeScript 环境</li>
          <li>✅ 组件状态管理</li>
          <li>✅ 事件处理</li>
          <li>🔄 时间线编辑器集成 (待实现)</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicExample;