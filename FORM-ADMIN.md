# Website contact form: Formspree owner guide

Last verified: September 20, 2026. No passwords, tokens, recovery codes or signed-in browser links belong in this document.

## Start here, even if it has been years

1. Open https://formspree.io/account (or visit https://formspree.io and choose Log in).
2. Sign in with **melinda@melindaduritsa.com** and the password you keep separately. If forgotten, use Formspree's password-reset option and check that mailbox.
3. Open Forms, then **My First Project → Website session inquiries**. Direct submissions link: https://formspree.io/forms/xqpapeov/submissions.
4. For email routing, open **Workflow**. The Email action currently sends every submission to **melinda@melindaduritsa.com**.

Formspree handles form submissions. GitHub Pages hosts the site. Bluehost hosts Melinda's email; Roundcube is its webmail interface. These are separate accounts/services. Connecting the form required no GitHub Pages, DNS or mail-hosting changes.

## Account and addresses

| Item | Current value and purpose |
|---|---|
| Formspree account name | Melinda Duritsa |
| Formspree login/account email | melinda@melindaduritsa.com; verified in Account |
| Notification recipient | melinda@melindaduritsa.com; configured in the form's Workflow Email action |
| Visitor email | Whatever the visitor enters in the form's Email field; used as Reply-To in the notification |
| Notification sender observed | noreply@formspree.io, displayed as Formspree |
| Notification subject | Outdoor family photography inquiry |
| Project | My First Project (ID 3095157970661539350) |
| Form | Website session inquiries |
| Public form ID | xqpapeov; this is a public identifier, not a password |
| Website POST endpoint | https://formspree.io/f/xqpapeov; receives submissions, not an admin login page |

## Management links

- Account, linked/verified emails and usage: https://formspree.io/account
- All forms: https://formspree.io/forms
- Submissions: https://formspree.io/forms/xqpapeov/submissions
- Form overview: https://formspree.io/forms/xqpapeov/overview
- Form settings: https://formspree.io/forms/xqpapeov/settings
- Email destination/workflow: https://formspree.io/forms/xqpapeov/workflow
- Website form: https://www.melindaduritsa.com/contact-me.html
- Email access: sign into https://www.bluehost.com/, open Email, select melinda@melindaduritsa.com and open webmail/Roundcube. Do not bookmark a temporary cpsess link.

## Change where inquiries go

1. In Formspree Account → Linked Emails, add the new recipient address if needed.
2. Complete the verification email sent to that address.
3. Open this form's Workflow and use the existing Email action's menu to edit its recipient. Avoid adding a duplicate action unless both recipients should receive notifications.
4. Save, then submit one clearly labeled setup test on the live site and confirm it in Submissions and the intended inbox.
5. Update this guide. If the public business email also changes, have the site agent update contact links, footer, structured data and js/form-config.js consistently.

Changing the account/login email and changing the notification recipient are separate operations. Changing only the recipient does not require a website deployment while the form ID stays the same.

## Website wiring for a future agent

- contact-me.html contains method="POST" and action="https://formspree.io/f/xqpapeov". The HTML form works without JavaScript using Formspree's response page.
- js/site.js enhances this with in-page success/error messages, a sending state, duplicate-click prevention, a 20-second timeout and preserved input after errors. The email field is named email; keep it that way for Reply-To.
- js/form-config.js holds the public fallback contact address, not the form ID or credentials.
- If replacing the form, change the HTML endpoint, test, commit and publish using the existing public-only release process. No private API key belongs in browser code.
- Direct phone/email links remain available if a visitor cannot submit.
- An inquiry does not book a session automatically; Melinda replies to discuss details.

## If messages stop arriving

1. Look in this form's Submissions and Spam views first. A website success message means acceptance by Formspree, not proof of email delivery.
2. If the submission exists, check the receiving Inbox and Junk folders, then verify the Workflow Email recipient and Account → Linked Emails verification status.
3. Check Form settings: Enabled, submission archive and Formshield were on at setup. Do not disable spam protection to troubleshoot.
4. Check Account usage/quota and any service notices. The account showed 1 of 50 monthly submissions used at verification; limits and plans may change. Do not purchase an upgrade automatically.
5. If no submission exists, check that the live HTML still uses the endpoint above, required fields are filled, and no on-page error appears. Ask the site agent to inspect the browser/network error.
6. Send one labeled test after a fix, then confirm both Formspree and actual inbox receipt. Do not count setup tests as customer leads.

Use Reply on an actual notification to answer the visitor, checking the destination first. The setup test used Melinda's own email in the visitor field, so replying to that test would reply to herself.

## Verified delivery and rollback

On September 20, 2026, the live site showed success, Formspree stored exactly one setup submission, and the matching message arrived in the Roundcube Inbox for melinda@melindaduritsa.com. Identifier: MD-FORM-20260920. Message: Website setup test; not a customer inquiry or booking. Reply-To matched the submitted email. No reply was sent. Display time zones differed, so use the identifier to match records.

Public implementation commit: da7e3f7fe7bd811883b1599bf9dc0e8a2149b42e. Previous public commit: 33de9f9e55062fcbc77df8d0d7d9f3f8949e2710. Restore with a new revert/restoration commit if necessary; preserve history and existing hosting configuration.

This guide is kept in the source repository as FORM-ADMIN.md and copied to the local Knowledge Base. It is excluded from the public website artifact. The Knowledge Base is gitignored; the source-repository copy is the durable GitHub backup. Access to the source repository is not the same as access to Formspree or the mailbox.
