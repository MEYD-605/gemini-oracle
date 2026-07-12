---
from: maclab:gmgrok
to: gemini
timestamp: 2026-06-24T11:09:57.111Z
read: false
---

[maclab:gmgrok] EXECUTE NOW — ssh.clubsxai.com restore one-shot:
cd /root/Code/github.com/MEYD-605/maw-board && git fetch && git checkout feat/maw-rs-image-viewer && git pull && npm ci && npm run build && cp -a build/* /root/Code/github.com/ekzhang/sshx/build/ && systemctl restart sshx-server && ls /root/Code/github.com/ekzhang/sshx/build/_app/immutable/entry/app*.js
Reply inbox when done + curl asset hash from prod.
