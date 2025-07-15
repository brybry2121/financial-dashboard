// Tab navigation
document.querySelectorAll('.navbar button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.navbar button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  };
});

// AddableList logic
function AddableList(container, { subtitle, items, setItems, totalLabel, positive = true, allowEmpty = false, inOrOut = "in" }) {
  function render() {
    container.innerHTML = '';
    if (subtitle) {
      const sub = document.createElement('div');
      sub.className = positive ? "cf-subtitle" : "cf-subtitle cf-out";
      sub.textContent = subtitle;
      container.appendChild(sub);
    }
    // List
    const ul = document.createElement('ul');
    items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'addable-list-item';
      li.innerHTML = `<span>${item.name}</span>
        <span class="amount${!positive || inOrOut === "out" ? ' negative' : ''}">${positive || inOrOut === "in" ? '+' : '-'}$${item.amount}</span>
        <button class="delete-btn" title="Delete">×</button>`;
      li.querySelector('.delete-btn').onclick = () => {
        items.splice(idx, 1);
        setItems([...items]);
      };
      ul.appendChild(li);
    });
    container.appendChild(ul);
    // Input row
    if (container.dataset.adding === "true") {
      const inputRow = document.createElement('div');
      inputRow.className = 'input-row';
      const nameInput = document.createElement('input');
      nameInput.type = "text";
      nameInput.placeholder = "Item name";
      const amtInput = document.createElement('input');
      amtInput.type = "number";
      amtInput.placeholder = "Amount";
      const addBtn = document.createElement('button');
      addBtn.className = "add-btn";
      addBtn.textContent = "Add";
      addBtn.onclick = () => {
        if (nameInput.value && amtInput.value !== "") {
          items.push({ name: nameInput.value, amount: Number(amtInput.value) });
          container.dataset.adding = "false";
          setItems([...items]);
        }
      };
      inputRow.appendChild(nameInput);
      inputRow.appendChild(amtInput);
      inputRow.appendChild(addBtn);
      container.appendChild(inputRow);
    }
    // Add button
    if (container.dataset.adding !== "true") {
      const addBtn = document.createElement('button');
      addBtn.className = positive || inOrOut === "in" ? 'add-btn' : 'plus-btn';
      addBtn.textContent = "+ Add Item";
      addBtn.onclick = () => {
        container.dataset.adding = "true";
        render();
        container.querySelector("input")?.focus();
      };
      container.appendChild(addBtn);
    }
    // Subtotal
    const subtotal = items.reduce((sum, i) => sum + i.amount, 0);
    if (items.length > 0 || allowEmpty) {
      const subTotalDiv = document.createElement('div');
      subTotalDiv.className = positive || inOrOut === "in" ? 'cf-subtotal' : 'cf-subtotal cf-out';
      subTotalDiv.textContent = `${totalLabel || "Subtotal"}: $${subtotal}`;
      container.appendChild(subTotalDiv);
    }
  }
  render();
  return render;
}

// ----------- Income Statement -----------
(function renderIncomeStatement() {
  const box = document.querySelector('.income-box');
  box.innerHTML = `
    <h2>Income Statement Breakdown</h2>
    <div class="inc-section">
      <div class="inc-subhead">1️⃣ Revenue</div>
      <div class="inc-desc">Money earned from core operations.</div>
      <div id="revenue-list"></div>
      <div class="inc-subtotal" id="total-revenue"></div>
    </div>
    <div class="inc-section">
      <div class="inc-subhead">2️⃣ Cost of Goods Sold (COGS)</div>
      <div class="inc-desc">Direct costs of production.</div>
      <div id="begin-inventory-list"></div>
      <div id="purchases-list"></div>
      <div id="end-inventory-list"></div>
      <div class="inc-subtotal" id="total-cogs"></div>
    </div>
    <div class="inc-row-highlight" id="gross-profit"></div>
    <div class="inc-section">
      <div class="inc-subhead">4️⃣ Operating Expenses</div>
      <div class="inc-desc">Costs not directly tied to production.</div>
      <div id="operating-expenses-list"></div>
      <div class="inc-subtotal red" id="total-operating-expenses"></div>
    </div>
    <div class="inc-row-highlight blue" id="operating-income"></div>
    <div class="inc-section">
      <div class="inc-subhead">6️⃣ Other Income / Expense</div>
      <div class="inc-desc">Interest, dividends, etc.</div>
      <div id="other-income-list"></div>
      <div id="other-expense-list"></div>
      <div class="inc-subtotal" id="net-other"></div>
    </div>
    <div class="inc-row-highlight green" id="net-income-before-tax"></div>
    <div class="inc-section">
      <div class="inc-subhead">8️⃣ Taxes</div>
      <div class="inc-desc">Can be manually added or entered as %.</div>
      <div id="taxes-list"></div>
      <div class="inc-subtotal red" id="total-taxes"></div>
    </div>
    <div class="inc-row-final" id="final-net-income"></div>
  `;

  // State for income statement
  const state = {
    revenues: [],
    beginInventory: [],
    purchases: [],
    endInventory: [],
    operatingExpenses: [],
    otherIncome: [],
    otherExpense: [],
    taxes: []
  };

  function updateAll() {
    // Revenue
    AddableList(document.getElementById("revenue-list"), {
      items: state.revenues,
      setItems: arr => { state.revenues = arr; updateAll(); },
      positive: true
    });
    const totalRevenue = state.revenues.reduce((sum, i) => sum + i.amount, 0);
    document.getElementById("total-revenue").textContent = `Total Revenue = $${totalRevenue}`;

    // COGS
    AddableList(document.getElementById("begin-inventory-list"), {
      items: state.beginInventory,
      setItems: arr => { state.beginInventory = arr; updateAll(); },
      positive: false
    });
    AddableList(document.getElementById("purchases-list"), {
      items: state.purchases,
      setItems: arr => { state.purchases = arr; updateAll(); },
      positive: false
    });
    AddableList(document.getElementById("end-inventory-list"), {
      items: state.endInventory,
      setItems: arr => { state.endInventory = arr; updateAll(); },
      positive: true
    });
    const totalBeginInventory = state.beginInventory.reduce((sum, i) => sum + i.amount, 0);
    const totalPurchases = state.purchases.reduce((sum, i) => sum + i.amount, 0);
    const totalEndInventory = state.endInventory.reduce((sum, i) => sum + i.amount, 0);
    const totalCOGS = totalBeginInventory + totalPurchases - totalEndInventory;
    document.getElementById("total-cogs").textContent =
      `COGS = Beginning Inventory + Purchases − Ending Inventory
COGS = $${totalBeginInventory} + $${totalPurchases} − $${totalEndInventory} = $${totalCOGS}`;

    // Gross Profit
    const grossProfit = totalRevenue - totalCOGS;
    document.getElementById("gross-profit").innerHTML =
      `3️⃣ Gross Profit = Revenue − COGS = $${totalRevenue} − ($${totalCOGS}) = <span style="font-size:18px;">$${grossProfit}</span>`;

    // Operating Expenses
    AddableList(document.getElementById("operating-expenses-list"), {
      items: state.operatingExpenses,
      setItems: arr => { state.operatingExpenses = arr; updateAll(); },
      positive: false
    });
    const totalOperatingExpenses = state.operatingExpenses.reduce((sum, i) => sum + i.amount, 0);
    document.getElementById("total-operating-expenses").textContent =
      `Total Operating Expenses = $${totalOperatingExpenses}`;

    // Operating Income
    const operatingIncome = grossProfit - totalOperatingExpenses;
    document.getElementById("operating-income").innerHTML =
      `5️⃣ Operating Income = Gross Profit − Operating Expenses = $${grossProfit} − $${totalOperatingExpenses} = <span style="font-size:18px;">$${operatingIncome}</span>`;

    // Other Income/Expense
    AddableList(document.getElementById("other-income-list"), {
      items: state.otherIncome,
      setItems: arr => { state.otherIncome = arr; updateAll(); },
      positive: true
    });
    AddableList(document.getElementById("other-expense-list"), {
      items: state.otherExpense,
      setItems: arr => { state.otherExpense = arr; updateAll(); },
      positive: false
    });
    const totalOtherIncome = state.otherIncome.reduce((sum, i) => sum + i.amount, 0);
    const totalOtherExpense = state.otherExpense.reduce((sum, i) => sum + i.amount, 0);
    const netOther = totalOtherIncome - totalOtherExpense;
    document.getElementById("net-other").innerHTML =
      `Net Other = $${totalOtherIncome} − $${totalOtherExpense} = <span style="color:#187a27;">$${netOther}</span>`;

    // Net Income Before Tax
    const netIncomeBeforeTax = operatingIncome + netOther;
    document.getElementById("net-income-before-tax").innerHTML =
      `7️⃣ Net Income Before Tax = Operating Income + Net Other = $${operatingIncome} + $${netOther} = <span style="font-size:18px;">$${netIncomeBeforeTax}</span>`;

    // Taxes
    AddableList(document.getElementById("taxes-list"), {
      items: state.taxes,
      setItems: arr => { state.taxes = arr; updateAll(); },
      positive: false
    });
    const totalTaxes = state.taxes.reduce((sum, i) => sum + i.amount, 0);
    document.getElementById("total-taxes").textContent = `Total Taxes = $${totalTaxes}`;

    // Final Net Income
    const netIncome = netIncomeBeforeTax - totalTaxes;
    document.getElementById("final-net-income").innerHTML =
      `9️⃣ Net Income = Net Income Before Tax − Taxes = $${netIncomeBeforeTax} − $${totalTaxes} = <span style="font-size:22px;">$${netIncome}</span>`;
  }
  updateAll();
})();

// ----------- Balance Sheet -----------
(function renderBalanceSheet() {
  const box = document.querySelector('.balance-box');
  box.innerHTML = `
    <div class="section-heading">Assets</div>
    <div class="addable-list-section">
      <div class="sub-heading">Current Assets</div>
      <div id="current-assets-list" class="addable-list"></div>
      <div class="subtotal" id="total-current-assets"></div>
    </div>
    <div class="addable-list-section">
      <div class="sub-heading">Fixed Assets</div>
      <div id="fixed-assets-list" class="addable-list"></div>
      <div class="subtotal" id="total-fixed-assets"></div>
    </div>
    <div class="total-row" id="total-assets"></div>
    <div class="section-heading">Liabilities</div>
    <div class="addable-list-section">
      <div class="sub-heading">Current Liabilities</div>
      <div id="current-liabilities-list" class="addable-list"></div>
      <div class="subtotal" id="total-current-liabilities"></div>
    </div>
    <div class="addable-list-section">
      <div class="sub-heading">Long-term Liabilities</div>
      <div id="long-liabilities-list" class="addable-list"></div>
      <div class="subtotal" id="total-long-liabilities"></div>
    </div>
    <div class="total-row" id="total-liabilities"></div>
    <div class="section-heading">Owner's Equity</div>
    <div class="addable-list-section">
      <div class="sub-heading">Contribution Capital</div>
      <div id="contribution-capital-list" class="addable-list"></div>
      <div class="subtotal" id="total-contribution-capital"></div>
    </div>
    <div class="addable-list-section">
      <div class="sub-heading">Other Capital</div>
      <div id="other-capital-list" class="addable-list"></div>
      <div class="subtotal" id="total-other-capital"></div>
    </div>
    <div class="total-row" id="total-equity"></div>
    <div class="total-row" id="total-liabilities-equity"></div>
    <div class="balance-status" id="balance-status"></div>
    <div class="final-assets" id="final-total-assets"></div>
  `;

  const state = {
    currentAssets: [],
    fixedAssets: [],
    currentLiabilities: [],
    longLiabilities: [],
    contributionCapital: [],
    otherCapital: []
  };

  function updateAll() {
    [
      { key: "currentAssets", label: "total-current-assets", list: "current-assets-list" },
      { key: "fixedAssets", label: "total-fixed-assets", list: "fixed-assets-list" },
      { key: "currentLiabilities", label: "total-current-liabilities", list: "current-liabilities-list" },
      { key: "longLiabilities", label: "total-long-liabilities", list: "long-liabilities-list" },
      { key: "contributionCapital", label: "total-contribution-capital", list: "contribution-capital-list" },
      { key: "otherCapital", label: "total-other-capital", list: "other-capital-list" }
    ].forEach(sec => {
      AddableList(
        document.getElementById(sec.list),
        {
          items: state[sec.key],
          setItems: arr => {
            state[sec.key] = arr;
            updateAll();
          }
        }
      );
      document.getElementById(sec.label).textContent =
        `${document.querySelector(`#${sec.list}`).previousElementSibling.textContent}: $${state[sec.key].reduce((sum, i) => sum + i.amount, 0)}`;
    });

    // Totals
    const totalCurrentAssets = state.currentAssets.reduce((sum, i) => sum + i.amount, 0);
    const totalFixedAssets = state.fixedAssets.reduce((sum, i) => sum + i.amount, 0);
    const totalAssets = totalCurrentAssets + totalFixedAssets;
    document.getElementById("total-assets").innerHTML =
      `Total Assets = $${totalCurrentAssets} + $${totalFixedAssets} = <span>$${totalAssets}</span>`;

    const totalCurrentLiabilities = state.currentLiabilities.reduce((sum, i) => sum + i.amount, 0);
    const totalLongLiabilities = state.longLiabilities.reduce((sum, i) => sum + i.amount, 0);
    const totalLiabilities = totalCurrentLiabilities + totalLongLiabilities;
    document.getElementById("total-liabilities").innerHTML =
      `Total Liabilities = $${totalCurrentLiabilities} + $${totalLongLiabilities} = <span>$${totalLiabilities}</span>`;

    const totalContributionCapital = state.contributionCapital.reduce((sum, i) => sum + i.amount, 0);
    const totalOtherCapital = state.otherCapital.reduce((sum, i) => sum + i.amount, 0);
    const totalEquity = totalContributionCapital + totalOtherCapital;
    document.getElementById("total-equity").innerHTML =
      `Total Owner's Equity = $${totalContributionCapital} + $${totalOtherCapital} = <span>$${totalEquity}</span>`;

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    document.getElementById("total-liabilities-equity").innerHTML =
      `Total Liabilities + Owner's Equity = $${totalLiabilities} + $${totalEquity} = <span>$${totalLiabilitiesAndEquity}</span>`;

    const balanced = totalLiabilitiesAndEquity === totalAssets;
    const balStatus = document.getElementById("balance-status");
    balStatus.textContent = balanced ? "Balanced ✔" : "Not Balanced ✖";
    balStatus.className = "balance-status " + (balanced ? "balanced" : "not-balanced");

    document.getElementById("final-total-assets").textContent = `Total Assets = $${totalAssets}`;
  }
  updateAll();
})();

// ----------- Cash Flow -----------
(function renderCashFlow() {
  const box = document.querySelector('.cashflow-card');
  box.innerHTML = `
    <div class="section-title">Cash Flows from Operating Activities (Core business)</div>
    <div id="oper-in-list"></div>
    <div id="oper-out-list"></div>
    <div class="cf-total-row" id="oper-total"></div>
    <div class="section-title">Cash Flows from Investing Activities (Long-term assets)</div>
    <div id="invest-in-list"></div>
    <div id="invest-out-list"></div>
    <div class="cf-total-row" id="invest-total"></div>
    <div class="section-title">Cash Flows from Financing Activities (Cash from owners or banks)</div>
    <div id="fin-in-list"></div>
    <div id="fin-out-list"></div>
    <div class="cf-total-row" id="fin-total"></div>
    <div class="cf-final-total" id="net-cash-change"></div>
  `;
  const state = {
    operIn: [],
    operOut: [],
    investIn: [],
    investOut: [],
    finIn: [],
    finOut: []
  };
  function updateAll() {
    AddableList(document.getElementById("oper-in-list"), {
      subtitle: "➕ Adjusted for inflows",
      items: state.operIn,
      setItems: arr => { state.operIn = arr; updateAll(); },
      totalLabel: "Total Inflow",
      inOrOut: "in"
    });
    AddableList(document.getElementById("oper-out-list"), {
      subtitle: "➖ Adjusted for outflows",
      items: state.operOut,
      setItems: arr => { state.operOut = arr; updateAll(); },
      totalLabel: "Total Outflow",
      inOrOut: "out"
    });
    const totalOperIn = state.operIn.reduce((sum, i) => sum + i.amount, 0);
    const totalOperOut = state.operOut.reduce((sum, i) => sum + i.amount, 0);
    const totalOper = totalOperIn - totalOperOut;
    document.getElementById("oper-total").innerHTML =
      `Total Operating Cash Flow = $${totalOperIn} - $${totalOperOut} = <span style="color:#187a27;">$${totalOper}</span>`;

    AddableList(document.getElementById("invest-in-list"), {
      subtitle: "➕ Inflows",
      items: state.investIn,
      setItems: arr => { state.investIn = arr; updateAll(); },
      totalLabel: "Total Inflow",
      inOrOut: "in"
    });
    AddableList(document.getElementById("invest-out-list"), {
      subtitle: "➖ Outflows",
      items: state.investOut,
      setItems: arr => { state.investOut = arr; updateAll(); },
      totalLabel: "Total Outflow",
      inOrOut: "out"
    });
    const totalInvestIn = state.investIn.reduce((sum, i) => sum + i.amount, 0);
    const totalInvestOut = state.investOut.reduce((sum, i) => sum + i.amount, 0);
    const totalInvest = totalInvestIn - totalInvestOut;
    document.getElementById("invest-total").innerHTML =
      `Total Investing Cash Flow = $${totalInvestIn} - $${totalInvestOut} = <span style="color:#187a27;">$${totalInvest}</span>`;

    AddableList(document.getElementById("fin-in-list"), {
      subtitle: "➕ Inflows",
      items: state.finIn,
      setItems: arr => { state.finIn = arr; updateAll(); },
      totalLabel: "Total Inflow",
      inOrOut: "in"
    });
    AddableList(document.getElementById("fin-out-list"), {
      subtitle: "➖ Outflows",
      items: state.finOut,
      setItems: arr => { state.finOut = arr; updateAll(); },
      totalLabel: "Total Outflow",
      inOrOut: "out"
    });
    const totalFinIn = state.finIn.reduce((sum, i) => sum + i.amount, 0);
    const totalFinOut = state.finOut.reduce((sum, i) => sum + i.amount, 0);
    const totalFin = totalFinIn - totalFinOut;
    document.getElementById("fin-total").innerHTML =
      `Total Financing Cash Flow = $${totalFinIn} - $${totalFinOut} = <span style="color:#187a27;">$${totalFin}</span>`;

    // Net Change
    const netChange = totalOper + totalInvest + totalFin;
    const netDiv = document.getElementById("net-cash-change");
    netDiv.className = "cf-final-total" + (netChange < 0 ? " negative" : "");
    netDiv.innerHTML =
      `<b>Net Change in Cash = ${totalOper} (Operating) + ${totalInvest} (Investing) + ${totalFin} (Financing) = <span>$${netChange}</span></b>`;
  }
  updateAll();
})();