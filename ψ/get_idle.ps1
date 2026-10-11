Add-Type @'
using System;
using System.Runtime.InteropServices;
public class WinInput {
    [StructLayout(LayoutKind.Sequential)]
    public struct LASTINPUTINFO {
        public uint cbSize;
        public uint dwTime;
    }
    [DllImport("user32.dll")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    public static uint GetIdleMs() {
        LASTINPUTINFO lii = new LASTINPUTINFO();
        lii.cbSize = (uint)Marshal.SizeOf(lii);
        if (GetLastInputInfo(ref lii)) {
            return ((uint)Environment.TickCount) - lii.dwTime;
        }
        return 0;
    }
}
'@
$idleSeconds = [WinInput]::GetIdleMs() / 1000
Write-Output "User idle seconds: $idleSeconds"
