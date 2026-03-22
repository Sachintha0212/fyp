from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from PIL import Image
import numpy as np
import io
import base64

app = Flask(__name__)
CORS(app)  # allows your frontend to talk to this server

# Load your model once when the server starts
model = load_model(r'D:\FINAL YEAR\FYP\Project\fyp\ml\ml model.keras')

# Define your class labels (match whatever your model was trained on)
CLASS_LABELS = [
    'Low light intensity(LI)',
    'Nitrogen Deficiency(ND)',
    'Normal Leaf(NL)',
    'Phosphorus Deficiency(PHD)',
    'Potassium Deficiency(PD)',
    'Red mite disease(RM)',
    'Water Deficiency(WD)',
    'Worm Creep Deficiency(WCD)'
]

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    
    # Decode base64 image from frontend
    image_data = base64.b64decode(data['image'].split(',')[1])
    image = Image.open(io.BytesIO(image_data)).convert('RGB')
    image = image.resize((224, 224))  # match your model's input size
    
    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    
    predictions = model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0])) * 100
    
    return jsonify({
        'disease': CLASS_LABELS[predicted_index],
        'confidence': round(confidence, 1),
        'all_predictions': {
            CLASS_LABELS[i]: round(float(predictions[0][i]) * 100, 1)
            for i in range(len(CLASS_LABELS))
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)