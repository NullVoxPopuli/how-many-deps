import assert from 'node:assert';
import { getEnvironmentData, parentPort } from 'node:worker_threads';
import { Walker } from './walker.ts';


const CWD = getEnvironmentData('cwd');

assert(CWD, `Expected cwd to be passed to worker via environment data`);

function send(obj: Record<string, unknown>) {
  assert(parentPort, `This module may only be used as a worker. Expected \`parentPort\` to be defined.`);

  parentPort.postMessage(JSON.stringify(obj));
}

function announce(type: string, data?: Record<string, unknown>) {
  send({ type, ...(data ?? {}) });
}

assert(parentPort, `This module may only be used as a worker. Expected \`parentPort\` to be defined.`);


let walker: Walker;

parentPort.on('message', (event) => {
  switch (event) {
    case 'scan': {
      walker = new Walker({ send, announce });
      walker.scan();
      return;
    }
    case 'print': {

      let { repos, count, directs, indirects } = walker;

      console.log(`
  You have:
    ${count} total dependencies!
      ${directs} direct dependencies
      ${indirects} indirect dependencies

      (across ${repos} ${repos > 1 ? "projects" : "project"})
`);

      announce('exit');
      return;
    }
  }

  console.log(`Unhandled event in worker`, event);
});
