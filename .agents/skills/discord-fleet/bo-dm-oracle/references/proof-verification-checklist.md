# Proof Verification & Cross-Node Truth Audit Checklist

## Protocol for Proof Demands ("ขอหลักฐานด้วย" / "คุยกันได้หรือยัง")

When Bo asks for proof of cross-node communication or agent responsiveness:

1. **Do NOT rely on API exit codes alone**: An `exit 0` or HTTP 200 from a relay tool (`maw hey`) does NOT prove the remote agent actually saw or processed the message.

2. **Direct Pane Injection & Verification**:
   - Execute direct payload delivery to the target session pane:
     ```bash
     maw run <target_session> "<message>"
     ```
   - Capture the live pane output to prove delivery:
     ```bash
     ssh -p <port> <user>@<ip> "tmux capture-pane -pt <target_session> -p" | tail -n 20
     ```

3. **Truth Audit & Failure Detection**:
   - Always verify live ports with `curl -m 3 http://<ip>:<port>/api/identity` or `maw probe`.
   - On Android/Termux (`note20`), background processes without a persistent shell or `loginctl enable-linger` will be killed by Android Kernel upon SSH disconnect (signal 9/15). Report this technical reality directly without fake "success" claims.

4. **Evidence Report Structure**:
   - Action executed with exact command.
   - Captured raw log showing the message present inside the target Tmux pane.
   - Status confirmation in polite, natural Thai.
