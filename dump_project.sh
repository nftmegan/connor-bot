#!/bin/bash

# Output file name
OUTPUT="project_context.txt"

# Clear the output file if it exists
> "$OUTPUT"

echo "Generating project dump into $OUTPUT..."

# 1. Write the Directory Structure
echo "============================================" >> "$OUTPUT"
echo "DIRECTORY STRUCTURE" >> "$OUTPUT"
echo "============================================" >> "$OUTPUT"

# Use 'tree' if available, otherwise fallback to 'find'
if command -v tree &> /dev/null; then
    # -I excludes patterns
    tree -I 'node_modules|dist|coverage|.git|.next|build' >> "$OUTPUT"
else
    find . -maxdepth 3 -not -path '*/.*' -not -path './node_modules*' -not -path './dist*' -not -path './coverage*' >> "$OUTPUT"
fi

echo "" >> "$OUTPUT"
echo "============================================" >> "$OUTPUT"
echo "FILE CONTENTS" >> "$OUTPUT"
echo "============================================" >> "$OUTPUT"

# 2. Find and read files
# Add or remove file extensions in the grep pattern as needed
find . -type f \
    -not -path '*/node_modules/*' \
    -not -path '*/dist/*' \
    -not -path '*/.git/*' \
    -not -path '*/coverage/*' \
    -not -name 'package-lock.json' \
    -not -name 'yarn.lock' \
    -not -name '.env' \
    -not -name '.DS_Store' \
    -not -name "$OUTPUT" \
    -not -name "*.png" \
    -not -name "*.ico" \
    -not -name "$0" | while read -r file; do

    echo "" >> "$OUTPUT"
    echo "--------------------------------------------------------------------------------" >> "$OUTPUT"
    echo "START FILE: $file" >> "$OUTPUT"
    echo "--------------------------------------------------------------------------------" >> "$OUTPUT"
    
    cat "$file" >> "$OUTPUT"
    
    echo "" >> "$OUTPUT"
    echo "END FILE: $file" >> "$OUTPUT"

done

echo "Done! Code and structure written to $OUTPUT"