# ESP WebRTC Solution Quick Reference Guide
### คู่มืออ้างอิงด่วนสำหรับโซลูชัน ESP WebRTC บนบอร์ด Espressif

คู่มือนี้ทำหน้าที่เป็นคู่มืออ้างอิงและ Cheatsheet สำหรับนักพัฒนาในการสร้างระบบ WebRTC (เสียง, วิดีโอ และช่องข้อมูล/Data Channel) บนชิป ESP32 Series (เช่น ESP32-S3, ESP32-P4) โดยใช้ SDK อย่างเป็นทางการของ Espressif

---

## 🔍 1. SDK Overview, Codecs & Protocols
### ภาพรวมของ SDK, ตัวแปลงสัญญาณ และโปรโตคอลที่รองรับ

โซลูชัน WebRTC ของ Espressif มีโครงสร้างโมดูลที่แยกบทบาทหน้าที่ออกจากกันอย่างชัดเจน:
*   **`esp_webrtc`**: ไลบรารีระดับสูง (High-level Wrapper) ทำหน้าที่เชื่อมประสานระหว่าง Signaling, PeerConnection และ Media Pipeline (Capture/Playback)
*   **`esp_peer`**: ส่วนการนำ PeerConnection ตามมาตรฐาน WebRTC มาใช้จริง (realization) โดยพัฒนาต่อยอดมาจาก [libpeer](https://github.com/sepfy/libpeer.git) และปรับปรุงประสิทธิภาพสำหรับการรันบน ESP32
*   **`esp_capture`**: คอมโพเนนต์สำหรับรับข้อมูลมัลติมีเดีย (Media Capture) เช่น กล้อง และไมโครโฟน
*   **`av_render`**: คอมโพเนนต์สำหรับแสดงผลมัลติมีเดีย (Media Render/Playback) เช่น ลำโพง และหน้าจอ

```
                     +---------------------------------------+
                     |             Application               |
                     +---------------------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |              esp_webrtc               |
                     +---------------------------------------+
                       /                 |                 \
                      v                  v                  v
             +---------------+   +---------------+   +---------------+
             |   Signaling   |   |   esp_peer    |   |  Media System |
             +---------------+   +---------------+   +---------------+
             (AppRTC/WHIP/OpenAI)   (ICE/DTLS/SCTP)   (esp_capture/render)
```

#### 🌐 โปรโตคอลที่รองรับ (Supported Protocols)
*   **ICE (Interactive Connectivity Establishment)**: รองรับทั้งบทบาท Controlling และ Controlled, สนับสนุนการเลือก ICE Candidate คู่ที่ดีที่สุดอย่างรวดเร็ว, รองรับ STUN/TURN (ตาม RFC5766 และ RFC8656) และ TCP ICE
*   **DTLS (Datagram Transport Layer Security)**: ความปลอดภัยในระดับ Transport โดยเรียกใช้งานผ่านไลบรารี `mbedTLS` ของ ESP-IDF
*   **SCTP (Stream Control Transmission Protocol)**: ใช้สร้างช่องทาง Data Channel รองรับทั้งการส่งข้อมูลแบบเชื่อถือได้ (Reliable) และไม่เชื่อถือได้ (Unreliable), การส่งตามลำดับ (Ordered) และสลับลำดับ (Unordered), รองรับการจัดแบ่งข้อมูลขนาดใหญ่ (SACK)
*   **RTP/SRTP (Secure Real-time Transport Protocol)**: การส่งสตรีมมีเดียที่ปลอดภัยผ่านไลบรารี `libSRTP` พร้อมกลไกแก้ไขความผิดพลาด เช่น NACK (Negative Acknowledgment), Retransmission และ Jitter Buffering

#### 🎹 ตัวแปลงสัญญาณมีเดีย (Supported Codecs)
*   **Audio Codecs**: OPUS (แนะนำสำหรับ OpenAI Realtime), G.711A (PCMA), G.711U (PCMU)
*   **Video Codecs**: H.264, MJPEG

---

## 🚀 2. Step-by-Step Guide to Run Solutions
### ขั้นตอนการรันโซลูชันตัวอย่างใน SDK

### 📋 การตั้งค่า ESP-IDF เบื้องต้น (Common Prerequisites)
เปิดใช้งานตัวเลือกเหล่านี้ในโปรเจกต์ของคุณผ่าน `menuconfig` หรือกำหนดไว้ใน `sdkconfig.defaults`:
```ini
CONFIG_MBEDTLS_SSL_PROTO_DTLS=y
CONFIG_MBEDTLS_SSL_DTLS_SRTP=y

# สำหรับ ESP-IDF v6.0 ขึ้นไป ต้องเพิ่ม:
CONFIG_MBEDTLS_X509_CREATE_C=y
```

---

### 🟢 2.1 OpenAI Real-Time Chat Demo (`openai_demo`)
ตัวอย่างการคุยโทรศัพท์แบบ Real-time กับเซิร์ฟเวอร์ OpenAI (เสียง/ข้อมูล) พร้อมรองรับ Function Calling ควบคุมอุปกรณ์ผ่านเสียง

1.  **ตั้งค่า Wi-Fi**: ไปที่ไฟล์ [settings.h](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/solutions/openai_demo/main/settings.h) เพื่อกรอก SSID และ Password
2.  **ตั้งค่า OpenAI API Key**: บนคอมพิวเตอร์ของคุณ ให้รันคำสั่งส่งออกตัวแปรระบบ:
    ```bash
    export OPENAI_API_KEY=your_openai_api_key_here
    ```
3.  **คอมไพล์และแฟลช**:
    ```bash
    idf.py -p YOUR_SERIAL_DEVICE flash monitor
    ```
4.  **วิธีทดสอบ**:
    *   หลังบูตสำเร็จ บอร์ดจะเชื่อมต่อ Wi-Fi และเข้าหาเซิร์ฟเวอร์ OpenAI อัตโนมัติ โดยใช้ WebSocket/HTTPS เพื่อดึง Ephemeral Token สำหรับแลกเปลี่ยน SDP
    *   ใช้คำสั่งทางคอนโซล `start` เพื่อคุย และ `stop` เพื่อหยุด
    *   ลองสั่งการทำงานผ่านเสียง เช่น *"Open the door"* หรือ *"Turn on the light"* โค้ดจะตอบรับฟังก์ชัน (Function Calling) และเรียกฟังก์ชันควบคุมภายในบอร์ด ([webrtc.c:L57-L91](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/solutions/openai_demo/main/webrtc.c#L57-L91))

---

### 🔵 2.2 WHIP Publish Client Demo (`whip_demo`)
ใช้ส่งสตรีมภาพกล้องและเสียงจาก ESP32 (เช่น ESP32-P4) ไปยังเซิร์ฟเวอร์สตรีมมิ่งที่รองรับโปรโตคอล WHIP (WebRTC HTTP Ingestion Protocol)

1.  **ติดตั้งและรันเซิร์ฟเวอร์ทดสอบ**: สามารถใช้ [mediaMTX](https://github.com/bluenviron/mediamtx) เป็นเซิร์ฟเวอร์รับสตรีมได้
2.  **ตั้งค่า Wi-Fi & URL**: ในไฟล์ [settings.h](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/solutions/whip_demo/main/settings.h) ให้แก้ไขค่า:
    *   Wi-Fi SSID/Password
    *   `WHIP_URL` (เช่น `http://192.168.1.100:8554/mystream`)
    *   `WHIP_TOKEN` (Bearer/Basic Auth Token)
3.  **คอมไพล์และแฟลช**:
    ```bash
    idf.py -p YOUR_SERIAL_DEVICE flash monitor
    ```
4.  **วิธีเล่นสตรีม (Playback)**:
    เปิดเครื่องคอมพิวเตอร์เพื่อดูภาพที่สตรีมขึ้นไปจากบอร์ด:
    ```bash
    ffplay rtsp://whip_server_ip:8554/mystream
    ```

---

### 🟡 2.3 Cloud-Managed Doorbell Demo (`doorbell_demo`)
กริ่งประตูอัจฉริยะแบบเชื่อมต่อคลาวด์ผ่าน WebSocket และโปรโตคอล AppRTC ทำการสตรีมวิดีโอ 1 ทาง และสนทนาเสียง 2 ทาง

1.  **ตั้งค่า Wi-Fi**: กรอก Wi-Fi ใน [settings.h](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/solutions/doorbell_demo/main/settings.h)
2.  **คอมไพล์และแฟลช**:
    ```bash
    idf.py -p YOUR_SERIAL_DEVICE flash monitor
    ```
3.  **ตรวจสอบหมายเลขห้อง (Room ID)**: ดูหมายเลขห้องจำลองจาก MAC address บนคอนโซล:
    `Please use browser to join in espxxxxxx on https://webrtc.espressif.com/doorbell`
4.  **การเชื่อมต่อ**:
    *   เปิดบราวเซอร์เข้าสู่หน้าเว็บตาม URL ด้านบน กรอก Room ID
    *   กดปุ่ม **Ring** (Boot Key) บนบอร์ด เพื่อส่งคำสั่งโทรเข้าหน้าเว็บบราวเซอร์ บอร์ดจะเล่นเสียงกริ่ง (`ring.aac`)
    *   หน้าเว็บจะแสดงตัวเลือก Accept / Deny สาย เมื่อคลิก Accept จะเปิดมีเดียสนทนาทันที
    *   ผู้ใช้สามารถคลิกไอคอน **Door** บนเว็บบราวเซอร์เพื่อส่งคำสั่งเปิดประตู บอร์ดจะตอบรับและเล่นเสียงเปิดประตู (`open.aac`)

---

### 🔴 2.4 Local Network Doorbell Demo (`doorbell_local`)
กริ่งประตูอัจฉริยะภายในวงแลนเดียวกันโดยไม่ผ่านเซิร์ฟเวอร์ภายนอก (ESP32 ทำตัวเป็น HTTPS Server และ Signaling Server) พร้อมฟีเจอร์การตรวจจับคนเดินถนน (AI Pedestrian Detection)

1.  **เปิดการตรวจจับคน (Optional)**: ในไฟล์ `sdkconfig` เปิดใช้ `CONFIG_DOORBELL_SUPPORT_PEDESTRIAN_DETECT=y`
2.  **คอมไพล์และแฟลช**:
    ```bash
    idf.py -p YOUR_SERIAL_DEVICE flash monitor
    ```
3.  **เปิดเบราว์เซอร์**: เข้าสู่ URL ของ ESP32 ที่แสดงขึ้นบนหน้าจอคอนโซล เช่น `https://192.168.10.33/webrtc/test` (หน้าเว็บนี้ใช้ Self-signed cert จำเป็นต้องกดยอมรับความเสี่ยง)
4.  **⚠️ ข้อควรระวังเรื่อง mDNS**:
    เบราว์เซอร์ยุคปัจจุบันจะปิดบัง Local IP ด้วย mDNS เพื่อความเป็นส่วนตัว ซึ่งส่งผลให้การเชื่อมต่อ WebRTC ในวงแลนระดับ Local ล้มเหลว วิธีแก้คือให้ไปที่ Flags ของเบราว์เซอร์:
    *   Chrome: `chrome://flags/#enable-webrtc-hide-local-ips-with-mdns`
    *   Edge: `edge://flags/#enable-webrtc-hide-local-ips-with-mdns`
    *   ตั้งค่าตัวเลือก **WebRTC mDNS ICE candidates** เป็น **Disabled** และ Restart เบราว์เซอร์
5.  **การทำงานของ AI**: หากเปิด Pedestrian Detect บอร์ดจะแบ่งเฟรมกล้องส่งให้โมเดล AI (ESP-DL) เมื่อตรวจเจอคน จะส่งอีเวนต์ `PEDESTRIAN_DETECTED` ทาง Data Channel เข้าไปแสดงผลบนหน้าจอเบราว์เซอร์ทันที

---

## 🛠 3. API Cheatsheet & Code Snippets
### สรุปฟังก์ชัน โครงสร้างข้อมูล และการทำงานหลักของ APIs

ไลบรารีเตรียมรูปแบบการเรียกใช้ไว้ 2 ระดับหลักๆ:
1.  **Low-level Connection (`esp_peer` API)**: คุมโฟลว์เชื่อมต่อและแลกเปลี่ยน SDP ด้วยตนเอง
2.  **High-level Wrapper (`esp_webrtc` API)**: คุมวงจรชีวิตและระบบ Capture/Playback มีเดียในคำสั่งเดียว

---

### 📑 3.1 ฟังก์ชันสำคัญที่ใช้บ่อย (Common Functions)

| Low-level (`esp_peer`) | High-level (`esp_webrtc`) | คำอธิบายการทำงาน |
| :--- | :--- | :--- |
| [esp_peer_open](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L422) | [esp_webrtc_open](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/include/esp_webrtc.h#L177) | เปิดระบบการเชื่อมต่อ / จองพื้นที่หน่วยความจำของออบเจกต์ |
| [esp_peer_new_connection](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L437) | (จัดการอัตโนมัติภายใน) | เริ่มต้นการจับคู่ ICE และสร้าง SDP ท้องถิ่นเพื่อพร้อมส่งต่อ |
| [esp_peer_send_msg](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L511) | (จัดการอัตโนมัติภายใน) | นำเข้า Remote SDP หรือ ICE Candidate ที่ได้มาจากเซิร์ฟเวอร์สัญญาณ |
| [esp_peer_main_loop](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L567) | (สร้าง Task คุมเบื้องหลัง) | ลูปหลักเพื่อดูแลสถานะพอร์ตและคัดกรองโปรโตคอลมีเดีย |
| [esp_peer_send_audio](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L537) / [send_video](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L524) | (ส่งให้อัตโนมัติจาก Capture) | ส่งข้อมูลแพ็กเก็ตดิบ (RAW Frame) ออกไปยังผู้ร่วมสนทนา |
| [esp_peer_send_data](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L551) | [esp_webrtc_send_custom_data](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/include/esp_webrtc.h#L280) | ส่งข้อมูลสตริงหรือไบนารีผ่าน SCTP Data Channel |
| [esp_peer_close](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L626) | [esp_webrtc_close](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/include/esp_webrtc.h#L327) | ตัดการเชื่อมต่อและเคลียร์ทรัพยากร/พอร์ตทั้งหมดที่ใช้งาน |

---

### 📑 3.2 ตัวอย่างโค้ดการใช้งานระดับสูง (High-Level WebRTC Init Snippet)
การใช้ `esp_webrtc` สำหรับรับเสียง/ภาพ และส่งผ่านทาง AppRTC Server:

```c
#include "esp_webrtc.h"
#include "esp_webrtc_defaults.h"

static esp_webrtc_handle_t webrtc_handle = NULL;

static int event_handler(esp_webrtc_event_t *event, void *ctx) {
    switch (event->type) {
        case ESP_WEBRTC_EVENT_CONNECTED:
            printf("WebRTC Connected successfully!\n");
            break;
        case ESP_WEBRTC_EVENT_DISCONNECTED:
            printf("WebRTC Disconnected.\n");
            break;
        default:
            break;
    }
    return 0;
}

void init_webrtc_app(char *url) {
    // 1. ตั้งค่าการดีเลย์ของ ICE และสร้างโหมด ICE Lite
    esp_peer_default_cfg_t peer_cfg = {
        .agent_recv_timeout = 500,
        .ice_use_lite_mode = false,
    };

    // 2. กำหนดรายละเอียดมีเดียที่สนับสนุน
    esp_webrtc_cfg_t cfg = {
        .peer_cfg = {
            .audio_info = {
                .codec = ESP_PEER_AUDIO_CODEC_OPUS,
                .sample_rate = 16000,
                .channel = 1,
            },
            .video_info = {
                .codec = ESP_PEER_VIDEO_CODEC_H264,
                .width = 640,
                .height = 480,
                .fps = 15,
            },
            .audio_dir = ESP_PEER_MEDIA_DIR_SEND_RECV,
            .video_dir = ESP_PEER_MEDIA_DIR_SEND_ONLY,
            .enable_data_channel = true,
            .extra_cfg = &peer_cfg,
            .extra_size = sizeof(peer_cfg),
        },
        .signaling_cfg = {
            .signal_url = url,
        },
        .peer_impl = esp_peer_get_default_impl(),
        .signaling_impl = esp_signaling_get_apprtc_impl(), // ใช้โปรโตคอล AppRTC
    };

    // 3. เปิดระบบและระบุ Device Inputs
    esp_webrtc_open(&cfg, &webrtc_handle);

    esp_webrtc_media_provider_t media_provider = {};
    media_sys_get_provider(&media_provider); // ฟังก์ชันนี้เขียนเพิ่มเติมเพื่อผูกกล้อง/ไมค์
    esp_webrtc_set_media_provider(webrtc_handle, &media_provider);

    esp_webrtc_set_event_handler(webrtc_handle, event_handler, NULL);

    // 4. เริ่มสตาร์ทระบบ
    esp_webrtc_start(webrtc_handle);
}
```

---

### 📑 3.3 การใช้งาน Data Channel แบบสร้างด้วยตนเอง (Manual Data Channel Snippet)
หากต้องการส่งรับข้อมูลที่ไม่พร้อมกันกับการสร้างมีเดีย (ตั้งค่า `manual_ch_create = true`):

```c
// เมื่อเข้าสู่สถานะ ESP_PEER_STATE_DATA_CHANNEL_CONNECTED ใน callback .on_state
void create_my_data_channel(esp_peer_handle_t peer) {
    esp_peer_data_channel_cfg_t ch_cfg = {
        .type = ESP_PEER_DATA_CHANNEL_RELIABLE,
        .ordered = true,
        .label = "sensor_data"
    };
    esp_peer_create_data_channel(peer, &ch_cfg);
}

// วิธีส่งข้อมูล
void send_sensor_reading(esp_peer_handle_t peer, float temp) {
    char buffer[32];
    int len = snprintf(buffer, sizeof(buffer), "{\"temp\": %.2f}", temp);
    
    esp_peer_data_frame_t frame = {
        .type = ESP_PEER_DATA_CHANNEL_STRING,
        .stream_id = 0, // หรือ ID ที่ได้ตอนอีเวนต์เปิดแชนเนลสำเร็จ
        .data = (uint8_t*)buffer,
        .size = len
    };
    esp_peer_send_data(peer, &frame);
}
```

---

### 📑 3.4 เครื่องรับส่งแปลงข้อมูล RTP (RTP Encoded Transform API)
SDK รองรับการยุ่งเกี่ยวกับบิตมีเดียดิบก่อนส่งหรือหลังรับผ่าน [esp_peer_set_rtp_transformer](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L497) (เหมาะสำหรับเข้ารหัสมีเดียเพิ่มเติมหรือแทรกข้อมูลส่วนตัว/SEI)

```c
// 1. ฟังก์ชันคำนวณขนาดของแพ็กเก็ตหลังจากได้รับการแปลงข้อมูล
static int my_sender_get_size(esp_peer_rtp_frame_t *frame, bool *in_place, void *ctx) {
    // เช่น การต่อท้ายฟูตเตอร์ลายน้ำเพิ่มขนาด 4 ไบต์
    frame->encoded_size = frame->orig_size + 4;
    *in_place = false; // ไม่เขียนทับบัฟเฟอร์เดิมโดยตรง
    return 0;
}

// 2. ฟังก์ชันแก้ไขตัวมีเดีย
static int my_sender_transform(esp_peer_rtp_frame_t *frame, void *ctx) {
    // คัดลอก RTP Header เดิม
    memcpy(frame->encoded_data, frame->orig_data, 12);
    // คัดลอก Payload และเขียนข้อมูลเพิ่มเติมท้ายสุด
    memcpy(frame->encoded_data + 12, frame->orig_data + 12, frame->orig_size - 12);
    memcpy(frame->encoded_data + frame->orig_size, "SIGN", 4);
    return 0;
}

// 3. ทำการลงทะเบียนในบอร์ดหลัก
void apply_rtp_security(esp_peer_handle_t peer) {
    esp_peer_rtp_transform_cb_t callback = {
        .get_encoded_size = my_sender_get_size,
        .transform = my_sender_transform,
    };
    esp_peer_set_rtp_transformer(peer, ESP_PEER_RTP_TRANSFORM_ROLE_SENDER, &callback, NULL);
}
```

---

## 📉 4. Network Considerations, Limitations & Performance Tuning
### ข้อแนะนำการปรับแต่งประสิทธิภาพและข้อพิจารณาทางเครือข่าย

#### ⚡ การประหยัดการหน่วงเวลาและ RAM (Performance & Memory Tuning)
*   **การสร้างพอร์ต DTLS Cert ล่วงหน้า (Cert Pre-generation)**: 
    การสร้าง RSA หรือ X.509 Certificate ในระหว่างการคุยโทรศัพท์จริงส่งผลให้ CPU ทำงานหนักและเกิดรอยต่อสัญญาณล่าช้า (Delay) แนะนำให้เรียกใช้ฟังก์ชัน [esp_peer_pre_generate_cert()](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/include/esp_peer.h#L645) ทันทีในช่วงเปิดบอร์ดเพื่อทำการเก็บ Certificate และ Private Key ไว้ในแคช
*   **การรันในบอร์ดแบบไร้ PSRAM (SRAM-Only Target)**:
    `esp_peer` สามารถจำกัดขนาดได้โดยใช้เนื้อที่ RAM น้อยกว่า **60 KB** เพื่อลดปริมาณหน่วยความจำ ให้ทำการตั้งค่าขนาดบัฟเฟอร์ให้ต่ำลงผ่าน `esp_peer_default_cfg_t`:
    *   ลด `max_candidates` ลงเหลือ 4-8 เพื่อจำกัดจำนวนการรวบรวม ICE IP
    *   ปรับขนาดของส่งและรับของ Jitter Buffer (`video_recv_jitter.cache_size`, `send_pool_size`) ให้พอดีกับปริมาณเฟรมเรต เช่น ภาพ 15fps ควรจำกัด pool เหลือไม่เกิน 150KB - 200KB

#### 📡 ปัญหาเรื่องเครือข่ายและระบบสัญญาณ (Network Traversal)
*   **การสลับใช้ ICE Lite**: 
    หากบอร์ดต้องสนทนากับคลาวด์เซิร์ฟเวอร์ที่มี IP สาธารณะอยู่แล้ว (เช่น mediaMTX หรือ OpenAI) สามารถตั้งค่า `.ice_use_lite_mode = true` เพื่อลดทอนการสลักแลกเปลี่ยน ICE Candidate จากบอร์ดลง ช่วยให้ประหยัดแบตเตอรี่และ RAM
*   **STUN/TURN Timeout**:
    หากอยู่ในเครือข่ายประเภท Symmetric NAT สัญญาณจะต้องวิ่งผ่าน TURN Server เท่านั้น หากเซิร์ฟเวอร์ส่งสัญญาณช้า ให้ปรับค่า `.agent_recv_timeout` ใน `esp_peer_default_cfg_t` ให้ยาวขึ้นจากเดิม (เช่น 500ms แทนที่จะใช้ 100ms)
*   **Keepalive**:
    การเช็ค Binding ของ STUN ส่งออกทุกๆ 6 วินาที หากต้องการปรับเปลี่ยนความละเอียดของการตัดสัญญาณ ให้ตั้งค่าตัวแปร `alive_binding_retries`
