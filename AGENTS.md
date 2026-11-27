# Agent guidelines

## What this repo is

`@wazoo/worlds-kit` is a React component library for composing Worlds-backed
interfaces. `demo/` is a separate Vite app that consumes the built package.

## Code health

Family-wide rules live in the [wazootech workspace constitution](https://github.com/wazootech/workspace/blob/main/AGENTS.md#code-health-standards); this repo's specifics:

- Before pushing, run `bun run ci` (prettier, eslint with `--max-warnings 0`,
  `tsc` over `src/` and `tests/`, tests, build, then the `demo/` typecheck).
- `@typescript-eslint/no-explicit-any` is an error; use real types or
  `unknown`.
- `WorldsKitDataSource` methods resolve to `unknown`; callers narrow with
  `queryBindings` rather than passing a type argument.
- Actions are pinned to commit SHAs, and Node comes from `.node-version`.
- `secret-scan.yml` (gitleaks) runs on every PR; `code-health.yml` fails on a file over 120 lines of code (300 for tests);
  files that were already over it are listed there with a ceiling that only
  shrinks. A `TODO`/`FIXME` without an issue link only warns. `CODEOWNERS` assigns review.
- Publishing to JSR runs from `main` and needs approval.
