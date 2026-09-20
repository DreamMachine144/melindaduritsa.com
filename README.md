# Melinda Duritsa website

Website: https://www.melindaduritsa.com/
Repository: https://github.com/DreamMachine144/melindaduritsa.com

Plain HTML, CSS and small JavaScript files, with local photographs and fonts. No application server, CMS or JavaScript build system is required to run the site.

## Current status

The redesigned outdoor-family website is live on GitHub Pages, replacing the original static Weebly replica. HTTPS, the domain and the bare-domain redirect work. Preserve DNS and email configuration.

The redesign source is on `codex/website-audit`. Production release 33de9f9 was published and verified September 19. The rollback branch is backup/pre-seo-redesign-2026-09-19 at d24a65d. The local scorecard records remaining discovery, authority and conversion evidence. It adds outdoor-family positioning, edited packages, two useful pages, canonical URLs, sitemap and structured data. The local, gitignored Knowledge Base folder contains the research, pricing strategy, launch notes and current scorecard. Those files remain on this computer; they are not part of a fresh Git clone. Publication is distinct from proving search visibility and booking outcomes.

## Files

| File | Purpose |
|---|---|
| `index.html` | Home, work samples, process and inquiry links |
| `family-photography.html` | Outdoor family experience, six-photo portfolio and questions |
| `booking-info.html` | Edited collections, prices and booking questions |
| `about.html` | Melinda's approach and portrait |
| `contact-me.html` | Inquiry form and direct contact details |
| `404.html` | Missing-page recovery with root-relative links |
| `css/site.css` | Responsive layout, typography and focus states |
| `js/site.js` | Menu, accessible image dialog and inquiry handling |
| `js/form-config.js` | Public form ID and fallback email; no secrets |
| `robots.txt`, `sitemap.xml` | Crawl guidance and canonical page list |
| `images/`, `fonts/` | Original local assets |
| `Knowledge Base/` | Local, gitignored strategy/reference files and optional photo-selection placeholders; excluded from future Git commits and website release |
| `scripts/` | Dependency-free public packaging and source checks |
| `scripts/release_manifest.py` | Prepare an exact public or source Git tree for publication through the GitHub connection |

## Local preview

Serve the repository over HTTP so root-relative links resolve correctly:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Open http://127.0.0.1:4173/. Use `python3` if that is the installed executable name. This local server also exposes the Knowledge Base for review; the public packaging step excludes it. Do not serve the repository root on a public interface. Stop the preview server when finished.

The existing Windows checkout is `C:\Users\ryan\Documents\Coding\MelindaDuritsa website\melindaduritsa-static-site`. It already has valid Git history and the origin remote; do not initialize a replacement repository.

## Verify a release

```sh
python scripts/prepare_public.py _site
python scripts/check_site.py _site
python -m http.server 4174 --bind 127.0.0.1 --directory _site
```

The packaging script requires a fresh output directory and will not delete an existing one. Choose another output path for subsequent checks or deliberately remove the prior build after verifying the path. `_site/` is ignored by Git.

The checker validates local links/assets, headings, descriptions, canonical URLs, sitemap, entity/offer JSON, removal of the retired offer, and exclusion of non-site files. Check browser layouts, keyboard navigation and actual inbox delivery separately. A local performance measurement is not a real-user Core Web Vitals result.

## Contact form

The owner chose to keep email drafts on September 19. Formspree is optional and its ID is currently empty. The form explicitly prepares an email for the visitor to send in their email application. It must not claim to have delivered a message in this mode. Phone and email links remain available, including without JavaScript.

To enable direct submission, use an owner-controlled form-service account, verify the recipient inbox, and put only the public form ID in `js/form-config.js`. Check service limits and costs before selecting a plan. The configured UI switches to direct submission automatically. Verify actual receipt and error handling before declaring it operational. No real test inquiry has been sent during local development.

Form event hooks are available for a later analytics integration, but no analytics collector is installed. The optional discovery-source question can help attribute real inquiries once delivery is connected. Do not count an email draft or button click as a booking.

## Publishing and the Knowledge Base

Keep the existing GitHub Pages source (`main`, repository root), domain and HTTPS settings unchanged. The source belongs on `codex/website-audit`; the Knowledge Base remains local and untracked; `main` contains only the checked public artifact. **Never merge the full source branch into main**, because it would also publish source instructions and verification scripts.

Create a fresh public artifact with `prepare_public.py`, then check it. `release_manifest.py public PATH` prepares an exact Git tree of those public files, reusing unchanged Git objects and including changed text. Use the current remote main as the parent of a release commit and update main without force. The GitHub connection can perform this when shell Git has no authenticated login. Preserve the old main commit as a rollback reference before release. Verify the Pages deployment and live URLs before reporting publication success.

`release_manifest.py source` prepares a snapshot of the committed source for backup on the working branch. Local commits retain the detailed editing history; remote source snapshots and public release commits provide additional recovery points. The remote source history intentionally uses reviewed snapshots instead of uploading earlier local commits that contained Knowledge Base files. For subsequent source snapshots, use the manifest expected_parent (current origin/codex/website-audit), not main; update that branch without force. Do not force-push local historical commits over the remote snapshot branch. The repository is public, so tracked source-branch files are readable on GitHub. The owner-requested Knowledge Base is gitignored and excluded from new source snapshots; its earlier versions remain only in local Git history until those historical commits are explicitly pushed. Back up that local folder separately if desired. Keep credentials, customer records and private addresses outside Git entirely.

The custom Pages workflow was removed before first publication. No Pages setting change is required for this branch/artifact approach. For rollback, create a new main commit with the prior public tree and the current main as parent; avoid rewriting history or changing DNS.

## Maintenance

Edit the HTML directly. Keep prices, image counts, form choices and structured offers consistent when changing packages. Update the sitemap and public-file list when adding a genuine new page. The site does not require weekly blog posts or recurring dependency upgrades to render.

Use actual Melinda photographs only. The twelve labeled placeholder files in Knowledge Base are a selection aid, not portfolio content. Keep biographies, service areas, reviews and policies factual. Existing six images are approved for continued use.

The pre-redesign conversion history remains in Git. It removed Weebly scripts and legacy analytics and introduced local assets; the subsequent redesign builds on that working foundation.

## Contact form administration

See [FORM-ADMIN.md](FORM-ADMIN.md) for public maintenance notes. The complete owner guide with account details, management links and troubleshooting is local-only at Knowledge Base/formspree-owner-guide.md. Keep a private backup; the Knowledge Base is gitignored and is not restored by cloning this repository.
