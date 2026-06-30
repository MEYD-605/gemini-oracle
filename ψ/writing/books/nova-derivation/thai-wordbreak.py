#!/usr/bin/env python3
"""Insert ZWSP at Thai word boundaries for proper line breaking in Typst."""
import sys, re
from pythainlp.tokenize import word_tokenize

ZWSP = "​"

def has_thai(text):
    return bool(re.search(r'[\u0e00-\u0e7f]', text))

def insert_zwsp(text):
    if not has_thai(text):
        return text
    # Preserve inline code blocks (e.g. `code`)
    parts = re.split(r'(`[^`]+`)', text)
    result = []
    for part in parts:
        if part.startswith('`'):
            result.append(part)
        elif has_thai(part):
            segments = re.split(r'([\u0e00-\u0e7f]+)', part)
            for seg in segments:
                if has_thai(seg):
                    result.append(ZWSP.join(word_tokenize(seg, engine="newmm")))
                else:
                    result.append(seg)
        else:
            result.append(part)
    return ''.join(result)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 thai-wordbreak.py <file>")
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        content = f.read()
    print(insert_zwsp(content), end="")
