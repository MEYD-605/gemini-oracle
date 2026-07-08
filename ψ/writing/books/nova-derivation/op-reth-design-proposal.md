# เอกสารการออกแบบ: โครงสร้างกู้ภัยและการเชื่อมต่อ OP-Reth สำหรับเทอมสอง (Midterm 2 Design Proposal)

เอกสารนี้แสดงการออกแบบสถาปัตยกรรมการเปิดใช้งานและปรับแต่งตัวประมวลผลเลเยอร์ 2 แบบกะทัดรัดด้วย **OP-Reth** ร่วมกับการควบคุมผ่าน **Deployment Makefile** เพื่อทำตามโจทย์วิจัยการทดลองของพี่นัท

---

## 1. การออกแบบ Makefile สำหรับระบบติดตั้งทีละขั้น (Step-by-Step Deploy Makefile)

เป้าหมายคือการสร้างไฟล์สั่งการ `Makefile` สำหรับบริหารจัดการโหนดย่อยแต่ละส่วนโดยไม่รันคำสั่งดิบ ช่วยลดความเสี่ยงมนุษย์ (Human Error) และเพิ่มความง่ายในการสืบสวนประวัติระบบ

### โครงร่างคำสั่งประมวลผลหลัก (Makefile Target Blueprint):

```makefile
# คอนฟิกูเรชันพื้นฐาน
JWT_PATH ?= ./jwt.txt
GENESIS_PATH ?= ./genesis-l2-20260619.json
ROLLUP_PATH ?= ./rollup.json
DB_PATH ?= ./db
L1_RPC ?= https://sepolia.drpc.org

.PHONY: all clean init jwt db run-geth run-node status verify

all: status

# 1. การตั้งค่าสารตั้งต้น
init:
	@echo "ดาวน์โหลดและตรวจสอบความสมบูรณ์ของคอนฟิกูเรชัน..."
	wget -O $(GENESIS_PATH) http://141.11.156.4:8181/genesis.json || true
	wget -O $(ROLLUP_PATH) http://141.11.156.4:8181/rollup.json || true

jwt:
	@if [ ! -f $(JWT_PATH) ]; then \
		echo "สร้าง JWT Token สำหรับEngine API..."; \
		openssl rand -hex 32 > $(JWT_PATH); \
	fi

# 2. การเตรียมฐานข้อมูลสถานะ
db: jwt init
	@echo "สำรองฐานข้อมูลเก่าและทำการ Initialize..."
	@if [ -d $(DB_PATH) ]; then \
		BACKUP_TIME=$$(date +%Y%m%d_%H%M%S); \
		mv $(DB_PATH) /tmp/nova-db-old-$$BACKUP_TIME; \
	fi
	op-geth init --datadir=$(DB_PATH) $(GENESIS_PATH)

# 3. การเปิดใช้งานระบบประมวลผล (op-geth)
run-geth: jwt
	@echo "เริ่มประมวลผลกิ่ง Execution Engine..."
	op-geth \
		--datadir=$(DB_PATH) \
		--http \
		--http.port=9545 \
		--http.api=eth,web3,net,debug \
		--authrpc.port=8551 \
		--authrpc.jwtsecret=$(JWT_PATH) \
		--gcmode=archive

# 4. การเปิดใช้งานสัญญาณฉันทามติ (op-node)
run-node: jwt
	@echo "เริ่มระบบประสานงาน Consensus Engine..."
	op-node \
		--l2=http://127.0.0.1:8551 \
		--l2.jwt-secret=$(JWT_PATH) \
		--l1=$(L1_RPC) \
		--l1.rpckind=standard \
		--rollup.config=$(ROLLUP_PATH) \
		--rpc.addr=127.0.0.1 \
		--rpc.port=9547 \
		--p2p.static=/ip4/141.11.156.4/tcp/9227/p2p/16Uiu2HAmHdqUp...

# 5. การตรวจสอบความเข้ากันได้
status:
	@curl -X POST -H "Content-Type: application/json" \
		--data '{"jsonrpc":"2.0","method":"optimism_syncStatus","params":[],"id":1}' \
		http://127.0.0.1:9547
```

---

## 2. การออกแบบเพื่อข้อสอบใหญ่เทอมสอง: การใช้งานตระกูล Reth (OP-Reth Real Chain Architecture)

ตัวประมวลผล **Reth** (Rust Ethereum client พัฒนาโดย Paradigm) เป็นทางเลือกใหม่ที่เขียนขึ้นด้วยภาษา Rust สำหรับใช้แทน op-geth โดยมีข้อดีด้านประสิทธิภาพ ความปลอดภัยในการเข้าถึงหน่วยความจำ (Memory Safety) และการใช้ฐานข้อมูลแบบ MDBX ที่มีความเสถียรสูงกว่า leveldb

### โครงสร้างการเชื่อมต่อ OP-Reth:

```
            +---------------------------------+
            |             op-node             | (Consensus Engine)
            +----------------+----------------+
                             |
                             | (Engine API over IPC / HTTP)
                             v
            +----------------+----------------+
            |             op-reth             | (Execution Engine written in Rust)
            +----------------+----------------+
                             |
                             v
                [ MDBX Database (L2 State) ]
```

### การตั้งค่าและการใช้งานคอนฟิกเบื้องต้นของ `op-reth`:

1.  **การ Init คอนฟิกด้วย Reth**:
    Reth จะนำเข้าข้อมูล genesis เพื่อสร้างฐานข้อมูลสถานะตั้งต้นในรูปแบบเฉพาะของ MDBX:
    ```bash
    rtk reth init --datadir ./reth-db --chain ./genesis-l2-20260619.json
    ```
2.  **การรัน Engine API รองรับ OP-Stack**:
    `op-reth` ได้รับการเสริมฟิลด์คอนฟิกและการตอบสนองต่อคำสั่งประมวลผลบล็อกของ Optimism โดยเราจะเปิดใช้งานผ่าน flag:
    ```bash
    rtk reth node \
      --datadir ./reth-db \
      --http \
      --http.port 9545 \
      --authrpc.port 8551 \
      --authrpc.jwtsecret ./jwt.txt \
      --chain ./genesis-l2-20260619.json \
      --rollup.sequencer-http http://141.11.156.4:9545 \
      --instance 2
    ```
    *หมายเหตุ: `--rollup.sequencer-http` และการจัดการบล็อกเฉพาะตัวของ Optimism จะถูกควบคุมผ่านการแยกแยะ Engine API เพื่อรองรับการเรียกประมวลผลแบบ Real-time*

### แผนการทดสอบใช้งานจริง (Action Plan):
1.  **การเปิดประเด็นเสนอการออกแบบในกระทู้บอร์ด**: โพสต์นำเสนอแผนโครงสร้างและรายละเอียดการใช้ Rust-Reth บนโครงสร้างพื้นฐานเดิม
2.  **การติดตั้งเครื่องมือระดับปฏิบัติการ**: ทำการสร้าง Makefile และสร้าง codebase แหล่งประวัติแยกเพื่อเตรียม Pull Request
3.  **การทดสอบซิงก์คู่ขนาน**: ตรวจสอบว่าโหนด op-node เดิมที่เชื่อมต่อ op-reth ใหม่ สามารถซิงก์ L1 Derivation และ P2P Gossip ทัน Sequencer หลักได้เหมือนเกณฑ์มาตรฐาน byte-for-byte
