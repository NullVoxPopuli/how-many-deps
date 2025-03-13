import { Walker } from "./walker.ts";

let walker = new Walker();

walker.scan();

console.log(`
  You have:
    ${walker.count} dependencies!
      (both direct and indirect)
`);
