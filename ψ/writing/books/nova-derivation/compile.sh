#!/bin/bash
set -e

echo "Compiling Markdown to Typst using Pandoc..."
pandoc /tmp/book-zwsp.md -o book-typst.typ -t typst

echo "Performing cleanups on Typst file..."
# Standard cleanup for pandoc horizontal rules to line rules
sed -i 's/#horizontalrule/#line(length: 100%)/g' book-typst.typ || true

echo "Combining layout config and document content..."
cat book.typ book-typst.typ > book-full.typ

echo "Running Typst compiler to generate PDF..."
typst compile book-full.typ The_Nova_Derivation.pdf

echo "PDF Generation Successful: The_Nova_Derivation.pdf"
