# Discord Response Formatting Guidelines (P'Nat Standard / discord-render)

When formatting messages for Discord (especially for Bo DMs or public channels):

1. **Anti-Wrapping (<65 Chars per Line inside Codeblocks)**:
   - Discord Mobile wraps long codeblock lines tightly, turning tables into illegible messes.
   - Limit codeblock line lengths to 65 characters maximum.

2. **No Box-Drawing Borders**:
   - Avoid Unicode box-drawing characters (`┌`, `┐`, `║`, `═`, `┼`) or trailing vertical pipes (`|`).
   - Use clean Markdown lists (`-`, `*`, `1.`) and bold headers (`**Header**`) instead.

3. **Message Length Cap (<2,000 Chars)**:
   - Ensure the total payload fits within Discord's 2,000 character limit to deliver as a single cohesive message.

4. **Visual Proofs & Terminal Captures**:
   - When Bo asks for proof ("ขอภาพหน้าจอ / ขอหลักฐาน"), capture tmux panes directly or render clean terminal screenshots (`/tmp/terminal_view.html` -> screenshot) rather than pasting raw unformatted dumps.

5. **2-Way Maw-Hey & Remote 9Router Validation (2026-07-28)**:
   - Remote 9Router calls (e.g. from Note20 or machine `black`) require `providers.9router.api_key` in `config.yaml` to prevent HTTP 401 errors.
   - `custom_providers` must strictly follow YAML list format (`- name: 9router`).
