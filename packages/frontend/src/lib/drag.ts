export function dragStart(trigger: HTMLElement, e: HTMLElement): void {
  let isDragging: boolean = false;
  let pointerId = 0;

  trigger.style.cursor = "grab";

  trigger.addEventListener("pointerdown", (event) => {
    isDragging = true;
    pointerId = event.pointerId;
    trigger.setPointerCapture(pointerId);
    console.log("pointerdown");
  });

  trigger.addEventListener("mouseup", (event) => {
    isDragging = false;
    release();
    if( isInvisible(e) ){
      e.style.left = "10px";
      e.style.top = "10px";
    }
    console.log("pointerup");
  })

  trigger.addEventListener("pointermove", (event) => {
    if( isDragging ){
      let deltaX = event.movementX;
      let deltaY = event.movementY;
      const rect = e.getBoundingClientRect();
      e.style.left = rect.x + deltaX + "px";
      e.style.top = rect.y + deltaY + "px";
    } else {
      if( pointerId !== 0 ){
        release();
      }
    }
  });

  function release() {
    trigger.releasePointerCapture(pointerId);
    pointerId = 0;
  }
}

function isInvisible(e: HTMLElement): boolean {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  const r = e.getBoundingClientRect();
  return r.right <= 0 || r.left >= w || r.top >= h || r.bottom <= 0;
}