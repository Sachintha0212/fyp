from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import os
import base64
from PIL import Image

app = Flask(__name__)

UPLOAD_FOLDER = "static/uploads"
MODEL_PATH = "model/ml model.keras"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load trained model
model = load_model(MODEL_PATH)

class_names = [
    'Low light intensity (LI)',
    'Nitrogen Deficiency (ND)',
    'Normal Leaf (NL)',
    'Phosphorus deficiency (PHD)',
    'Potassium Deficiency (PD)',
    'Red mite disease (RM)',
    'Water Deficiency (WD)',
    'Worm Creep Decease (WCD)'
]

def prepare_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)
    return img_array

def predict_image(img_path):
    img_array = prepare_image(img_path)
    preds = model.predict(img_array)
    pred_index = int(np.argmax(preds))
    confidence = float(np.max(preds)) * 100
    return {
        "predicted_class": class_names[pred_index],
        "confidence": round(confidence, 2)
    }

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/disease")
def disease():
    return render_template("disease.html")

@app.route("/iot")
def iot():
    return render_template("iot.html")

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/predict", methods=["POST"])
def predict():
    try:
        # File upload
        if "image" in request.files:
            file = request.files["image"]
            if file.filename == "":
                return jsonify({"error": "No selected file"}), 400

            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)
            result = predict_image(file_path)
            result["image_path"] = "/" + file_path.replace("\\", "/")
            return jsonify(result)

        # Base64 camera image
        data = request.get_json(silent=True)
        if data and "image" in data:
            image_data = data["image"]

            if "," in image_data:
                image_data = image_data.split(",")[1]

            file_path = os.path.join(UPLOAD_FOLDER, "captured_image.png")
            with open(file_path, "wb") as f:
                f.write(base64.b64decode(image_data))

            result = predict_image(file_path)
            result["image_path"] = "/" + file_path.replace("\\", "/")
            return jsonify(result)

        return jsonify({"error": "No image provided"}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)