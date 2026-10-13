#!/usr/bin/env bash
# ==============================================================================
# 🚀 Sovereign Vibe Coder — 1-Click Starter Kit Installer
# Blueprint: Chapter 8 of "The Sovereign Vibe Coder" Handbook
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

CONFIG_DIR="${HOME}/.gemini/config"
CLI_DIR="${HOME}/.gemini/antigravity-cli"
VIBE_KIT_DIR="${HOME}/.gemini/vibe-kit"
AGENTS_DIR="${HOME}/.agents"

echo "======================================================================"
echo "⚡ Sovereign Vibe Coder — 1-Click Installer"
echo "   Empowering autonomous AI development with 1M context & safety gates"
echo "======================================================================"

# 1. Check Prerequisites
echo "🔍 [1/5] Checking environment prerequisites..."

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo "❌ Required command '$1' is missing. Please install it first."
        exit 1
    else
        echo "  ✓ Found $1: $(command -v "$1")"
    fi
}

check_cmd python3
check_cmd git
check_cmd curl

if ! command -v agy &>/dev/null; then
    echo "⚠️ 'agy' (Antigravity CLI) was not found in PATH."
    echo "💡 Please download the official Antigravity CLI binary from:"
    echo "   https://antigravity.google.com (or place 'agy' binary in ~/.local/bin)"
else
    echo "  ✓ Found agy: $(command -v agy)"
fi

# 2. Setup Directory Structure
echo "📁 [2/5] Creating directory structure..."
mkdir -p "${CONFIG_DIR}"
mkdir -p "${CLI_DIR}"
mkdir -p "${VIBE_KIT_DIR}/scripts"
mkdir -p "${VIBE_KIT_DIR}/config"
mkdir -p "${AGENTS_DIR}/skills"
mkdir -p "${HOME}/.local/bin"
echo "  ✓ Directories verified in ${HOME}/.gemini"

# 3. Deploy Scripts, Skills, and RTK
echo "🛡️ [3/5] Deploying Safety Gate, Progress scripts, Skills, and RTK..."
cp "${SCRIPT_DIR}/scripts/safety-gate.py" "${VIBE_KIT_DIR}/scripts/safety-gate.py"
cp "${SCRIPT_DIR}/scripts/vibe-progress.py" "${VIBE_KIT_DIR}/scripts/vibe-progress.py"
chmod +x "${VIBE_KIT_DIR}/scripts/safety-gate.py"
chmod +x "${VIBE_KIT_DIR}/scripts/vibe-progress.py"

if [ -d "${SCRIPT_DIR}/skills" ]; then
    cp -R "${SCRIPT_DIR}/skills/"* "${AGENTS_DIR}/skills/"
    echo "  ✓ Skills deployed to ${AGENTS_DIR}/skills/"
fi

if command -v rtk &>/dev/null; then
    echo "  ✓ RTK is already installed: $(command -v rtk)"
elif [ -f "${SCRIPT_DIR}/bin/rtk" ]; then
    cp "${SCRIPT_DIR}/bin/rtk" "${HOME}/.local/bin/rtk"
    chmod +x "${HOME}/.local/bin/rtk"
    echo "  ✓ RTK binary deployed to ${HOME}/.local/bin/rtk"
else
    echo "⬇️ Downloading RTK (Rust Token Killer) v0.51.0..."
    OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
    ARCH="$(uname -m)"
    RTK_URL=""
    if [ "${OS}" = "darwin" ]; then
        if [ "${ARCH}" = "arm64" ]; then
            RTK_URL="https://github.com/rtk-ai/rtk/releases/download/v0.51.0/rtk-aarch64-apple-darwin.tar.gz"
        else
            RTK_URL="https://github.com/rtk-ai/rtk/releases/download/v0.51.0/rtk-x86_64-apple-darwin.tar.gz"
        fi
    elif [ "${OS}" = "linux" ]; then
        if [ "${ARCH}" = "aarch64" ] || [ "${ARCH}" = "arm64" ]; then
            RTK_URL="https://github.com/rtk-ai/rtk/releases/download/v0.51.0/rtk-aarch64-unknown-linux-gnu.tar.gz"
        else
            RTK_URL="https://github.com/rtk-ai/rtk/releases/download/v0.51.0/rtk-x86_64-unknown-linux-musl.tar.gz"
        fi
    fi

    if [ -n "${RTK_URL}" ]; then
        TMP_DIR="$(mktemp -d)"
        if curl -fsSL "${RTK_URL}" -o "${TMP_DIR}/rtk.tar.gz"; then
            tar -xzf "${TMP_DIR}/rtk.tar.gz" -C "${TMP_DIR}"
            if [ -f "${TMP_DIR}/rtk" ]; then
                cp "${TMP_DIR}/rtk" "${HOME}/.local/bin/rtk"
                chmod +x "${HOME}/.local/bin/rtk"
                echo "  ✓ RTK downloaded and installed to ${HOME}/.local/bin/rtk"
            fi
        else
            echo "  ⚠️ Could not download pre-built RTK binary. You can build via: cargo install rtk-ai"
        fi
        rm -rf "${TMP_DIR}"
    fi
fi
echo "  ✓ Core scripts deployed successfully."

# 4. Deploy Configuration with Backup
echo "⚙️ [4/5] Deploying settings and lifecycle hooks..."

backup_and_copy() {
    local src="$1"
    local dest="$2"
    if [ -f "${dest}" ]; then
        echo "  📦 Backing up existing $(basename "${dest}") -> $(basename "${dest}").bak.${TIMESTAMP}"
        cp "${dest}" "${dest}.bak.${TIMESTAMP}"
    fi
    cp "${src}" "${dest}"
}

backup_and_copy "${SCRIPT_DIR}/config/settings.json" "${CLI_DIR}/settings.json"

# Render hooks.json with absolute paths to ensure spawn executes correctly
if [ -f "${CONFIG_DIR}/hooks.json" ]; then
    echo "  📦 Backing up existing hooks.json -> hooks.json.bak.${TIMESTAMP}"
    cp "${CONFIG_DIR}/hooks.json" "${CONFIG_DIR}/hooks.json.bak.${TIMESTAMP}"
fi
sed "s|{{SCRIPTS_DIR}}|${VIBE_KIT_DIR}/scripts|g" "${SCRIPT_DIR}/templates/hooks.json.template" > "${CONFIG_DIR}/hooks.json"
echo "  ✓ Configuration updated successfully."

# 5. Verify & Self-Test
echo "🧪 [5/5] Running verification and self-test suite..."
python3 -m py_compile "${VIBE_KIT_DIR}/scripts/safety-gate.py"
python3 -m py_compile "${VIBE_KIT_DIR}/scripts/vibe-progress.py"
python3 "${VIBE_KIT_DIR}/scripts/safety-gate.py" --test
python3 "${VIBE_KIT_DIR}/scripts/vibe-progress.py" --test

echo "======================================================================"
echo "🎉 Installation Complete! You are now a Sovereign Vibe Coder."
echo ""
echo "🚀 Getting Started:"
echo "   1. Open any project workspace: cd /path/to/your/project"
echo "   2. Start coding with AGY:      agy"
echo "   3. Real-time progress log:     tail -f ~/.gemini/vibe-progress.log"
echo ""
echo "💡 Tips:"
echo "   - RTK is recommended for terminal commands to save 60-90% token costs."
echo "   - To enable Discord alerts, export VIBE_DISCORD_WEBHOOK=\"https://discord.com/...\""
echo "======================================================================"
