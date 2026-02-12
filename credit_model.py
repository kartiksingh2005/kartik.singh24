from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

app = Flask(__name__)
CORS(app)

# ================================
# LOAD DATASET
# ================================
df = pd.read_csv("credit_dataset.csv")

features = [
    "monthly_income",
    "expenses",
    "upi_frequency",
    "savings",
    "water_bill",
    "electricity_bill",
    "rent_bill",
    "emergency_fund"
]

X = df[features]
y = df["credit_score"]

model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X, y)

print("✅ ML Model Loaded Successfully")

# ================================
# SAFE PREDICT API
# ================================
@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.json

        print("Incoming data:", data)

        # Build dataframe EXACT order
        input_data = pd.DataFrame([[
            data["monthly_income"],
            data["expenses"],
            data["upi_frequency"],
            data["savings"],
            data["water_bill"],
            data["electricity_bill"],
            data["rent_bill"],
            data["emergency_fund"]
        ]], columns=features)

        prediction = model.predict(input_data)[0]
        credit_score = int(prediction)

        # =====================
        # AI LOGIC
        # =====================
        risk = "High"
        if credit_score > 700:
            risk = "Low"
        elif credit_score > 500:
            risk = "Medium"

        loan = "Yes" if credit_score > 650 else "No"

        return jsonify({
            "credit_score": credit_score,
            "risk_level": risk,
            "loan_eligibility": loan
        })

    except Exception as e:
        print("ML ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
