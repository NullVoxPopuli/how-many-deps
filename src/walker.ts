import { dirname } from "node:path";

import resolvePackagePath from "resolve-package-path";

import ora from "ora";

import { readJSONSync } from "./fs.ts";

export class Walker {
  private packageResolveCache = {
    PATH: new Map(),
    RESOLVED_PACKAGE_PATH: new Map(),
    REAL_FILE_PATH: new Map(),
    REAL_DIRECTORY_PATH: new Map(),
  };

  private seen = new Map<string, string>();

  edges = 0;
  get count() {
    return this.seen.size;
  }

  spinner: any;

  scan() {
    this.spinner = ora("Starting scan");

    this.spinner.start();
    this.traverse("package.json");
    this.spinner.stop();
  }

  /**
   * Unused -- might be worth figuring out a way to enable if giant monorepos take too long
   * to scan
   */
  updateSpinner() {
    this.spinner.text = `Scanned ${this.seen.size} dependencies through ${this.edges} edges`;
  }

  traverse(packageJSONPath: string): string {
    let version = this.seen.get(packageJSONPath);
    if (version) {
      return version;
    }

    let pkg = readJSONSync(packageJSONPath);
    this.seen.set(packageJSONPath, pkg.version);

    let root = dirname(packageJSONPath);

    this.checkSection("dependencies", pkg, root);
    this.checkSection("peerDependencies", pkg, root);
    this.checkSection("devDependencies", pkg, root);

    return pkg.version;
  }

  private checkSection(
    section: "dependencies" | "devDependencies" | "peerDependencies",
    pkg: any,
    packageRoot: string,
  ): void {
    let dependencies = pkg[section];
    if (!dependencies) {
      return;
    }
    for (let name of Object.keys(dependencies)) {
      this.checkDep(packageRoot, name);
      this.edges++;
    }
  }

  private checkDep(packageRoot: string, pkgName: string): string | false {
    let target = resolvePackagePath(
      pkgName,
      packageRoot,
      this.packageResolveCache,
    );
    if (!target) {
      return false;
    }
    return this.traverse(target);
  }
}
