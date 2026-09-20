(function () {
  "use strict";
  // Event hooks contain no names, email addresses, message text or location data.
  // A future consent-aware analytics integration may listen for these events.
  function track(name, detail) {
    document.dispatchEvent(
      new CustomEvent("photography:" + name, { detail: detail || {} }),
    );
  }
  document.querySelectorAll("[data-contact]").forEach(function (link) {
    link.addEventListener("click", function () {
      track("contact-click", { channel: link.dataset.contact });
    });
  });

  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (navToggle && nav) {
    navToggle.hidden = false;
    nav.dataset.enhanced = "true";
    navToggle.addEventListener("click", function () {
      navToggle.setAttribute(
        "aria-expanded",
        String(nav.classList.toggle("is-open")),
      );
    });
    nav.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  var lightbox = document.querySelector(".lightbox");
  var links = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (lightbox && typeof lightbox.showModal === "function") {
    var current = 0;
    var opener;
    var image = lightbox.querySelector("img");
    var caption = lightbox.querySelector(".lightbox-caption");
    function show(index) {
      current = (index + links.length) % links.length;
      image.src = links[current].href;
      image.alt = links[current].dataset.alt;
      caption.textContent =
        current + 1 + " / " + links.length + " · " + image.alt;
    }
    links.forEach(function (link, index) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        opener = link;
        show(index);
        lightbox.showModal();
        document.body.classList.add("lightbox-open");
        lightbox.querySelector(".lightbox-close").focus();
      });
    });
    lightbox
      .querySelector(".lightbox-close")
      .addEventListener("click", function () {
        lightbox.close();
      });
    lightbox
      .querySelector(".lightbox-prev")
      .addEventListener("click", function () {
        show(current - 1);
      });
    lightbox
      .querySelector(".lightbox-next")
      .addEventListener("click", function () {
        show(current + 1);
      });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        show(current - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        show(current + 1);
      }
      if (event.key === "Tab") {
        var buttons = Array.from(lightbox.querySelectorAll("button"));
        var first = buttons[0],
          last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
    lightbox.addEventListener("close", function () {
      document.body.classList.remove("lightbox-open");
      image.removeAttribute("src");
      if (opener) opener.focus();
    });
  }

  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var button = form.querySelector("button[type=submit]");
  var cfg = window.SITE_FORM || {};
  var toEmail = cfg.toEmail || "melinda@melindaduritsa.com";
  var busy = false;
  var session = new URLSearchParams(window.location.search).get("session");
  if (["30-minute", "60-minute"].includes(session))
    form.elements.session.value = session;
  function showStatus(message, error) {
    status.textContent = message;
    status.classList.toggle("is-error", !!error);
  }
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    if (form.elements._gotcha.value) return;
    if (
      !form.elements.name.value.trim() ||
      !form.elements.message.value.trim()
    ) {
      showStatus("Please add your name and a short message.", true);
      return;
    }
    busy = true;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    showStatus("Sending your message…", false);
    var controller = new AbortController();
    var timer = setTimeout(function () {
      controller.abort();
    }, 20000);
    try {
      var response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Rejected");
      form.reset();
      showStatus(
        "Thanks—your message has been sent. Melinda will be in touch.",
        false,
      );
      // Service acceptance is measurable, but inbox delivery still requires verification.
      track("inquiry-submitted", { channel: "form" });
    } catch (error) {
      showStatus(
        "We couldn’t confirm your message was sent. Your details are still here. Please email " +
          toEmail +
          " or call 773-456-8568 for help.",
        true,
      );
      track("inquiry-error");
    } finally {
      clearTimeout(timer);
      busy = false;
      button.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
})();
