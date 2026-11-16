# Frontend architecture refactor baseline

Recorded on 2026-11-16 before source migration.

- Branch: `main`; initial worktree clean.
- `git pull --ff-only origin main`: already up to date.
- Commit: `d9f6763b9c067fb599366f6d540655298bd1cd97`.
- Local backup tag: `backup/frontend-refactor-20261116`.
- No commit or push performed.

| Check | Result |
| --- | --- |
| `npm.cmd run typecheck --prefix apps/web` | PASS |
| `npm.cmd run lint --prefix apps/web` | PASS, no warnings or errors |
| `npm.cmd test` | PASS, runner reports 5 frontend suites and 37 assertions |
| `npm.cmd run build --prefix apps/web` | PASS, 89 static pages generated |

Baseline warnings: Google Fonts stylesheet download failed during build; font optimization was skipped. Node emitted experimental type-stripping and missing module-type warnings during regression tests. No source fixes were made for these warnings.

The initial PowerShell npm wrapper emitted a permissions warning; the completed checks above used npm.cmd. The interrupted wrapper run was stopped before the completed production build.

Browser appearance and interactive flows have not been checked. Backend, database, deployment configuration, and production were not changed.

Migration is awaiting the approved file-by-file manifest: no matching manifest was found in repository searches or the memory registry. No source files have been moved.
