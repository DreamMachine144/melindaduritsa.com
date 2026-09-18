/**
 * Contact form endpoint for GitHub Pages.
 *
 * Pages cannot send email. This site posts to Formspree when an ID is set,
 * and falls back to mailto:melinda@melindaduritsa.com otherwise.
 *
 * You must do this (we cannot):
 * 1. Sign up at https://formspree.io (free plan is enough).
 * 2. Create a form whose notification email is melinda@melindaduritsa.com
 *    (or whichever inbox should receive inquiries).
 * 3. Confirm the address when Formspree emails you.
 * 4. Copy the form ID from the endpoint URL:
 *    https://formspree.io/f/xxxxxxxx  →  formspreeId: "xxxxxxxx"
 * 5. Paste that ID below. No API key belongs in this repo; the form ID is public.
 *
 * Until formspreeId is filled in, Send opens the visitor's email app (mailto).
 */
window.SITE_FORM = {
  formspreeId: "",
  toEmail: "melinda@melindaduritsa.com"
};
