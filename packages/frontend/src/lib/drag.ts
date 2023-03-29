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
      const rect = e.getBoundingClientRect();
      e.style.left = rect.x + deltaX + "px";
      e.style.top = rect.y + deltaY + "px";
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