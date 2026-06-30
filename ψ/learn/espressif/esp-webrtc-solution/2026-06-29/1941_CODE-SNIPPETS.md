# ESP-WebRTC Code Snippets & Architecture Deep Dive
**Date**: 2026-06-29  
**Context**: `esp-webrtc-solution` analysis.  
**Federation Tag**: `[ai-core:no6]`  
**Author**: No.6 Gemini

---

## 1. Architectural Overview & Component Layout

The Espressif ESP-WebRTC solution separates concern via a clean layered design:
*   **Media Abstraction layer**: Integrates with [esp_capture](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/include/esp_webrtc.h#L152) and [av_render](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/include/esp_webrtc.h#L153) to manage device-specific audio and video hardware pipelines.
*   **Core Peer Connection Wrapper**: [esp_peer.c](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/src/esp_peer.c) acts as an abstraction wrapper around target-specific binary libraries (e.g. precompiled for ESP32-S3/P4).
*   **Signaling Abstraction Layer**: [esp_peer_signaling.c](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/src/esp_peer_signaling.c) handles room state, connection events, and SDP negotiation independently of the network protocol.
*   **Signaling Implementations**: Modular implementations for AppRTC (default), [Janus VideoRoom](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/impl/janus_signal/janus_signaling.c), [WHIP](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/impl/whip_signal/whip_signaling.c), and [OpenAI Realtime REST APIs](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/solutions/openai_demo/main/openai_signaling.c).

---

## 2. Main Initialization & Control Flow

### 2.1 WebRTC Handle Initialization
In [esp_webrtc.c](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/src/esp_webrtc.c), the connection is opened and signaling starts. The core structure [webrtc_t](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/src/esp_webrtc.c#L72-L113) manages the session state:

```c
// File: components/esp_webrtc/src/esp_webrtc.c
// Symbol: esp_webrtc_open

int esp_webrtc_open(esp_webrtc_cfg_t *cfg, esp_webrtc_handle_t *handle)
{
    if (cfg == NULL || cfg->signaling_impl == NULL || cfg->peer_impl == NULL) {
        return ESP_PEER_ERR_INVALID_ARG;
    }
    webrtc_t *rtc = (webrtc_t *)calloc(1, sizeof(webrtc_t));
    if (rtc == NULL) {
        return ESP_PEER_ERR_NO_MEM;
    }
    rtc->rtc_cfg = *cfg;
    rtc->rtc_cfg.peer_cfg.server_num = 0;
    rtc->rtc_cfg.peer_cfg.server_lists = NULL;
    malloc_server_cfg(rtc, cfg->peer_cfg.server_lists, cfg->peer_cfg.server_num);
    if (cfg->peer_cfg.extra_cfg) {
        void *peer_exta_cfg = calloc(1, cfg->peer_cfg.extra_size);
        if (peer_exta_cfg) {
            memcpy(peer_exta_cfg, cfg->peer_cfg.extra_cfg, cfg->peer_cfg.extra_size);
        }
        rtc->rtc_cfg.peer_cfg.extra_cfg = peer_exta_cfg;
    }
    if (cfg->signaling_cfg.extra_cfg) {
        void *signaling_cfg = calloc(1, cfg->signaling_cfg.extra_size);
        if (signaling_cfg) {
            memcpy(signaling_cfg, cfg->signaling_cfg.extra_cfg, cfg->signaling_cfg.extra_size);
        }
        rtc->rtc_cfg.signaling_cfg.extra_cfg = signaling_cfg;
    }
    *handle = rtc;
    return ESP_PEER_ERR_NONE;
}
```

Starting WebRTC entails initiating the signaling implementation configured at runtime:

```c
// File: components/esp_webrtc/src/esp_webrtc.c
// Symbol: esp_webrtc_start

int esp_webrtc_start(esp_webrtc_handle_t handle)
{
    if (handle == NULL) {
        return ESP_PEER_ERR_INVALID_ARG;
    }
    webrtc_t *rtc = (webrtc_t *)handle;
    if (rtc->signaling) {
        ESP_LOGW(TAG, "Already started");
        return ESP_PEER_ERR_WRONG_STATE;
    }

    // Start signaling firstly
    esp_peer_signaling_cfg_t sig_cfg = {
        .signal_url = rtc->rtc_cfg.signaling_cfg.signal_url,
        .extra_cfg = rtc->rtc_cfg.signaling_cfg.extra_cfg,
        .extra_size = rtc->rtc_cfg.signaling_cfg.extra_size,
        .on_ice_info = signal_ice_received,
        .on_connected = signal_connected,
        .on_msg = signal_new_msg,
        .on_close = signal_closed,
        .ctx = rtc
    };
    int ret = esp_peer_signaling_start(&sig_cfg, rtc->rtc_cfg.signaling_impl, &rtc->signaling);
    if (ret != ESP_PEER_ERR_NONE) {
        ESP_LOGE(TAG, "Fail to start signaling");
        return ret;
    }
    return ret;
}
```

---

## 3. OpenAI Realtime Integration (openai_demo)

The OpenAI Realtime integration utilizes HTTP/REST requests (rather than typical WebSocket connections) to create a session, fetch ephemeral client secrets, and negotiate standard WebRTC SDP.

### 3.1 Ephemeral Token Fetching
The client exchanges its developer API token for an ephemeral token associated with a specific voice and model configuraiton:

```c
// File: solutions/openai_demo/main/openai_signaling.c
// Symbol: fetch_ephemeral_token

static int fetch_ephemeral_token(openai_signaling_t *sig)
{
    char *body = build_client_secret_request_body(sig);
    if (body == NULL) {
        ESP_LOGE(TAG, "Fail to build client secret request");
        return -1;
    }

    char content_type[] = "Content-Type: application/json";
    int auth_len = strlen("Authorization: Bearer ") + strlen(sig->api_key) + 1;
    char auth[auth_len];
    snprintf(auth, auth_len, "Authorization: Bearer %s", sig->api_key);
    char *header[] = {
        content_type,
        auth,
        NULL,
    };

    https_request_cfg_t req_cfg = {
        .timeout_ms = 30000,
        .max_redirects = DEFAULT_HTTPS_MAX_REDIRECTS,
        .buffer_size = 4096,
        .buffer_size_tx = 4096,
        .keep_alive_enable = true,
    };
    https_request_t req = {
        .method = "POST",
        .url = OPENAI_CLIENT_SECRETS_URL,
        .headers = header,
        .data = body,
        .body_cb = client_secret_answer,
        .ctx = sig,
    };

    ESP_LOGI(TAG, "Creating OpenAI Realtime client secret");
    SAFE_FREE(sig->ephemeral_token);
    int ret = https_request_advance(&req_cfg, &req);
    SAFE_FREE(body);
    if (ret != 0 || sig->ephemeral_token == NULL) {
        ESP_LOGE(TAG, "Fail to create OpenAI Realtime client secret");
        return -1;
    }
    return 0;
}
```

### 3.2 Exchanging SDP Offers
Once the ephemeral token is ready, the local SDP offer is HTTP POSTed to OpenAI's endpoint, yielding the remote SDP answer:

```c
// File: solutions/openai_demo/main/openai_signaling.c
// Symbol: openai_signaling_send_msg

static int openai_signaling_send_msg(esp_peer_signaling_handle_t h, esp_peer_signaling_msg_t *msg)
{
    if (h == NULL || msg == NULL) {
        return ESP_PEER_ERR_INVALID_ARG;
    }
    openai_signaling_t *sig = (openai_signaling_t *)h;
    if (msg->type == ESP_PEER_SIGNALING_MSG_SDP) {
        char *sdp = dup_sdp_msg(msg);
        if (sdp == NULL) {
            ESP_LOGE(TAG, "Fail to build Realtime GA SDP request");
            return -1;
        }

        char content_type[] = "Content-Type: application/sdp";
        int len = strlen("Authorization: Bearer ") + strlen(sig->ephemeral_token) + 1;
        char auth[len];
        snprintf(auth, len, "Authorization: Bearer %s", sig->ephemeral_token);
        char *header[] = {
            content_type,
            auth,
            NULL,
        };
        https_request_cfg_t req_cfg = {
            .timeout_ms = 30000,
            .buffer_size = 4096,
            .buffer_size_tx = 8192,
            .keep_alive_enable = true,
        };
        https_request_t req = {
            .method = "POST",
            .url = OPENAI_REALTIME_CALLS_URL,
            .headers = header,
            .data = sdp,
            .body_cb = openai_sdp_answer,
            .ctx = h,
        };

        ESP_LOGI(TAG, "Exchanging SDP with OpenAI Realtime GA API");
        SAFE_FREE(sig->remote_sdp);
        sig->remote_sdp_size = 0;
        int ret = https_request_advance(&req_cfg, &req);
        SAFE_FREE(sdp);
        if (ret != 0 || sig->remote_sdp == NULL || strncmp((char *)sig->remote_sdp, "v=0", 3) != 0) {
            return -1;
        }
        esp_peer_signaling_msg_t sdp_msg = {
            .type = ESP_PEER_SIGNALING_MSG_SDP,
            .data = sig->remote_sdp,
            .size = sig->remote_sdp_size,
        };
        if (sig->cfg.on_msg) {
            sig->cfg.on_msg(&sdp_msg, sig->cfg.ctx);
        }
    }
    return 0;
}
```

### 3.3 Declarative Function Calling Registry
The OpenAI Demo allows OpenAI's model to trigger hardware controls via declarative declarations in [webrtc.c](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/solutions/openai_demo/main/webrtc.c):

```c
// File: solutions/openai_demo/main/webrtc.c
// Symbol: webrtc_event_handler

static int webrtc_event_handler(esp_webrtc_event_t *event, void *ctx)
{
    printf("====================Event %d======================\n", event->type);
    if (event->type == ESP_WEBRTC_EVENT_DATA_CHANNEL_CONNECTED) {
        // Manually create data channel since ESP32 acts as SCTP server
        esp_peer_data_channel_cfg_t cfg = {
            .label = "esp_channel",
        };
        esp_peer_handle_t peer_handle = NULL;
        esp_webrtc_get_peer_connection(webrtc, &peer_handle);
        esp_peer_create_data_channel(peer_handle, &cfg);
    }
    if (event->type == ESP_WEBRTC_EVENT_DATA_CHANNEL_OPENED) {
        send_response("You are helpful and have some tools installed. Say 'How can I help?'");
        send_function_desc(); // Transmit JSON scheme of local tools to model
    }
    return 0;
}
```

When OpenAI Realtime fires a function execution over the WebRTC data channel, it is routed, parsed, and executed dynamically:

```c
// File: solutions/openai_demo/main/webrtc.c
// Symbol: process_json

static int process_json(const char *json_data)
{
    cJSON *root = cJSON_Parse(json_data);
    if (!root) return -1;

    const cJSON *type = cJSON_GetObjectItemCaseSensitive(root, "type");
    if (!cJSON_IsString(type) || strcmp(type->valuestring, "response.function_call_arguments.done") != 0) {
        cJSON_Delete(root);
        return 0;
    }

    const cJSON *name = cJSON_GetObjectItemCaseSensitive(root, "name");
    const cJSON *arguments = cJSON_GetObjectItemCaseSensitive(root, "arguments");
    if (!cJSON_IsString(name) || !cJSON_IsString(arguments)) {
        cJSON_Delete(root);
        return -1;
    }

    cJSON *args_root = cJSON_Parse(arguments->valuestring);
    if (!args_root) {
        cJSON_Delete(root);
        return -1;
    }

    // Iterate through registered control classes
    class_t *iter = classes;
    while (iter) {
        if (strcmp(iter->name, name->valuestring) == 0) {
            for (int i = 0; i < iter->attr_num; i++) {
                attribute_t *attr = &iter->attr_list[i];
                match_and_execute(args_root, attr);
            }
        }
        iter = iter->next;
    }

    cJSON_Delete(args_root);
    cJSON_Delete(root);
    return 0;
}
```

---

## 4. Janus & WHIP Integrations

### 4.1 Janus Signaling (Long-polling and Trickle ICE)
In [janus_signaling.c](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/impl/janus_signal/janus_signaling.c), Janus session management involves creating a session, attaching to the videoroom plugin, and publisher joining. 
Events and incoming answers are handled in a dedicated polling thread:

```c
// File: components/esp_webrtc/impl/janus_signal/janus_signaling.c
// Symbol: janus_poll_thread

static void janus_poll_thread(void *arg)
{
    janus_signaling_t *sig = (janus_signaling_t *)arg;
    while (sig->running) {
        char poll_url[384];
        snprintf(poll_url, sizeof(poll_url), "%s/%" PRIu64 "?maxev=1&rid=%" PRIu64,
                 sig->cfg.signal_url, sig->session_id, (uint64_t)esp_timer_get_time());
        janus_http_resp_t resp = {};
        https_request_cfg_t req_cfg = {
            .timeout_ms = 10000, 
        };
        https_request_t req = {
            .method = "GET",
            .url = poll_url,
            .body_cb = janus_save_response,
            .ctx = &resp,
        };
        if (https_request_advance(&req_cfg, &req) == 0 && resp.data) {
            cJSON *root = cJSON_Parse(resp.data);
            if (root) {
                if (cJSON_IsArray(root)) {
                    int n = cJSON_GetArraySize(root);
                    for (int i = 0; i < n; i++) {
                        janus_handle_event(sig, cJSON_GetArrayItem(root, i));
                    }
                } else {
                    janus_handle_event(sig, root);
                }
                cJSON_Delete(root);
            }
            SAFE_FREE(resp.data);
        }
    }
    sig->poll_started = false;
    media_lib_sema_unlock(sig->exit_sema);
    media_lib_thread_destroy(NULL);
}
```

And sending negotiated information (offer, candidates) is implemented in `janus_signaling_send_msg`:

```c
// File: components/esp_webrtc/impl/janus_signal/janus_signaling.c
// Symbol: janus_signaling_send_msg

static int janus_signaling_send_msg(esp_peer_signaling_handle_t h, esp_peer_signaling_msg_t *msg)
{
    janus_signaling_t *sig = (janus_signaling_t *)h;
    char post_url[320];
    int ret = ESP_PEER_ERR_NONE;
    char *txn = NULL;
    cJSON *root = NULL;
    janus_http_resp_t resp = {};

    do {
        snprintf(post_url, sizeof(post_url), "%s/%" PRIu64 "/%" PRIu64,
                 sig->cfg.signal_url, sig->session_id, sig->handle_id);
        txn = janus_create_txn();
        root = cJSON_CreateObject();
        if (!txn || !root) { ret = ESP_PEER_ERR_NO_MEM; break; }
        
        cJSON_AddStringToObject(root, "transaction", txn);
        if (sig->janus_cfg.token) cJSON_AddStringToObject(root, "token", sig->janus_cfg.token);
        
        if (msg->type == ESP_PEER_SIGNALING_MSG_SDP && sig->local_sdp_sent == false) {
            cJSON_AddStringToObject(root, "janus", "message");
            cJSON *body = cJSON_AddObjectToObject(root, "body");
            cJSON_AddStringToObject(body, "request", "publish");
            cJSON_AddBoolToObject(body, "audio", true);
            cJSON_AddBoolToObject(body, "video", true);
            cJSON *jsep = cJSON_AddObjectToObject(root, "jsep");
            cJSON_AddStringToObject(jsep, "type", "offer");
            cJSON_AddStringToObject(jsep, "sdp", (char *)msg->data);
            janus_send_api(sig, "POST", post_url, root, &resp);
            sig->local_sdp_sent = true;
        } else if (msg->type == ESP_PEER_SIGNALING_MSG_CANDIDATE) {
            cJSON *cand = cJSON_Parse((char *)msg->data);
            cJSON_AddStringToObject(root, "janus", "trickle");
            cJSON_AddItemToObject(root, "candidate", cand);
            janus_send_api(sig, "POST", post_url, root, &resp);
        }
    } while (0);

    SAFE_FREE(txn);
    cJSON_Delete(root);
    SAFE_FREE(resp.data);
    return ret;
}
```

### 4.2 WHIP HTTP Signaling & Trickle ICE
WebRTC HTTP Ingestion Protocol (WHIP) leverages REST calls. It expects a HTTP `POST` for the SDP offer, extraction of `Location` header, and links for STUN/TURN, followed by HTTP `PATCH` requests for candidate trickles:

```c
// File: components/esp_webrtc/impl/whip_signal/whip_signaling.c
// Symbol: whip_signaling_send_msg

static int whip_signaling_send_msg(esp_peer_signaling_handle_t h, esp_peer_signaling_msg_t *msg)
{
    whip_signaling_t *sig = (whip_signaling_t *)h;
    if (msg->type == ESP_PEER_SIGNALING_MSG_SDP) {
        if (sig->local_sdp_sent == false) {
            char content_type[] = "Content-Type: application/sdp";
            char *auth = get_auth_header(sig->whip_cfg);
            char *header[] = { content_type, auth, NULL };
            // Initial SDP offer negotiation
            int ret = https_post(sig->cfg.signal_url, header, (char *)msg->data, whip_sdp_header, whip_sdp_answer, h);
            SAFE_FREE(auth);
            if (ret != 0 || sig->remote_sdp == NULL) {
                return ESP_PEER_ERR_FAIL;
            }
            sig->local_sdp_sent = true;
            if (sig->server_num) {
                esp_peer_signaling_ice_info_t ice_info = {
                    .is_initiator = true,
                    .server_info = *sig->ice_servers[0],
                };
                sig->cfg.on_ice_info(&ice_info, sig->cfg.ctx);
            }
            esp_peer_signaling_msg_t sdp_msg = {
                .type = ESP_PEER_SIGNALING_MSG_SDP,
                .data = sig->remote_sdp,
                .size = sig->remote_sdp_size,
            };
            sig->cfg.on_msg(&sdp_msg, sig->cfg.ctx);
            SAFE_FREE(sig->remote_sdp);
        } else if (sig->location) {
            char *sdp = strstr((char *)msg->data, "a=group:BUNDLE");
            if (sdp) {
                // Trickle ICE PATCH update to the acquired Location URL
                char content_type[] = "Content-Type: application/trickle-ice-sdpfrag";
                char *auth = get_auth_header(sig->whip_cfg);
                char *header[] = { content_type, auth, NULL };
                https_send_request("PATCH", header, sig->location, sdp, NULL, NULL, h);
                SAFE_FREE(auth);
            }
        }
    }
    return ESP_PEER_ERR_NONE;
}
```

---

## 5. Interesting C Patterns & Pipeline Synchronization

### 5.1 Dynamic Polymorphism in C via Virtual Method Tables (VMTs)
The codebase builds abstract drivers for peer connections and signaling channels using structures of function pointers.

For instance, [esp_peer.c](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/src/esp_peer.c) defines a [peer_wrapper_t](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_peer/src/esp_peer.c#L15-L18) that dynamically wraps concrete implementations (like `esp_peer_get_default_impl()`):

```c
typedef struct {
    esp_peer_ops_t    ops;
    esp_peer_handle_t handle;
} peer_wrapper_t;

int esp_peer_open(esp_peer_cfg_t *cfg, const esp_peer_ops_t *ops, esp_peer_handle_t *handle)
{
    peer_wrapper_t *peer = calloc(1, sizeof(peer_wrapper_t));
    if (peer == NULL) return ESP_PEER_ERR_NO_MEM;
    
    memcpy(&peer->ops, ops, sizeof(esp_peer_ops_t));
    int ret = ops->open(cfg, &peer->handle);
    if (ret != ESP_PEER_ERR_NONE) {
        free(peer);
        return ret;
    }
    *handle = peer;
    return ret;
}
```

### 5.2 Thread Synchronization & Control Flags
The media capture task and main loops are controlled via bit-oriented event groups (`media_lib_event_grp_handle_t`), ensuring non-blocking execution while preserving thread safety.

```c
#define PC_EXIT_BIT      (1 << 0)
#define PC_PAUSED_BIT    (1 << 1)
#define PC_RESUME_BIT    (1 << 2)
#define PC_SEND_QUIT_BIT (1 << 3)

#define SET_WAIT_BITS(bit) media_lib_event_group_set_bits(rtc->wait_event, bit)
#define WAIT_FOR_BITS(bit)                                                          \
    media_lib_event_group_wait_bits(rtc->wait_event, bit, MEDIA_LIB_MAX_LOCK_TIME); \
    media_lib_event_group_clr_bits(rtc->wait_event, bit)
```

The media sending thread blocks on exit criteria cleanly:

```c
void media_send_task(void *arg)
{
    webrtc_t *rtc = (webrtc_t *)arg;
    while (rtc->send_going) {
        _media_send(arg);
        media_lib_thread_sleep(AUDIO_FRAME_INTERVAL);
    }
    SET_WAIT_BITS(PC_SEND_QUIT_BIT); // Signal main thread of exit
    media_lib_thread_destroy(NULL);
}
```

### 5.3 Media Playout and Ingestion Synchronization
The media pipeline hooks up capture sinks with audio/video stream parameters configured by WebRTC negotiation events:

*   **Ingestion Flow**: Audio/Video capture devices are enabled, and frames are dynamically pulled from the sinks via [esp_capture_sink_acquire_frame](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/src/esp_webrtc.c#L127) and pushed to `esp_peer_send_audio` / `esp_peer_send_video`.
*   **Playout Flow**: Frame events incoming from the Peer Connection are received in `pc_on_audio_data` / `pc_on_video_data` and pushed straight into [av_render](file:///root/Code/github.com/MEYD-605/gemini-oracle/ψ/learn/espressif/esp-webrtc-solution/origin/components/esp_webrtc/src/esp_webrtc.c#L380) for hardware playout.

```c
static int pc_on_audio_data(esp_peer_audio_frame_t *info, void *ctx)
{
    webrtc_t *rtc = (webrtc_t *)ctx;
    if (rtc->running == false || rtc->recv_aud_info.codec == ESP_PEER_AUDIO_CODEC_NONE) {
        return 0;
    }
    av_render_audio_data_t audio_data = {
        .pts = info->pts,
        .data = info->data,
        .size = info->size,
    };
    av_render_add_audio_data(rtc->play_handle, &audio_data);
    return 0;
}
```

### 5.4 Error Cleanup & Idioms
To handle memory leaks, the codebase defines a strict cleanup structure using `goto` labels and a safety free macro:

```c
#define SAFE_FREE(ptr) if (ptr) {   \
    free(ptr);                      \
    ptr = NULL;                     \
}

#define GOTO_LABEL_ON_NULL(label, ptr, code) if (ptr == NULL) {   \
    ret = code;                                                   \
    goto label;                                                   \
}
```

This prevents double-free vulnerability bugs while keeping memory releases highly centralized.
