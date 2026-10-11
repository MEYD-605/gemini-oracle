# Arra search/learn smoke notes

Use this as the quick verification pattern for Oracle memory work.

## Smoke-test sequence
1. Call `arra_learn` with a compact, specific pattern and concepts.
2. Capture the returned file path / id from the tool result.
3. Verify with `arra_read` using the **file path** returned by `arra_learn`.
4. Use `arra_search` for recall, but expect hybrid/vector ranking to surface conceptually close items before the newest write.

## Query tips
- Prefer 2–4 distinctive tokens.
- Use quotes for exact phrases: `"broken ~/.local/bin/hermes symlink"`.
- Use `OR` to widen recall when needed.
- If the exact new item does not rank first, that is usually a ranking issue, not a write failure.

## Good verification rule
- A successful learn is proven by `arra_read` on the emitted file path.
- A successful search is proven by receiving semantically related results, even if exact-match ranking is not first.
