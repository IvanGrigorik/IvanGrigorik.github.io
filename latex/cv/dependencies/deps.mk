# Local-placed dependencies, included by Makefile in the `latex/cv` directory
DEPS_ROOT := $(patsubst %/,%,$(dir $(abspath $(lastword $(MAKEFILE_LIST)))))
DEPS_DIR := $(DEPS_ROOT)//
DEPS_SEARCH_VARS := TEXINPUTS TFMFONTS T1FONTS ENCFONTS VFFONTS TEXFONTMAPS \
                    OPENTYPEFONTS TTFONTS BIBINPUTS BSTINPUTS
$(foreach var,$(DEPS_SEARCH_VARS),$(eval export $(var) := $(DEPS_DIR):$($(var))))

# pdflatex only loads font maps it is told about, so load every vendored
# .map before the document starts. Pass $(LATEXMK_PRETEX) to latexmk.
DEPS_MAPS := $(notdir $(shell find $(DEPS_ROOT) -name '*.map'))
PRETEX := $(foreach map,$(DEPS_MAPS),\pdfmapfile{+$(map)})
LATEXMK_PRETEX := $(if $(PRETEX),-usepretex='$(PRETEX)')
