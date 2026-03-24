import os
import io
import base64
import numpy as np
from flask import Flask, request, jsonify
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
    "Low light intensity (LI)",     # index 0
    "Nitrogen Deficiency (ND)",     # index 1
    "Normal Leaf (NL)",             # index 2
    "Phosphorus deficiency (PHD)",  # index 3
    "Potassium Deficiency (PD)",    # index 4
    "Red mite disease (RM)",        # index 5
    "Water Deficiency (WD)",        # index 6
    "Worm Creep Decease (WCD)",     # index 7
]

IMG_SIZE = (224, 224)

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

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "model_loaded": True,
        "classes":      CLASS_NAMES
    })


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
    }

    print(f" Prediction: {result['disease']}  ({result['confidence']}%)")
    return jsonify(result)


# ──────────────────────────────────────────────
#  RUN
# ──────────────────────────────────────────────

if __name__ == "__main__":
    print(" HelaGrow AI running at http://127.0.0.1:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False)