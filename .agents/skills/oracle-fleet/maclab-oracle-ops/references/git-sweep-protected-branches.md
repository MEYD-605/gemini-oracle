# Git Sweep & Protected Branch Safety (maclab)

## Overview
`git-sweep-maclab.sh` is a cron job running every 3 hours on `maclab`.

## Behavior & Safety Design
- Scans repositories across `maclab`.
- If `ahead > 0` on protected branches (e.g. `main` or `mainn`), it explicitly reports `held local` and skips pushing automatically.
- Other non-protected feature branches are pushed automatically.
- This is an intentional safety guard to prevent autonomous bots from blindly pushing commits to primary branches without manual review.

## Operator Action
- When repositories (such as `cartographer-oracle`) report `ahead 100+ commits` on `main`/`mainn` or protected branches, recognize that `git-sweep` is operating as designed.
- Do not attempt to force push or bypass the guard automatically; notify the seat owner or human operator so they can review and push when appropriate.
