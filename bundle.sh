#!/bin/bash

# Output filename
OUTPUT="project_context.txt"

# Clear the file if it exists
echo "Generating Project Bundle..."
echo "Project Context - Generated on $(date)" > "$OUTPUT"
echo "" >> "$OUTPUT"

# ==========================================
# 1. PROJECT STRUCTURE
# ==========================================
echo "==========================================" >> "$OUTPUT"
echo "PROJECT STRUCTURE" >> "$OUTPUT"
echo "==========================================" >> "$OUTPUT"

# List files but exclude junk folders
find . -maxdepth 4 -not -path '*/.*' \
    -not -path '*/node_modules*' \
    -not -path '*/dist*' \
    -not -path '*/.next*' \
    -not -path '*/coverage*' \
    >> "$OUTPUT"

echo -e "\n\n" >> "$OUTPUT"

# ==========================================
# 2. FILE CONTENTS
# ==========================================

# Helper function to append file
append_file() {
    echo "Processing: $1"
    echo "==========================================" >> "$OUTPUT"
    echo "FILE: $1" >> "$OUTPUT"
    echo "==========================================" >> "$OUTPUT"
    cat "$1" >> "$OUTPUT"
    echo -e "\n\n" >> "$OUTPUT"
}

# Find relevant source code files
# We search for: .ts, .tsx, .js, .json, .css, .yaml, .env
find . -type f \( \
    -name "*.ts" -o \
    -name "*.tsx" -o \
    -name "*.js" -o \
    -name "*.json" -o \
    -name "*.css" -o \
    -name "*.yaml" -o \
    -name ".env" \
\) \
-not -path "*/node_modules/*" \
-not -path "*/.next/*" \
-not -path "*/dist/*" \
-not -path "*/.git/*" \
-not -name "pnpm-lock.yaml" \
-not -name "$OUTPUT" \
-not -name "bundle.sh" \
| sort | while read -r file; do
    append_file "$file"
done

echo "------------------------------------------"
echo "Done! All code saved to: $OUTPUT"