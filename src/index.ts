#!/usr/bin/env node

import { scan, printAndExit } from './scanner.ts';

await scan();

await printAndExit();
