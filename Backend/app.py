import os
import io
import base64
from datetime import datetime, timezone
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# ──────────────────────────────────────────────
#  SETTINGS
# ──────────────────────────────────────────────

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "model.keras")

# Sorted alphabetically — matches flow_from_directory training order
CLASS_NAMES = [
    "Low light intensity (LI)",     
    "Nitrogen Deficiency (ND)",     
    "Normal Leaf (NL)",             
    "Phosphorus deficiency (PHD)",  
    "Potassium Deficiency (PD)",    
    "Red mite disease (RM)",        
    "Water Deficiency (WD)",        
    "Worm Creep Decease (WCD)",     
]

IMG_SIZE = (224, 224)

IOT_STATE = {
    "temperature": None,
    "humidity": None,
    "soil_moisture": None,
    "light": None,
    "camera_url": None,
    "device_id": "esp32-unknown",
    "updated_at": None,
}

# ──────────────────────────────────────────────
#  LOAD MODEL
# ──────────────────────────────────────────────

print(f"\n Loading model: {os.path.abspath(MODEL_PATH)}")
model = load_model(MODEL_PATH)
print(f" Model loaded! Output classes: {model.output_shape[-1]}")

if model.output_shape[-1] != len(CLASS_NAMES):
    print(f" WARNING: Model has {model.output_shape[-1]} outputs but CLASS_NAMES has {len(CLASS_NAMES)} entries!")
else:
    print(f" CLASS_NAMES count matches model output. All good!\n")

# ──────────────────────────────────────────────
#  FLASK APP
# ──────────────────────────────────────────────

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)


@app.route("/")
def index():
    return app.send_static_file("home.html")


@app.route("/<path:path>")
def send_frontend_asset(path):
    # Keep API endpoints handled by explicit routes (predict, iot/data, health)
    if path in ("health", "predict", "iot/data"):
        return jsonify({"error": "invalid frontend route"}), 404

    # Fix for missing asset or non-asset: fallback to home for SPA behavior
    if not os.path.exists(os.path.join(FRONTEND_DIR, path)):
        return app.send_static_file("home.html")

    return app.send_static_file(path)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "model_loaded": True,
        "classes":      CLASS_NAMES,
        "iot_connected": IOT_STATE["updated_at"] is not None,
    })


def _to_float(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _iot_alerts(state):
    alerts = []

    temp = _to_float(state.get("temperature"))
    humidity = _to_float(state.get("humidity"))
    soil = _to_float(state.get("soil_moisture"))
    light = _to_float(state.get("light"))

    if temp is not None and (temp < 20 or temp > 30):
        alerts.append({
            "type": "temperature",
            "severity": "warn",
            "message": f"Temperature out of optimal range: {temp:.1f} C (target 20-30 C).",
        })
    if humidity is not None and (humidity < 60 or humidity > 80):
        alerts.append({
            "type": "humidity",
            "severity": "warn",
            "message": f"Humidity out of optimal range: {humidity:.1f}% (target 60-80%).",
        })
    if soil is not None and soil < 35:
        alerts.append({
            "type": "soil_moisture",
            "severity": "critical",
            "message": f"Soil moisture is low: {soil:.1f}%. Consider irrigation.",
        })
    if light is not None and light < 25:
        alerts.append({
            "type": "light",
            "severity": "warn",
            "message": f"Light intensity looks low: {light:.1f}%.",
        })

    if not alerts:
        alerts.append({
            "type": "system",
            "severity": "ok",
            "message": "All sensor values are within expected range.",
        })

    return alerts


@app.route("/iot/data", methods=["POST"])
def ingest_iot_data():
    data = request.get_json(force=True, silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON body"}), 400

    IOT_STATE["temperature"] = _to_float(data.get("temperature"))
    IOT_STATE["humidity"] = _to_float(data.get("humidity"))
    IOT_STATE["soil_moisture"] = _to_float(data.get("soil_moisture"))
    IOT_STATE["light"] = _to_float(data.get("light"))
    IOT_STATE["camera_url"] = data.get("camera_url") or IOT_STATE["camera_url"]
    IOT_STATE["device_id"] = data.get("device_id") or IOT_STATE["device_id"]
    IOT_STATE["updated_at"] = datetime.now(timezone.utc).isoformat()

    return jsonify({
        "status": "ok",
        "message": "IoT telemetry received",
        "device_id": IOT_STATE["device_id"],
        "updated_at": IOT_STATE["updated_at"],
    })


@app.route("/iot/data", methods=["GET"])
def get_iot_data():
    payload = dict(IOT_STATE)
    payload["alerts"] = _iot_alerts(IOT_STATE)
    payload["connected"] = IOT_STATE["updated_at"] is not None
    return jsonify(payload)


@app.route("/predict", methods=["POST"])
def predict():
    # 1. Get JSON body
    data = request.get_json(force=True, silent=True) or {}
    if "image" not in data:
        return jsonify({"error": "Missing 'image' field"}), 400

    # 2. Decode base64 image
    try:
        b64 = data["image"]
        if "," in b64:
            b64 = b64.split(",", 1)[1]
        img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {e}"}), 400

    # 3. Preprocess
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)

    # 4. Predict
    probs = model.predict(arr, verbose=0)[0]
    n     = len(probs)
    names = CLASS_NAMES if len(CLASS_NAMES) == n else [f"Class {i}" for i in range(n)]
    top   = int(np.argmax(probs))

    result = {
        "disease":         names[top],
        "confidence":      round(float(probs[top]) * 100, 1),
        "all_predictions": {names[i]: round(float(probs[i]) * 100, 1) for i in range(n)},
        "iot": {
            "connected": IOT_STATE["updated_at"] is not None,
            "latest": {
                "temperature": IOT_STATE["temperature"],
                "humidity": IOT_STATE["humidity"],
                "soil_moisture": IOT_STATE["soil_moisture"],
                "light": IOT_STATE["light"],
            },
        },
    }

    print(f" Prediction: {result['disease']}  ({result['confidence']}%)")
    return jsonify(result)


# ──────────────────────────────────────────────
#  RUN
# ──────────────────────────────────────────────

if __name__ == "__main__":
    print(" HelaGrow AI running at http://127.0.0.1:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False)