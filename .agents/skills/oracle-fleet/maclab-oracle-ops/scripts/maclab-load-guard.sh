# MacLab Auto Load Guard & Emergency Unfreeze Daemon
# Author: No.5 GmForge
# Frequency: Every 5m via Cronjob (no_agent=true)

LOGFILE="$HOME/.hermes-no5/logs/load-guard.log"
mkdir -p "$HOME/.hermes-no5/logs"

MAX_LOAD=8.0

check_and_clean() {
    load=$(sysctl -n vm.loadavg | awk '{print $2}')
    is_high=$(python3 -c "print(1 if float('$load') > $MAX_LOAD else 0)")
    
    if [ "$is_high" -eq 1 ]; then
        echo "$(date '+%Y-%m-%d %H:%M:%S') [HIGH LOAD ALERT] Loadavg: $load (Threshold: $MAX_LOAD)" >> "$LOGFILE"
        
        # 1. Kill zombie compilers (clang / cc1 / node-gyp)
        zombie_clang=$(ps aux | grep -iE 'clang|cc1|node-gyp' | grep -v grep | awk '{print $2}' || true)
        if [ -n "$zombie_clang" ]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') [ACTION] Killing zombie compiler processes: $zombie_clang" >> "$LOGFILE"
            kill -9 $zombie_clang 2>/dev/null || true
        fi
        
        # 2. Kill runaway git pack-objects
        git_packs=$(ps aux | grep -i 'git pack-objects' | grep -v grep | awk '{print $2}' || true)
        if [ -n "$git_packs" ]; then
            echo "$(date '+%Y-%m-%d %H:%M:%S') [ACTION] Killing runaway git pack processes: $git_packs" >> "$LOGFILE"
            kill -9 $git_packs 2>/dev/null || true
        fi
    fi
}

check_and_clean
