#!/bin/bash

# Kickstart Agent Setup
# Usage: ./kickstart_agent.sh /path/to/new/project

if [ -z "$1" ]; then
  echo "Usage: $0 /path/to/new/project"
  exit 1
fi

TARGET_DIR="$1"
SOURCE_DIR="$(dirname "$0")"

echo "🚀 Kickstarting Agent in $TARGET_DIR..."

# 1. Create .agent directory structure
mkdir -p "$TARGET_DIR/.agent/skills"
echo "✅ Created .agent/skills"

# 2. Copy Skills
# Assuming skills are in the same folder as this script or in a standard location
# For this starter kit, we assume they are in ../../.agent/skills relative to this script's location in the current project
# but for portability, we should probably bundle them. 
# For now, let's copy from the current project's .agent/skills if available, else warn.

if [ -d "$SOURCE_DIR/../../.agent/skills" ]; then
    cp "$SOURCE_DIR/../../.agent/skills/"* "$TARGET_DIR/.agent/skills/"
    echo "✅ Copied standard skills"
else
    echo "⚠️  Could not find standard skills to copy. Please populate .agent/skills manually."
fi

# 3. Create mcp_config.json from template
if [ -f "$SOURCE_DIR/mcp_config.json.template" ]; then
    cp "$SOURCE_DIR/mcp_config.json.template" "$TARGET_DIR/.agent/mcp_config.json"
    echo "✅ Created .agent/mcp_config.json (REMEMBER TO EDIT IT WITH TOKENS!)"
else
    echo "⚠️  Could not find mcp_config.json.template."
fi

# 4. Create initial SUMMARY.md
cat <<EOF > "$TARGET_DIR/.agent/SUMMARY.md"
# Project Summary
**Last Updated:** $(date)

## Status
- Project initialized.

## Pending Tasks
- [ ] Configure mcp_config.json with correct tokens.
- [ ] Review implementation plan.
EOF
echo "✅ Created .agent/SUMMARY.md"

# 5. Add to .gitignore
if [ -f "$TARGET_DIR/.gitignore" ]; then
    if ! grep -q ".agent/SUMMARY.md" "$TARGET_DIR/.gitignore"; then
        echo "" >> "$TARGET_DIR/.gitignore"
        echo "# Agent Context" >> "$TARGET_DIR/.gitignore"
        echo ".agent/SUMMARY.md" >> "$TARGET_DIR/.gitignore"
        echo ".agent/summaries/" >> "$TARGET_DIR/.gitignore"
        echo "✅ Added agent files to .gitignore"
    else
        echo "ℹ️  Agent files already in .gitignore"
    fi
else
    echo ".agent/SUMMARY.md" > "$TARGET_DIR/.gitignore"
    echo ".agent/summaries/" >> "$TARGET_DIR/.gitignore"
    echo "✅ Created .gitignore with agent files"
fi

echo "🎉 Agent Setup Complete! Don't forget to edit .agent/mcp_config.json with your tokens."
