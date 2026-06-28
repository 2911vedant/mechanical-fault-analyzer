from flask import Flask, request, jsonify
from flask_cors import CORS
from vision import detect_fault
from rag import load_manuals, answer_question
import os

app = Flask(__name__)
CORS(app)

print("Loading PDF manuals...")
chunks = load_manuals()
print(f"Loaded {len(chunks)} chunks from manuals!")

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    image = request.files["image"].read()
    
    import time
    for attempt in range(3):
        try:
            result = detect_fault(image)
            return jsonify({"result": result})
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                if attempt < 2:
                    time.sleep(15)
                    continue
            return jsonify({"result": f"Error: {str(e)}"}), 500
    
    return jsonify({"result": "Quota exceeded. Please wait 1 minute and try again."}), 429

if __name__ == "__main__":
    app.run(debug=True, port=5001)