# esp-webrtc-solution Learning Index

## Source
- **Origin**: ./origin/
- **GitHub**: https://github.com/espressif/esp-webrtc-solution

## Explorations

### 2026-06-29 1941 (default)
- [[2026-06-29/1941_ARCHITECTURE|Architecture]]
- [[2026-06-29/1941_CODE-SNIPPETS|Code Snippets]]
- [[2026-06-29/1941_QUICK-REFERENCE|Quick Reference]]

**Key insights**:
1. **OpenAI Realtime Integration**: ESP-WebRTC allows microcontrollers (ESP32-S3, ESP32-P4) to communicate directly with OpenAI's Realtime API via WebRTC by exchanging SDP offers and utilizing Data Channels for JSON-based tool calls and event handling.
2. **P2P and Cloud Interoperability**: Supported signaling mechanisms cover direct P2P (AppRTC style), WHIP/WHEP ingestion (for media servers like MediaMTX), AWS KVS (Amazon Kinesis Video Streams), and Janus WebRTC gateway.
3. **Optimized Embedded Handshake**: Memory footprint is optimized under 60KB RAM. DTLS handshake latency is addressed by pre-generating self-signed certificates (`esp_peer_pre_generate_cert`) during boot time rather than runtime negotiations.
