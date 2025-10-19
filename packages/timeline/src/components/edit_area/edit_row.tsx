import React, { FC, useState, useRef, useCallback } from 'react';
import { TimelineAction, TimelineRow } from '@xzdarcy/timeline-engine';
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.less';

export type EditRowProps = CommonProp & {
  areaRef: React.RefObject<HTMLDivElement>;
  rowData?: TimelineRow;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  /** 距离左侧滚动距离 */
  scrollLeft: number;
  /** 设置scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
  /** 拖拽相关属性 */
  rowIndex?: number;
  isDragging?: boolean;
  isDragged?: boolean;
  isPlaceholder?: boolean;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const {
    rowData,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
    disableRowDrag,
    onRowDragStart,
    onRowDragEnd,
    editorData,
    setEditorData,
    rowIndex = -1,
    isDragging = false,
    isDragged = false,
    isPlaceholder = false
  } = props;

  const classNames = ['edit-row'];
  if (rowData?.selected) classNames.push('edit-row-selected');
  // 被拖拽的行不显示自身样式，由拖拽预览元素替代
  // if (isPlaceholder) classNames.push('edit-row-placeholder');

  // 拖拽状态
  const [localDragging, setLocalDragging] = useState(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const originalPositionRef = useRef<{ top: number; left: number }>({ top: 0, left: 0 });

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) return 0;
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  // 拖拽手柄鼠标按下事件
  const handleDragHandleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disableRowDrag || !rowData || rowIndex === -1) return;

    e.preventDefault();
    e.stopPropagation();

    // 记录初始位置
    if (dragHandleRef.current) {
      const rect = dragHandleRef.current.getBoundingClientRect();
      originalPositionRef.current = {
        top: rect.top,
        left: rect.left
      };
    }

    // 设置本地拖拽状态
    setLocalDragging(true);

    // 触发拖拽开始回调 - 传递给EditArea组件处理
    onRowDragStart?.({ row: rowData });

    // 添加全局鼠标事件监听
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // 拖拽移动逻辑将在EditArea组件中处理
    };

    const handleMouseUp = () => {
      setLocalDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      // 拖拽结束逻辑将在EditArea组件中处理
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disableRowDrag, rowData, rowIndex, onRowDragStart]);

  // 如果当前行正在被拖拽，保持可见但调整透明度
  // if (isDragged) {
  //   return (
  //     <div
  //       className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')} ${prefix('edit-row-dragged')}`}
  //       style={style}
  //       {...dataAttributes}
  //     >
  //       {/* 拖拽手柄 */}
  //       {!disableRowDrag && rowData && (
  //         <div
  //           className={prefix('edit-row-drag-handle')}
  //           title="拖拽中..."
  //         >
  //           ⋮⋮
  //         </div>
  //       )}

  //       {/* 保持所有子元素可见 */}
  //       {(rowData?.actions || []).map((action: TimelineAction) => (
  //         <EditAction key={action.id} {...props} handleTime={handleTime} row={rowData!} action={action} />
  //       ))}
  //     </div>
  //   );
  // }

  return (
    <div
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')} ${localDragging ? prefix('edit-row-dragging') : ''}`}
      style={style}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: rowData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: rowData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: rowData, time: time });
        }
      }}
    >
      {/* 拖拽手柄 */}
      {!disableRowDrag && rowData && (
        <div
          ref={dragHandleRef}
          className={prefix('edit-row-drag-handle')}
          onMouseDown={handleDragHandleMouseDown}
          title="拖拽调整行顺序"
        >
          ⋮⋮
        </div>
      )}

      {(rowData?.actions || []).map((action: TimelineAction) => (
        <EditAction key={action.id} {...props} handleTime={handleTime} row={rowData!} action={action} />
      ))}
    </div>
  );
};
