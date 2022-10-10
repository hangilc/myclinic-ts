export interface Task {
  start(): void;
  cancel(): void;
}

class SyncTask implements Task {
  private proc: () => void;

  constructor(proc: () => void){
    this.proc = proc;
  }

  start(): void {
    this.proc();
  }

  cancel(): void {
    // nop
  }
}

class FetchTask<T> implements Task {
  private f: () => Promise<T>;
  private handler: (result: T) => void;
  private canceled = false;

  constructor(f: () => Promise<T>, handler: (result: T) => void){
    this.f = f;
    this.handler = handler;
  }

  start(): void {
    if( !this.canceled ){
      this.f().then(result => {
        if( !this.canceled ){
          this.handler(result);
        }
      }).catch(console.error);
    }
  }

  cancel(): void {
    this.canceled = true;
  }
}

class ParaTask implements Task {
  private tasks: Task[];
  private canceled = false;

  constructor(tasks: Task[]){
    this.tasks = tasks;
  }

  start(): void {
    if( !this.canceled ){
      Promise.all(this.tasks.map(t => t.start())).catch(console.error);
    }
  }

  cancel(): void {
    this.canceled = true;
    this.tasks.forEach(t => t.cancel());
  }
}

export const TaskFactory = {
  proc(f: () => void): Task {
    return new SyncTask(f);
  },

  fetch<T>(f: () => Promise<T>, handler: (result: T) => void): Task {
    return new FetchTask(f, handler);
  },

  para(tasks: Task[]): Task {
    return new ParaTask(tasks);
  }
}

export class TaskRunner {
  private tasks: Task[] = [];

  run(...tasks: Task[]): void {
    this.tasks.push(...tasks);
    tasks.forEach(t => t.start());
  }

  cancel(): void {
    this.tasks.forEach(t => t.cancel());
    this.tasks = [];
  }
}