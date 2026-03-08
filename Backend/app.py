from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # allow frontend to call backend

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict():
    # Expecting an image file sent as form-data with key: "image"
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded. Use form-data key: image"}), 400

    img = request.files["image"]
    save_path = os.path.join("uploads", img.filename)
    os.makedirs("uploads", exist_ok=True)
    img.save(save_path)

    # TODO: Replace this with your ML model prediction
    # result = your_model_predict(save_path)
    result = {
        "class": "placeholder_class",
        "confidence": 0.90
    }

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)