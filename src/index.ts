#!/usr/bin/env node

import { scan, printAndExit } from "./scanner.ts";

async function main() {
  await scan();
  await printAndExit();
}
main();
