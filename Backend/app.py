
import os
import io
import base64
import logging
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from PIL import Image─
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.keras")
STATIC_DIR = os.path.join(BASE_DIR, "static")
IMG_SIZE   = (224, 224)

CLASS_NAMES = [
    "Fungal Disease",
    "Normal / Healthy",
    "Nutrient Deficiency",
    "Pest Damage",
]

logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")
log = logging.getLogger("helagrow")

app = Flask(__name__, static_folder=STATIC_DIR)
CORS(app)   # allow requests from the frontend (any origin on localhost)

# ─────────────────────────────────────────────────────────────────────────────
# Load model once at startup
# ─────────────────────────────────────────────────────────────────────────────
_model = None

def get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model not found at {MODEL_PATH}\n"
                "Copy your .keras file to  helagrow/models/model.keras"
            )
        log.info("Loading Keras model from %s …", MODEL_PATH)
        _model = load_model(MODEL_PATH)
        log.info("Model loaded OK — input shape: %s", _model.input_shape)
    return _model


# ─────────────────────────────────────────────────────────────────────────────
# Image helpers
# ─────────────────────────────────────────────────────────────────────────────
def decode_base64_image(b64_string: str) -> Image.Image:
    """Accept  data:image/jpeg;base64,....  or raw base64."""
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    img_bytes = base64.b64decode(b64_string)
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return img


def preprocess(img: Image.Image) -> np.ndarray:
    """Resize → numpy → MobileNetV2 preprocess → add batch dim."""
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)          # scales to [-1, 1]
    return np.expand_dims(arr, axis=0)   # shape (1, 224, 224, 3)


# ─────────────────────────────────────────────────────────────────────────────
# Routes — Frontend
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "home.html")

@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(STATIC_DIR, filename)


# ─────────────────────────────────────────────────────────────────────────────
# Routes — API
# ─────────────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Quick liveness check."""
    return jsonify({"status": "ok", "model_loaded": _model is not None})


@app.route("/predict", methods=["POST"])
def predict():
    """
    Body (JSON):
        { "image": "<data:image/jpeg;base64,...>" }

    Response (JSON):
        {
          "disease":         "Normal / Healthy",
          "confidence":      97.3,
          "all_predictions": { "Normal / Healthy": 97.3, "Fungal Disease": 1.8, ... }
        }
    """
    # ── Parse request ────────────────────────────────────────────────────────
    data = request.get_json(force=True, silent=True)
    if not data or "image" not in data:
        return jsonify({"error": "Missing 'image' field in JSON body"}), 400

    # ── Decode image ─────────────────────────────────────────────────────────
    try:
        img = decode_base64_image(data["image"])
    except Exception as exc:
        log.warning("Image decode failed: %s", exc)
        return jsonify({"error": f"Could not decode image: {exc}"}), 400

    # ── Run inference ────────────────────────────────────────────────────────
    try:
        model = get_model()
        tensor = preprocess(img)
        probs  = model.predict(tensor, verbose=0)[0]   # shape (num_classes,)
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:
        log.exception("Inference error")
        return jsonify({"error": f"Inference failed: {exc}"}), 500

    # ── Build response ───────────────────────────────────────────────────────
    # Use CLASS_NAMES if lengths match, else fall back to index labels
    n = len(probs)
    names = CLASS_NAMES if len(CLASS_NAMES) == n else [f"Class {i}" for i in range(n)]

    top_idx    = int(np.argmax(probs))
    top_label  = names[top_idx]
    top_conf   = round(float(probs[top_idx]) * 100, 1)

    all_preds  = {names[i]: round(float(probs[i]) * 100, 1) for i in range(n)}

    log.info("Prediction → %s  (%.1f%%)", top_label, top_conf)

    return jsonify({
        "disease":         top_label,
        "confidence":      top_conf,
        "all_predictions": all_preds,
    })


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.makedirs(os.path.join(BASE_DIR, "models"), exist_ok=True)
    os.makedirs(STATIC_DIR, exist_ok=True)
    log.info("🌱 HelaGrow AI backend starting on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=True)