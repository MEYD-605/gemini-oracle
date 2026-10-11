# Remote Venv Symlink Breakage & Recovery Guide

## Problem Summary
When a remote host (`black`) undergoes Python updates or system-level path changes, virtual environments pointing to binary symlinks (e.g. `/usr/bin/python3.13`) break with:
`bash: /path/to/venv/bin/python: No such file or directory`

## Recovery Procedure
1. Verify system Python location:
   `ssh meyd@black "python3.12 --version || python3 --version"`
2. Re-create the virtualenv with absolute Python 3.12 binary path:
   `ssh meyd@black "rm -rf /path/to/agent/.hermes-target/venv && python3.12 -m venv /path/to/agent/.hermes-target/venv"`
3. Install `hermes-agent`:
   `ssh meyd@black "/path/to/agent/.hermes-target/venv/bin/pip install hermes-agent"`
4. Start the Gateway using a launcher script that sets `HERMES_HOME` cleanly:
   ```bash
   #!/bin/bash
   export HERMES_HOME=/path/to/agent/.hermes-target
   export PATH=/path/to/agent/.hermes-target/venv/bin:$PATH
   exec /path/to/agent/.hermes-target/venv/bin/python -m hermes_cli.main gateway run --replace
   ```
5. Verify connection in log:
   `ssh meyd@black "tail -n 25 /path/to/agent/.hermes-target/logs/gateway.log"`
   Look for `✓ discord connected` and `Connected as <BotName>`.
