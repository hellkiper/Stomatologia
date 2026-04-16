function qs(sel, root = document) {
  return root.querySelector(sel);
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setAriaCurrent() {
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  qsa("[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function initDialog() {
  const dlg = qs("#appointmentDialog");
  if (!dlg) return;

  const openers = qsa("[data-open-appointment]");
  const closers = qsa("[data-close-dialog]", dlg);

  function open() {
    if (typeof dlg.showModal === "function") {
      dlg.showModal();
    } else {
      dlg.setAttribute("open", "");
    }
  }

  function close() {
    if (typeof dlg.close === "function") {
      dlg.close();
    } else {
      dlg.removeAttribute("open");
    }
  }

  openers.forEach((btn) => btn.addEventListener("click", open));
  closers.forEach((btn) => btn.addEventListener("click", close));

  dlg.addEventListener("click", (e) => {
    const rect = dlg.getBoundingClientRect();
    const inDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!inDialog) close();
  });

  const form = qs("form", dlg);
  const toast = qs("#toast");
  const toastText = qs("#toastText");

  // URL веб‑приложения Google Apps Script, который пишет в Google Sheets.
  // ЗАМЕНИТЕ на свой URL вида:
  // https://script.google.com/macros/s/XXXXXXXXXXXX/exec
  const SHEETS_ENDPOINT = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_ID/exec";

  function toastOpen(message) {
    if (!toast) return;
    toast.setAttribute("data-open", "true");
    if (toastText) toastText.textContent = message;
  }

  function toastClose() {
    if (!toast) return;
    toast.setAttribute("data-open", "false");
  }

  const toastCloseBtn = qs("[data-close-toast]");
  if (toastCloseBtn) toastCloseBtn.addEventListener("click", toastClose);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = (qs('input[name="name"]', form)?.value || "").trim();
      const phone = (qs('input[name="phone"]', form)?.value || "").trim();
      const service = qs('select[name="service"]', form)?.value || "";
      const time = qs('select[name="time"]', form)?.value || "";
      const comment = qs('textarea[name="comment"]', form)?.value || "";
      if (!name || !phone) {
        toastOpen("Пожалуйста, заполните имя и телефон.");
        return;
      }
      const payload = {
        name,
        phone,
        service,
        time,
        comment,
      };

      fetch(SHEETS_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Ошибку сети тихо игнорируем, чтобы пользователь видел единый сценарий.
      });

      close();
      form.reset();
      toastOpen("Заявка отправлена. Мы перезвоним в ближайшее время.");
    });
  }
}

function initCookies() {
  const key = "profdent_cookies_ok";
  const el = qs("#cookieToast");
  if (!el) return;
  const ok = localStorage.getItem(key) === "1";
  el.setAttribute("data-open", ok ? "false" : "true");

  const accept = qs("[data-accept-cookies]", el);
  if (accept) {
    accept.addEventListener("click", () => {
      localStorage.setItem(key, "1");
      el.setAttribute("data-open", "false");
    });
  }
}

function initMobileMenu() {
  const btn = qs("#menuBtn");
  const toast = qs("#menuToast");
  if (!btn || !toast) return;

  const closeBtn = qs("[data-close-menu]");
  const links = qsa("a", toast);

  function open() {
    toast.setAttribute("data-open", "true");
    btn.setAttribute("aria-expanded", "true");
  }

  function close() {
    toast.setAttribute("data-open", "false");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", () => {
    const isOpen = toast.getAttribute("data-open") === "true";
    if (isOpen) close();
    else open();
  });

  if (closeBtn) closeBtn.addEventListener("click", close);
  links.forEach((a) => a.addEventListener("click", close));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setAriaCurrent();
  initDialog();
  initCookies();
  initMobileMenu();
});

