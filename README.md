# melinda duritsa

Static replica of [www.melindaduritsa.com](https://www.melindaduritsa.com/), a Chicago lifestyle photography site. Plain HTML, CSS, and a little JavaScript, meant to be hosted on **GitHub Pages** under the **DreamMachine144** account, with the custom domain `www.melindaduritsa.com`.

This is not a Weebly export. Copy, photos, and layout are recreated so you can edit the files directly. Weebly scripts and tracking are not included.

**Do not change production DNS until you are ready to cut over.** Leave the live Weebly www site as it is until then.

**Intended GitHub home:** [github.com/DreamMachine144](https://github.com/DreamMachine144) — suggested repo name `melindaduritsa.com`, so Pages can publish at `https://dreammachine144.github.io/melindaduritsa.com/` until the custom domain is attached.

This working copy is **not** pushed to DreamMachine144 from here. Use the handoff steps below after you have that account.

## Pages

| File | URL path | What it is |
| --- | --- | --- |
| `index.html` | `/` | Home: intro, banner portrait, six-photo gallery |
| `contact-me.html` | `/contact-me.html` | Phone, email, contact form |
| `booking-info.html` | `/booking-info.html` | Packages and rates |
| `404.html` | (Pages 404) | Simple not-found page |

Navigation matches the original: **home · contact me · booking info**.

## Preview locally

From this folder:

```bash
python3 -m http.server 43127
```

Open [http://127.0.0.1:43127/](http://127.0.0.1:43127/).

## Handoff to DreamMachine144 (you must do this)

This environment does not have credentials for `github.com/DreamMachine144`. Do not expect a push to that account from this repo. After you are happy with the site:

1. On GitHub, signed in as **DreamMachine144**, create a new repository (suggested name: `melindaduritsa.com`). Public is simplest for Pages on a free account.
2. Add that repo as a remote and push `main` (or merge this branch first):

   ```bash
   git remote add dreammachine https://github.com/DreamMachine144/melindaduritsa.com.git
   git push -u dreammachine main
   ```

   If you use GitHub Desktop or the website upload, copy the files in this repo (except `.git`) into that repository instead.
3. Enable Pages (next section).
4. Create the Formspree form (contact form section).
5. Only when the `github.io` preview looks right, change DNS (DNS section). Production DNS is not changed by this project.

## Enable GitHub Pages

The site publishes from the **repository root** (not `/docs`):

- `CNAME` contains `www.melindaduritsa.com`
- `.nojekyll` tells Pages not to run Jekyll

On **github.com/DreamMachine144/&lt;repo&gt;**:

1. **Settings → Pages**
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `main`, folder **`/` (root)**. Save
4. **Custom domain:** `www.melindaduritsa.com` (the `CNAME` file should fill this in)
5. After DNS works, check **Enforce HTTPS**

Until the custom domain is live, the site is:

`https://dreammachine144.github.io/melindaduritsa.com/`

(If you named the repo something else, use that name in the path. If you instead create a user site repo named `DreamMachine144.github.io`, the preview is `https://dreammachine144.github.io/` with no extra path — still use the same `CNAME` file.)

### What only DreamMachine144 can do

- Own the GitHub repo and turn on Pages
- Click through GitHub’s custom-domain / TLS prompts
- Create the Formspree account and confirm `melinda@melindaduritsa.com`
- Change DNS at the registrar or Bluehost when ready to cut over

## DNS (when you are ready to cut over)

Do **not** edit these records until Pages looks right at the `github.io` URL.

GitHub Pages should use **www** as the public hostname. Point the apex at GitHub as well (or redirect apex → www).

### www.melindaduritsa.com

| Type | Name / host | Value |
| --- | --- | --- |
| `CNAME` | `www` | `dreammachine144.github.io` |

### melindaduritsa.com (apex)

GitHub Pages does not use a CNAME on the apex. Use **A** (and optionally **AAAA**) records:

| Type | Name / host | Value |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `AAAA` | `@` | `2606:50c0:8000::153` |
| `AAAA` | `@` | `2606:50c0:8001::153` |
| `AAAA` | `@` | `2606:50c0:8002::153` |
| `AAAA` | `@` | `2606:50c0:8003::153` |

If the DNS host offers **ALIAS** or **ANAME**, you can point `@` at `dreammachine144.github.io` instead of the A records.

Keep **MX** records for email. Only change web A/CNAME records.

After DNS propagates, Pages settings should show the domain as verified. Then enable **Enforce HTTPS**.

### Cutover order

1. Push to DreamMachine144, enable Pages, confirm `https://dreammachine144.github.io/…`
2. Point **www** at `dreammachine144.github.io`. Leave the apex on the old host if you want a staged cutover.
3. When www looks good, point the **apex** at GitHub too.
4. Only then turn off Weebly. Until then, leave live www as it is.

## Contact form

GitHub Pages cannot send email. There is no PHP, Weebly, or Bluehost form handler.

The form on `contact-me.html` is wired like this:

1. **Formspree** (preferred once configured) — posts to `https://formspree.io/f/{id}`
2. **mailto fallback** — if no Formspree ID is set, Send opens the visitor’s email app addressed to `melinda@melindaduritsa.com`

### What you must provide (Formspree)

You need a **Formspree form ID**, not a secret API key in the repo. The destination inbox is configured on Formspree’s site, not in HTML.

1. Sign up at [formspree.io](https://formspree.io)
2. New form → notification email **`melinda@melindaduritsa.com`** (or another inbox you control)
3. Confirm that address when Formspree emails you (submissions will not arrive until this is done)
4. Copy the ID from the form endpoint, e.g. `https://formspree.io/f/xpzgkqyz` → `xpzgkqyz`
5. Paste it in `js/form-config.js`:

   ```js
   window.SITE_FORM = {
     formspreeId: "xpzgkqyz",
     toEmail: "melinda@melindaduritsa.com"
   };
   ```

6. Commit and push. No Formspree API key should be committed; the form ID is public in the page source.

Until that ID is set, the mailto fallback stays on. Phone and email links on the contact page work either way.

## Editing

- Copy: `index.html`, `contact-me.html`, `booking-info.html`
- Look and layout: `css/site.css`
- Photos: `images/`
- Form endpoint: `js/form-config.js`
- Fonts: `fonts/BlackJack.ttf`, `fonts/questrial-*.woff2`

## Source of this replica

Rebuilt from the Weebly site that has served as www.melindaduritsa.com (three pages, same nav). Photos are the original uploads. Theme chrome (social sprite, hairline corners, separator) is kept; Weebly JS, GDPR banners, and analytics are not.
