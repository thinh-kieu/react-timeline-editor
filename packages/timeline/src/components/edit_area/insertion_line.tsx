import React, { FC } from 'react';
import { prefix } from '../../utils/deal_class_prefix';
import { TimelineRow } from '@xzdarcy/timeline-engine';
import { calculateInsertionLineTop } from './drag_utils';

interface InsertionLineProps {
  /** 编辑器数据 */
  editorData: TimelineRow[];
  /** 默认行高 */
  rowHeight: number;
  /** 插入线索引 */
  insertionLineIndex: number;
  /** 插入线是否可见 */
  visible: boolean;
}

/**
 * 插入线组件 - 显示拖拽插入位置
 */
export const InsertionLine: FC<InsertionLineProps> = ({
  editorData,
  rowHeight,
  insertionLineIndex,
  visible,
}) => {
  if (!visible || insertionLineIndex < 0) {
    return null;
  }

  // 计算插入线位置
  const top = calculateInsertionLineTop(editorData, insertionLineIndex, rowHeight);

  return (
    <div
      className={prefix('edit-area-insertion-line')}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: '2px',
        background: '#4a90e2',
        zIndex: 1000,
        pointerEvents: 'none',
        top,
      }}
    />
  );
};