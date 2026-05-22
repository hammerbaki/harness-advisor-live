#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$PROJECT_DIR/arxiv_submit"
ZIP_NAME="arxiv_submit.zip"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Copy only source files needed for arXiv
rsync -av \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='.vscode' \
  --exclude='arxiv_submit' \
  --exclude='*.aux' \
  --exclude='*.bbl' \
  --exclude='*.bcf' \
  --exclude='*.blg' \
  --exclude='*.fdb_latexmk' \
  --exclude='*.fls' \
  --exclude='*.log' \
  --exclude='*.out' \
  --exclude='*.pdf' \
  --exclude='*.run.xml' \
  --exclude='*.synctex.gz' \
  --exclude='*.toc' \
  --exclude='.DS_Store' \
  "$PROJECT_DIR/" "$OUT_DIR/"

cd "$OUT_DIR/.."
rm -f "$ZIP_NAME"
zip -r "$ZIP_NAME" "$(basename "$OUT_DIR")" >/dev/null

echo "Created: $PROJECT_DIR/$ZIP_NAME"
