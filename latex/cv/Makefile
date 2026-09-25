MAIN := main
CV_PDF := CV_IvanGrigorik.pdf
# The cover letter is built separately (make letter), never by make/all, so
# CI only builds the CV. It shares preamble.tex with the CV.
LETTER := letter
TARGETS := $(MAIN) $(LETTER)

TARGETS_PATTERN := ($(shell echo $(TARGETS) | sed 's/ /|/g'))
DEPENDENCIES := $(shell find . -type f | grep -v -E "/$(TARGETS_PATTERN)\." | grep -v -E "\.gitignore|pdflatex2041000\.fls|\.DS_Store|\*~|$(CV_PDF)")
MAKEFILE_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
ROOT_DIR :=  $(abspath $(MAKEFILE_DIR)/../../)
LATEXINDENT_FILE := $(MAKEFILE_DIR)/latexindent.yaml

# Vendored packages: search paths and $(LATEXMK_PRETEX).
include $(MAKEFILE_DIR)dependencies/deps.mk

.PHONY: all clean format clean-latexindent

# Main PDF compilation rules
all: $(CV_PDF)

$(TARGETS) : % : %.pdf
$(MAIN): $(CV_PDF)

$(TARGETS:=.pdf) : %.pdf : %.tex $(DEPENDENCIES)
	latexmk -pdf -shell-escape $(LATEXMK_PRETEX) $< -synctex=1 -file-line-error -interaction=nonstopmode -halt-on-error -logfilewarninglist

$(CV_PDF): $(MAIN).pdf
	cp $< $@

# latexmk -pvc never exits, so copy from its per-build success hook instead.
$(MAIN)-auto: AUTO_OPTS = -e '$$success_cmd = "cp %D $(CV_PDF)"'

$(TARGETS:=-auto) : %-auto : %.tex $(DEPENDENCIES)
	latexmk -pdf $(LATEXMK_PRETEX) $(AUTO_OPTS) $< -synctex=1 -file-line-error -interaction=nonstopmode -halt-on-error -logfilewarninglist -pvc

# Clean rule(s)
clean: clean-latexindent
	latexmk -C $(TARGETS:=.tex)
	rm -rf $(TARGETS:%=_minted-%)
	rm -f $(TARGETS:=.bbl) $(CV_PDF)

clean-latexindent:
	rm -f *.bak*

# Formatting rule(s)
format:
	latexindent -l $(LATEXINDENT_FILE) -w -m -s ./*.tex
	$(MAKE) clean-latexindent
