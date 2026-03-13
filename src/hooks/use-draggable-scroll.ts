import { useRef, MouseEvent } from 'react';

export function useDraggableScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);

  const onMouseDown = (e: MouseEvent<T>) => {
    isDown.current = true;
    isDragging.current = false;
    startX.current = e.pageX - ref.current!.offsetLeft;
    scrollLeft.current = ref.current!.scrollLeft;
  };

  const onMouseLeave = () => {
    isDown.current = false;
  };

  const onMouseUp = () => {
    isDown.current = false;
  };

  const onMouseMove = (e: MouseEvent<T>) => {
    if (!isDown.current || !ref.current) return;
    
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX.current); 
    
    if (Math.abs(x - startX.current) > 5) {
      isDragging.current = true;
    }

    if (isDragging.current) {
      e.preventDefault();
      ref.current.scrollLeft = scrollLeft.current - walk;
    }
  };

  const onClickCapture = (e: MouseEvent<T>) => {
    if (isDragging.current) {
      e.stopPropagation(); 
      e.preventDefault();  
      isDragging.current = false; 
    }
  };

  return { 
    ref, 
    onMouseDown, 
    onMouseLeave, 
    onMouseUp, 
    onMouseMove, 
    onClickCapture 
  };
}