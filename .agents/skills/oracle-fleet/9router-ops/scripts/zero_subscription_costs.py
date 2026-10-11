#!/usr/bin/env python3
import re
import sys

def patch_pricing(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def zero_entry(m):
        return m.group(1) + "input:0,output:0,cached:0,reasoning:0,cache_creation:0"

    total_zeroed = 0
    for pref in ("claude", "gemini", "gpt", "gcli", "ag"):
        content, count = re.subn(
            r'("%s-[a-z0-9.*_-]+":\{)((?:input|output|cached|reasoning|cache_creation):[\d.]+,?){2,6}' % pref,
            zero_entry,
            content
        )
        total_zeroed += count

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Zeroed {total_zeroed} subscription model pricing entries in {file_path}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "/usr/local/lib/node_modules/9router/app/.next-cli-build/server/chunks/6763.js"
    patch_pricing(target)
