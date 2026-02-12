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
    "income",
    "expenses",
    "upi_freq",
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
    d = request.json

    input_data = [[
        int(d["income"]),
        int(d["expenses"]),
        int(d["upi_freq"]),
        int(d["savings"]),
        int(d["water_bill"]),
        int(d["electricity_bill"]),
        int(d["rent_bill"]),
        int(d["emergency_fund"])
    ]]

    score = model.predict(input_data)[0]

    # Risk Logic
    if score > 750:
        risk = "Low"
        loan = "Yes"
    elif score > 500:
        risk = "Medium"
        loan = "Maybe"
    else:
        risk = "High"
        loan = "No"

    return jsonify({
        "creditScore": int(score),
        "riskLevel": risk,
        "loanEligibility": loan
    })


if __name__ == "__main__":
    app.run(port=5000, debug=True)
