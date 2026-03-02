/**
 * Content script: extrage date din paginile de anunț imobiliare.ro, OLX, Storia.
 * Expune window.__CRM_SCRAPE__ pentru a fi apelat din popup.
 */

(function () {
  const PORTALS = {
    imobiliare: {
      name: "imobiliare.ro",
      patterns: [/imobiliare\.ro\/.*\/oferta/i],
      selectors: {
        title: [
          "h1[class*='titlu']",
          ".titlu-oferta",
          "h1",
          "[data-cy='ad_title']",
        ],
        description: [
          "[class*='descriere']",
          ".descriere-oferta",
          "#description",
          "[data-cy='ad_description']",
          ".description",
        ],
        price: [
          "[class*='pret']",
          ".pret",
          "[data-cy='ad_price']",
          ".price",
        ],
        phone: [
          "[class*='telefon']",
          "[data-phone]",
          "a[href^='tel:']",
          "[class*='contact'] a[href^='tel:']",
          "[data-cy='ad_phone']",
        ],
        images: [
          "[class*='galerie'] img",
          ".gallery img",
          "[data-cy='ad_images'] img",
          ".photo img",
          "img[src*='imobiliare']",
          ".carousel img",
          "figure img",
        ],
        characteristics: [
          "[class*='caracteristici']",
          "[class*='detalii']",
          ".details-list",
          "ul[class*='lista']",
          "[data-cy='ad_characteristics']",
          ".offer-details li",
        ],
      },
    },
    olx: {
      name: "OLX",
      patterns: [/olx\.ro\/.*\/id[a-z0-9_-]+/i],
      selectors: {
        title: [
          "h1[data-cy='adPageAdTitle']",
          "h1[data-cy='ad_title']",
          "h1",
        ],
        description: [
          "div[data-cy='adPageAdDescription']",
          "[data-cy='ad_description']",
          ".description",
        ],
        price: [
          "[data-cy='adPageAdPrice']",
          "h3[data-cy='ad_price']",
          "[data-cy='ad_price']",
          ".price-label",
        ],
        phone: [
          "a[data-cy='phone-number.number-button']",
          "a[href^='tel:']",
          "[data-cy='ad_phone']",
        ],
        images: [
          "img[data-cy^='mosaic-gallery-image']",
          "img[src*='olxcdn.com']",
          "img[src*='apollo.olxcdn']",
        ],
        characteristics: [
          "div[data-sentry-element='ItemGridContainer']",
        ],
      },
      /** OLX: caracteristici sunt pereche label + value în div[data-sentry-element='ItemGridContainer'] */
      characteristicsAsPairs: true,
    },
    storia: {
      name: "Storia",
      patterns: [/storia\.ro\/.*\/anunt/i, /storia\.ro\/.*\/oferta/i],
      selectors: {
        title: [
          "h1",
          "[class*='title']",
          ".announcement-title",
        ],
        description: [
          "[class*='description']",
          ".description",
          "#description",
        ],
        price: [
          "[class*='price']",
          ".price",
          "[class*='pret']",
        ],
        phone: [
          "a[href^='tel:']",
          "[class*='phone']",
          "[class*='contact']",
        ],
        images: [
          ".gallery img",
          "[class*='gallery'] img",
          ".photos img",
          "img[src*='storia']",
        ],
        characteristics: [
          "[class*='characteristics']",
          "[class*='details']",
          ".details li",
        ],
      },
    },
  };

  function detectPortal() {
    const url = window.location.href;
    for (const [key, portal] of Object.entries(PORTALS)) {
      if (portal.patterns.some((p) => p.test(url))) return { key, portal };
    }
    if (/imobiliare\.ro/i.test(url)) return { key: "imobiliare", portal: PORTALS.imobiliare };
    if (/olx\.ro/i.test(url)) return { key: "olx", portal: PORTALS.olx };
    if (/storia\.ro/i.test(url)) return { key: "storia", portal: PORTALS.storia };
    return null;
  }

  function firstText(selectors) {
    for (const sel of selectors) {
      try {
        const el = document.querySelector(sel);
        if (el) return (el.textContent || "").trim();
      } catch (_) {}
    }
    return "";
  }

  function allImages(selectors, max = 20, portalKey) {
    const seen = new Set();
    const urls = [];
    for (const sel of selectors) {
      try {
        const nodes = document.querySelectorAll(sel);
        for (const el of nodes) {
          let src = (el.getAttribute("src") || el.getAttribute("data-src") || "").trim();
          if (!src || !src.startsWith("http")) continue;
          src = src.replace(/\/small\//, "/large/").replace(/\/thumb\//, "/");
          if (portalKey === "olx" && src.includes("olxcdn.com") && src.includes(";s=")) {
            src = src.replace(/;s=\d+x\d+/, ";s=1280x1024");
          }
          const key = src.split(";")[0];
          if (seen.has(key)) continue;
          seen.add(key);
          urls.push(src);
          if (urls.length >= max) return urls;
        }
      } catch (_) {}
    }
    return urls;
  }

  function allTextFromList(selectors, portal) {
    if (portal.characteristicsAsPairs) {
      const sel = "div[data-sentry-element='ItemGridContainer']";
      const containers = document.querySelectorAll(sel);
      const lines = [];
      containers.forEach((container) => {
        const divs = container.querySelectorAll(":scope > div");
        if (divs.length >= 2) {
          const label = (divs[0].textContent || "").trim().replace(/\s+/g, " ");
          const value = (divs[1].textContent || "").trim().replace(/\s+/g, " ");
          if (label && value) lines.push(label + " " + value);
        }
      });
      if (lines.length) return lines;
    }
    const lines = [];
    for (const sel of selectors) {
      try {
        const container = document.querySelector(sel);
        if (!container) continue;
        const items = container.querySelectorAll("li, tr, [class*='item'], .offer-details__item");
        if (items.length) {
          items.forEach((el) => {
            const t = (el.textContent || "").trim();
            if (t) lines.push(t);
          });
          if (lines.length) return lines;
        }
        const t = (container.textContent || "").trim();
        if (t) return [t];
      } catch (_) {}
    }
    return [];
  }

  function extractPhone(text) {
    const match = (text || "").match(/(?:\+40|0)[\s.-]?[237]\d[\s.-]?\d{3}[\s.-]?\d{3}/);
    return match ? match[0].replace(/\s/g, "").trim() : "";
  }

  function extractPrice(text) {
    const normalized = (text || "").replace(/\s/g, "").replace(/\./g, "");
    const match = normalized.match(/(\d[\d,]*)\s*(?:EUR|€|euro)/i) || normalized.match(/(\d[\d,]*)/);
    if (match) return parseInt(match[1].replace(/,/g, ""), 10) || 0;
    return 0;
  }

  async function urlToBase64(url) {
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    } catch (_) {
      return null;
    }
  }

  async function scrape() {
    const detected = detectPortal();
    if (!detected) {
      return { ok: false, error: "Portal necunoscut. Deschide un anunț pe imobiliare.ro, OLX sau Storia." };
    }
    const { key, portal } = detected;
    const title = firstText(portal.selectors.title);
    const description = firstText(portal.selectors.description);
    const priceText = firstText(portal.selectors.price);
    const phoneFromLink = document.querySelector("a[data-cy='phone-number.number-button']")?.getAttribute("href")?.replace(/^tel:/i, "").trim()
      || document.querySelector("a[href^='tel:']")?.getAttribute("href")?.replace(/^tel:/i, "").trim();
    const phoneRaw = phoneFromLink || firstText(portal.selectors.phone);
    const phone = (phoneFromLink && phoneFromLink.replace(/\s/g, "")) || extractPhone(phoneRaw) || extractPhone(description);
    const imageUrls = allImages(portal.selectors.images, 20, key);
    const characteristicsLines = allTextFromList(portal.selectors.characteristics, portal);

    const price = extractPrice(priceText);

    const images = [];
    for (let i = 0; i < Math.min(imageUrls.length, 15); i++) {
      const data = await urlToBase64(imageUrls[i]);
      if (data) images.push({ data, name: `image-${i + 1}.jpg` });
    }

    return {
      ok: true,
      portal: key,
      portalName: portal.name,
      sourceUrl: window.location.href,
      title: title || "Anunț importat",
      description: description || "",
      price,
      ownerPhone: phone,
      characteristics: characteristicsLines,
      images,
    };
  }

  window.__CRM_SCRAPE__ = { scrape, detectPortal: () => detectPortal() };

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === "scrape") {
      scrape().then(sendResponse);
      return true;
    }
  });
})();
