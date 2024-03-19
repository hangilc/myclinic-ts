interface Queue {
  tasks: (() => Promise<void>)[];
  isRunning: boolean;
}

export function create(): Queue {
  return {
    tasks: [],
    isRunning: false,
  }
}

async function run(q: Queue) {
  if( q.isRunning ){
    return;
  } else {
    q.isRunning;
    const t = q.tasks.shift();
    if (t) {
      await t();
      q.isRunning = false;
      run(q);
    } else {
      q.isRunning = false;
    }
  }
}

export function append(q: Queue, task: () => Promise<void>) {
  q.tasks.push(task);
  run(q);
}

export function abort(q: Queue) {
  q.tasks = [];
}
