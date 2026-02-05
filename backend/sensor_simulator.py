import time
import requests
import random
import json
from datetime import datetime

# API Configuration
API_URL = "http://127.0.0.1:8000/api/sensors/reading"
HEADERS = {"Content-Type": "application/json"}

# Simulation Ranges (Safe/Unsafe flipping logic)
RANGES = {
    'ph': (6.5, 8.5),
    'Hardness': (150, 250), # Safeish
    'Solids': (10000, 25000),
    'Chloramines': (5, 9),
    'Sulfate': (250, 350),
    'Conductivity': (300, 500),
    'Organic_carbon': (10, 20),
    'Trihalomethanes': (50, 80),
    'Turbidity': (3, 5)
}

def generate_reading(is_safe=True):
    """Generates a random reading. Occasional spikes if not safe."""
    data = {}
    for key, (low, high) in RANGES.items():
        val = random.uniform(low, high)
        
        # Add some jitter
        val += random.uniform(-0.5, 0.5)
        
        # Occasional spike for unsafe demo
        if not is_safe and random.random() < 0.3:
            val *= random.choice([0.5, 1.5])
            
        data[key] = round(val, 2)
    return data

def main():
    print(f"🌊 Water Quality IoT Simulator Started")
    print(f"📡 Target: {API_URL}")
    print("-" * 40)

    try:
        while True:
            # Simulate shifting water quality trends
            is_safe_cycle = random.random() > 0.3 # 70% chance of being "normal"
            
            payload = generate_reading(is_safe=is_safe_cycle)
            
            try:
                start_time = time.time()
                response = requests.post(API_URL, data=json.dumps(payload), headers=HEADERS)
                latency = (time.time() - start_time) * 1000
                
                status_icon = "✅" if response.status_code == 200 else "❌"
                print(f"{status_icon} [{datetime.now().strftime('%H:%M:%S')}] pH: {payload['ph']} | Turbidity: {payload['Turbidity']} | {latency:.0f}ms")
                
            except requests.exceptions.ConnectionError:
                print(f"⚠️  Connection Failed: Backend unreachable at {API_URL}")
            except Exception as e:
                print(f"❌ Error: {e}")

            time.sleep(3) # Send every 3 seconds

    except KeyboardInterrupt:
        print("\n🛑 Simulator Stopped.")

if __name__ == "__main__":
    main()
