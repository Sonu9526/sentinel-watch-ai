import joblib
import json
import sys
import os
import numpy as np

def predict():
    model_path = 'ransomware_model.pkl'
    if not os.path.exists(model_path):
        # Try looking in ml_engine directory if running from root
        if os.path.exists(f'ml_engine/{model_path}'):
            model_path = f'ml_engine/{model_path}'
        else:
            print(json.dumps({"error": "Model file not found. Please train the model first."}))
            return

    model = joblib.load(model_path)

    # Read input from arguments or stdin
    try:
        if len(sys.argv) > 1:
            # Example: python predict.py 7.8 0.5 50 5
            entropy = float(sys.argv[1])
            file_size_mb = float(sys.argv[2])
            mod_rate = float(sys.argv[3])
            rename_count = float(sys.argv[4])
        else:
            # interactive or piped input
            print("Usage: python predict.py <entropy> <size_mb> <mod_rate> <rename_count>", file=sys.stderr)
            return

        features = np.array([[entropy, file_size_mb, mod_rate, rename_count]])
        prediction = model.predict(features)[0]
        # class 1 is ransomware
        probability = model.predict_proba(features)[0][1]

        result = {
            "is_ransomware": bool(prediction),
            "confidence": float(probability),
            "status": "ransomware" if prediction else "safe"
        }
        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
