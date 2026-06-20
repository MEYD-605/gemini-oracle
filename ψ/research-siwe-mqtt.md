# ผลการศึกษาความเป็นไปได้: ระบบลงชื่อเข้าใช้ด้วย Ethereum บน MQTT Broker (SIWE on MQTT Broker Feasibility Study)
ผู้สรุป: No.6 Gemini (Research Companion, Oracle Council)

---

## 1. ปัญหาพื้นฐาน (Protocol Mismatch)
โปรโตคอล MQTT เป็นรูปแบบน้ำหนักเบา (Lightweight Messaging) ที่เชื่อมต่อด้วยโครงสร้างคงที่ผ่าน `CONNECT` packet ซึ่งโดยทั่วไปจะรับข้อมูลความน่าเชื่อถือเพียงแค่ **Username (สูงสุด 65,535 bytes)** และ **Password (สูงสุด 65,535 bytes)**

ในขณะที่ **SIWE (Sign-In with Ethereum - EIP-4361)** เป็นมาตรฐานที่อิงอยู่บนสถาปัตยกรรม Challenge-Response ของเว็บดั้งเดิม (HTTP/REST) ซึ่งจำเป็นต้องมีขั้นตอนการขอ Nonce, การสร้างข้อความ SIWE ในฟอร์แมตมาตรฐานที่มีข้อมูลชื่อโดมเนสและเวลาหมดอายุ และการส่งลายมือชื่อ (Signature) กลับมาตรวจสอบ

ดังนั้น **MQTT Broker จะไม่มีฟังก์ชัน SIWE ติดมาด้วยแบบสำเร็จรูป (Out-of-the-box)** แต่เราสามารถสถาปนาสถาปัตยกรรมขึ้นมาได้ 3 แนวทางหลักดังนี้:

---

## 2. โครงสร้างสถาปัตยกรรมทางเลือก (Feasible Architectures)

### แนวทาง A: ผ่านสถาปัตยกรรม Token-Based Authentication (แนะนำที่สุด - Production Ready)
ใช้ตัวกลางในการทำ SIWE Handshake เพื่อออกใบเบิกทางก่อนเชื่อมต่อโหนด MQTT

```
   [ Client App ] --(1) SIWE Challenge/Signature--> [ Web API / Auth Server ]
         |                                                 |
         |                                           (Verify via Ethers/SIWE library)
         |                                                 |
         |<--(2) Return JWT (Ethereum Address in Subject)--+
         |
         +--(3) MQTT CONNECT -----------------------------------> [ MQTT Broker ]
                - Username: 0xAddress...                                |
                - Password: JWT_Token                                   |
                                                                        +--(4) Verify JWT signature
                                                                               (Local or Webhook)
```

1.  **ขั้นตอนการเชื่อมต่อ:**
    *   **ขั้นแรก:** แอปพลิเคชัน Client ติดต่อไปยัง Web Authentication Server เพื่อลงชื่อเข้าใช้ด้วย SIWE ตามมาตรฐานปกติ (เช่น รับ nonce -> sign message ผ่าน wallet -> ส่งตรวจสอบ signature)
    *   **ขั้นสอง:** เมื่อระบบยืนยันความถูกต้อง Web Server จะออกรหัสผ่านชั่วคราวในรูปแบบ **JWT (JSON Web Token)** ที่เข้ารหัสข้อมูลกระเป๋า (Wallet Address) และตั้งเวลาหมดอายุเอาไว้
    *   **ขั้นสาม:** Client นำ JWT นี้ไปกรอกเป็น `Password` และ Wallet Address เป็น `Username` ในการเชื่อมต่อ MQTT
2.  **ฝั่ง MQTT Broker (เช่น EMQX หรือ Mosquitto):**
    *   เปิดใช้งานปลั๊กอินตรวจสอบ JWT ในตัว (เช่น `emqx_auth_jwt` หรือใช้ปลั๊กอินเสริมของ Mosquitto) เพื่อทำการแกะลายเซ็นและตรวจสอบสิทธิ์ของ Token
3.  **ข้อดี:**
    *   ไม่ต้องเขียนปลั๊กอินระดับล่างที่ Broker (ใช้ฟังก์ชันมาตรฐานของ EMQX/Mosquitto ได้เลย)
    *   ความเร็วในการต่อท่อสูง (โหนดไม่จำเป็นต้องทำลายเซ็นวิเคราะห์ cryptography ใหม่ทุกครั้งที่ reconnect)
    *   เข้ากันได้ดีกับ MQTT Client ทั่วไป

---

### แนวทาง B: ตรวจสอบ SIWE บน Payload CONNECT โดยตรงผ่าน HTTP Webhook Plugin
ใช้การแปลง Payload SIWE ไปไว้ในช่อง Password แล้วส่งตรวจสอบผ่าน Webhook

1.  **ขั้นตอนการเชื่อมต่อ:**
    *   Client ทำการจัดทำข้อความ SIWE และสร้างลายเซ็น (Signature)
    *   Client เข้ารหัส Payload (Message + Signature) เป็นข้อความ JSON
    *   Client ส่งข้อมูลไปยัง MQTT Broker โดยกรอก `Username = Wallet Address` และ `Password = JSON Payload`
2.  **ฝั่ง MQTT Broker (เช่น Mosquitto ร่วมกับ mosquitto-go-auth หรือ EMQX):**
    *   ตั้งค่าการตรวจสิทธิ์ด้วยปลั๊กอิน **HTTP Auth Webhook**
    *   เมื่อมีผู้เชื่อมต่อ Broker จะยิงข้อมูล Username และ Password (JSON Payload) ไปยัง Authentication HTTP Endpoint
    *   ฝั่งเว็บ Endpoint ทำการแกะ JSON รันคลัง SIWE (`viem` หรือ `ethers`) ตรวจสอบความสมบูรณ์ หากแฮชถูกและ wallet ตรงจะคืนค่า HTTP `200` กลับไปให้โหนดผ่านด่าน
3.  **ข้อดี:**
    *   ไม่ต้องใช้ Web App แยกทำ handshaking ก่อน Client สามารถต่อเข้า Broker ได้ตรงๆ
4.  **ข้อเสีย:**
    *   การประมวลผลเซ็นสัญญาบล็อกเชน (secp256k1) ทุกครั้งที่ Reconnect จะกินแรงเครื่องฝั่งหลังบ้านค่อนข้างสูง

---

### แนวทาง C: การใช้ MQTT 5.0 Enhanced Authentication (Challenge-Response)
ใช้คุณสมบัติแลกเปลี่ยนแพ็กเก็ต `AUTH` ของ MQTT 5.0

1.  **ขั้นตอนการเชื่อมต่อ:**
    *   Client ส่งแพ็กเก็ต `CONNECT` พร้อมระบุกลไกตรวจสอบสิทธิ์เป็น `SIWE`
    *   MQTT Broker ส่งแพ็กเก็ต `AUTH` กลับไปพร้อมความท้าทาย (Nonce/Challenge Message)
    *   Client เซ็นกำกับข้อความด้วย Private Key และส่งแพ็กเก็ต `AUTH` กลับมาที่โหนด
    *   โหนดทำการยืนยันสิทธิ์และอนุญาตเชื่อมต่อ
2.  **ข้อจำกัด:**
    *   ต้องใช้ Broker ที่รองรับขั้นสูง (เช่น HiveMQ ร่วมกับส่วนขยาย SDK หรือ EMQX ปรับแต่งพิเศษ)
    *   ไลบรารีฝั่ง Client ในฝั่ง IoT หลายตัวยังไม่รองรับแพ็กเก็ต `AUTH` ของ MQTT 5.0

---

## 3. ตัวเลือกซอฟต์แวร์ที่แนะนำ
1.  **EMQX (แนะนำที่สุด):**
    *   มีระบบ JWT Authentication ในตัวที่เสถียรและเร็วมาก รองรับการทำงานคู่ขนานระดับ Enterprise
2.  **Mosquitto:**
    *   เหมาะสำหรับงานขนาดเล็กและเบา โดยใช้งานควบคู่กับปลั๊กอินยอดนิยมอย่าง **`mosquitto-go-auth`** ในการยิง Webhook ไปตรวจสิทธิ์ที่ Web API หลังบ้าน

---

## 4. ข้อสรุปการออกแบบระบบจริง (Final Stateless Time-Based Design)

สืบเนื่องจากการหารือเกี่ยวกับ Nonce และ Replay Attack เราได้ข้อสรุปร่วมในการเลือกใช้สถาปัตยกรรมแบบ **Time-Based Agreement** ที่ตัดภาระ Nonce Server ออกไป และย้ายการรักษาความปลอดภัยแบบครอบคลุมไปไว้ที่ **Message-Level Signature** ดังรายละเอียดด้านล่าง:

```text
SIWE-MQTT DESIGN (Lightweight, stateless, message-level verified)

1. CONNECT AUTHENTICATION (Gateway)
- Username: Client Address (0x...)
- Password: timestamp:signature
  * timestamp = epoch seconds (e.g. 1782012045)
  * signature = sign("SIWE-MQTT Connect: <address> at <timestamp>")
- Broker Verification (Stateless via webhook):
  * Split password into timestamp and signature.
  * Check drift: abs(now - timestamp) < 30 seconds.
  * Recover signer address from signature.
  * Verify recovered address == username.
  * If valid, return HTTP 200 to allow connection.

2. REPLAY & ATTACK PROTECTION
- Short drift window (30s) prevents replay of CONNECT packet.
- No nonce server needed, keeping MQTT client stateless and clean.
- Message-level signature acts as the primary cryptographical guard:
  * Payload format: { "data": ..., "timestamp": ..., "sig": ... }
  * Subscriber decodes signature to verify sender on every message.
  * Broker auth is only a gateway gate (to discard spam early).

3. TOPIC ACL (Access Control List)
- Address-based rules evaluated dynamically:
  * e.g., Publish: device/<address>/telemetry
  * e.g., Subscribe: device/<address>/commands
- Optional token-gating: Webhook checks address balance/NFT on L2.

4. TARGET STACK
- Broker: EMQX (with HTTP auth & ACL webhook)
- Backend: Node.js / Bun Webhook (Viem / Ethers for recover)
- Client: Plain MQTT client with pre-connect sign helper
```

---

## 5. การรองรับ MQTT Bridge และเปรียบเทียบการทำ Clustering (MQTT Bridge & Clustering Comparison)

### 5.1 ข้อควรระวังในการทำ MQTT Bridging
เนื่องจาก MQTT Bridge ทำงานเป็นเบื้องหลังโดยใช้ค่าคอนฟิกคงตัว (Static Config) ในไฟล์คอนฟิก ทำให้ระบบไม่สามารถสร้างลายเซ็นแบบไดนามิก (Dynamic SIWE) ทุกครั้งที่ Reconnect ได้ เพื่อความเข้ากันได้ เราต้องแบ่งแยกพอร์ตและสิทธิ์เข้าถึง:
* **พอร์ตหลัก (Dynamic SIWE)**: สำหรับอุปกรณ์ปลายทาง (Edge) และผู้ใช้ทั่วไป
* **พอร์ตสำหรับ Bridge (Static Auth/MTLS)**: สำหรับเชื่อมต่อระหว่างโบรกเกอร์ โดยอาจใช้ TLS Client Certificate (MTLS) หรือโทเค็นระยะยาว ร่วมกับการจำกัด ACL ให้คุยเฉพาะหัวข้อสำหรับ Bridge (`bridge/#`)

### 5.2 การเลือกโบรกเกอร์ที่รองรับการทำ Clustering
เมื่อต้องการขยายระบบเป็นคลัสเตอร์เพื่อรองรับการขยายตัวเชิงรุก (Horizontal Scaling) โบรกเกอร์ที่เหมาะสมมีดังนี้:

1. **EMQX (แนะนำที่สุด)**
   * **การทำ Cluster**: รองรับในตัวแบบ Native (ผ่าน Mnesia / Erlang Distribution)
   * **จุดเด่น**: รองรับการเชื่อมต่อพร้อมกันสูงมาก ปรับแต่งสิทธิ์ผ่าน Webhook และมี Rule Engine ในตัวที่เสถียร เหมาะกับระบบสเกลใหญ่

2. **VerneMQ (ทางเลือกประสิทธิภาพสูง)**
   * **การทำ Cluster**: รองรับในตัวแบบ Native (Masterless Clustering)
   * **จุดเด่น**: เบาและจัดการหน่วยความจำได้เร็วมาก สามารถเชื่อมต่อเขียนเว็บฮุกควบคุมการทำงานได้หลากหลาย

3. **HiveMQ (Enterprise Grade)**
   * **การทำ Cluster**: รองรับเฉพาะรุ่นจำหน่ายเชิงพาณิชย์ (Enterprise Edition) ส่วนเวอร์ชันชุมชน (Community Edition) จะไม่มีระบบคลัสเตอร์ติดตัวมาให้

4. **Mosquitto (ไม่แนะนำสำหรับการทำ Native Cluster)**
   * **การทำ Cluster**: ไม่มีระบบคลัสเตอร์ในตัว การขยายระบบมักใช้วิธีทำ Bridge ไปยังโหนดอื่น หรือการตั้ง Load Balancer ด้านหน้า ซึ่งมีความยุ่งยากในการจัดการเมื่อมีอุปกรณ์จำนวนมาก

