export const ESP8266_ARDUINO_SKETCH = `/*
  ==============================================================
   NEW-TECH INSTITUTE TV RECOVERY TOOL (ኒው-ቴክ ኢንስቲትዩት)
   ESP8266 Wireless WiFi-to-UART Serial Bridge
   For MStar, MediaTek, Realtek, HiSilicon, Amlogic TV Mainboards
  ==============================================================
   Hardware Connections:
     - ESP8266 GND  ---> TV Mainboard GND (CRITICAL: Shared Ground!)
     - ESP8266 TX (GPIO1) ---> TV Mainboard RX (via 1k resistor or direct 3.3V)
     - ESP8266 RX (GPIO3) ---> TV Mainboard TX
     - Power: 5V / MicroUSB to NodeMCU or 3.3V regulated to ESP-01.
     * WARNING: NEVER connect TV 5V or 12V directly to ESP8266 GPIO pins!
  ==============================================================
*/

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WebSocketsServer.h>

// Configuration
const char* AP_SSID = "ESP8266_TV_TOOL";
const char* AP_PASS = "12345678"; // Min 8 chars or leave empty "" for open
const int HTTP_PORT = 80;
const int WS_PORT   = 81;

// Web and WebSocket Servers
ESP8266WebServer server(HTTP_PORT);
WebSocketsServer webSocket = WebSocketsServer(WS_PORT);

// Default Baud Rate for TV Mainboards (MStar / MTK / Realtek)
long currentBaud = 115200;

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>ESP8266 TV Bridge</title></head>";
  html += "<body style='background:#111;color:#fff;font-family:sans-serif;padding:20px;'>";
  html += "<h2>New-Tech Institute - ESP8266 TV Bridge</h2>";
  html += "<p>Status: <span style='color:#0f0'>ONLINE</span></p>";
  html += "<p>WebSocket Port: <b>" + String(WS_PORT) + "</b></p>";
  html += "<p>Current Baud: <b>" + String(currentBaud) + "</b></p>";
  html += "<p>Connect from New-Tech TV Recovery Tool App!</p>";
  html += "</body></html>";
  server.send(200, "text/html", html);
}

// REST fallback endpoint: /send?cmd=reset
void handleSendCmd() {
  if (server.hasArg("cmd")) {
    String cmd = server.arg("cmd");
    Serial.println(cmd);
    server.send(200, "text/plain", "OK: Sent " + cmd);
  } else {
    server.send(400, "text/plain", "Missing cmd param");
  }
}

// WebSocket Event Handler
void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_DISCONNECTED:
      // Client disconnected
      break;
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      webSocket.sendTXT(num, "[ESP8266] Connected to TV Bridge @ 115200 baud\\r\\n");
      break;
    }
    case WStype_TEXT: {
      // Received command from Web App -> Send directly out to TV Mainboard UART
      for (size_t i = 0; i < length; i++) {
        Serial.write(payload[i]);
      }
      break;
    }
    case WStype_BIN:
      // Binary data transfer
      Serial.write(payload, length);
      break;
  }
}

void setup() {
  // Start Hardware UART for TV Mainboard
  Serial.begin(currentBaud);
  delay(100);

  // Setup Soft AP (WiFi Access Point)
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASS);

  // IP is fixed at 192.168.4.1 in AP mode
  server.on("/", handleRoot);
  server.on("/send", handleSendCmd);
  server.begin();

  // Start WebSockets server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  // Status indicator LED (built-in LED on GPIO2 / D4)
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW); // LED ON
}

void loop() {
  server.handleClient();
  webSocket.loop();

  // Read incoming serial data from TV Mainboard and broadcast to Web App
  if (Serial.available()) {
    size_t len = Serial.available();
    uint8_t sBuffer[256];
    size_t readBytes = Serial.readBytes(sBuffer, min(len, sizeof(sBuffer)));
    if (readBytes > 0) {
      webSocket.broadcastBIN(sBuffer, readBytes);
      // Brief LED toggle on activity
      digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
    }
  }
}
`;
