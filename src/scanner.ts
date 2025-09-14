import { Worker, setEnvironmentData } from 'node:worker_threads';
import ora from "ora";

setEnvironmentData('cwd', process.cwd());

const worker = new Worker(new URL('./worker.ts', import.meta.url));

let spinner: ReturnType<typeof ora>;


worker.on('message', (event) => {
  let json = JSON.parse(event);

  switch (json.type) {
    case 'scan:init': {
      spinner = ora("Starting scan");
      return;
    }
    case 'scan:start': {
      spinner.start();
      return;
    }
    case 'scan:update': {
      spinner.text = json.message;
      return;
    }
    case 'scan:stop': {
      spinner.stop();
      p.scan.resolve?.();
      return;
    }
    case 'exit': {
      p.scan.resolve?.();
      p.exit.resolve?.();
    }
  }
  console.log('unhandled message in scanner', event);
});

worker.on('error', (event) => {
  console.log('in scanner:error', event);
});
worker.on('exit', (event) => {
  console.log('in scanner:exit', event);
});

interface Deferred {
  promise: null | Promise<void>
  resolve: null | (() => void);
}

let p: Record<'scan' | 'exit', Deferred> = {
  scan: {
    promise: null,
    resolve: null,
  },
  exit: {
    promise: null,
    resolve: null,
  }
};



export async function scan() {
  if (p.scan?.promise) return p.scan.promise;

  p.scan.promise = new Promise(resolve => {
    p.scan.resolve = resolve;
    worker.postMessage('scan');
  })

  return p.scan.promise;
}

export async function printAndExit() {
  if (p.exit?.promise) return p.exit.promise;

  p.exit.promise = new Promise(resolve => {
    p.exit.resolve = resolve;
    worker.postMessage('print');
  })

  await p.exit.promise;

  process.exit(0);
}
