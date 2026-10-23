# Code Snippets: Gathin23/cleanyourtv

Source repository: `/Users/admin/.no6-home/ghq/github.com/Gathin23/cleanyourtv`

This document compiles verified excerpts (<25 lines each) showcasing the core mechanisms of `cleanyourtv`:
1. Backup and restore script logic
2. Debloat execution and package safety rules
3. ADB-over-TCP connection and transfer helpers
4. Key launcher implementation patterns (spring highlight, icon color extraction, remote key interception)

---

## 1. Backup & Restore Logic

### 1.1 Restore Script Command Generator
Re-enables every package in the debloat list, restores the stock launcher component, resets animation scales, and lists remaining disabled packages.
- File: `tools/restore.sh` (Lines 13–22)

```bash
{
  grep -vE '^\s*(#|$)' "$LIST" | sed -E 's/\s+#.*$//' | awk '{print "pm enable " $1}'
  echo "pm enable $STOCK"
  # resolve the stock HOME component on the TV (Android 9 needs pkg/activity, not just pkg)
  echo "cmd package set-home-activity --user 0 \$(cmd package resolve-activity --brief -a android.intent.action.MAIN -c android.intent.category.HOME $STOCK | tail -n 1)"
  echo "settings put global window_animation_scale 1.0"
  echo "settings put global transition_animation_scale 1.0"
  echo "settings put global animator_duration_scale 1.0"
  echo "pm list packages -d"
} | "$PY" -I tools/tv.py --batch
```

### 1.2 Pre-Debloat Backup Specification
Specifies state capture before modifying system packages or settings.
- File: `PROMPT.md` (Lines 30–34)

```markdown
Back up first
- Save the full package list, disabled-package list, getprop output and all settings to a backup folder
  before changing anything, and write a restore script that re-enables everything you disable.
- Ask me what is plugged into the TV's USB ports. Some devices cut their power while USB debugging
  is on, so warn me, and remind me to switch debugging off once you're done.
```

---

## 2. Debloat Step & Safety Guardrails

### 2.1 Non-Destructive Package Disabling (`pm disable-user`)
Parses target package list (ignoring comments/blanks), converts to `pm disable-user --user 0`, and checks disabled list.
- File: `tools/disable.sh` (Lines 13–16)

```bash
{
  grep -vE '^\s*(#|$)' "$LIST" | sed -E 's/\s+#.*$//' | awk '{print "pm disable-user --user 0 " $1}'
  echo "pm list packages -d"
} | "$PY" -I tools/tv.py --batch
```

### 2.2 Safety Denylist / Protected Package Rules
Defines essential TV components that must never be disabled under any circumstance.
- File: `PROMPT.md` (Lines 40–47)

```markdown
- Disable the first categories with `pm disable-user --user 0`, never uninstall system packages.
- Never disable what the TV needs to work: the TV app and input services that play HDMI and the
  tuner, the input/source menu, remote control and Bluetooth pairing services, the on-screen
  keyboard, Google Play Store and Play Services. Manufacturer package names often don't say what a
  package does: check its activities and services with `dumpsys package` first, and ask me if it's
  still unclear.
- Before touching streaming apps, voice assistant, Chromecast, Miracast or the update service, ask me
  which ones I use with a checklist question and disable only what I don't tick.
```

### 2.3 Safe Stock Launcher Detection & Rollback
Protects against disabling unknown components, setup wizards, or leaving the TV with an invalid HOME handler.
- File: `launcher/build-and-install.sh` (Lines 58–67)

```bash
HOME_NOW=$("$PY" -I ../tools/tv.py 'cmd package resolve-activity --brief -c android.intent.category.HOME -a android.intent.action.MAIN' | tail -n 1 | tr -d '\r')
case "$HOME_NOW" in
  com.gathin.tvhome/*) echo "Home now resolves to $HOME_NOW" ;;
  *)
    [ "$STOCK_LAUNCHER" = none ] || "$PY" -I ../tools/tv.py "pm enable --user 0 $STOCK_LAUNCHER" >/dev/null || true
    echo "ERROR: Home resolves to ${HOME_NOW:-nothing}, not to the new launcher; $STOCK_LAUNCHER was re-enabled." >&2
    echo "On Google TV this usually means com.google.android.tungsten.setupwraith also claims Home: add it to" >&2
    echo "your debloat list (see README, Troubleshooting), apply the list, then run this script again." >&2
    exit 1 ;;
esac
```

---

## 3. ADB Connection Helpers

### 3.1 Minimal ADB-over-TCP Client (`adb_shell` without ADB binary)
Reuses existing host keys (`~/.android/adbkey`) or auto-generates RSA keys to connect directly to the TV over TCP port 5555.
- File: `tools/tv.py` (Lines 23–46)

```python
KEYDIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "adbkey")
KEY = os.path.join(KEYDIR, "adbkey")
# Reuse the stock adb key when the TV already trusts it (platform-tools / Android Studio users), so the
# "Allow USB debugging?" prompt doesn't come back a second time for this client. From #105.
ADB_KEY = os.path.join(os.path.expanduser("~"), ".android", "adbkey")
if not os.path.exists(KEY) and os.path.exists(ADB_KEY) and os.path.exists(ADB_KEY + ".pub"):
    KEY = ADB_KEY


def get_signer():
    os.makedirs(KEYDIR, exist_ok=True)
    if not os.path.exists(KEY):
        keygen(KEY)
    with open(KEY) as f:
        priv = f.read()
    with open(KEY + ".pub") as f:
        pub = f.read()
    return PythonRSASigner(pub, priv)


def connect(timeout=120):
    dev = AdbDeviceTcp(HOST, PORT, default_transport_timeout_s=float(timeout))
    dev.connect(rsa_keys=[get_signer()], transport_timeout_s=float(timeout), auth_timeout_s=timeout)
    return dev
```

### 3.2 Single-Session Batch Execution
Runs multiple shell commands over a single persisted ADB connection while stripping Windows PowerShell UTF-8 BOM prefixes.
- File: `tools/tv.py` (Lines 62–74)

```python
    elif args[0] == "--batch":
        # one shell command per stdin line, each run separately on the same connection.
        # utf-8-sig drops the BOM Windows PowerShell may prepend to piped stdin.
        sys.stdin.reconfigure(encoding="utf-8-sig")
        for line in sys.stdin:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            out = dev.shell(line, read_timeout_s=120.0)
            sys.stdout.write(f"$ {line}\n{out}")
            if out and not out.endswith("\n"):
                sys.stdout.write("\n")
            sys.stdout.flush()
```

### 3.3 Fallback Base64 Chunked Transfer with MD5 Verification
Transfers files as 48 KB base64 chunks through raw shell commands to bypass macOS local network ADB push hangs.
- File: `tools/b64push.py` (Lines 24–37)

```python
    for i in range(n):
        part = base64.b64encode(data[i * CHUNK:(i + 1) * CHUNK]).decode()
        out = dev.shell(f"echo '{part}' >> {tmp} && echo ok{i}", read_timeout_s=60.0)
        if f"ok{i}" not in out:
            print(f"chunk {i} failed: {out}")
            sys.exit(1)
        print(f"\rchunk {i + 1}/{n}", end="", flush=True)
    print()
    out = dev.shell(f"base64 -d {tmp} > {remote} && rm {tmp} && md5sum {remote}", read_timeout_s=120.0)
    got = out.split()[0] if out.strip() else ""
    print("md5 remote:", got, "local:", want, "MATCH" if got == want else "MISMATCH")
    dev.close()
    sys.exit(0 if got == want else 1)
```

---

## 4. Launcher Implementation Patterns

### 4.1 Physics-Based Spring Focus Highlight
Drives a single floating `GlassView` highlight using `SpringAnimation` with custom viewport scroll offset compensation.
- File: `launcher/app/src/main/java/com/gathin/tvhome/MainActivity.java` (Lines 253–268)

```java
        // Liquid feel: soft springs on the highlight's position.
        springX = new SpringAnimation(glass, DynamicAnimation.TRANSLATION_X);
        springY = new SpringAnimation(glass, new FloatPropertyCompat<View>("glassContentY") {
            @Override
            public float getValue(View v) {
                return v.getTranslationY() - glassScrollShift;
            }

            @Override
            public void setValue(View v, float value) {
                v.setTranslationY(value + glassScrollShift);
            }
        });
        for (SpringAnimation s : new SpringAnimation[]{springX, springY}) {
            s.setSpring(new SpringForce().setStiffness(260f).setDampingRatio(0.58f));
        }
```

### 4.2 Dynamic Color Extraction from App Icon / Banner
Downsamples app banners/icons into a 12x12 bitmap, scores pixels in HSV space for high saturation and balanced brightness, and derives the ambient background glow.
- File: `launcher/app/src/main/java/com/gathin/tvhome/AppAdapter.java` (Lines 289–318)

```java
    private static int vividColor(Drawable live) {
        if (live == null) return 0xFF444444;
        // Draw a private copy: changing the bounds of the drawable an ImageView shows would blank the tile.
        Drawable d = live.getConstantState() != null ? live.getConstantState().newDrawable().mutate() : live;
        Rect saved = new Rect(d.getBounds());
        int n = 12;
        Bitmap bmp = Bitmap.createBitmap(n, n, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(bmp);
        d.setBounds(0, 0, n, n);
        d.draw(c);
        d.setBounds(saved);
        float[] hsv = new float[3];
        int best = 0xFF444444;
        float bestScore = -1f;
        long r = 0, g = 0, b = 0;
        for (int y = 0; y < n; y++) {
            for (int x = 0; x < n; x++) {
                int p = bmp.getPixel(x, y);
                r += Color.red(p); g += Color.green(p); b += Color.blue(p);
                Color.colorToHSV(p, hsv);
                float score = hsv[1] * Math.min(1f, hsv[2] * 1.4f);   // saturated and not too dark
                if (score > bestScore) { bestScore = score; best = p; }
            }
        }
        bmp.recycle();
```

### 4.3 Remote `KEYCODE_TV` Interception via AccessibilityService
Intercepts physical TV remote Input buttons (`KEYCODE_TV`) across all apps when the stock launcher is disabled, routing them to the system input switcher (`ACTION_VIEW_INPUTS`).
- File: `launcher/app/src/main/java/com/gathin/tvhome/InputKeyService.java` (Lines 15–29)

```java
public class InputKeyService extends AccessibilityService {

    private static final String ACTION_VIEW_INPUTS = "com.android.tv.action.VIEW_INPUTS";

    @Override
    protected boolean onKeyEvent(KeyEvent event) {
        if (event.getKeyCode() != KeyEvent.KEYCODE_TV) return false;
        if (event.getAction() == KeyEvent.ACTION_UP) {
            try {
                startActivity(new Intent(ACTION_VIEW_INPUTS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (ActivityNotFoundException ignored) {
            }
        }
        return true;
    }
```
