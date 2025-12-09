import React, { FC, useEffect, useRef, useState } from 'react';
import { ScrollSync } from 'react-virtualized';
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime, parserTimeToPixel } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { RowRndApi } from '../row_rnd/row_rnd_interface';
import './cursor.less';

/** 动画时间轴组件参数 */
export type CursorProps = CommonProp & {
  /** 距离左侧滚动距离 */
  scrollLeft: number;
  /** 设置光标位置 */
  setCursor: (param: { left?: number; time?: number }) => boolean;
  /** 时间轴区域dom ref */
  areaRef: React.MutableRefObject<HTMLDivElement>;
  /** 设置scroll left */
  deltaScrollLeft: (delta: number) => void;
  /** 滚动同步ref（TODO: 该数据用于临时解决scrollLeft拖住时不同步问题） */
  scrollSync: React.MutableRefObject<ScrollSync>;
};

export const Cursor: FC<CursorProps> = ({
  disableDrag,
  cursorTime,
  setCursor,
  startLeft,
  timelineWidth,
  scaleWidth,
  scale,
  scrollLeft,
  scrollSync,
  areaRef,
  maxScaleCount,
  cursorMaxTime,
  deltaScrollLeft,
  onCursorDragStart,
  onCursorDrag,
  onCursorDragEnd,
}) => {
  const rowRnd = useRef<RowRndApi>();
  const draggingLeft = useRef<undefined | number>();
  const getMaxCursorLeft = (currentScrollLeft: number) => {
    if (typeof cursorMaxTime !== 'number' || !Number.isFinite(cursorMaxTime)) return Infinity;
    return parserTimeToPixel(cursorMaxTime, { startLeft, scaleWidth, scale }) - currentScrollLeft;
  };

  useEffect(() => {
    if (typeof draggingLeft.current === 'undefined') {
      // 非dragging时，根据穿参更新cursor刻度
      rowRnd.current.updateLeft(parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - scrollLeft);
    }
  }, [cursorTime, startLeft, scaleWidth, scale, scrollLeft]);

  const maxCursorLeft = getMaxCursorLeft(scrollLeft);

  return (
    <RowDnd
      start={startLeft}
      ref={rowRnd}
      parentRef={areaRef}
      bounds={{
        left: 0,
        right: Math.min(timelineWidth, maxScaleCount * scaleWidth + startLeft - scrollLeft, maxCursorLeft),
      }}
      deltaScrollLeft={deltaScrollLeft}
      enableDragging={!disableDrag}
      enableResizing={false}
      onDragStart={() => {
        onCursorDragStart && onCursorDragStart(cursorTime);
        const currentScrollLeft = scrollSync.current.state.scrollLeft;
        const currentMaxLeft = getMaxCursorLeft(currentScrollLeft);
        const currentLeft = parserTimeToPixel(cursorTime, { startLeft, scaleWidth, scale }) - currentScrollLeft;
        draggingLeft.current = Math.min(currentLeft, currentMaxLeft);
        rowRnd.current.updateLeft(draggingLeft.current);
      }}
      onDragEnd={() => {
        const currentScrollLeft = scrollSync.current.state.scrollLeft;
        const currentMaxLeft = getMaxCursorLeft(currentScrollLeft);
        if (Number.isFinite(currentMaxLeft)) {
          draggingLeft.current = Math.min(draggingLeft.current, currentMaxLeft);
          rowRnd.current.updateLeft(draggingLeft.current);
        }
        const time = parserPixelToTime(draggingLeft.current + currentScrollLeft, { startLeft, scale, scaleWidth });
        setCursor({ time });
        onCursorDragEnd && onCursorDragEnd(time);
        draggingLeft.current = undefined;
      }}
      onDrag={({ left }, scroll = 0) => {
        const currentScrollLeft = scrollSync.current.state.scrollLeft;
        const currentMaxLeft = getMaxCursorLeft(currentScrollLeft);

        if (!scroll || currentScrollLeft === 0) {
          // 拖拽时，如果当前left < left min，将数值设置为 left min
          if (left < startLeft - currentScrollLeft) draggingLeft.current = startLeft - currentScrollLeft;
          else draggingLeft.current = left;
        } else {
          // 自动滚动时，如果当前left < left min，将数值设置为 left min
          if (draggingLeft.current < startLeft - currentScrollLeft - scroll) {
            draggingLeft.current = startLeft - currentScrollLeft - scroll;
          }
        }
        if (Number.isFinite(currentMaxLeft)) draggingLeft.current = Math.min(draggingLeft.current, currentMaxLeft);
        rowRnd.current.updateLeft(draggingLeft.current);
        const time = parserPixelToTime(draggingLeft.current + currentScrollLeft, { startLeft, scale, scaleWidth });
        setCursor({ time });
        onCursorDrag && onCursorDrag(time);
        return false;
      }}
    >
      <div className={prefix('cursor')}>
        <svg className={prefix('cursor-top')} width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path
            d="M0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1V9.38197C8 9.76074 7.786 10.107 7.44721 10.2764L4.44721 11.7764C4.16569 11.9172 3.83431 11.9172 3.55279 11.7764L0.552786 10.2764C0.214002 10.107 0 9.76074 0 9.38197V1Z"
            fill="#5297FF"
          />
        </svg>
        <div className={prefix('cursor-area')} />
      </div>
    </RowDnd>
  );
};
