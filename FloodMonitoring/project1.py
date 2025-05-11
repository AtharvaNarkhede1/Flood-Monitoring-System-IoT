import requests
import datetime
import firebase_admin
from firebase_admin import credentials, db
import serial
import json
import time

# -------------------------------------
# 🔐 Firebase Configuration
# -------------------------------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://flood-1d18f-default-rtdb.firebaseio.com/'
})

# -------------------------------------
# 🌦️ OpenWeather API Configuration
# -------------------------------------
API_KEY = ""
CITY = "Kopargaon"
URL = f"https://api.openweathermap.org/data/2.5/weather?q={CITY}&appid={API_KEY}&units=metric"

# -------------------------------------
# 📟 Serial Port Configuration``
# -------------------------------------
SERIAL_PORT = 'COM8'  # Change this to match your ESP32's port
BAUD_RATE = 115200

# -------------------------------------
# 📥 Fetch Data Functions
# -------------------------------------
last_float_state = None
last_distance = None
last_flow_rate = None
last_liters_per_minute = None

def fetch_weather_data():
    try:
        response = requests.get(URL)
        response.raise_for_status()
        data = response.json()

        print("✅ Weather data fetched successfully:", data)

        return {
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "pressure": data["main"]["pressure"],
            "weather": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "precipitation": data.get("rain", {}).get("1h", 0),
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        print("❌ Error fetching weather data:", e)
        return None

def fetch_esp32_data(serial_port):
    global last_float_state, last_distance, last_flow_rate, last_liters_per_minute
    try:
        if serial_port.in_waiting > 0:
            line = serial_port.readline().decode('utf-8', errors='ignore').strip()
            print("📡 Raw Serial:", line)

            if line.startswith("{") and line.endswith("}"):
                try:
                    data = json.loads(line)
                    data["timestamp"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                    # Show flow data
                    if "flow_rate" in data and "liters_per_minute" in data:
                        print(f"💧 Flow Rate: {data['flow_rate']} Hz | Liters/min: {data['liters_per_minute']}")

                    # Only store if float, distance, or flow data changed
                    if (
                        last_float_state != data.get("float_triggered") or 
                        last_distance != data.get("distance") or 
                        last_flow_rate != data.get("flow_rate") or 
                        last_liters_per_minute != data.get("liters_per_minute")
                    ):
                        last_float_state = data.get("float_triggered")
                        last_distance = data.get("distance")
                        last_flow_rate = data.get("flow_rate")
                        last_liters_per_minute = data.get("liters_per_minute")

                        print(f"📈 Float Sensor: {data.get('float_triggered')} | Distance: {data.get('distance')}")
                        return data
                    else:
                        print("⏩ No significant change in data. Skipping.")
                except json.JSONDecodeError:
                    print("⚠️ Invalid JSON.")
            else:
                print("⚠️ Skipped non-JSON serial line.")
    except Exception as e:
        print("❌ Error reading ESP32 data:", e)
    return None

def wait_for_esp_boot(serial_port, timeout=5):
    print(f"⏳ Waiting {timeout}s for ESP32 to boot...\n")
    start_time = datetime.datetime.now()
    while (datetime.datetime.now() - start_time).seconds < timeout:
        if serial_port.in_waiting > 0:
            serial_port.readline()

# -------------------------------------
# 📤 Firebase Push
# -------------------------------------
def store_data(path, data):
    try:
        today = datetime.date.today().isoformat()
        ref = db.reference(f"/flood_monitoring/{path}/{today}")
        ref.push(data)
        print(f"✅ Stored {path} data to Firebase.")
    except Exception as e:
        print(f"❌ Error storing {path} data:", e)

# -------------------------------------
# 🚀 Main Loop
# -------------------------------------
def main():
    try:
        serial_port = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.1)
        wait_for_esp_boot(serial_port)

        print("⏳ Fetching initial weather data...")
        weather = fetch_weather_data()
        if weather:
            print("✅ Initial weather data fetched:", weather)
            store_data("weather_data", weather)
        else:
            print("❌ Failed to fetch initial weather data.")

        last_weather_fetch_time = time.time()
        last_esp_push_time = time.time()

        while True:
            current_time = time.time()

            # Every 5 seconds: ESP32 sensor data
            if current_time - last_esp_push_time >= 5:
                esp_data = fetch_esp32_data(serial_port)
                if esp_data:
                    store_data("iot_data/latest", esp_data)

                    # Also store flow data separately if present
                    if "flow_rate" in esp_data and "liters_per_minute" in esp_data:
                        flow_data = {
                            "flow_rate": esp_data["flow_rate"],
                            "liters_per_minute": esp_data["liters_per_minute"],
                            "timestamp": esp_data["timestamp"]
                        }
                        store_data("flow_data", flow_data)

                last_esp_push_time = current_time

            # Every 10 minutes: Weather data
            if current_time - last_weather_fetch_time >= 600:
                print("⏳ Fetching weather data...")
                weather = fetch_weather_data()
                if weather:
                    print("✅ Weather data fetched:", weather)
                    store_data("weather_data", weather)
                else:
                    print("❌ Failed to fetch weather data.")
                last_weather_fetch_time = current_time

            time.sleep(0.1)

    except serial.SerialException as e:
        print(f"❌ Serial error: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user.")
    finally:
        try:
            serial_port.close()
            print("🔌 Serial port closed.")
        except:
            pass

if __name__ == "__main__":
    main()