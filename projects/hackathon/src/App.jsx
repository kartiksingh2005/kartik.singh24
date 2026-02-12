import { useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";
import CryptoJS from "crypto-js";

const peraWallet = new PeraWalletConnect();

function App() {
  const [account, setAccount] = useState(null);
  const [tab, setTab] = useState("send");
  const [receiver, setReceiver] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [splitAddress, setSplitAddress] = useState("");
  const [splitAmount, setSplitAmount] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventWallet, setEventWallet] = useState("");
  const [events, setEvents] = useState([]);
  const [vaultAmount, setVaultAmount] = useState("");
  const [totalSaved, setTotalSaved] = useState(0);
  const [creditScore, setCreditScore] = useState(300);
  const [paymentsMade, setPaymentsMade] = useState(0);
  const [contributionsMade, setContributionsMade] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [upiFreq, setUpiFreq] = useState("");
  const [savings, setSavings] = useState("");
  const [waterBill, setWaterBill] = useState("");
  const [electricityBill, setElectricityBill] = useState("");
  const [rentBill, setRentBill] = useState("");
  const [emergencyFund, setEmergencyFund] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const algodClient = new algosdk.Algodv2(
    "",
    "https://testnet-api.algonode.cloud",
    ""
  );
  const indexerClient = new algosdk.Indexer(
    "",
    "https://testnet-idx.algonode.cloud",
    ""
  );
  const card = {
    background: "#111",
    padding: "25px",
    borderRadius: "12px",
    maxWidth: "520px",
    marginTop: "20px",
  };
  const input = {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid gray",
    background: "#222",
    color: "white",
  };
  const button = {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#00ffa6",
    fontWeight: "bold",
    cursor: "pointer",
  };
  const connectWallet = async () => {
    const accounts = await peraWallet.connect();
    setAccount(accounts[0]);
  };
  const addTransaction = (type, amount, to) => {
    const tx = {
      type,
      amount,
      to,
      time: new Date().toLocaleTimeString(),
    };
    setTransactions((prev) => [tx, ...prev]);
  };
  const sendAlgo = async (to, amount) => {
    try {
      if (isSending) return;
      setIsSending(true);
      const params = await algodClient.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: account,
        receiver: to,
        amount: Number(amount) * 1000000,
        suggestedParams: params,
      });
      const signedTxn = await peraWallet.signTransaction([
        [{ txn, signers: [account] }],
      ]);
      await algodClient.sendRawTransaction(signedTxn).do();
      setPaymentsMade((p) => p + 1);
      addTransaction("Send", amount, to);
      alert("Transaction Sent 🚀");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };
  const storeUserDataOnBlockchain = async () => {
    try {
      if (!account) {
        alert("Connect wallet first");
        return;
      }
      const hash = generateUserHash();
      const params = await algodClient.getTransactionParams().do();
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: account,
        receiver: account,   
        amount: 0,
        note: new TextEncoder().encode("USER_HASH:" + hash),
        suggestedParams: params,
      });
      const signedTxn = await peraWallet.signTransaction([
        [{ txn, signers: [account] }],
      ]);
      await algodClient.sendRawTransaction(signedTxn).do();
      alert("User data stored on blockchain ✅");
    } catch (err) {
      console.error(err);
    }
  };
  const createEvent = () => {
    if (!eventName || !eventWallet) return;
    setEvents([...events, { name: eventName, wallet: eventWallet }]);
    setEventName("");
    setEventWallet("");
  };
  const calculateCreditScore = async () => {
    try {
      const res = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: Number(income),
          expenses: Number(expenses),
          upi_freq: Number(upiFreq),
          savings: Number(savings),
          water_bill: Number(waterBill),
          electricity_bill: Number(electricityBill),
          rent_bill: Number(rentBill),
          emergency_fund: emergencyFund ? 1 : 0
        }),
      });
      const data = await res.json();
      setCreditScore(data.creditScore);
      console.log("Risk:", data.riskLevel);
      console.log("Loan:", data.loanEligibility);

    } catch (err) {
      console.error("ML Error:", err);
    }
  };
  const fetchUserHashFromBlockchain = async () => {
    try {
      const indexer = new algosdk.Indexer(
        "",
        "https://testnet-idx.algonode.cloud",
        ""
      );
      const txns = await indexer
        .searchForTransactions()
        .address(account)
        .do();
      const hashes = txns.transactions
        .map((tx) => {
          if (!tx.note) return null;
          try {
            const decoded = new TextDecoder().decode(
              Uint8Array.from(atob(tx.note), (c) => c.charCodeAt(0))
            );
            if (decoded.startsWith("USER_HASH:")) {
              return decoded;
            }
          } catch (e) {
            // Ignore non-text notes
            return null;
          }
          return null;
        })
        .filter(Boolean);
      console.log("Fetched hashes:", hashes);
    } catch (err) {
      console.error("Fetch blockchain error:", err);
    }
  };
  const depositToVault = async () => {
    if (!vaultAmount) return;
    await sendAlgo(account, vaultAmount);
    setTotalSaved((prev) => prev + Number(vaultAmount));
    addTransaction("Vault Deposit", vaultAmount, "Vault");
    setVaultAmount("");
  };
  const healthScore =
    creditScore +
    totalSaved * 10 +
    paymentsMade * 20 +
    contributionsMade * 30;
  let risk = "High";
  let color = "red";
  if (healthScore > 800) {
    risk = "Low";
    color = "lime";
  } else if (healthScore > 500) {
    risk = "Medium";
    color = "orange";
  }
  const generateUserHash = () => {

    const userProfile = {
      income,
      expenses,
      upi_freq: upiFreq,
      savings,
      water_bill: waterBill,
      electricity_bill: electricityBill,
      rent_bill: rentBill,
      emergency_fund: emergencyFund ? 1 : 0
    };
    const hash = CryptoJS.SHA256(
      JSON.stringify(userProfile)
    ).toString();

    console.log("Generated USER HASH:", hash);

    return hash;
  };
  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Algorand Smart Bank</h1>
      {!account ? (
        <button style={button} onClick={connectWallet}>
          Connect Pera Wallet
        </button>
      ) : (
        <>
          <p>Connected: {account}</p>
          <div>
            <button onClick={() => setTab("send")}>Send</button>
            <button onClick={() => setTab("split")}>Split</button>
            <button onClick={() => setTab("events")}>Events</button>
            <button onClick={() => setTab("vault")}>Savings</button>
            <button onClick={() => setTab("credit")}>Credit</button>
            <button onClick={() => setTab("history")}>History</button>
            <button onClick={() => setTab("ai")}>AI Dashboard</button>
          </div>
          {tab === "send" && (
            <div style={card}>
              <h3>Send Payment</h3>
              <input
                style={input}
                placeholder="Receiver Wallet"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
              />
              <input
                style={input}
                placeholder="Amount (ALGO)"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
              />
              <button
                style={button}
                disabled={isSending}
                onClick={() => sendAlgo(receiver, sendAmount)}
              >
                Send ALGO
              </button>
            </div>
          )}
          {tab === "split" && (
            <div style={card}>
              <h3>Split Expense</h3>
              <input
                style={input}
                placeholder="Friend Address"
                value={splitAddress}
                onChange={(e) => setSplitAddress(e.target.value)}
              />
              <input
                style={input}
                placeholder="Amount to Split"
                value={splitAmount}
                onChange={(e) => setSplitAmount(e.target.value)}
              />
              <button
                style={button}
                disabled={isSending}
                onClick={() => {
                  sendAlgo(splitAddress, splitAmount);
                  setContributionsMade((p) => p + 1);
                }}
              >
                Pay Friend
              </button>
            </div>
          )}
          {tab === "events" && (
            <div style={card}>
              <h3>Create Event Fund</h3>
              <input style={input} value={eventName} onChange={(e) => setEventName(e.target.value)} />
              <input style={input} value={eventWallet} onChange={(e) => setEventWallet(e.target.value)} />
              <button style={button} onClick={createEvent}>Create</button>
              {events.map((ev, i) => (
                <div key={i}>
                  <p>{ev.name}</p>
                  <button style={button} onClick={() => sendAlgo(ev.wallet, 0.05)}>
                    Contribute
                  </button>
                </div>
              ))}
            </div>
          )}
          {tab === "vault" && (
            <div style={card}>
              <h3>Savings Vault</h3>
              <input style={input} value={vaultAmount} onChange={(e) => setVaultAmount(e.target.value)} />
              <button style={button} onClick={depositToVault}>Deposit</button>
              <h2>Total Saved: {totalSaved}</h2>
            </div>
          )}
          {tab === "credit" && (
            <div style={card}>
              <h3>AI Credit Score</h3>
              <input style={input} placeholder="Monthly Income (₹)"
                value={income} onChange={(e) => setIncome(e.target.value)} />
              <input style={input} placeholder="Expenses (₹)"
                value={expenses} onChange={(e) => setExpenses(e.target.value)} />
              <input style={input} placeholder="UPI Transactions / Month"
                value={upiFreq} onChange={(e) => setUpiFreq(e.target.value)} />
              <input style={input} placeholder="Savings (₹)"
                value={savings} onChange={(e) => setSavings(e.target.value)} />
              <input style={input} placeholder="Water Bill Paid? (1/0)"
                value={waterBill} onChange={(e) => setWaterBill(e.target.value)} />
              <input style={input} placeholder="Electricity Bill Paid? (1/0)"
                value={electricityBill} onChange={(e) => setElectricityBill(e.target.value)} />
              <input style={input} placeholder="Rent Paid? (1/0)"
                value={rentBill} onChange={(e) => setRentBill(e.target.value)} />
              <label>
                Emergency Fund:
                <input type="checkbox"
                  checked={emergencyFund}
                  onChange={(e) => setEmergencyFund(e.target.checked)} />
              </label>
              <button style={button} onClick={calculateCreditScore}>
                Calculate
              </button>
              <button
                style={button}
                onClick={storeUserDataOnBlockchain}
              >
                Store Data on Blockchain 🔗
              </button>
              <h2>{creditScore}</h2>
            </div>
          )}
          {tab === "history" && (
            <div style={card}>
              <h3>Transaction History</h3>
              {transactions.map((tx, i) => (
                <p key={i}>{tx.type} — {tx.amount} → {tx.to}</p>
              ))}
            </div>
          )}
          {tab === "ai" && (
            <div style={card}>
              <h2>🤖 AI Financial Health</h2>
              <h3>Health Score: {healthScore}</h3>
              <h3 style={{ color }}>Risk Level: {risk}</h3>

              <button style={button} onClick={fetchUserHashFromBlockchain}>
                Fetch Blockchain Data
              </button>
            </div>
          )}

        </>
      )}
    </div>
  );
}
export default App;
