#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

// --- Pin Definitions ---
#define TRIG_PIN 25
#define ECHO_PIN 26
#define FLOAT_SENSOR_PIN 34
#define BUZZER_PIN 27
#define LED1_PIN 13
#define LED2_PIN 12
#define LED3_PIN 14
#define DHT_PIN 4
#define FLOW_SENSOR_PIN 35

// --- Constants ---
#define DHT_TYPE DHT11
const int MAX_DISTANCE = 37;
const int MIN_DISTANCE = 5;
const float pulsesPerLiter = 450.0;  // For YF-S201

// --- Objects ---
DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(0x27, 16, 2);

// --- Variables ---
unsigned long lastDisplaySwitch = 0;
unsigned long lastBlinkTime = 0;
unsigned long lastSerialSend = 0;
unsigned long lastFlowCalc = 0;

bool blinkState = false;
bool showAlert = false;

volatile int flowPulseCount = 0;
float flowRate = 0;
float totalLiters = 0.0;

// --- Flow Sensor Interrupt ---
void IRAM_ATTR flowPulseCounter() {
  flowPulseCount++;
}

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(FLOAT_SENSOR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);
  pinMode(FLOW_SENSOR_PIN, INPUT_PULLUP);

  Serial.begin(115200);
  Wire.begin(33, 32);
  lcd.begin(16, 2);
  lcd.backlight();
  dht.begin();

  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flowPulseCounter, RISING);
}

void loop() {
  unsigned long currentMillis = millis();

  // --- Sensor Readings ---
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  int distance = duration * 0.0344 / 2;
  distance = constrain(distance, MIN_DISTANCE, MAX_DISTANCE);
  int waterLevelPercentage = map(distance, MAX_DISTANCE, MIN_DISTANCE, 0, 100);

  bool floatSensor = !digitalRead(FLOAT_SENSOR_PIN);

  float temp = dht.readTemperature();
  float hum = dht.readHumidity();
  bool isDHTValid = !isnan(temp) && !isnan(hum);

  // --- Alert Logic ---
  bool ultrasonicAlert = (distance <= MIN_DISTANCE);
  bool floatAlert = floatSensor;
  bool bothAlert = ultrasonicAlert && floatAlert;
  showAlert = floatAlert || ultrasonicAlert;

  // --- LED & Buzzer ---
  if (floatSensor) {
    if (currentMillis - lastBlinkTime >= 300) {
      blinkState = !blinkState;
      digitalWrite(LED1_PIN, blinkState);
      digitalWrite(LED2_PIN, blinkState);
      digitalWrite(LED3_PIN, blinkState);
      lastBlinkTime = currentMillis;
    }
  } else {
    digitalWrite(LED1_PIN, distance <= 28 ? HIGH : LOW);
    digitalWrite(LED2_PIN, distance <= 22 ? HIGH : LOW);
    digitalWrite(LED3_PIN, distance <= 5 ? HIGH : LOW);
  }
  digitalWrite(BUZZER_PIN, showAlert ? HIGH : LOW);

  // --- Flow Sensor Calculation ---
  if (currentMillis - lastFlowCalc >= 1000) {
    noInterrupts();
    int pulseCount = flowPulseCount;
    flowPulseCount = 0;
    interrupts();
    flowRate = (pulseCount / pulsesPerLiter) * 60.0;
    totalLiters += (pulseCount / pulsesPerLiter);
    lastFlowCalc = currentMillis;
  }

  // --- LCD Display Logic ---
  static int displayState = 0;  // 0 to 4
  static unsigned long lastSwitch = 0;

  if (currentMillis - lastSwitch >= 1000) {
    lcd.clear();

    switch (displayState) {
      case 0:
        lcd.setCursor(0, 0);
        lcd.print("D:");
        lcd.print(distance);
        lcd.print("cm P:");
        lcd.print(waterLevelPercentage);
        lcd.print("%");
        break;

      case 1:
        if (isDHTValid) {
          lcd.setCursor(0, 0);
          lcd.print("Temp: ");
          lcd.print(temp);
          lcd.print(" C");
          lcd.setCursor(0, 1);
          lcd.print("Hum: ");
          lcd.print(hum);
          lcd.print(" %");
        } else {
          lcd.setCursor(0, 0);
          lcd.print("DHT Error");
        }
        break;

      case 2:
        lcd.setCursor(0, 0);
        lcd.print("Flow: ");
        lcd.print(flowRate);
        lcd.print(" L/m");
        lcd.setCursor(0, 1);
        lcd.print("Total: ");
        lcd.print(totalLiters);
        lcd.print(" L");
        break;

      case 3:
      case 4:
        if (showAlert) {
          if (bothAlert) {
            lcd.setCursor(0, 0);
            lcd.print("Water Float Warn");
            lcd.setCursor(0, 1);
            lcd.print("Critical Alert!!!");
          } else if (floatAlert) {
            lcd.setCursor(0, 0);
            lcd.print("Float Warning!");
            lcd.setCursor(0, 1);
            lcd.print("Critical Alert!!!");
          } else if (ultrasonicAlert) {
            lcd.setCursor(0, 0);
            lcd.print("Water Level High");
            lcd.setCursor(0, 1);
            lcd.print("Critical Alert!!!");
          }
        } else {
          lcd.setCursor(0, 0);
          lcd.print("System Normal :)");
        }
        break;
    }

    // Cycle: 0 → 1 → 2 → 3 → 4 → back to 0
    displayState = (displayState + 1) % 5;
    lastSwitch = currentMillis;
  }

  // --- Serial Print Every 5 Seconds ---
  if (currentMillis - lastSerialSend >= 5000) {
    String jsonData = "{\"distance\":";
    jsonData += distance;
    jsonData += ",\"P\":";
    jsonData += waterLevelPercentage;
    jsonData += ",\"temperature\":";
    jsonData += isDHTValid ? temp : 0.0;
    jsonData += ",\"humidity\":";
    jsonData += isDHTValid ? hum : 0.0;
    jsonData += ",\"float_triggered\":\"";
    jsonData += floatSensor ? "true" : "false";
    jsonData += "\",\"flow_lpm\":";
    jsonData += flowRate;
    jsonData += ",\"total_liters\":";
    jsonData += totalLiters;
    jsonData += "}";
    Serial.println(jsonData);
    lastSerialSend = currentMillis;
  }
}
