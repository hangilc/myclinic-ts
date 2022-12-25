export class TaskQueue {
  queue: Promise<any>[] = [];
  isStarted = false;

  append(promise: Promise<any>): void {
    this.queue.push(promise);
    if( this.isStarted ){
      this.start();
    }
  }

  async start() {
    this.isStarted = true;
    while(true){
      const p = this.queue.shift();
      if( p == undefined ){
        break;
      }
      try {
        await p;
      } catch(ex) {
        console.error(ex);
      }
    }
  }

  clear(): void {
    this.queue = [];
  }
}
