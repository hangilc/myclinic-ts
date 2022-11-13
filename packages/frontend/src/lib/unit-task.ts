export interface Task {
  start(): Promise<void>;
  cancel(): void;
}

export class FetchTask<T> implements Task {
  private f: () => Promise<T>;
  private handler: (result: T) => void;
  private canceled = false;

  constructor(f: () => Promise<T>, handler: (result: T) => void){
    this.f = f;
    this.handler = handler;
  }

  async start(): Promise<void> {
    if( !this.canceled ){
      const result = await this.f();
      if( !this.canceled ){
        this.handler(result);
      }
    } else {
      throw new Error("Already canceled");
    }
  }

  cancel(): void {
    this.canceled = true;
  }
}

export class TaskRunner {
  private tasks: Task[] = [];

  run(...tasks: Task[]): void {
    this.tasks.push(...tasks);
    tasks.forEach(async t => {
      try {
        await t.start();
      } catch(ex){
        console.error(ex);
      } finally {
        const i = this.tasks.indexOf(t);
        if( i >= 0 ){
          this.tasks.splice(i, 1);
        }
      }
    });
  }

  cancel(): void {
    this.tasks.forEach(t => t.cancel());
    this.tasks = [];
  }
}