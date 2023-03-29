export function dragStart(trigger: HTMLElement, e: HTMLElement): void {
  let pointerId = 0;

  trigger.style.cursor = "grab";

  trigger.addEventListener("pointerdown", (event) => {
    pointerId = event.pointerId;
    trigger.setPointerCapture(pointerId);
    console.log("pointerdown");
  });

  trigger.addEventListener("mouseup", (event) => {
    release();
    if( isInvisible(e) ){
      e.style.left = "10px";
      e.style.top = "10px";
    }
    console.log("pointerup");
  })

  trigger.addEventListener("pointermove", (event) => {
    if( trigger.hasPointerCapture(pointerId) ){
      let deltaX = event.movementX;
      let deltaY = event.movementY;
      const rect = trigger.getBoundingClientRect();
      const left = rect.x + deltaX;
      const top = rect.y + deltaY;
      const dw = document.documentElement.clientWidth;
      const dh = document.documentElement.clientHeight;
      if( left >= 0 && left + rect.width <= dw && top >= 0 && top + rect.height <= dh ){
        const r = e.getBoundingClientRect();
        e.style.left = r.x + deltaX + "px";
        e.style.top = r.y + deltaY + "px";
      }
    } else {
      release();
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
