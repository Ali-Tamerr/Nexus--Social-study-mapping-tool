import { DrawnShape } from '@/types/knowledge';

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

export interface ShapeBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export function getShapeBounds(shape: DrawnShape): ShapeBounds | null {
  if (shape.points.length === 0) return null;

  const xs = shape.points.map(p => p.x);
  const ys = shape.points.map(p => p.y);
  
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getResizeHandlePosition(
  bounds: ShapeBounds,
  handle: ResizeHandle
): { x: number; y: number } {
  const { minX, minY, maxX, maxY, width, height } = bounds;
  
  switch (handle) {
    case 'nw': return { x: minX, y: minY };
    case 'ne': return { x: maxX, y: minY };
    case 'sw': return { x: minX, y: maxY };
    case 'se': return { x: maxX, y: maxY };
    case 'n': return { x: minX + width / 2, y: minY };
    case 's': return { x: minX + width / 2, y: maxY };
    case 'e': return { x: maxX, y: minY + height / 2 };
    case 'w': return { x: minX, y: minY + height / 2 };
  }
}

export function drawResizeHandles(
  ctx: CanvasRenderingContext2D,
  bounds: ShapeBounds,
  globalScale: number
) {
  const handleSize = 8 / globalScale;
  const handles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
  
  ctx.fillStyle = '#3B82F6';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5 / globalScale;
  
  handles.forEach(handle => {
    const pos = getResizeHandlePosition(bounds, handle);
    ctx.beginPath();
    ctx.rect(
      pos.x - handleSize / 2,
      pos.y - handleSize / 2,
      handleSize,
      handleSize
    );
    ctx.fill();
    ctx.stroke();
  });
}

export function getHandleAtPoint(
  point: { x: number; y: number },
  bounds: ShapeBounds,
  globalScale: number
): ResizeHandle | null {
  const handleSize = 8 / globalScale;
  const handles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
  
  for (const handle of handles) {
    const pos = getResizeHandlePosition(bounds, handle);
    const dx = point.x - pos.x;
    const dy = point.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= handleSize) {
      return handle;
    }
  }
  
  return null;
}

export function resizeShape(
  shape: DrawnShape,
  handle: ResizeHandle,
  currentPoint: { x: number; y: number },
  startPoint: { x: number; y: number },
  startBounds: ShapeBounds
): DrawnShape {
  const dx = currentPoint.x - startPoint.x;
  const dy = currentPoint.y - startPoint.y;
  
  let newMinX = startBounds.minX;
  let newMinY = startBounds.minY;
  let newMaxX = startBounds.maxX;
  let newMaxY = startBounds.maxY;
  
  switch (handle) {
    case 'se':
      newMaxX = startBounds.maxX + dx;
      newMaxY = startBounds.maxY + dy;
      break;
    case 'sw':
      newMinX = startBounds.minX + dx;
      newMaxY = startBounds.maxY + dy;
      break;
    case 'ne':
      newMaxX = startBounds.maxX + dx;
      newMinY = startBounds.minY + dy;
      break;
    case 'nw':
      newMinX = startBounds.minX + dx;
      newMinY = startBounds.minY + dy;
      break;
    case 'e':
      newMaxX = startBounds.maxX + dx;
      break;
    case 'w':
      newMinX = startBounds.minX + dx;
      break;
    case 's':
      newMaxY = startBounds.maxY + dy;
      break;
    case 'n':
      newMinY = startBounds.minY + dy;
      break;
  }
  
  const MIN_SIZE = 20;
  if (newMaxX - newMinX < MIN_SIZE) {
    if (handle.includes('e')) {
      newMaxX = newMinX + MIN_SIZE;
    } else if (handle.includes('w')) {
      newMinX = newMaxX - MIN_SIZE;
    }
  }
  
  if (newMaxY - newMinY < MIN_SIZE) {
    if (handle.includes('s')) {
      newMaxY = newMinY + MIN_SIZE;
    } else if (handle.includes('n')) {
      newMinY = newMaxY - MIN_SIZE;
    }
  }
  
  const newPoints = shape.points.map(p => {
    const relX = startBounds.width > 0 ? (p.x - startBounds.minX) / startBounds.width : 0.5;
    const relY = startBounds.height > 0 ? (p.y - startBounds.minY) / startBounds.height : 0.5;
    return {
      x: newMinX + relX * (newMaxX - newMinX),
      y: newMinY + relY * (newMaxY - newMinY),
    };
  });
  
  return {
    ...shape,
    points: newPoints,
  };
}

export function getCursorForHandle(handle: ResizeHandle | null): string {
  if (!handle) return 'default';
  
  switch (handle) {
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    default:
      return 'default';
  }
}
