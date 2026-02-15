async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tab;
}

function scrapeCurrentPage() {
  function stripUtmSource(rawUrl) {
    if (!rawUrl) return "";
    try {
      const u = new URL(rawUrl, window.location.href);
      u.searchParams.delete("utm_source");
      return u.toString();
    } catch {
      return rawUrl;
    }
  }

  function extractText(el) {
    const text = el?.textContent ?? "";
    return text.replace(/\s+/g, " ").trim();
  }

  function extractTextPreserveLines(el) {
    const text = el?.innerText ?? el?.textContent ?? "";
    return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  const html = document.documentElement?.outerHTML ?? "";
  void html;

  const h1 = document.querySelector("h1");
  const name = extractText(h1);

  let icon = "";
  if (h1) {
    const prev = h1.previousElementSibling;
    const img =
      prev?.tagName === "IMG" ? prev : prev?.querySelector?.("img") ?? h1.previousElementSibling?.querySelector?.("img");
    if (img && img instanceof HTMLImageElement) {
      icon = img.getAttribute("src") || img.getAttribute("data-src") || img.currentSrc || "";
    }
  }

  const description = extractText(document.querySelector(".leading-relaxed.text-muted-foreground"));

  const visitAnchor = Array.from(document.querySelectorAll("a")).find((a) => {
    const t = (a.textContent ?? "").replace(/\s+/g, " ").trim();
    return t === "Visit Website" || t.includes("Visit Website");
  });
  const link = stripUtmSource(visitAnchor?.href ?? "");

  const imageEl = document.querySelector("img.object-cover.w-full.rounded-xl");
  const image =
    imageEl instanceof HTMLImageElement
      ? imageEl.getAttribute("src") || imageEl.getAttribute("data-src") || imageEl.currentSrc || ""
      : "";

  const categories = Array.from(document.querySelectorAll(".flex.items-center.min-w-0"))
    .map((el) => extractText(el))
    .filter((t) => t.length > 0)
    .filter((t, i, arr) => arr.indexOf(t) === i);

  const introduction = extractTextPreserveLines(document.querySelector(".p-6.mr-0.rounded-xl.border"));

  return { name, icon, description, link, image, categories, introduction };
}

async function executeScrape(tabId) {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: scrapeCurrentPage
  });
  return results?.[0]?.result ?? null;
}

function setStatus(el, message) {
  el.textContent = message;
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

document.addEventListener("DOMContentLoaded", () => {
  const collectBtn = document.getElementById("collect");
  const copyBtn = document.getElementById("copy");
  const outputEl = document.getElementById("output");
  const statusEl = document.getElementById("status");

  if (!(collectBtn instanceof HTMLButtonElement)) return;
  if (!(copyBtn instanceof HTMLButtonElement)) return;
  if (!(outputEl instanceof HTMLTextAreaElement)) return;
  if (!(statusEl instanceof HTMLParagraphElement)) return;

  let lastJson = "";

  collectBtn.addEventListener("click", async () => {
    copyBtn.disabled = true;
    setStatus(statusEl, "采集中…");
    outputEl.value = "";
    lastJson = "";

    try {
      const tab = await getActiveTab();
      if (!tab?.id) {
        setStatus(statusEl, "未找到当前标签页");
        return;
      }

      const data = await executeScrape(tab.id);
      if (!data) {
        setStatus(statusEl, "采集失败：未返回结果");
        return;
      }

      lastJson = JSON.stringify(data, null, 2);
      outputEl.value = lastJson;
      copyBtn.disabled = false;
      setStatus(statusEl, "采集完成");
    } catch (err) {
      setStatus(statusEl, `采集失败：${String(err?.message ?? err)}`);
    }
  });

  copyBtn.addEventListener("click", async () => {
    if (!lastJson) return;
    try {
      await copyText(lastJson);
      setStatus(statusEl, "已复制到剪贴板");
    } catch (err) {
      setStatus(statusEl, `复制失败：${String(err?.message ?? err)}`);
    }
  });
});
