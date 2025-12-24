import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

def train():
    print("Loading dataset...")
    try:
        df = pd.read_csv('dataset.csv')
    except FileNotFoundError:
        print("Error: dataset.csv not found.")
        return

    features = ['entropy', 'file_size_mb', 'modification_rate', 'rename_count']
    X = df[features]
    y = df['is_ransomware']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy * 100:.2f}%")

    print("Saving model to ransomware_model.pkl...")
    joblib.dump(model, 'ransomware_model.pkl')
    print("Done.")

if __name__ == "__main__":
    if os.path.basename(os.getcwd()) != "ml_engine":
        # Ensure we are running from inside ml_engine or handle path
        if os.path.exists("ml_engine/dataset.csv"):
            os.chdir("ml_engine")
    
    train()
