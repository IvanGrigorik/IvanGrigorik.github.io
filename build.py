#!/usr/bin/env python3
"""Assembles index.html and cv.html from the files in partials/.

The main site is a single scrolling page, but its markup is split into one file
per section for easier editing. Run this script after changing anything in
partials/ to regenerate both pages:

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


def page(title, description, og_description, body, scripts):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script src="assets/js/theme-init.js"></script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{og_description}">
<meta property="og:type" content="website">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/style.css">
</head>
<body>

{body}

{read("footer.html")}

{scripts}
</body>
</html>
"""


def main():
    nav = read("nav.html")
    sections = "\n\n".join(indent(read(name)) for name in SECTIONS)

    index = page(
        title="Ivan Grigorik",
        description="Ivan Grigorik - PhD student in Electrical and Computer Engineering, The University of Texas at Austin. Research in compilers, software testing, and programming languages.",
        og_description="PhD student in Electrical and Computer Engineering, The University of Texas at Austin.",
        body=f'{nav}\n\n<main id="top">\n{sections}\n</main>',
        scripts='<script src="assets/js/main.js"></script>',
    )
    (ROOT / "index.html").write_text(index)
    print("Wrote index.html")

    # The CV page is a PDF viewer for materials/CV_IvanGrigorik.pdf, which CI
    # builds from latex/cv/ (see .github/workflows/deploy.yml).
    cv = page(
        title="CV - Ivan Grigorik",
        description="Curriculum vitae of Ivan Grigorik, PhD student in Electrical and Computer Engineering, The University of Texas at Austin.",
        og_description="Curriculum vitae of Ivan Grigorik.",
        body=read("cv.html"),
        scripts='<script src="assets/js/main.js"></script>\n'
                '<script src="assets/js/pdf-viewer.js"></script>',
    )
    (ROOT / "cv.html").write_text(cv)
    print("Wrote cv.html")


if __name__ == "__main__":
    main()
