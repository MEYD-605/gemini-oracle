# Oracle House Moving & Migration Patterns (yai-ban-oracle.pdf)

> Reference guide based on Nat Weerawan's 20-chapter "ย้ายบ้าน Oracle" (July 2026).

## The 5 Ferry Layers
1. **Repo**: Codebase (`git clone` / `maw-rs-oracle`).
2. **Sessions**: Conversation history (`~/.claude/projects/<encoded-dir>/`).
3. **Memory**: Facts and notes (`MEMORY.md` + `USER.md` + learnings). Use `comm` to diff and merge memory files safely.
4. **Credentials**: Tokens, SSH keys, `gh auth` (*MUST be done manually by human*).
5. **Tooling**: Binaries & scripts (`~/.local/bin/`, `maw`).

## Unix User Isolation
- Each agent/persona receives an isolated Unix user (e.g. `phd`, `no10`, `black`).
- Setup checklist:
  ```bash
  sudo useradd -m -s /bin/bash phd
  sudo usermod -aG sudo phd
  sudo su - phd -c 'mkdir -p ~/.ssh && chmod 700 ~/.ssh'
  sudo cp ~/.ssh/authorized_keys ~phd/.ssh/
  sudo chown phd:phd ~phd/.ssh/authorized_keys
  sudo chmod 600 ~phd/.ssh/authorized_keys
  ```

## Service Persistence (Zero-Death Daemon Setup)
- **Systemd User Unit**: Define `systemd --user` units with `Restart=always` for `maw serve` or `hermes gateway`.
- **Linger Activation**: MUST execute `loginctl enable-linger <user>` so background processes survive SSH disconnects and shell reboots.
- **Cross-Node Trust & Peer Key**: Cross-node `maw hey` requires a 3-step sequence: Protocol probe -> Pubkey exchange (`~/.maw/peer-key` + `~/.maw/auth/<peer>.pub`) -> Trust authorization (`maw probe`).
- **Truth Audit Rule (Stop-Think-Verify)**: Never rely on `status: online`, green status cards, or exit 0 alone — always run live probes (`curl /api/identity`, direct tmux pane verify) to ensure background daemons survive SSH detachment.
