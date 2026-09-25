MAIN := main
# The cover letter is built separately (make letter), never by make/all, so
# CI only builds the CV. It shares preamble.tex with the CV.
LETTER := letter
TARGETS := $(MAIN) $(LETTER)

TARGETS_PATTERN := ($(shell echo $(TARGETS) | sed 's/ /|/g'))
DEPENDENCIES := $(shell find . -type f | grep -v -E "/$(TARGETS_PATTERN)\." | grep -v -E "\.gitignore|pdflatex2041000\.fls|\.DS_Store|\*~")
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
ROOT_DIR :=  $(abspath $(MAKEFILE_DIR)/../../)
LATEXINDENT_FILE := $(MAKEFILE_DIR)/latexindent.yaml

# Vendored packages: search paths and $(LATEXMK_PRETEX).
include $(MAKEFILE_DIR)dependencies/deps.mk

.PHONY: all clean format clean-latexindent

# Main PDF compilation rules
all: $(MAIN).pdf

$(TARGETS) : % : %.pdf

$(TARGETS:=.pdf) : %.pdf : %.tex $(DEPENDENCIES)
	latexmk -pdf -shell-escape $(LATEXMK_PRETEX) $< -synctex=1 -file-line-error -interaction=nonstopmode -halt-on-error -logfilewarninglist

$(TARGETS:=-auto) : %-auto : %.tex $(DEPENDENCIES)
	latexmk -pdf $(LATEXMK_PRETEX) $< -synctex=1 -file-line-error -interaction=nonstopmode -halt-on-error -logfilewarninglist -pvc

# Clean rule(s)
clean: clean-latexindent
	latexmk -C $(TARGETS:=.tex)
	rm -rf $(TARGETS:%=_minted-%)
	rm -f $(TARGETS:=.bbl)

clean-latexindent:
	rm -f *.bak*

# Formatting rule(s)
format:
	latexindent -l $(LATEXINDENT_FILE) -w -m -s ./*.tex
	$(MAKE) clean-latexindent
