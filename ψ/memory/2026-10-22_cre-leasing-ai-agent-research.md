# Comprehensive Research Report: AI Agents in Commercial Real Estate (CRE) Leasing
**Focus:** Office & Retail Tenant Representation (Tenant-Rep) and Occupier Services (Colliers, CBRE, JLL, Cushman & Wakefield, PropTech)  
**Target:** Implementation on Samsung Galaxy Z Flip 5 (Companion Agent *Rdda* for Colliers Leasing Advisors)  
**Date:** 2026-10-22  
**Researcher:** CRE AI Agent Researcher Subagent via No.6 Gemini `[maclab:06-gemini]`

---

## 1. Executive Summary & Market Landscape

Commercial Real Estate (CRE) leasing is shifting from passive software (Salesforce, Apto, CoStar) to **Agentic Transaction Execution**. In Tenant Representation and Occupier Services, brokers represent corporate tenants whose goals oppose landlords: minimizing Net Effective Rent (NER), maximizing expansion/termination flexibility, capping operating expense pass-throughs, and accelerating occupancy timelines.

Traditionally, tenant-rep brokers spend **60–70% of their billable time on administrative friction**: manual lease abstraction, normalizing landlord RFP responses into Excel leveling sheets, running discounted cash flows for Net Effective Rent, generating tour books, and drafting non-binding Letters of Intent (LOIs).

---

## 2. Institutional Deployments & Startup Ecosystem

| Brokerage / Tech | AI Platform | Core Leasing & Occupier Capabilities | Architecture & Tech Stack |
| :--- | :--- | :--- | :--- |
| **Colliers** | **Colliers360**<br>• Generative Workplace AI | • 3D space configuration & hybrid ratio scenario modeling<br>• Automated lease admin extraction<br>• IoT occupancy analytics (*Basking* sensors) | Agnostic data layer, OutSystems / Python microservices, MRI Software integration. |
| **JLL** | **JLL GPT**<br>• JLL Falcon Platform<br>• LeasingOS | • Natural language querying over stacking plans & vacancies<br>• Compresses market rent comp research from weeks to hours<br>• Workplace strategy formulation | Custom fine-tuned LLM on private transaction/comp database, enterprise sandbox. |
| **CBRE** | **Gemini Enterprise Agent**<br>• Capital AI / Ellis AI | • Unstructured lease document intelligence<br>• Multi-step autonomous agentic transaction workflows<br>• Predictive tenant expansion tracking | Partnership with Google Cloud (Gemini) and McKinsey. |
| **Prophia** | **Lease Abstraction Standard** | • Deep extraction of complex covenants: ROFO, ROFR, contraction rights, restoration ("make good") obligations | Custom NLP pipeline with amendment hierarchy tracking. |
| **Dealpath** | **Dealpath AI & MCP** | • Automated ingestion of Offering Memorandums (OMs) and broker flyers into standardized deal models | Deal management automation platform. |
| **Occupier.com** | **Occupier Platform** | • Built specifically for tenant-rep brokers: site selection, lease leveling, ASC 842 / IFRS 16 lease accounting | Corporate occupier software stack. |

---

## 3. End-to-End Tenant-Rep Agent Capabilities

```
[1. Space Programming] ──> [2. Market Survey] ──> [3. RFP Leveling] ──> [4. LOI Generation]
                                                                              │
[8. Stale Deal Alerts] <── [7. TI Buildout]   <── [6. Lease Abstract] <──────┘
```

1. **Space Programming & Calculation:** Headcount to USF/RSF, BOMA 2017 loss factors, hybrid desk-sharing ratio (1.25:1 - 1.5:1), collaborative space allocation (25-35%).
2. **Option Comparison Matrix & Leveling:** Normalizing Full Service Gross vs. NNN, calculating Net Effective Rent (NER) and NPV discounted at client's WACC.
3. **Automated LOI Drafting:** Colliers-standard Letter of Intent with non-binding commercial terms and binding carve-outs (representation, exclusivity, confidentiality).
4. **Lease Abstraction & Due Diligence:** Critical dates (9-12 month renewal windows), controllable CAM caps (5% cumulative), restoration ("make good") clauses, retail co-tenancy & exclusivity.
5. **Stale Deal & Expiration Pipeline Engine:** 18-24 month proactive renewal/relocation triggers.

---

## 4. Mobile Ergonomics & 5 Killer Features for Rdda (Samsung Z Flip 5)

### Ergonomic Synergies:
- **Flex Window (3.4" Cover Screen - จอนอก):**
  - *1-Tap Field Voice Memo:* แตะอัดเสียงสรุปไซต์ทัวร์ทันทีที่เดินออกจากลิฟต์
  - *Next Building Dossier:* ดึงสเปกตึกถัดไปอัตโนมัติตามพิกัด GPS
  - *Flash NER Card:* ป้อน TI + Free Rent คำนวณค่าเช่าสุทธิบนจอนอก
- **Flex Mode (พับ 90° ตั้งโต๊ะ):**
  - *Conference Table Co-Pilot:* วางตั้งโต๊ะไม่ต้องใช้ขาตั้ง แอบจด/สรุปข้อเสนอระหว่างคุยกับ Landlord
  - *Snap-to-Spec Vision:* ถ่ายรูปผังห้อง (Floor Plan) ตรวจเสา, ทางเดิน, สเปกห้องทันที

### 5 Killer Mobile Features for Khun Mook:
1. **Pocket Underwriter:** คำนวณเปรียบเทียบข้อเสนอค่าเช่าทันทีในห้องประชุม (เช่น $40 ฐาน vs $43 แต่ได้ Free Rent เพิ่ม 2 เดือน + TI เพิ่ม)
2. **Walkthrough Voice-to-Matrix:** เดินตรวจตึกแล้วพูดโน้ต ระบบแปลงเป็นสเปกห้อง, จุดที่ Landlord ต้องปรับปรุง, และความพึงพอใจของลูกค้า
3. **Snap-to-Spec Floorplan Scanner:** ถ่ายรูปผังห้อง ตรวจสอบ Usable vs Rentable และการแบ่งกั้นห้อง
4. **Colliers-Standard LOI & Proposal Drafter:** ร่างเอกสารข้อเสนอและ LOI ภาษาอังกฤษทางการตามแบบ Colliers International
5. **10-Minute Post-Tour Client Recap:** สรุปทัวร์ตึกพร้อมรูปถ่ายส่ง LINE/WhatsApp ให้ลูกค้าทันทีหลังตรวจตึกเสร็จ
