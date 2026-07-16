# บทวิเคราะห์ระบบการทดสอบ (Testing Infrastructure) ของ claude-code

เอกสารฉบับนี้วิเคราะห์โครงสร้าง วิธีการทดสอบ และแนวปฏิบัติ (conventions) ด้านการทดสอบภายในคลังรหัสของ `claude-code` โดยแบ่งหัวข้อวิเคราะห์ออกเป็น 4 ส่วนหลัก ได้แก่:
1. โครงสร้างและการจัดตั้งไฟล์ทดสอบ (Test Structure and Conventions)
2. เครื่องมือและฟังก์ชันช่วยเหลือการทดสอบ (Test Utilities and Helpers)
3. รูปแบบและเทคนิคการทำ Mocking (Mocking Patterns)
4. แนวทางการประเมินความครอบคลุมการทดสอบ (Coverage Approach)

---

## 1. Test Structure and Conventions (โครงสร้างและข้อตกลงการเขียน Test)

ระบบการทดสอบของ `claude-code` อ้างอิงตาม Bun Runtime เป็นหลัก โดยใช้เฟรมเวิร์กการทดสอบแบบ built-in (`bun test`) ซึ่งมีความเหมาะสมสูงสำหรับ CLI และชุดคำสั่งย่อย (workspaces)

### 1.1 การแบ่งระดับการทดสอบ (Test Levels)
- **Unit Tests (การทดสอบหน่วยย่อย)**: จัดวางแบบ **Colocated/In-source** โดยจัดตั้งโฟลเดอร์ชื่อ `__tests__` อยู่เคียงข้างกับรหัสต้นฉบับในแต่ละโมดูลโดยตรง เช่น:
  - [Tool.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/src/__tests__/Tool.test.ts)
  - [bridgeMessaging.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/src/bridge/__tests__/bridgeMessaging.test.ts)
  - [ArtifactTool.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/packages/builtin-tools/src/tools/ArtifactTool/__tests__/ArtifactTool.test.ts)
- **Integration Tests (การทดสอบเชิงบูรณาการ)**: รวมกันอยู่ในโฟลเดอร์ส่วนกลางที่ชื่อ `tests/integration/` เพื่อทดสอบพฤติกรรมระหว่างส่วนประกอบต่าง ๆ เช่น:
  - [autonomy-lifecycle-user-flow.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/integration/autonomy-lifecycle-user-flow.test.ts)
  - [cli-arguments.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/integration/cli-arguments.test.ts)
  - [goal-lifecycle.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/integration/goal-lifecycle.test.ts)

### 1.2 การตั้งชื่อและมาตรฐาน (Naming & Organization)
- ไฟล์ทดสอบจะใช้รูปแบบ `.test.ts` หรือ `.test.tsx` (เมื่อมีการใช้ React/Ink ในคอมโพเนนต์ส่วนติดต่อผู้ใช้งาน)
- เขียนชุดคำสั่งการทดสอบในรูปแบบ **BDD (Behavior-Driven Development)** โดยเรียกใช้ฟังก์ชัน `describe`, `test` (หรือ `it`), และ `expect` ของ `bun:test`
- ตัวอย่างรูปแบบพื้นฐาน:
  ```typescript
  import { describe, expect, test } from 'bun:test'
  
  describe('buildTool', () => {
    test('fills in default isEnabled as true', () => {
      // test implementation
    })
  })
  ```

### 1.3 สภาพแวดล้อมและการแยกผลลัพธ์ (Test Isolation)
- แต่ละ Test Case จะมีระบบจัดการ Lifecycle โดยใช้ `beforeEach` และ `afterEach` เพื่อตั้งค่าสภาพแวดล้อมใหม่เสมอ
- ในการทดสอบระดับ Integration จะมีการสร้างไดเรกทอรีชั่วคราว (`mkdtempSync`) และแยกการเข้าถึงตัวแปร Config (`CLAUDE_CONFIG_DIR`) ในแต่ละเคส เพื่อหลีกเลี่ยงการติดขัดของทรัพยากรร่วม (cross-test pollution)
- มีการล้างค่าสถานะระบบ (State) ผ่านฟังก์ชันเฉพาะ เช่น `resetStateForTests()`

---

## 2. Test Utilities and Helpers (เครื่องมือและฟังก์ชันช่วยเหลือ)

การทดสอบ `claude-code` ใช้เครื่องมือที่ถูกออกแบบมาเพื่อเพิ่มความคล่องตัวและหลีกเลี่ยงข้อจำกัดของระบบจำลอง:

### 2.1 File System Helpers
เนื่องจากต้องการรักษาความเร็วในการทำงาน ชุดทดสอบจึงมี Wrapper สำหรับจัดการไฟล์ระบบใน Temp directory โดยใช้ API ระดับต่ำของ Bun ในไฟล์ [file-system.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/file-system.ts):
- `createTempDir()` และ `cleanupTempDir()` จัดการสร้างและล้างโฟลเดอร์ขยะ
- `readTempFile(path)` และ `tempPathExists(path)` เลือกใช้ `Bun.file(path).text()` และ `Bun.file(path).exists()` แบบ native ซึ่งเร็วกว่า `node:fs`

### 2.2 Subprocess Build Utility (`ensureCliBundle`)
ในการทำ Integration tests บน Fresh subprocess ด้วย `Bun.spawn` พบปัญหาว่า subprocess ไม่สามารถแปลง Path aliases (`src/*`) จาก tsconfig ที่ระบุใน CWD ปลายทางได้สำเร็จ
- ผู้พัฒนาจึงสร้างฟังก์ชันช่วยเหลือ `ensureCliBundle()` ใน `beforeAll` ของ [autonomy-lifecycle-user-flow.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/integration/autonomy-lifecycle-user-flow.test.ts#L41-L59) เพื่อสั่งคอมไพล์ชุดโค้ดเป็น Bundle ปลายทาง (`dist/cli.js`) ก่อนการรันครั้งแรก ถ้ายังไม่มีไฟล์ดังกล่าว
- การรัน CLI Subprocess จะกระทำบนตัว Bundle จริงเสมอ ช่วยให้การทดสอบพฤติกรรม CLI มีความแม่นยำสูง

### 2.3 Isolated Commander Parser (`createTestProgram`)
ใน [cli-arguments.test.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/integration/cli-arguments.test.ts#L8-L24) มีการแยกฟังก์ชัน `createTestProgram()` เพื่อสร้างอินสแตนซ์ `Command` (ของ `@commander-js/extra-typings`) โดยเรียก `.exitOverride()` ไว้ล่วงหน้า วิธีนี้ทำให้สามารถทดสอบ Option Parsing ได้โดยไม่ต้องเจอกับสถานการณ์ที่โปรเซสถูกสั่งปิดลงในตอนที่เจอ Argument ผิดรูปแบบ

---

## 3. Mocking Patterns (รูปแบบการจำลองการทำงาน)

การจำลอง (Mocking) ในโปรเจกต์นี้ มีเป้าหมายสูงสุดคือ **"ตัดห่วงโซ่การพึ่งพา" (Cut dependency chains)** และป้องกัน **"การปนเปื้อนข้อมูลจำลองข้ามไฟล์" (Cross-file mock pollution)** โดยใช้ฟังก์ชันระดับสูงของ Bun:

### 3.1 Scoped / Per-file Mocking (เทคนิคเฉพาะสำหรับ Axios)
ในการทดสอบทั่วไป การประกาศ `mock.module` อาจมีผลกระทบข้ามไปมาระหว่างไฟล์ทดสอบอื่น ๆ (Pollution)
- โค้ดเบสนี้ใช้วิธีเรียก `setupAxiosMock()` ใน [axios.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/axios.ts)
- ฟังก์ชันนี้จะทำการเรียก `mock.module('axios', ...)` ใหม่เฉพาะขอบเขตของไฟล์ทดสอบนั้น ๆ และคืนค่า `AxiosMockHandle` เพื่อให้แต่ละชุดทดสอบกำหนดค่า Stub ล่วงหน้าได้เอง (`axiosHandle.stubs.get = ...`)
- วิธีนี้ทำให้สามารถใช้งาน Axios จำลองได้อย่างเป็นเอกเทศในแต่ละ suite โดยตัดขาดสถานะร่วมออกไปทั้งหมด

### 3.2 Global & Native Module Mocking
- **node:child_process**: จำลองผ่าน [childProcess.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/childProcess.ts) โดยทำการ Stub คำสั่งหลักอย่าง `execFile` และ `execFileSync` เพื่อดักจับและตรวจสอบพารามิเตอร์โดยไม่ต้องรันคำสั่งบนระบบปฏิบัติการจริง
- **auth.ts**: จำลอง Token lifecycle ผ่าน [auth.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/auth.ts) คืนค่าจำลองที่สมบูรณ์เพื่อให้สอดคล้องกับพฤติกรรมในฝั่ง Production
- **state.ts**: ตัดกระบวนการเตรียมการที่ซับซ้อน เช่น การดึงค่าจริงของ UUID, Duration accumulators, และ Token counts ด้วยการ Mock ตัวแปรสถานะทั้งหมดผ่านอินเตอร์เฟสคงที่ใน [state.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/state.ts)
- **log.ts / debug.ts**: ป้องกันการพยายามเขียนไฟล์บันทึกจริงลงใน Disk ผ่านการ Stub ฟังก์ชัน logging หลักของ CLI ใน [log.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/log.ts) และ [debug.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/debug.ts)
- **toolContext.ts**: ใช้ [toolContext.ts](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/tests/mocks/toolContext.ts) เพื่อเป็น mock `ToolUseContext` สำหรับใช้ในการทดสอบ Unit tests ของเครื่องมือ (tools) โดยไม่มี dependency ไปที่ตัวระบบจริง

---

## 4. Coverage Approach (แนวทางด้านความครอบคลุมการทดสอบ)

การจัดการ Coverage ในคลังโค้ดนี้ถูกออกแบบมาเพื่อสมดุลระหว่างความครอบคลุมกับความเหมาะสมทางสถาปัตยกรรม (Pragmatic approach):

### 4.1 เครื่องมือการเก็บ Coverage
- ใช้ฟีเจอร์ Coverage ดั้งเดิมของ Bun ผ่านคำสั่ง:
  `bun test --coverage --coverage-reporter lcov --coverage-dir coverage`
- การประเมินผลจะใช้ไฟล์ผลลัพธ์ `lcov.info` ส่งขึ้นไปประมวลผลต่อ

### 4.2 ข้อยกเว้นและการกรองผล (Exclusions in `codecov.yml`)
ผู้พัฒนาไม่ได้กำหนดเป้าหมาย Coverage แบบไร้เหตุผล แต่มีการเขียนละเว้นไฟล์บางรายการอย่างเจาะจงใน [codecov.yml](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/codecov.yml):
- **ละเว้นไฟล์ UI / `.tsx`**: เนื่องจากเป็นคอมโพเนนต์หน้าจอแสดงผลด้วย Ink
- **ละเว้นไฟล์ที่พึ่งพาการทำงานสูง (Orchestration-heavy)**: เช่น `resumeAgent.ts` ซึ่งการจะทดสอบโค้ดเพียงไม่กี่บรรทัด จำเป็นต้อง Mock โมดูลพึ่งพามากกว่า 15 ตัว การทำ Mock ทั้งหมดจึงมีภาระและเปราะบางเกินไป ผู้พัฒนาเลือกที่จะปล่อยให้ครอบคลุมผ่าน Integration test ภายนอกแทน
- **ละเว้นโค้ดที่เข้าถึงไม่ได้ในโครงสร้าง (Structurally unreachable)**: เช่น `parseArgs.ts` ที่มีการเช็คความปลอดภัยแบบตั้งรับ (defensive) ซึ่งไม่สามารถเข้าถึงได้จากภายนอกเนื่องจากมีระบบตรวจสอบด้านหน้าคอยกันไว้ จึงทำสัญลักษณ์เลี่ยงการเช็คในระดับ Codecov แทนเนื่องจากเครื่องมือเก็บครอบคลุมของ Bun ไม่ยอมรับความเห็นประเภท `/* istanbul ignore next */`

### 4.3 การตรวจสอบความเสถียรใน CI
ในส่วนขั้นตอนท่อส่ง CI ใน [ci.yml](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/claude-code-best/claude-code/origin/.github/workflows/ci.yml#L41-L49) มีการเขียนคอมเมนต์ระบุเรื่อง **Flaky tests** (ซึ่งเกิดจากการปนเปื้อนของ Mock หรือลำดับสถานะการรันใน Bun) แต่ CI ยังคงบังคับเช็คว่าต้องมีไฟล์ `lcov.info` ที่สมบูรณ์และมีเนื้อหาประมวลผลจริงผ่านชุดคำสั่งดักกรอง:
```bash
bun test --coverage --coverage-reporter lcov --coverage-dir coverage 2>&1 | grep -vE '^\s*(\(pass\)|\(skip\))'
test -s coverage/lcov.info
grep -q '^SF:' coverage/lcov.info
```
