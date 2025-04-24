import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, addDoc, getDoc, getDocs,
  collection, updateDoc, deleteDoc, onSnapshot
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAj0GISGDAM6uP4u3rYthHCa9NIvHfOJYM",
  authDomain: "expense-tracker-c561a.firebaseapp.com",
  projectId: "expense-tracker-c561a",
  storageBucket: "expense-tracker-c561a.appspot.com",
  messagingSenderId: "305997067284",
  appId: "1:305997067284:web:2f6fbbfac778439fa76301"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const balanceForm = document.getElementById("balanceForm");
const fixedInput = document.getElementById("fixedBalance");
const remainingText = document.getElementById("remaining");

const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const expenseList = document.getElementById("expenseList");

const resetBtn = document.getElementById("resetBtn");
const addBalanceBtn = document.getElementById("addBalanceBtn");

// Set Initial Balance
balanceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = parseInt(fixedInput.value);
  if (!isNaN(value)) {
    await setDoc(doc(db, "meta", "info"), {
      balance: value,
      remaining: value
    });
    fixedInput.value = "";
  }
});

// Add to Remaining
addBalanceBtn.addEventListener("click", async () => {
  const additional = parseInt(fixedInput.value);
  if (!isNaN(additional)) {
    const docRef = doc(db, "meta", "info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const current = docSnap.data().remaining || 0;
      await updateDoc(docRef, { remaining: current + additional });
      fixedInput.value = "";
    }
  }
});

// Add Expense
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (title && !isNaN(amount)) {
    const docRef = doc(db, "meta", "info");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const current = docSnap.data().remaining || 0;
      if (amount <= current) {
        await updateDoc(docRef, { remaining: current - amount });
        await addDoc(collection(db, "expenses"), { title, amount });
        titleInput.value = "";
        amountInput.value = "";
      } else {
        alert("Not enough balance!");
      }
    }
  }
});

// Delete Expense and Add Back Amount
async function deleteExpense(id, amount) {
  const docRef = doc(db, "meta", "info");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const current = docSnap.data().remaining || 0;
    await updateDoc(docRef, { remaining: current + amount });
    await deleteDoc(doc(db, "expenses", id));
  }
}

// Reset All
resetBtn.addEventListener("click", async () => {
  await setDoc(doc(db, "meta", "info"), {});
  const expenseSnapshot = await getDocs(collection(db, "expenses"));
  for (const docSnap of expenseSnapshot.docs) {
    await deleteDoc(doc(db, "expenses", docSnap.id));
  }
});

// Update UI in Real-Time
function updateDisplay() {
  onSnapshot(doc(db, "meta", "info"), (docSnap) => {
    remainingText.textContent = docSnap.exists() ? docSnap.data().remaining || 0 : 0;
  });

  onSnapshot(collection(db, "expenses"), (snapshot) => {
    expenseList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const { title, amount } = docSnap.data();
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${title}</span>
        <div>
          <span class="me-3">₹${amount}</span>
          <button class="btn btn-sm btn-danger">Delete</button>
        </div>`;
      li.querySelector("button").addEventListener("click", () => deleteExpense(docSnap.id, amount));
      expenseList.appendChild(li);
    });
  });
}

updateDisplay();
