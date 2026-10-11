# Dossier: ConPass (Color Blindness Contact Lenses) Complete Ecosystem

**Author**: No.6 Gemini (Pack Leader) · `[maclab:no6]`  
**Date**: 2026-10-01  
**Category**: Business Operations & Enterprise Infrastructure Dossier  
**Target Brand**: ConPass (คอนแทคเลนส์กรองแสงตาบอดสี)

---

## 1. Web Infrastructure & Landing Pages

- **Production Domain**: `https://conpasslens.com/`
- **Internal / Staging Domains**: `https://conpass.clubsxai.com`, `https://conpass-landing.pages.dev` (Cloudflare Pages)
- **Local Source Repository**: `/Users/admin/Code/github.com/MEYD-605/mimo-oracle/projects/conpass-landing/`
- **Architecture**: Responsive High-Conversion Single Page Application (HTML5 / TailwindCSS / Vanilla JS / Schema.org MedicalDevice SEO)

### Key Page Routes
1. `index.html` / `conpass-landing.html` (V5 Release — 98 KB):
   - Interactive Ishihara test simulation with before/after visual filter toggle.
   - 3-Way Decision Matrix (ConPass vs. แว่นตาบอดสี vs. เลนส์เถื่อนทั่วไป).
   - Interactive FAQ accordion addressing safety, pupil blend, and test passing.
   - Schema.org structured medical device data for rich Google search snippets.
2. `bangkok-pickup.html`:
   - จุดนัดรับด่วนใน กทม. ลาดพร้าว 48 ใกล้ MRT สายสีเหลือง สถานีภาวนา พร้อมแผนที่และขั้นตอนเดินทาง.
3. `factory-jobs.html`:
   - เจาะกลุ่มคนสอบเข้างานโรงงาน ตรวจสุขภาพฝ่ายผลิต, ช่างเทคนิค, QC.
4. `korea-eps.html`:
   - เจาะกลุ่มแรงงานไทยไปเกาหลีใต้ ทดสอบสมรรถภาพร่างกาย EPS-TOPIK.
5. `guides.html`:
   - คู่มือเทคนิคการใส่เลนส์ การดูแลรักษา และเทคนิคการอ่านแผ่นทดสอบสี.

---

## 2. Social Media & Facebook Infrastructure

- **MCP Integration**: `/Users/admin/Code/github.com/MEYD-605/facebook-mcp-server/`
- **Active Pages**:
  1. **Page 1 (เพจหลัก)**:
     - Name: `Conpass คอนแทคตาบอดสี`
     - Page ID: `107870654966895`
     - Status: Live / Verified / Direct inbox synced to Mattermost
  2. **Page 2 (เพจใหม่ / แคมเปญเสริม)**:
     - Name: `ตาบอดสี ConPass`
     - Page ID: `1793802327536139`
     - Status: Live / Synced to Mattermost

---

## 3. Omnichannel Communications & Contact Directory

- **LINE Official Account (LINE OA)**: `@conpasslen` (Synced to Mattermost Channel 10)
- **Direct Phone Contact**: `080-255-9500` (ช่างโม / HippyMo)
- **Physical Pickup Hub**:
  - ซอยลาดพร้าว 48 แขวงสามเสนนอก เขตห้วยขวาง กรุงเทพมหานคร
  - การเดินทาง: รถไฟฟ้าสายสีเหลือง MRT สถานีภาวนา (Phawana Station)
- **Banking & Payment Gateways**:
  - PromptPay: `0949989486` (สุจิต มานิตยกุล - Bo)
  - ธนาคารกสิกรไทย (KBank): `051-2-97876-2` (สุจิต มานิตยกุล)
  - ธนาคารไทยพาณิชย์ (SCB): `111-508-3127` (สุจิต มานิตยกุล)

---

## 4. Mattermost Enterprise Operations Hub

- **Public URL**: `https://mm.clubsxai.com`
- **Local Network URL**: `http://127.0.0.1:8065`
- **Daemon Process**: `/Users/admin/srv/mattermost/hermes-mattermost-daemon.py`
- **Team**: `clubs` (`788yy3gqq7y59brj3pxqdjd3kr`)
- **Key ConPass Channels**:
  - `04 | 👁️ แผนกคอนแทคเลนส์ ConPass` (`conpass-lens`, ID: `k5ipktrqcbbibbctjyxfu7fqqa`)
    - พื้นที่ปฏิบัติการหลักของทีม แจ้งงานสต็อก ออร์เดอร์พิเศษ และสถานะจัดส่ง
  - `07 | 📥 ลูกค้า FB: 👁️ ConPass (เพจหลัก)` (`inbox-conpass`, ID: `hnon95eqntn4mym3xumpzmheje`)
    - ซิงก์แชท Real-time จาก Facebook Page ID `107870654966895`
  - `08 | 📥 ลูกค้า FB: 👁️ ConPass (เพจใหม่)` (`inbox-conpass-new`, ID: `rd31p19197fz5yc73fr6x3x7or`)
    - ซิงก์แชท Real-time จาก Facebook Page ID `1793802327536139`
  - `10 | 📥 ลูกค้า LINE: 🟢 บัญชีทางการ LINE OA` (`inbox-line`, ID: `8ikadamk7bb6uph5nfguqyz7hy`)
    - ซิงก์แชท Real-time จาก LINE OA `@conpasslen`
- **CRM Integration**:
  - Focalboard Kanban Board เชื่อมต่ออัตโนมัติ ติดตามสถานะ Lead -> Ordered -> Paid -> Shipped -> Completed.

---

## 5. Product Packaging, Pricing & Fulfillment Matrix

### Standard Kit (ชุดมาตรฐานพร้อมใช้งาน): 1,490.- THB (จากราคาปกติ 2,500.-)
- **รายการสินค้าในเซ็ต**:
  1. คอนแทคเลนส์ ConPass ในขวดแก้วสุญญากาศ Sterile 2 ขวด (อายุการเก็บรักษา 1 ปี / เปิดใช้รายเดือน)
  2. ตลับแช่เลนส์ Luxury Matte Black สกรีนฟอยล์ทอง พร้อมกระจกในตัว
  3. น้ำยาแช่และล้างคอนแทคเลนส์ขวดพกพา
  4. ชุดอุปกรณ์ใส่เลนส์: ที่คีบเลนส์ซิลิโคน และแท่งดูดเลนส์สูญญากาศ
  5. คู่มือภาพสีเทคนิคการอ่านแผ่นทดสอบ Ishihara 24/38 Plates
- **ช่องทางการจัดส่ง**:
  - ส่งด่วน Flash Express / EMS ฟรีทั่วประเทศ (1-2 วันทำการ)
  - บริการเก็บเงินปลายทาง (COD) ไม่บวกเพิ่ม
  - Grab Express / Lalamove ส่งด่วนถึงมือ 1–2 ชั่วโมงในเขต กทม. และปริมณฑล (คิดค่าส่งตามระยะทางจริง)
  - นัดรับหน้าร้าน ลาดพร้าว 48 MRT ภาวนา (ฟรีไม่มีค่าจัดส่ง)

### Van Express Kit (ชุดด่วนพิเศษรถตู้ข้ามจังหวัด): 1,900.- THB
- จัดส่งผ่านคิวรถตู้ / รถทัวร์ (หมอชิต 2 / เอกมัย / สายใต้ใหม่) ถึงผู้รับภายในวันเดียวกันหรือเช้าวันรุ่งขึ้น
- เหมาะสำหรับลูกค้าที่ต้องใช้สอบตรวจร่างกายด่วนแบบฉุกเฉินต่างจังหวัด (รับเฉพาะการโอนเงินล่วงหน้า)

---

## 6. Digital Marketing & Advertising Infrastructure

- **Google Ads Manager (MCC)**: CID `810-402-1058` (Conpass Manager)
- **Google Ads Child Account**: CID `610-476-1960` (`conpass.ai1@gmail.com`)
- **Core Search Keywords**:
  - `ตาบอดสี สอบ ใบขับขี่`
  - `คอนแทคเลนส์ ตาบอดสี ราคา`
  - `ตรวจตาบอดสี เกาหลี EPS`
  - `สมัครงานโรงงาน ตาบอดสี`
  - `คอนแทคเลนส์ แก้ ตาบอดสี แดงเขียว`

---

## 7. Sales Closing SOP (4-Step Standard Script)

1. **Step 1: คลายความกังวล & สร้างความมั่นใจ 100%**:
   - ยืนยันว่าเมื่อใส่เลนส์เข้ากับตา เลนส์จะกลืนไปกับรูม่านตาดำ มองภายนอกไม่ออก และช่วยให้แยกแยะเฉดสีบนแผ่นทดสอบ Ishihara ชัดเจนทันที.
2. **Step 2: เช็ควันใช้งาน & ไทม์ไลน์**:
   - สอบถามวันและเวลาที่ต้องเข้าตรวจ เพื่อเลือกโซลูชันการจัดส่งที่ทันเวลา 100% (EMS / Grab / รถตู้ / นัดรับ).
3. **Step 3: ปิดการขายด้วยชุดโปรโมชั่น 1,490.-**:
   - นำเสนอชุดอุปกรณ์ครบเซ็ตไม่ต้องซื้ออะไรเพิ่ม พร้อมส่งฟรี / COD.
4. **Step 4: รับออร์เดอร์ & ยืนยันการชำระ**:
   - เก็บที่อยู่จัดส่ง เบอร์โทร หรือส่งบัญชีธนาคารพร้อมสลิปโอนเงิน แล้วบันทึกลง Mattermost / Focalboard ทันที.
