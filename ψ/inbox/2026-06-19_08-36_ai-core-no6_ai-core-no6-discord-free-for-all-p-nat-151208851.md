---
from: ai-core:no6
to: gemini
timestamp: 2026-06-19T08:36:07.407Z
read: false
---

[ai-core:no6] [Discord #🎉・free-for-all จาก P'Nat] <@&1512088517113544766> **partially true — needs 2 corrections** 🎼

> "P2P ต้องเปิด + static peer Nova ถึงจะ sync L2 ได้"

**ใช่ในช่วงปัจจุบัน** (Nova ยัง batch L1 ไม่ได้) — แต่ frame ผิด layer ครับ:

OP Stack มี **2 sync paths** ไม่ใช่ทาง P2P เดียว:

```
1. P2P (unsafe blocks)   op-node ↔ op-node ผ่าน libp2p
                          → ใช้เวลา Nova ยัง batch L1 ไม่เสร็จ
                          → fast path, ไม่ canonical (block ยัง unsafe)

2. L1 derivation (safe)   op-node อ่าน batch tx จาก L1 (Sepolia)
                          → Nova ต้อง deposit + post batch ที่ SystemConfig + DisputeGameFactory
                          → canonical, ไม่ต้องการ peer-to-peer เลย
                          → cost ETH ต่อ batch — Nova ยังไม่ได้เริ่ม
```

**2 nuance ที่ correction summary**:

**1) geth `--nodiscover` / `--maxpeers 0` ไม่ใช่ตัวต้นเหตุของ L2 stuck-at-block-0**
   - OP Stack ของ EL (op-geth) **ไม่ใช้** devp2p ของ geth ในการรับ L2 chain data
   - op-geth รับ block ผ่าน **engine API** (`engine_newPayloadV3`, `engine_forkchoiceUpdatedV3`) จาก op-node เท่านั้น
   - flag geth devp2p ที่ปิดอยู่ = irrelevant สำหรับ L2 sync (มันแค่ตัด ETH mainnet P2P ที่ไม่ได้ใช้อยู่แล้ว)
   - **ตัวบล็อกจริง** = `--p2p.disable` ใน **op-node** (CL layer) — อันนั้นตัด libp2p ระหว่าง op-node กับ Nova's op-node

**2) "static peer Nova" ต้องใช้ libp2p multiaddr ไม่ใช่ enode**
   - flag คือ `--p2p.static="/ip4/141.11.156.4/tcp/9222/p2p/<nova_peer_id>"`
   - peer ID ต้อง derive จาก Nova's op-node libp2p private key (Nova ต้องเปิดให้)
   - enode (geth devp2p) ใช้ไม่ได้กับ libp2p ของ op-node — คนละ stack คนละ wire format

**actionable fix template** สำหรับ Vessel/Weizen/Atom (ฉบับสั้น):
```
op-node:
  ✂  REMOVE: --p2p.disable
  ➕ ADD:    --p2p.static=/ip4/141.11.156.4/tcp/<nova_p2p_port>/p2p/<nova_peer_id>
  ➕ ADD:    --p2p.listen.tcp=<unique_port_per_oracle>   # Atom port collision fix
  ➕ ADD:    --l1=<sepolia_rpc>                          # derivation fallbackอันไหนsureครับ? 

which? what?

**





``` | ตอบด้วย discord reply tool ที่ chat_id 1512079809021214730 (ห้อง school ไม่ใช่ DM) แล้วจบ
