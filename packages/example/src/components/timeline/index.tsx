import React, { useState, useRef } from 'react';
import './index.less';

interface TimelineItem {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
}

const TimelineExample: React.FC = () => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([
    { id: '1', name: '动画1', start: 0, end: 5, color: '#007acc' },
    { id: '2', name: '动画2', start: 3, end: 8, color: '#ff6b6b' },
    { id: '3', name: '动画3', start: 7, end: 12, color: '#51cf66' },
  ]);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animationRef = useRef<number>();

  const timelineWidth = 800;
  const timelineDuration = 15;

  const startAnimation = () => {
    if (isPlaying) return;

    setIsPlaying(true);
    let startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const newTime = elapsed % timelineDuration;

      setCurrentTime(newTime);

      if (isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const addTimelineItem = () => {
    const newItem: TimelineItem = {
      id: Date.now().toString(),
      name: `动画${timelineItems.length + 1}`,
      start: 0,
      end: 3,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    };
    setTimelineItems([...timelineItems, newItem]);
  };

  const removeTimelineItem = (id: string) => {
    setTimelineItems(timelineItems.filter(item => item.id !== id));
  };

  const updateTimelineItem = (id: string, updates: Partial<TimelineItem>) => {
    setTimelineItems(timelineItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  return (
    <div className="timeline-example">
      <div className="control-panel">
        <div className="panel-info">
          <h3>时间线编辑器</h3>
          <p>当前时间: {currentTime.toFixed(1)}s</p>
        </div>
        <div className="panel-controls">
          {!isPlaying ? (
            <button
              onClick={startAnimation}
              className="play-btn"
            >
              播放
            </button>
          ) : (
            <button
              onClick={stopAnimation}
              className="stop-btn"
            >
              停止
            </button>
          )}
          <button
            onClick={addTimelineItem}
            className="add-btn"
          >
            添加动画
          </button>
        </div>
      </div>

      {/* 时间轴 */}
      <div className="timeline-container">
        {/* 时间刻度 */}
        <div className="time-scale">
          {Array.from({ length: timelineDuration + 1 }).map((_, i) => (
            <div key={i} className="time-marker">
              <div className="marker-line"></div>
              <span className="marker-label">{i}s</span>
            </div>
          ))}
        </div>

        {/* 时间线项目 */}
        <div className="timeline-items">
          {timelineItems.map((item, index) => {
            const left = (item.start / timelineDuration) * timelineWidth;
            const width = ((item.end - item.start) / timelineDuration) * timelineWidth;

            return (
              <div key={item.id} className="timeline-item">
                <div className="item-header">
                  <span className="item-name">
                    {item.name}
                  </span>
                  <div className="item-controls">
                    <button
                      onClick={() => removeTimelineItem(item.id)}
                      className="remove-btn"
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="item-track">
                  <div
                    className="item-bar"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      backgroundColor: item.color
                    }}
                  >
                    {item.start}s - {item.end}s
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 播放头 */}
        <div 
          className="current-time-indicator"
          style={{
            left: `${(currentTime / timelineDuration) * timelineWidth}px`
          }}
        ></div>
      </div>

      <div className="info-panel">
        <h3>时间线编辑器功能说明</h3>
        <ul>
          <li>✅ 时间线项目创建和管理</li>
          <li>✅ 时间轴可视化</li>
          <li>✅ 播放控制</li>
          <li>✅ 实时时间指示器</li>
          <li>🔄 后续将集成 @xzdarcy/react-timeline-editor</li>
        </ul>
      </div>
    </div>
  );
};

export default TimelineExample;
