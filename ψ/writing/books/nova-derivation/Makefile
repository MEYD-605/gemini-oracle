# Makefile for building 'The Nova Derivation' book

.PHONY: all clean wordbreak pdf

all: pdf

wordbreak:
	@echo "Running Thai word segmentation on all chapters..."
	rm -f /tmp/book-zwsp.md
	for f in 00-frontmatter.md 01-chapter-one.md 02-chapter-two.md 03-chapter-three.md 04-chapter-four.md 05-chapter-five.md 06-chapter-six.md 07-chapter-seven.md; do \
		python3 thai-wordbreak.py $$f >> /tmp/book-zwsp.md; \
		echo "" >> /tmp/book-zwsp.md; \
		echo "---" >> /tmp/book-zwsp.md; \
		echo "" >> /tmp/book-zwsp.md; \
	done

pdf: wordbreak
	@echo "Compiling Markdown to Typst..."
	pandoc /tmp/book-zwsp.md -o book-typst.typ -t typst
	sed -i 's/#horizontalrule/#line(length: 100%)/g' book-typst.typ || true
	cat book.typ book-typst.typ > book-full.typ
	@echo "Compiling Typst to PDF..."
	typst compile book-full.typ The_Nova_Derivation.pdf
	@echo "Done! The_Nova_Derivation.pdf generated successfully."

clean:
	rm -f book-typst.typ book-full.typ The_Nova_Derivation.pdf /tmp/book-zwsp.md
