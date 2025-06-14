// Sprawdzanie logowania
if (!localStorage.getItem("isLoggedIn")) {
  window.location.href = "login.html";
}

function openTab(tabName) {
  document.querySelectorAll(".tab").forEach(t => t.classList.add("hidden"));
  document.getElementById(tabName).classList.remove("hidden");
}

function saveEntry(category) {
  const input = document.getElementById(`input-${category}`).value.trim();
  if (!input) return;

  const list = JSON.parse(localStorage.getItem(category)) || [];
  list.push({ id: Date.now(), text: input });
  localStorage.setItem(category, JSON.stringify(list));
  document.getElementById(`input-${category}`).value = "";
  loadEntries(category);
  logChange("create", `Dodano "${input}" do zakładki "${category}"`);
}

function loadEntries(category) {
  const entries = JSON.parse(localStorage.getItem(category)) || [];
  const container = document.getElementById(`list-${category}`);
  container.innerHTML = "";
  entries.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = entry.text;
    const delBtn = document.createElement("button");
    delBtn.textContent = "Usuń";
    delBtn.style.marginLeft = "10px";
    delBtn.style.background = "#ef4444";
    delBtn.style.border = "none";
    delBtn.style.color = "white";
    delBtn.onclick = () => {
      const updated = JSON.parse(localStorage.getItem(category)).filter((_, i) => i !== index);
      localStorage.setItem(category, JSON.stringify(updated));
      loadEntries(category);
      logChange("delete", `Usunięto "${entry.text}" z zakładki "${category}"`);
    };
    li.appendChild(delBtn);
    container.appendChild(li);
  });
}

function logChange(type, description) {
  const history = JSON.parse(localStorage.getItem("changeHistory")) || [];
  history.unshift({ type, description, timestamp: new Date().toLocaleString() });
  localStorage.setItem("changeHistory", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("changeHistory")) || [];
  const container = document.getElementById("change-history");
  container.innerHTML = "";
  history.forEach(entry => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<strong>[${entry.type}]</strong> — ${entry.description}<br/><small>${entry.timestamp}</small>`;
    container.appendChild(div);
  });
}

function addNode() {
  const text = document.getElementById("input-node").value.trim();
  if (!text) return;

  const graph = document.getElementById("graph-container");
  const node = document.createElement("div");
  node.className = "node";
  node.textContent = text;
  node.style.left = Math.random() * (graph.clientWidth - 60) + "px";
  node.style.top = Math.random() * (graph.clientHeight - 60) + "px";

  let selected = false;
  node.addEventListener("click", () => {
    node.style.backgroundColor = selected ? "#7c3aed" : "#a855f7";
    selected = !selected;
  });

  graph.appendChild(node);
  document.getElementById("input-node").value = "";
  logChange("create", `Dodano węzeł: ${text}`);
}

function downloadBackup() {
  const dataStr = JSON.stringify({
    podejrzani: JSON.parse(localStorage.getItem("podejrzani")),
    pojazdy: JSON.parse(localStorage.getItem("pojazdy")),
    raporty: JSON.parse(localStorage.getItem("raporty")),
    historia: JSON.parse(localStorage.getItem("changeHistory"))
  }, null, 2);

  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dtu-bcso-backup.json";
  a.click();
  URL.revokeObjectURL(url);
}

function searchData(query) {
  const results = [];
  ["podejrzani", "pojazdy", "raporty"].forEach(cat => {
    const items = JSON.parse(localStorage.getItem(cat)) || [];
    items.forEach(item => {
      if (item.text?.toLowerCase().includes(query.toLowerCase())) {
        results.push(`<li>[${cat}] ${item.text}</li>`);
      }
    });
  });
  document.getElementById("search-results").innerHTML = results.join("") || "<li>Brak wyników</li>";
}

function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

window.onload = () => {
  ["podejrzani", "pojazdy", "raporty"].forEach(loadEntries);
  if (document.getElementById("change-history")) loadHistory();
};