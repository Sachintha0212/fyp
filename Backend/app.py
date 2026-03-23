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

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "model.keras")

CLASS_NAMES = [
    'Low light intensity(LI)',
    'Nitrogen Deficiency(ND)',
    'Normal Leaf(NL)',
    'Phosphorus Deficiency(PHD)',
    'Potassium Deficiency(PD)',
    'Red mite disease(RM)',
    'Water Deficiency(WD)',
    'Worm Creep Deficiency(WCD)'
]

IMG_SIZE = (224, 224)

print(f"\n Loading model from: {os.path.abspath(MODEL_PATH)}")
model = load_model(MODEL_PATH)
print(f" Model loaded!  Output classes: {model.output_shape[-1]}\n")

app = Flask(__name__)
CORS(app)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": True})


@app.route("/predict", methods=["POST"])
def predict():
    
    data = request.get_json(force=True, silent=True) or {}
    if "image" not in data:
        return jsonify({"error": "Missing 'image' field"}), 400

    try:
        b64 = data["image"]
        if "," in b64:
            b64 = b64.split(",", 1)[1]
        img = Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {e}"}), 400

   
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)
    arr = preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)   # shape: (1, 224, 224, 3)

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



if __name__ == "__main__":
    print(" HelaGrow AI backend running at http://127.0.0.1:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False)