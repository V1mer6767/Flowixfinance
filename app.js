const el = (id) => document.getElementById(id);

const els = {
  today: el("today"),
  balance: el("balance"),
  income: el("income"),
  expense: el("expense"),
  type: el("type"),
  category: el("category"),
  amount: el("amount"),
  note: el("note"),
  addBtn: el("addBtn"),
  list: el("list"),
  clearBtn: el("clearBtn"),
  search: el("search"),
  filter: el("filter"),
};

const KEY = "flowix_finance_entries_v9";
let entries = JSON.parse(localStorage.getItem(KEY) || "[]");

els.today.textContent = new Date().toLocaleDateString("uk-UA", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

function save() {
  localStorage.setItem(KEY, JSON.stringify(entries));
}

function uah(n) {
  const num = Number(n) || 0;
  return `${num.toLocaleString("uk-UA")} ₴`;
}

function totals() {
  let inc = 0, exp = 0;
  for (const e of entries) {
    const a = Number(e.amount) || 0;
    if (e.type === "income") inc += a;
    else exp += a;
  }
  return { inc, exp, bal: inc - exp };
}

function matches(e) {
  const f = els.filter.value;
  const q = els.search.value.trim().toLowerCase();
  if (f !== "all" && e.type !== f) return false;
  if (!q) return true;
  return (e.category || "").toLowerCase().includes(q) ||
         (e.note || "").toLowerCase().includes(q);
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTotals() {
  const t = totals();
  els.balance.textContent = uah(t.bal);
  els.income.textContent = uah(t.inc);
  els.expense.textContent = uah(t.exp);
}

function renderList() {
  els.list.innerHTML = "";
  const visible = entries.filter(matches);

  if (visible.length === 0) {
    els.list.innerHTML = `<div class="meta">Немає записів. Додай перший 👆</div>`;
    return;
  }

  for (const e of visible) {
    const dt = new Date(e.createdAt).toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const sign = e.type === "income" ? "+" : "-";
    const cls = e.type === "income" ? "income" : "expense";

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <div class="left">
        <div class="badge">${e.type === "income" ? "🟢 Доходи" : "🔴 Витрати"} • ${escapeHtml(e.category)}</div>
        <div class="meta">${escapeHtml(e.note || "")}</div>
        <div class="meta">${dt}</div>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="amount ${cls}">${sign} ${uah(e.amount)}</div>
        <button class="iconbtn" title="Видалити">🗑️</button>
      </div>
    `;

    div.querySelector("button").addEventListener("click", () => {
      entries = entries.filter(x => x.id !== e.id);
      save();
      render();
    });

    els.list.appendChild(div);
  }
}

function addEntry() {
  const amount = Number(els.amount.value);
  if (!amount || amount <= 0) return alert("Введи суму більше 0");

  const entry = {
    id: crypto.randomUUID(),
    type: els.type.value,
    category: els.category.value,
    amount,
    note: els.note.value.trim() || "Без коментаря",
    createdAt: new Date().toISOString(),
  };

  entries.unshift(entry);
  save();

  els.amount.value = "";
  els.note.value = "";
  render();
}

function clearAll() {
  if (!confirm("Точно очистити всі записи?")) return;
  entries = [];
  save();
  render();
}

function render() {
  renderTotals();
  renderList();
}

els.addBtn.addEventListener("click", addEntry);
els.clearBtn.addEventListener("click", clearAll);
els.search.addEventListener("input", renderList);
els.filter.addEventListener("change", renderList);

render();
