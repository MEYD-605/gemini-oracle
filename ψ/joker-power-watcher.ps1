# Joker Realtime Hardware, Power & Thermal Watcher
# Runs continuously in Session 1 as ClubSGame
Add-Type -AssemblyName System.Speech -ErrorAction SilentlyContinue

# XInput Dual-Motor Haptic Controller Support
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
using System.Threading;

public class XController {
    [StructLayout(LayoutKind.Sequential)]
    public struct XINPUT_VIBRATION {
        public ushort wLeftMotorSpeed;
        public ushort wRightMotorSpeed;
    }

    [DllImport("xinput1_4.dll", EntryPoint = "XInputSetState")]
    private static extern int XInputSetState14(int dwUserIndex, ref XINPUT_VIBRATION pVibration);

    [DllImport("xinput1_3.dll", EntryPoint = "XInputSetState")]
    private static extern int XInputSetState13(int dwUserIndex, ref XINPUT_VIBRATION pVibration);

    public static void Vibrate(int durationMs, ushort leftSpeed = 65535, ushort rightSpeed = 65535) {
        try {
            XINPUT_VIBRATION v = new XINPUT_VIBRATION { wLeftMotorSpeed = leftSpeed, wRightMotorSpeed = rightSpeed };
            for (int i = 0; i < 4; i++) {
                try { if (XInputSetState14(i, ref v) == 0) break; } catch {
                    try { if (XInputSetState13(i, ref v) == 0) break; } catch {}
                }
            }
            Thread.Sleep(durationMs);
            XINPUT_VIBRATION stop = new XINPUT_VIBRATION { wLeftMotorSpeed = 0, wRightMotorSpeed = 0 };
            for (int i = 0; i < 4; i++) {
                try { XInputSetState14(i, ref stop); } catch {
                    try { XInputSetState13(i, ref stop); } catch {}
                }
            }
        } catch {}
    }
}
"@ -ErrorAction SilentlyContinue

# Native Hardware RGB Controller Helper (via OneXConsole CDP IPC)
$nodeExe = "C:\Users\noone\AppData\Local\hermes\node\node.exe"
$scriptRgb = "C:\Users\noone\bin\cdp_rgb.js"

function Set-WatcherRgb([int]$r, [int]$g, [int]$b, [int]$lvl = 2, [bool]$breathing = $false) {
    if ((Test-Path $nodeExe) -and (Test-Path $scriptRgb)) {
        try {
            & $nodeExe $scriptRgb $r $g $b $lvl | Out-Null
        } catch {}
    }
}

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToDefaultAudioDevice()
$ryzenAdj = "C:\Program Files\OneXConsole\resources\resources\ryzenadj.exe"
$nircmd = "C:\Program Files\OneXConsole\resources\resources\tools\nircmd\nircmdc.exe"
$logFile = "C:\Users\noone\bin\joker-watcher.log"

$NORMAL_VOLUME = 38000  # ~58% Normal comfortable volume
$ALERT_VOLUME  = 65535  # 100% MAXIMUM BLAST for urgent alerts

# Set clear system volume to normal
if (Test-Path $nircmd) {
    & $nircmd setdefaultsounddevice "Speakers" 1 2>$null
    & $nircmd mutesysvolume 0 2>$null
    & $nircmd setsysvolume $NORMAL_VOLUME 2>$null
}

function Play-AlertVoice($audioFile, $fallbackText, $isUrgentAlert = $false) {
    $audioPath = "C:\Users\noone\bin\audio\$audioFile"
    $wavPath = $audioPath -replace "\.mp3$", ".wav"
    
    # 1. Unmute and Set volume (100% for urgent alerts, normal for others)
    $vol = if ($isUrgentAlert) { $ALERT_VOLUME } else { $NORMAL_VOLUME }
    if (Test-Path $nircmd) {
        & $nircmd mutesysvolume 0 2>$null
        & $nircmd setsysvolume $vol 2>$null
    }
    
    # 2. SoundDevice WASAPI. Mono clips must stay 1-D; forcing (-1, 2)
    # raises on mobile_mode_*.wav and the alert dies with no sound.
    $pyVenv = "C:\Users\noone\AppData\Local\hermes\hermes-agent\venv\Scripts\python.exe"
    if ((Test-Path $pyVenv) -and (Test-Path $wavPath)) {
        try {
            $pyPlay = @"
import sounddevice as sd, wave, numpy as np
wf = wave.open(r'$wavPath', 'rb')
ch = wf.getnchannels()
rate = wf.getframerate()
data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16)
if ch > 1:
    data = data.reshape(-1, ch)
sd.play(data, rate)
sd.wait()
"@
            $pyPlay | & $pyVenv - 2>$null
            if ($LASTEXITCODE -eq 0) {
                if ($isUrgentAlert -and (Test-Path $nircmd)) {
                    & $nircmd setsysvolume $NORMAL_VOLUME 2>$null
                }
                return
            }
        } catch {}
    }

    # 3. Winsound via Python (Hardware WaveOut direct)
    $py = "C:\Users\noone\AppData\Local\Programs\Python\Python312\python.exe"
    if ((Test-Path $py) -and (Test-Path $wavPath)) {
        try {
            & $py -c "import winsound; winsound.PlaySound(r'$wavPath', winsound.SND_FILENAME)" 2>$null
            if ($isUrgentAlert -and (Test-Path $nircmd)) {
                & $nircmd setsysvolume $NORMAL_VOLUME 2>$null
            }
            return
        } catch {}
    }

    # 4. Fallback to SoundPlayer
    if (Test-Path $wavPath) {
        try {
            $player = New-Object System.Media.SoundPlayer $wavPath
            $player.PlaySync()
            if ($isUrgentAlert -and (Test-Path $nircmd)) {
                & $nircmd setsysvolume $NORMAL_VOLUME 2>$null
            }
            return
        } catch {}
    }

    # 5. Fallback to NirCmd
    if (Test-Path $audioPath) {
        if (Test-Path $nircmd) {
            & $nircmd mediaplay 6000 $audioPath
            if ($isUrgentAlert) {
                & $nircmd setsysvolume $NORMAL_VOLUME 2>$null
            }
            return
        }
    }
    $synth.Speak($fallbackText)
    if ($isUrgentAlert -and (Test-Path $nircmd)) {
        & $nircmd setsysvolume $NORMAL_VOLUME 2>$null
    }
}

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class AcSense {
    [DllImport("kernel32.dll")]
    public static extern byte GetSystemPowerStatus(out SYSTEM_POWER_STATUS s);
    [StructLayout(LayoutKind.Sequential)]
    public struct SYSTEM_POWER_STATUS {
        public byte ACLineStatus;
        public byte BatteryFlag;
        public byte BatteryLifePercent;
        public byte SystemStatusFlag;
        public int BatteryLifeTime;
        public int BatteryFullLifeTime;
    }
    // 1 = adapter present, 0 = on battery, 255 = unknown (treat as present)
    public static bool OnAc() {
        SYSTEM_POWER_STATUS s;
        if (GetSystemPowerStatus(out s) == 0) return true;
        return s.ACLineStatus != 0;
    }
}
public class WinInput {
    [StructLayout(LayoutKind.Sequential)]
    public struct LASTINPUTINFO {
        public uint cbSize;
        public uint dwTime;
    }
    [DllImport("user32.dll")]
    public static extern bool GetLastInputInfo(ref LASTINPUTINFO plii);
    [DllImport("user32.dll")]
    public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);

    public static uint GetIdleMs() {
        LASTINPUTINFO lii = new LASTINPUTINFO();
        lii.cbSize = (uint)Marshal.SizeOf(lii);
        if (GetLastInputInfo(ref lii)) {
            return ((uint)Environment.TickCount) - lii.dwTime;
        }
        return 0;
    }

    public static void TurnOffScreen() {
        // SendMessage(HWND_BROADCAST, WM_SYSCOMMAND, SC_MONITORPOWER, 2)
        SendMessage(0xffff, 0x0112, 0xf170, 2);
    }
}
"@ -ErrorAction SilentlyContinue

# Initial Greeting & Initial RGB
"$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Joker Realtime Watcher (Gemini Puck Voice Active)" | Out-File $logFile -Encoding utf8
$lastConfirmedOnline = [AcSense]::OnAc()
if (-not $lastConfirmedOnline) {
    Set-WatcherRgb 255 120 0 2 $false # Mobile Amber
} else {
    Set-WatcherRgb 0 255 230 2 $false # Homelab Cyan
}
Play-AlertVoice "joker_startup.mp3" "Joker Guardian ready." $false

$consecutiveOfflineCount = 0
$consecutiveOnlineCount = 0
$lastHour = -1
$lastOverheatAlert = [DateTime]::MinValue
$lastLowBatteryAlert = [DateTime]::MinValue
$bypassAnnounced = $false
$screenTurnedOff = $false

while ($true) {
    try {
        if (Test-Path "C:\Users\noone\bin\joker-exec.ps1") {
            $cmdFile = "C:\Users\noone\bin\joker-exec.ps1"
            $outFile = "C:\Users\noone\bin\joker-exec.log"
            try {
                & $cmdFile *>&1 | Out-File $outFile -Encoding utf8
            } catch {
                "Error: $_" | Out-File $outFile -Encoding utf8
            }
            Remove-Item $cmdFile -Force -ErrorAction SilentlyContinue
        }
        if (Test-Path "C:\Users\noone\bin\set_wallpaper.trigger") {
            Remove-Item "C:\Users\noone\bin\set_wallpaper.trigger" -Force -ErrorAction SilentlyContinue
            $nircmd = "C:\Program Files\OneXConsole\resources\resources\tools\nircmd\nircmdc.exe"
            & $nircmd setdesktopwallpaper "C:\Users\noone\wallpaper_joker.jpg"
            "$(Get-Date) Wallpaper changed via watcher!" | Out-File "C:\Users\noone\bin\wp_success.log" -Encoding utf8
        }

        # Screen Sleep Enforcement: 180s (3 minutes) idle
        # Overcomes Windows 11 GameInput / stick deadzone jitter that prevents native display idle sleep
        $idleSec = [WinInput]::GetIdleMs() / 1000
        if ($idleSec -ge 180) {
            if (-not $screenTurnedOff) {
                $screenTurnedOff = $true
                [WinInput]::TurnOffScreen()
                "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | SCREEN: Inactivity >= 180s ($([int]$idleSec)s). Display power off triggered." | Add-Content $logFile
            }
        } else {
            if ($screenTurnedOff) {
                $screenTurnedOff = $false
                "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | SCREEN: User activity detected. Display active." | Add-Content $logFile
            }
        }
        # Adapter sense from kernel32, not WMI BatteryStatus.PowerOnline.
        # That WMI flag flickers while the cable stays seated and fired false unplug alerts.
        $online = [AcSense]::OnAc()

        # Debounce logic: Fast detection (1-2 samples = ~1s)
        if ($online) {
            $consecutiveOnlineCount++
            $consecutiveOfflineCount = 0
        } else {
            $consecutiveOfflineCount++
            $consecutiveOnlineCount = 0
        }

        # 2. Fast Unplug / Plug event (~1s reaction time)
        if ($lastConfirmedOnline -and $consecutiveOfflineCount -ge 2) {
            $lastConfirmedOnline = $false
            $w = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
            $pct = if ($w) { $w.EstimatedChargeRemaining } else { 0 }
            
            # Unplug = urgent. Loud mastered stereo clips, not the quiet mono quips.
            [XController]::Vibrate(450, 65535, 65535)
            Set-WatcherRgb 255 120 0 2 $false
            $unplugFiles = @("alert_unplugged.wav", "alert_unplugged_2.wav", "alert_unplugged_3.wav")
            $selectedFile = $unplugFiles | Get-Random
            Play-AlertVoice $selectedFile "Bo ครับ สายชาร์จหลุด ตอนนี้ใช้แบตอยู่" $true
            "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | MODE: Unplugged! Battery: $pct% | Voice: $selectedFile" | Add-Content $logFile
        } elseif (-not $lastConfirmedOnline -and $consecutiveOnlineCount -ge 2) {
            $lastConfirmedOnline = $true
            
            # Gentle Confirmation Haptic Pulse
            [XController]::Vibrate(150, 20000, 20000)
            
            # RGB: Steady Mint/Cyan (Level 2) - Docked 24/7 Homelab Mode
            Set-WatcherRgb 0 255 230 2 $false
            
            Play-AlertVoice "alert_power_restored.mp3" "กลับเข้าแท่นชาร์จ ประจำการโฮมแลป 24 ชั่วโมงครับ" $false
            "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | MODE: Docked 24/7 Homelab Active (Power Restored)" | Add-Content $logFile
        }

        # 2.5 Check 85% Battery & Switch to Bypass Power Mode
        $w = Get-CimInstance Win32_Battery -ErrorAction SilentlyContinue
        $pct = if ($w) { $w.EstimatedChargeRemaining } else { 0 }
        if ($online -and $pct -ge 85 -and -not $bypassAnnounced) {
            $bypassAnnounced = $true
            & "C:\Users\noone\AppData\Local\Programs\Python\Python312\python.exe" -c "import sqlite3; con = sqlite3.connect(r'C:\Users\noone\AppData\Roaming\gamerzone\db\core.db'); con.execute('UPDATE setting SET byPassPowerMode=1 WHERE id=1'); con.commit(); con.close()" 2>$null
            # RGB: Emerald Green (Bypass Mode Active)
            Set-WatcherRgb 0 255 120 2 $false
            Play-AlertVoice "alert_battery_85.mp3" "Master Bo, battery reached 85 percent. Switched to bypass power mode." $false
            "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | INFO: Battery reached 85%! Switched to Bypass Power Mode" | Add-Content $logFile
        } elseif ($pct -lt 83) {
            $bypassAnnounced = $false
        }

        # 2.8 Critical Low Battery Warning (Only when on battery and <= 20%)
        if (-not $online -and $pct -le 20 -and $pct -gt 0) {
            if (-not $lastLowBatteryAlert -or ((Get-Date) - $lastLowBatteryAlert).TotalMinutes -ge 5) {
                $lastLowBatteryAlert = Get-Date
                [XController]::Vibrate(500)
                Set-WatcherRgb 255 0 0 4 $true  # Red Breathing Alert
                Play-AlertVoice "alert_unplugged.wav" "Bo ครับ แบตเตอรี่ต่ำกว่า 20% แล้วนะ หาที่เสียบชาร์จหน่อยครับ" $true
                "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | ALERT: Low battery warning! Battery: $pct%" | Add-Content $logFile
            }
        }

        # 3. Check Overheating (every 30s)
        if ((Get-Date).Second % 30 -eq 0 -and (Test-Path $ryzenAdj)) {
            $adjOut = & $ryzenAdj -i 2>$null
            $tempMatch = [regex]::Match($adjOut, "THM VALUE CORE\s+\|\s+([\d\.]+)")
            if ($tempMatch.Success) {
                $temp = [double]$tempMatch.Groups[1].Value
                if ($temp -ge 75.0 -and ((Get-Date) - $lastOverheatAlert).TotalMinutes -ge 10) {
                    [XController]::Vibrate(600)
                    Set-WatcherRgb 255 0 0 4 $true  # Red Breathing Alert
                    Play-AlertVoice "alert_overheat.mp3" "Master Bo, high temperature alert." $true
                    $lastOverheatAlert = Get-Date
                    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | ALERT: Overheating $temp C" | Add-Content $logFile
                }
            }
        }

        # 4. Hourly TDP Enforcement - Pinned to 10W 24/7 per Bo directive (Test Phase)
        $hour = (Get-Date).Hour
        if ($hour -ne $lastHour) {
            $lastHour = $hour
            $target = 10000
            $targetFast = 11000
            if (Test-Path $ryzenAdj) {
                & $ryzenAdj --stapm-limit=$target --fast-limit=$targetFast --slow-limit=$target --apu-slow-limit=$target | Out-Null
            }
            "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | TDP set to 10W (Pinned 24/7 Test Phase)" | Add-Content $logFile
        }
    } catch {
        "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Error: $_" | Add-Content $logFile
    }
    Start-Sleep -Milliseconds 1500
}
