#!/usr/bin/env python3
"""Assembles index.html from the section files in partials/.

The site is a single scrolling page, but its markup is split into one file
per section for easier editing. Run this script after changing anything in
partials/ to regenerate index.html:

    python3 build.py
"""
import pathlib

ROOT = pathlib.Path(__file__).parent
PARTIALS = ROOT / "partials"

SECTIONS = [
    "hero.html",
    "research.html",
    "news.html",
    "publications.html",
    "experience.html",
    "service.html",
    "interests.html",
]


def read(name):
    return (PARTIALS / name).read_text().rstrip("\n")


def indent(text, spaces=2):
    pad = " " * spaces
    return "\n".join(pad + line if line else line for line in text.split("\n"))


def main():
    nav = read("nav.html")
    footer = read("footer.html")
    sections = "\n\n".join(indent(read(name)) for name in SECTIONS)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script src="assets/js/theme-init.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Ivan Grigorik</title>
<meta name="description" content="Ivan Grigorik — PhD student in Electrical and Computer Engineering, The University of Texas at Austin. Research in compilers, software testing, and programming languages.">
<meta property="og:title" content="Ivan Grigorik">
<meta property="og:description" content="PhD student in Electrical and Computer Engineering, The University of Texas at Austin.">
<meta property="og:type" content="website">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

{nav}

<main id="top">
{sections}
</main>

{footer}

<script src="assets/js/main.js"></script>
</body>
</html>
"""

    (ROOT / "index.html").write_text(html)
    print("Wrote index.html")


if __name__ == "__main__":
    main()
