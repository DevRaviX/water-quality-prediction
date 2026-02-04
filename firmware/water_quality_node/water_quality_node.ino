/*

 * Water Quality Monitoring Node (ESP32)
 *
 * Hardware Requirements:
 * - ESP32 Dev Kit V1
 * - Analog Sensors (TDS, pH, Turbidity) -> Connected via Voltage Divider
 (Max 3.3V!)
 * - DS18B20 Temperature Sensor -> GPIO 4 (Requests 4.7k Pullup)
 *
 * Libraries Required (Install via Arduino Library Manager):
 * - OneWire
 * - DallasTemperature
 * - ArduinoJson (by Benoit Blanchon)
 */

#include <ArduinoJson.h>
#include <DallasTemperature.h>
#include <HTTPClient.h>
#include <OneWire.h>
#include <WiFi.h>

// ------------------- CONFIGURATION -------------------
const char *ssid = "YOUR_WIFI_NAME";
const char *password = "YOUR_WIFI_PASSWORD";

// REPLACE with your Computer's Local IP (e.g., 192.168.1.5)
const char *serverUrl = "http://YOUR_COMPUTER_IP:8000/api/iot/readings";

// Pin Definitions (Use ADC1 pins for WiFi stability)
const int PIN_PH = 34;        // Analog Input Only
const int PIN_TDS = 35;       // Analog Input Only
const int PIN_TURBIDITY = 32; // Analog
const int PIN_TEMP = 4;       // Digital (OneWire)

// Voltage Divider Factor (If you scaled 5V -> 3.3V)
// If reading 5V sensor on 3.3V pin with 2k/1k resistors: Factor roughly 1.5
// Calibrate this value by comparing with a multimeter!
const float VOLTAGE_SCALE = 1.0;

// -----------------------------------------------------

OneWire oneWire(PIN_TEMP);
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);

  // Start Sensors
  sensors.begin();
  pinMode(PIN_PH, INPUT);
  pinMode(PIN_TDS, INPUT);
  pinMode(PIN_TURBIDITY, INPUT);

  // Connect to Wi-Fi
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // 1. Read Temperature (Digital)
  sensors.requestTemperatures();
  float temperatureC = sensors.getTempCByIndex(0);

  // 2. Read Analog Sensors (Raw ADC: 0-4095)
  int phRaw = analogRead(PIN_PH);
  int tdsRaw = analogRead(PIN_TDS);
  int turbRaw = analogRead(PIN_TURBIDITY);

  // 3. Convert to Voltage (0 - 3.3V)
  float phVoltage = (phRaw / 4095.0) * 3.3 * VOLTAGE_SCALE;
  float tdsVoltage = (tdsRaw / 4095.0) * 3.3 * VOLTAGE_SCALE;
  float turbVoltage = (turbRaw / 4095.0) * 3.3 * VOLTAGE_SCALE;

  // 4. Apply Calibration (Simulated placeholder formulas - CALIBRATE THESE!)
  // Example: pH 7 @ 2.5V?
  float phValue = 7.0 + ((2.5 - phVoltage) * 3.5);

  // Example: TDS mapping
  float tdsValue = (133.42 * tdsVoltage * tdsVoltage * tdsVoltage -
                    255.86 * tdsVoltage * tdsVoltage + 857.39 * tdsVoltage) *
                   0.5;

  // Example: Turbidity (High voltage = Clear water usually)
  float turbidityNTU = 100.00 - (turbVoltage * 20.0);
  if (turbidityNTU < 0)
    turbidityNTU = 0;

  // 5. Create JSON Payload
  StaticJsonDocument<200> doc;
  doc["sensor_id"] = "esp32_01";
  doc["ph"] = phValue;
  doc["tds"] = tdsValue;
  doc["turbidity"] = turbidityNTU;
  doc["temperature"] = temperatureC;

  String jsonOutput;
  serializeJson(doc, jsonOutput);

  // 6. Send to Backend
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    Serial.println("Sending data: " + jsonOutput);
    int httpResponseCode = http.POST(jsonOutput);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Server Response: " + String(httpResponseCode) + " " +
                     response);
    } else {
      Serial.print("Error on sending POST: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  } else {
    Serial.println("WiFi Disconnected");
  }

  // 7. Wait 10 seconds before next reading
  delay(10000);
}
