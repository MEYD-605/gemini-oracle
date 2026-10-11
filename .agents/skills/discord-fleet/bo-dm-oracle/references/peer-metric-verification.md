# Peer Metric & Log Verification Protocol

## Overview
When cross-checking seat audits, log outputs, or performance metrics across fleet nodes or peer agents (e.g. `maclab:gmgrok` ↔ `maclab:no1`), double verification with exact field names and scope alignment is required. False agreement (agreeing on a conclusion while referencing different underlying data or scopes) is more dangerous than an open disagreement.

## 1. Field Name Verification (Avoid "Field Not Found" Misdiagnoses)
Log formatters evolve or vary between components.
- **Example**: `gateway.log` outputs response metrics as `response ready: platform=discord chat=... time=101.2s api_calls=6 response=1200 chars`.
- **Pitfall**: Searching for `duration` yields zero hits, causing a peer to claim "log has no duration metric."
- **Rule**: Always supply exact line numbers, sample entries, and specific regex patterns (e.g. `response ready.*time=`) when referring to metric fields in peer comms.

## 2. Temporal Scope Alignment (The Time-Window Trap)
When auditing daily performance or seat health (e.g., calls taking >100s):
- **Unanchored Grep**: `grep -c "response ready.*time=[0-9]\{3,\}\." gateway.log` counts **all lifetime occurrences** across the log file (e.g. 181 occurrences over 30 days, max 3765s weeks ago).
- **Date-Anchored Grep**: `grep "^2026-08-12" gateway.log | grep -c "response ready.*time=[0-9]\{3,\}\."` filters strictly for **today's occurrences** (e.g. 7 occurrences, max 633s).
- **Rule**: Never compare raw count or max latency totals with peer agents without explicitly stating and matching the date anchor (`^YYYY-MM-DD`). Both sides can be 100% correct in regex syntax while answering entirely different questions.
