# Algorand Smart Bank – AI Credit Scoring on Blockchain

## Overview

Algorand Smart Bank is a decentralized fintech application built for the **Future of Finance** hackathon track.
The project combines **Machine Learning credit scoring** with **Algorand blockchain** to create a secure and transparent student-focused financial platform.

It provides a UPI-style experience where users can send payments, split expenses, manage events, save funds, and generate an AI-powered credit score based on financial behavior.

---

## Features

* AI Credit Score Prediction using Random Forest ML model
* Risk Level and Loan Eligibility Analysis
* Algorand Blockchain Data Hash Storage
* Wallet Integration using Pera Wallet
* Send Payments
* Split Expenses
* Event Fund Management
* Savings Vault Tracking
* AI Financial Health Dashboard

---

## Credit Score Model

The Machine Learning model evaluates:

* Monthly Income
* Expenses
* UPI Transaction Frequency
* Savings Behaviour
* Water Bill Payment
* Electricity Bill Payment
* Rent Payment
* Emergency Fund Availability

Output:

* Credit Score (300 – 900)
* Risk Level
* Loan Eligibility

The ML model runs through a Flask backend API.

---

## Blockchain Integration

Sensitive user data is not stored directly on-chain.

Process:

1. Financial data is converted into a structured profile.
2. Profile is hashed using SHA256.
3. Only the hash is stored inside an Algorand transaction note.

This ensures privacy, security, and tamper-proof verification.

---

## Project Structure

frontend/
src/
App.jsx

ml_server.py
credit_model.py
credit_dataset.csv

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <your-fork-link>
cd Hackseries-2-QuickStart-template
```

### 2. Install Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on: http://localhost:5173

### 3. Run ML Server

```bash
pip install flask pandas scikit-learn
python ml_server.py
```

ML API runs on: http://localhost:5000

---

## How It Works

1. User connects Algorand wallet.
2. Financial data is entered in Credit tab.
3. Data is sent to ML backend.
4. Credit score and risk level are predicted.
5. User profile is hashed.
6. Hash is stored on Algorand blockchain.
7. Financial health dashboard updates in real time.

---


