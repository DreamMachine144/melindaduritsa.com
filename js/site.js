(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = lightbox && lightbox.querySelector("img");
  if (lightbox && lightboxImg) {
    document.querySelectorAll("[data-lightbox]").forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        lightboxImg.src = link.getAttribute("href");
        lightboxImg.alt = link.getAttribute("data-alt") || "";
        lightbox.classList.add("is-open");
      });
    });
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightboxImg.removeAttribute("src");
    }
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox || event.target.closest(".lightbox-close")) {
        closeLightbox();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeLightbox();
    });
  }

  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");
  var note = document.getElementById("form-mailto-note");
  var cfg = window.SITE_FORM || {};
  var formspreeId = (cfg.formspreeId || "").trim();
  var toEmail = cfg.toEmail || "melinda@melindaduritsa.com";
  var formspreeReady = /^[A-Za-z0-9]+$/.test(formspreeId);

  function showStatus(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.add("is-visible");
    status.classList.toggle("is-error", !!isError);
  }

  if (note) {
    note.hidden = formspreeReady;
  }

  if (formspreeReady) {
    form.setAttribute("action", "https://formspree.io/f/" + formspreeId);
    form.setAttribute("method", "post");
    form.removeAttribute("enctype");
  } else {
    form.setAttribute("action", "mailto:" + toEmail);
    form.setAttribute("method", "post");
    form.setAttribute("enctype", "text/plain");
  }

  form.addEventListener("submit", function (event) {
    var first = ((form.elements.first && form.elements.first.value) || "").trim();
    var last = ((form.elements.last && form.elements.last.value) || "").trim();
    var email = ((form.elements.email && form.elements.email.value) || "").trim();
    var comment = ((form.elements.comment && form.elements.comment.value) || "").trim();

    if (!first || !last || !email || !comment) {
      event.preventDefault();
      showStatus("Please fill in your name, email, and a comment.", true);
      return;
    }

    var name = (first + " " + last).replace(/\s+/g, " ");
    if (form.elements.name) form.elements.name.value = name;

    if (!formspreeReady) {
      event.preventDefault();
      var body =
        "Name: " + name + "\n" +
        "Email: " + email + "\n\n" +
        comment;
      window.location.href =
        "mailto:" + toEmail +
        "?subject=" + encodeURIComponent("Website inquiry from " + name) +
        "&body=" + encodeURIComponent(body);
      showStatus("Your email app should open with this message. If nothing happens, write directly to " + toEmail + ".", false);
      return;
    }

    event.preventDefault();
    var payload = new FormData(form);
    var sendBtn = form.querySelector("button[type='submit']");
    if (sendBtn) sendBtn.disabled = true;
    showStatus("Sending…", false);

    fetch("https://formspree.io/f/" + formspreeId, {
      method: "POST",
      body: payload,
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          showStatus("Thank you. Your message is on its way.", false);
          return;
        }
        return res.json().then(function (data) {
          var msg = (data && data.error) || "Something went wrong. Please email " + toEmail + " instead.";
          throw new Error(msg);
        });
      })
      .catch(function (err) {
        showStatus(err.message || ("Could not send. Please email " + toEmail + "."), true);
      })
      .then(function () {
        if (sendBtn) sendBtn.disabled = false;
      });
  });
})();
