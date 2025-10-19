import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { AutoSizer, Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { TimelineRow } from '@xzdarcy/timeline-engine';
import { CommonProp } from '../../interface/common_prop';
import { EditData } from '../../interface/timeline';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel } from '../../utils/deal_data';
import { DragLines } from './drag_lines';
import './edit_area.less';
import { EditRow } from './edit_row';
import { useDragLine } from './hooks/use_drag_line';

export type EditAreaProps = CommonProp & {
  /** 距离左侧滚动距离 */
  scrollLeft: number;
  /** 距离顶部滚动距离 */
  scrollTop: number;
  /** 滚动回调，用于同步滚动 */
  onScroll: (params: OnScrollParams) => void;
  /** 设置编辑器数据 */
  setEditorData: (params: TimelineRow[]) => void;
  /** 设置scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

/** edit area ref数据 */
export interface EditAreaState {
  domRef: React.MutableRefObject<HTMLDivElement | null>;
}

// 拖拽状态接口
interface DragState {
  isDragging: boolean;
  draggedRow: TimelineRow | null;
  draggedIndex: number;
  targetIndex: number;
  placeholderIndex: number;
  originalData: TimelineRow[];
  insertionLine: {
    visible: boolean;
    position: 'top' | 'bottom';
    index: number;
  };
  dragPreview: {
    visible: boolean;
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

const initialDragState: DragState = {
  isDragging: false,
  draggedRow: null,
  draggedIndex: -1,
  targetIndex: -1,
  placeholderIndex: -1,
  originalData: [],
  insertionLine: {
    visible: false,
    position: 'top',
    index: -1,
  },
  dragPreview: {
    visible: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

export const EditArea = React.forwardRef<EditAreaState, EditAreaProps>((props, ref) => {
  const {
    editorData,
    rowHeight,
    scaleWidth,
    scaleCount,
    startLeft,
    scrollLeft,
    scrollTop,
    scale,
    hideCursor = false,
    cursorTime,
    onScroll,
    dragLine,
    getAssistDragLineActionIds,
    onActionMoveEnd,
    onActionMoveStart,
    onActionMoving,
    onActionResizeEnd,
    onActionResizeStart,
    onActionResizing,
    disableRowDrag,
    onRowDragStart,
    onRowDragEnd,
    setEditorData,
  } = props;
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
  const editAreaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Grid>(null);
  const heightRef = useRef(-1);

  // 拖拽状态管理
  const [dragState, setDragState] = useState<DragState>(initialDragState);

  // ref 数据
  useImperativeHandle(ref, () => ({
    get domRef() {
      return editAreaRef;
    },
  }));

  // 行重新排序算法
  const reorderRows = useCallback((data: TimelineRow[], fromIndex: number, toIndex: number): TimelineRow[] => {
    const result = [...data];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    return result;
  }, []);

  // 计算目标位置 - 基于鼠标距离最近的行边界
  const calculateTargetIndex = useCallback(
    (clientY: number): { index: number; position: 'top' | 'bottom' } => {
      if (!editAreaRef.current || !gridRef.current) return { index: -1, position: 'top' };

      const rect = editAreaRef.current.getBoundingClientRect();
      const viewportTop = clientY - rect.top + scrollTop;

      // 获取可见行信息
      const rowCount = editorData.length;
      let currentTop = 0;

      // 如果鼠标在第一个行之前，插入到第一行上方
      if (rowCount > 0 && viewportTop < 0) {
        return { index: 0, position: 'top' };
      }

      for (let i = 0; i < rowCount; i++) {
        const rowHeight = editorData[i]?.rowHeight || props.rowHeight;
        const rowBottom = currentTop + rowHeight;

        // 检查鼠标是否在当前行范围内
        if (viewportTop >= currentTop && viewportTop <= rowBottom) {
          // 计算鼠标到当前行顶部和底部的距离
          const distanceToTop = Math.abs(viewportTop - currentTop);
          const distanceToBottom = Math.abs(viewportTop - rowBottom);

          // 如果鼠标更接近当前行顶部，插入到当前行上方
          if (distanceToTop < distanceToBottom) {
            return { index: i, position: 'top' };
          }
          // 如果鼠标更接近当前行底部，插入到当前行下方
          else {
            return { index: i, position: 'bottom' };
          }
        }

        currentTop = rowBottom;
      }

      // 如果鼠标在所有行之后，插入到最后一行下方
      return { index: rowCount, position: 'bottom' };
    },
    [editorData, props.rowHeight, scrollTop],
  );

  // 处理行拖拽开始
  const handleRowDragStart = useCallback(
    (row: TimelineRow, rowIndex: number) => {
      if (disableRowDrag) return;

      const originalData = [...editorData];

      // 计算被拖拽行的位置和尺寸
      let dragPreviewTop = 0;
      let dragPreviewHeight = row.rowHeight || props.rowHeight;

      for (let i = 0; i < rowIndex; i++) {
        dragPreviewTop += editorData[i]?.rowHeight || props.rowHeight;
      }

      setDragState({
        isDragging: true,
        draggedRow: row,
        draggedIndex: rowIndex,
        targetIndex: -1,
        placeholderIndex: rowIndex,
        originalData,
        insertionLine: {
          visible: false,
          position: 'top',
          index: -1,
        },
        dragPreview: {
          visible: true,
          top: dragPreviewTop,
          left: 0,
          width: 0,
          height: dragPreviewHeight,
        },
      });

      // 触发回调
      onRowDragStart?.({ row });

      // 添加全局鼠标事件监听
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const targetInfo = calculateTargetIndex(moveEvent.clientY);
        console.log(targetInfo, moveEvent.clientY);
        const targetIndex = targetInfo.index;

        // 正确计算拖拽预览位置（相对于编辑区域容器）
        let previewTop = 0;
        if (editAreaRef.current) {
          const rect = editAreaRef.current.getBoundingClientRect();
          previewTop = moveEvent.clientY - rect.top - dragPreviewHeight / 2 + scrollTop;
          // 限制预览元素在编辑区域内
          previewTop = Math.max(0, Math.min(previewTop, rect.height - dragPreviewHeight));
        }

        // 更新目标位置和插入线显示
        setDragState((prev) => ({
          ...prev,
          targetIndex,
          placeholderIndex: targetIndex > rowIndex ? targetIndex - 1 : targetIndex,
          insertionLine: {
            visible: targetIndex !== -1 && targetIndex !== rowIndex,
            position: targetInfo.position,
            index: targetIndex,
          },
          dragPreview: {
            ...prev.dragPreview,
            top: previewTop,
          },
        }));
      };

      const handleMouseUp = () => {
        // 使用函数式更新获取最新状态
        setDragState((prevState) => {
          const { draggedIndex, targetIndex, insertionLine, originalData, draggedRow } = prevState;

          if (targetIndex !== -1 && targetIndex !== draggedIndex) {
            // 根据插入位置调整目标索引
            let adjustedTargetIndex = targetIndex;
            if (insertionLine.position === 'bottom' && targetIndex < editorData.length) {
              // 插入到当前行下方，需要插入到下一行位置
              adjustedTargetIndex = targetIndex;
            } else {
              // 插入到当前行上方时，目标索引保持不变
              adjustedTargetIndex = Math.max(0, targetIndex - 1);
            }

            // 成功插入：重新排序数据
            const newData = reorderRows(editorData, draggedIndex, adjustedTargetIndex);
            setEditorData(newData);
            onRowDragEnd?.({ row: draggedRow!, editorData: newData });
          } else {
            // 未成功插入：恢复到原始位置
            setEditorData(originalData);
          }

          return initialDragState;
        });

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [disableRowDrag, editorData, onRowDragStart, onRowDragEnd, setEditorData, reorderRows, calculateTargetIndex],
  );

  const handleInitDragLine: EditData['onActionMoveStart'] = (data) => {
    if (dragLine) {
      const assistActionIds =
        getAssistDragLineActionIds &&
        getAssistDragLineActionIds({
          action: data.action,
          row: data.row,
          editorData,
        });
      const cursorLeft = parserTimeToPixel(cursorTime, { scaleWidth, scale, startLeft });
      const assistPositions = defaultGetAssistPosition({
        editorData,
        assistActionIds,
        action: data.action,
        row: data.row,
        scale,
        scaleWidth,
        startLeft,
        hideCursor,
        cursorLeft,
      });
      initDragLine({ assistPositions });
    }
  };

  const handleUpdateDragLine: EditData['onActionMoving'] = (data) => {
    if (dragLine) {
      const movePositions = defaultGetMovePosition({
        ...data,
        startLeft,
        scaleWidth,
        scale,
      });
      updateDragLine({ movePositions });
    }
  };

  /** 获取每个cell渲染内容 */
  const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
    const row = editorData[rowIndex]; // 行数据

    // 判断当前行是否为占位符
    const isPlaceholder = dragState.isDragging && rowIndex === dragState.placeholderIndex;
    const isDragged = dragState.isDragging && rowIndex === dragState.draggedIndex;

    return (
      <EditRow
        {...props}
        style={{
          ...style,
          backgroundPositionX: `0, ${startLeft}px`,
          backgroundSize: `${startLeft}px, ${scaleWidth}px`,
        }}
        areaRef={editAreaRef}
        key={key}
        rowHeight={row?.rowHeight || rowHeight}
        rowData={row}
        dragLineData={dragLineData}
        // 拖拽相关属性
        rowIndex={rowIndex}
        isDragging={dragState.isDragging}
        isDragged={isDragged}
        isPlaceholder={isPlaceholder}
        // 移除insertPosition属性，避免行级别插入线渲染
        onRowDragStart={(params) => {
          handleRowDragStart(params.row, rowIndex);
        }}
        onActionMoveStart={(data) => {
          handleInitDragLine(data);
          return onActionMoveStart && onActionMoveStart(data);
        }}
        onActionResizeStart={(data) => {
          handleInitDragLine(data);

          return onActionResizeStart && onActionResizeStart(data);
        }}
        onActionMoving={(data) => {
          handleUpdateDragLine(data);
          return onActionMoving && onActionMoving(data);
        }}
        onActionResizing={(data) => {
          handleUpdateDragLine(data);
          return onActionResizing && onActionResizing(data);
        }}
        onActionResizeEnd={(data) => {
          disposeDragLine();
          return onActionResizeEnd && onActionResizeEnd(data);
        }}
        onActionMoveEnd={(data) => {
          disposeDragLine();
          return onActionMoveEnd && onActionMoveEnd(data);
        }}
      />
    );
  };

  useLayoutEffect(() => {
    gridRef.current?.scrollToPosition({ scrollTop, scrollLeft });
  }, [scrollTop, scrollLeft]);

  useEffect(() => {
    gridRef.current?.recomputeGridSize();
  }, [editorData]);

  return (
    <div ref={editAreaRef} className={prefix('edit-area')}>
      <AutoSizer>
        {({ width, height }) => {
          // 获取全部高度
          let totalHeight = 0;
          // 高度列表
          const heights = editorData.map((row) => {
            const itemHeight = row.rowHeight || rowHeight;
            totalHeight += itemHeight;
            return itemHeight;
          });
          if (totalHeight < height) {
            heights.push(height - totalHeight);
            if (heightRef.current !== height && heightRef.current >= 0) {
              setTimeout(() =>
                gridRef.current?.recomputeGridSize({
                  rowIndex: heights.length - 1,
                }),
              );
            }
          }
          heightRef.current = height;

          return (
            <>
              <Grid
                columnCount={1}
                rowCount={heights.length}
                ref={gridRef}
                cellRenderer={cellRenderer}
                columnWidth={Math.max(scaleCount * scaleWidth + startLeft, width)}
                width={width}
                height={height}
                rowHeight={({ index }) => heights[index] || rowHeight}
                overscanRowCount={10}
                overscanColumnCount={0}
                onScroll={(param) => {
                  onScroll(param);
                }}
              />
              {/* 插入线指示器 */}
              {dragState.insertionLine.visible && (
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
                    top:
                      dragState.insertionLine.position === 'top'
                        ? (() => {
                            let top = 0;
                            for (let i = 0; i < dragState.insertionLine.index; i++) {
                              top += editorData[i]?.rowHeight || rowHeight;
                            }
                            return top;
                          })()
                        : (() => {
                            let top = 0;
                            for (let i = 0; i <= dragState.insertionLine.index; i++) {
                              top += editorData[i]?.rowHeight || rowHeight;
                            }
                            return top - 2;
                          })(),
                  }}
                />
              )}
              {/* 拖拽预览元素 */}
              {dragState.dragPreview.visible && (
                <div
                  className={prefix('edit-area-drag-preview')}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: dragState.dragPreview.top,
                    height: dragState.dragPreview.height,
                    background: 'rgba(74, 144, 226, 0.3)',
                    border: '2px dashed #4a90e2',
                    borderRadius: '4px',
                    zIndex: 1001,
                    pointerEvents: 'none',
                    opacity: 0.8,
                    transition: 'top 0.1s ease',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 16px',
                      color: '#4a90e2',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    拖拽中...
                  </div>
                </div>
              )}
            </>
          );
        }}
      </AutoSizer>
      {dragLine && <DragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </div>
  );
});
