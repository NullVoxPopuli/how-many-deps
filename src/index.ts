#!/usr/bin/env node

import { Walker } from "./walker.ts";

let walker = new Walker();

await walker.scan();

let { repos, count } = walker;

console.log(`
  You have:
    ${count} dependencies!
      (both direct and indirect across ${repos} ${repos > 1 ? 'repos' : 'repo'})
`);
