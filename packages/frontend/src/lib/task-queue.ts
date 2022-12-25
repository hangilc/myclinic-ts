export class TaskQueue {
  queue: (() => Promise<void>)[] = [];
  isRunning = false;

  append(task: () => Promise<void>): void {
    this.queue.push(task);
    if( !this.isRunning ){
      this.start();
    }
  }

  async start() {
    this.isRunning = true;
    while(true){
      const p = this.queue.shift();
      if( p == undefined ){
        break;
      }
      try {
        await p();
      } catch(ex) {
        console.error(ex);
      } finally {
        this.isRunning = false;
      }
    }
  }

  clear(): void {
    this.queue = [];
  }
}
