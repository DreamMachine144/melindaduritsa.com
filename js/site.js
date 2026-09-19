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
  var note = document.getElementById("form-mailto-note");
  var privacy = document.getElementById("form-privacy");
  var button = form.querySelector("button[type=submit]");
  var cfg = window.SITE_FORM || {};
  var id = String(cfg.formspreeId || "").trim();
  var ready = /^[A-Za-z0-9]+$/.test(id);
  var toEmail = cfg.toEmail || "melinda@melindaduritsa.com";
  var busy = false;
  var copyFallback = document.getElementById("email-copy-fallback");
  var copyText = document.getElementById("inquiry-copy");
  function inquiryText() {
    return [
      ["Name", "name"],
      ["Email", "email"],
      ["Session", "session"],
      ["Preferred area", "location"],
      ["Preferred timing", "timing"],
      ["Message", "message"],
      ["How you found me", "source"],
    ]
      .map(function (field) {
        var input = form.elements[field[1]];
        var value =
          input.tagName === "SELECT"
            ? input.value
              ? input.options[input.selectedIndex].text
              : ""
            : input.value.trim();
        return field[0] + ": " + value;
      })
      .join("\n\n");
  }
  function updateCopy() {
    if (copyFallback && copyFallback.open) {
      copyText.value =
        "To: " +
        toEmail +
        "\nSubject: Outdoor family photography inquiry\n\n" +
        inquiryText();
    }
  }
  if (copyFallback && copyText) {
    copyFallback.hidden = ready;
    copyFallback.addEventListener("toggle", updateCopy);
    form.addEventListener("input", updateCopy);
    document
      .getElementById("select-inquiry")
      .addEventListener("click", function () {
        updateCopy();
        copyText.focus();
        copyText.select();
      });
  }
  var session = new URLSearchParams(window.location.search).get("session");
  if (["30-minute", "60-minute"].includes(session))
    form.elements.session.value = session;
  form.hidden = false;
  // Prevent an accidental GET of personal details if the handler is changed later.
  form.method = "post";
  form.action = ready ? "https://formspree.io/f/" + id : "mailto:" + toEmail;
  if (ready) {
    note.textContent =
      "Send your inquiry here. Melinda will reply by email to discuss the details.";
    button.textContent = "Send session inquiry ↗";
    privacy.textContent =
      "Your details are used to respond to this inquiry. Formspree processes this form to deliver your message. Please don’t include sensitive personal information.";
  }
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
    if (!ready) {
      var body = inquiryText();
      window.location.href =
        "mailto:" +
        toEmail +
        "?subject=" +
        encodeURIComponent("Outdoor family photography inquiry") +
        "&body=" +
        encodeURIComponent(body);
      showStatus(
        "Your email draft should open. Please send it from your email app to complete your inquiry. If it does not open, email " +
          toEmail +
          " or use the copy option below. You can also call 773-456-8568.",
        false,
      );
      track("email-draft-requested");
      return;
    }
    busy = true;
    button.disabled = true;
    form.setAttribute("aria-busy", "true");
    showStatus("Sending your inquiry…", false);
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
        "Thank you. Your inquiry has been submitted. Melinda will reply by email to discuss your session; a date is not reserved yet.",
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
