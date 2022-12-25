export class TaskQueue {
  queue: (() => Promise<void>)[] = [];
  isStarted = false;

  append(task: () => Promise<void>): void {
    this.queue.push(task);
    if( !this.isStarted ){
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
        await p();
      } catch(ex) {
        console.error(ex);
      }
    }
  }

  clear(): void {
    this.queue = [];
  }
}
