import React, { useState, useEffect } from 'react';
import './index.less';

const AnimationExample: React.FC = () => {
  const [animationType, setAnimationType] = useState<'fade' | 'slide' | 'scale' | 'rotate'>('fade');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationCount, setAnimationCount] = useState(0);

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setAnimationCount(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const startAnimation = () => {
    setIsAnimating(true);
  };

  const getAnimationStyle = () => {
    const baseStyle = {
      width: '150px',
      height: '150px',
      backgroundColor: '#007acc',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '18px',
      transition: 'all 0.5s ease-in-out',
      margin: '20px auto'
    };

    if (!isAnimating) {
      return baseStyle;
    }

    switch (animationType) {
      case 'fade':
        return {
          ...baseStyle,
          opacity: 0,
          transform: 'scale(0.8)'
        };
      case 'slide':
        return {
          ...baseStyle,
          transform: 'translateX(200px) rotate(45deg)'
        };
      case 'scale':
        return {
          ...baseStyle,
          transform: 'scale(1.5) rotate(180deg)',
          backgroundColor: '#ff6b6b'
        };
      case 'rotate':
        return {
          ...baseStyle,
          transform: 'rotate(360deg) scale(1.2)',
          borderRadius: '50%',
          backgroundColor: '#51cf66'
        };
      default:
        return baseStyle;
    }
  };

  const getAnimationName = () => {
    switch (animationType) {
      case 'fade': return '淡入淡出';
      case 'slide': return '滑动旋转';
      case 'scale': return '缩放旋转';
      case 'rotate': return '旋转变形';
      default: return '动画';
    }
  };

  return (
    <div className="animation-example">
      <div className="animation-header">
        <h2>CSS动画示例</h2>
        <p>展示不同的CSS动画效果，为时间线编辑器提供视觉基础</p>

        <div className="control-section">
          <label>选择动画类型:</label>
          <select
            value={animationType}
            onChange={(e) => setAnimationType(e.target.value as any)}
          >
            <option value="fade">淡入淡出</option>
            <option value="slide">滑动旋转</option>
            <option value="scale">缩放旋转</option>
            <option value="rotate">旋转变形</option>
          </select>
        </div>

        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="animation-button"
        >
          {isAnimating ? '动画中...' : `播放 ${getAnimationName()} 动画`}
        </button>

        <div className="animation-counter">
          动画播放次数: {animationCount}
        </div>
      </div>

      {/* 动画演示区域 */}
      <div className="animation-demo">
        <div style={getAnimationStyle()}>
          {getAnimationName()}
        </div>

        <div className="animation-info">
          <h3>动画效果说明</h3>
          <ul>
            <li><strong>淡入淡出:</strong> 透明度变化 + 轻微缩放</li>
            <li><strong>滑动旋转:</strong> 水平位移 + 45度旋转</li>
            <li><strong>缩放旋转:</strong> 放大1.5倍 + 180度旋转 + 颜色变化</li>
            <li><strong>旋转变形:</strong> 360度旋转 + 形状变化 + 颜色变化</li>
          </ul>
          <p>
            这些动画效果展示了CSS过渡和变换的能力，为时间线编辑器中的动画序列提供基础。
          </p>
        </div>
      </div>

      {/* 技术说明 */}
      <div className="tech-info">
        <h4>技术实现</h4>
        <ul>
          <li>使用React Hooks管理动画状态</li>
          <li>CSS transitions实现平滑动画效果</li>
          <li>动态样式计算实现多种动画类型</li>
          <li>为时间线编辑器集成提供动画基础</li>
        </ul>
      </div>
    </div>
  );
};

export default AnimationExample;
