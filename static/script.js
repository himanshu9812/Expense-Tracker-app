import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, set, push, onValue, remove } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAj0GISGDAM6uP4u3rYthHCa9NIvHfOJYM",
  authDomain: "expense-tracker-c561a.firebaseapp.com",
  projectId: "expense-tracker-c561a",
  storageBucket: "expense-tracker-c561a.appspot.com",
  messagingSenderId: "305997067284",
  appId: "1:305997067284:web:2f6fbbfac778439fa76301"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// DOM elements
const balanceForm = document.getElementById("balanceForm");
const fixedInput = document.getElementById("fixedBalance");
const remainingText = document.getElementById("remaining");

const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const expenseList = document.getElementById("expenseList");

const resetBtn = document.getElementById("resetBtn");
const addBalanceBtn = document.getElementById("addBalanceBtn");

// Set initial balance and remaining
balanceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = parseInt(fixedInput.value);
  if (!isNaN(value)) {
    set(ref(db), {
      balance: value,
      remaining: value,
      expenses: {} // optional if you want to clear old expenses
    });
    fixedInput.value = "";
  }
});

// Add more balance to remaining
addBalanceBtn.addEventListener("click", () => {
  const additional = parseInt(fixedInput.value);
  if (!isNaN(additional)) {
    const remainingRef = ref(db, "remaining");
    onValue(remainingRef, (snapshot) => {
      const current = snapshot.val() || 0;
      set(remainingRef, current + additional);
      fixedInput.value = "";
    }, { onlyOnce: true });
  }
});

// Add expense and deduct from remaining
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  const amount = parseInt(amountInput.value);

  if (title && !isNaN(amount)) {
    // Deduct from remaining first
    const remainingRef = ref(db, "remaining");
    onValue(remainingRef, (snapshot) => {
      const current = snapshot.val() || 0;
      if (amount <= current) {
        // Deduct remaining and save expense
        set(remainingRef, current - amount);

        const newRef = push(ref(db, "expenses"));
        set(newRef, { title, amount });

        titleInput.value = "";
        amountInput.value = "";
      } else {
        alert("Not enough balance!");
      }
    }, { onlyOnce: true });
  }
});

// Delete expense (adds back to remaining)
function deleteExpense(id, amount) {
  const remainingRef = ref(db, "remaining");
  onValue(remainingRef, (snapshot) => {
    const current = snapshot.val() || 0;
    set(remainingRef, current + amount);
    remove(ref(db, `expenses/${id}`));
  }, { onlyOnce: true });
}

// Reset balance and expenses
resetBtn.addEventListener("click", () => {
  set(ref(db), {});
});

// Update UI
function updateDisplay() {
  onValue(ref(db), (snapshot) => {
    const data = snapshot.val() || {};
    const remaining = data?.remaining || 0;
    const expenses = data?.expenses || {};

    remainingText.textContent = remaining;

    expenseList.innerHTML = "";
    for (const [id, { title, amount }] of Object.entries(expenses)) {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${title}</span>
        <div>
          <span class="me-3">₹${amount}</span>
          <button class="btn btn-sm btn-danger">Delete</button>
        </div>`;
      li.querySelector("button").addEventListener("click", () => deleteExpense(id, amount));
      expenseList.appendChild(li);
    }
  });
}

updateDisplay();
