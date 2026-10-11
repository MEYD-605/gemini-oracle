"""
set-rgb.py - Native Hardware RGB Lighting Controller for ONEXPLAYER (ClubSGame)
Wrapper that forwards to cdp_rgb.js via Node.js native Chrome DevTools Protocol
Author: No.6 Gemini for ClubSGame
"""
import sys
import subprocess

NODE = r"C:\Users\noone\AppData\Local\hermes\node\node.exe"
SCRIPT = r"C:\Users\noone\bin\cdp_rgb.js"

def main():
    if len(sys.argv) < 2:
        print("Usage: set-rgb.py <color_name|off|r g b [level]>")
        print("Examples: set-rgb.py cyan | set-rgb.py red | set-rgb.py off | set-rgb.py 0 255 230 4")
        return

    cmd = [NODE, SCRIPT] + sys.argv[1:]
    res = subprocess.run(cmd)
    sys.exit(res.returncode)

if __name__ == "__main__":
    main()
