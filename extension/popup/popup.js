const STORAGE_KEY = "crm_extension_api_base";

document.getElementById("apiBase").addEventListener("change", (e) => {
  const base = (e.target.value || "").trim().replace(/\/+$/, "");
  chrome.storage.local.set({ [STORAGE_KEY]: base || null });
});

document.getElementById("btnScrape").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  const btn = document.getElementById("btnScrape");
  function showStatus(msg, type = "info") {
    statusEl.textContent = msg;
    statusEl.className = "status " + type;
    statusEl.style.display = "block";
  }
  btn.disabled = true;
  showStatus("Se extrag datele din pagină...", "info");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      showStatus("Nu s-a găsit tab-ul activ.", "error");
      btn.disabled = false;
      return;
    }

    let data;
    try {
      data = await chrome.tabs.sendMessage(tab.id, { action: "scrape" });
    } catch (e) {
      showStatus("Deschide un anunț pe imobiliare.ro, OLX sau Storia, apoi reîncarcă pagina și încearcă din nou.", "error");
      btn.disabled = false;
      return;
    }
    if (!data) {
      showStatus("Nu s-au putut extrage date. Încearcă pe o pagină de anunț.", "error");
      btn.disabled = false;
      return;
    }
    if (!data.ok) {
      showStatus(data.error || "Eroare la extragere.", "error");
      btn.disabled = false;
      return;
    }

    showStatus("Se trimit datele la CRM...", "info");
    const { [STORAGE_KEY]: apiBase } = await chrome.storage.local.get(STORAGE_KEY);
    const base = (apiBase || "").trim().replace(/\/+$/, "") || "http://localhost:3000";
    const url = base + "/api/properties/extension-import";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errText = await res.text();
      showStatus("Eroare CRM: " + (errText || res.status), "error");
      btn.disabled = false;
      return;
    }
    const json = await res.json();
    const importId = json.id;
    const openUrl = importId ? base + "/properties/import?id=" + encodeURIComponent(importId) : base + "/properties/import";
    chrome.tabs.create({ url: openUrl });
    showStatus("Anunț trimis. Deschide \"Import\" în CRM pentru a-l adăuga în portofoliu.", "success");
  } catch (e) {
    showStatus("Eroare: " + (e.message || String(e)), "error");
  }
  btn.disabled = false;
});

chrome.storage.local.get(STORAGE_KEY, (o) => {
  const base = o[STORAGE_KEY];
  const input = document.getElementById("apiBase");
  if (base) input.value = base;
  else input.placeholder = "http://localhost:3000 sau URL-ul aplicației";
});
