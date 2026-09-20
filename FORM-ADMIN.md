# Contact form maintenance

The full owner guide, including account login details, receiving addresses, dashboard links and recovery steps, is stored locally at **Knowledge Base/formspree-owner-guide.md**. That folder is intentionally gitignored and excluded from the published website. Keep a private backup of it when moving computers; cloning this public repository does not restore it.

## Public implementation

The contact page uses a native HTTPS POST to the public Formspree endpoint in contact-me.html. JavaScript adds inline status and preserves entered fields after an error. Credentials and private API keys must never be added to site files.

When changing the endpoint or email destination, test the live form and verify both the submission record and actual inbox receipt. A setup test is not a customer lead. Preserve the public-only release process and existing hosting settings.

## Clean replies in Roundcube

Roundcube offers Settings → Preferences → Composing Messages → When replying → **do not quote the original message** → Save. This is an account-wide Roundcube preference, not a Formspree-only rule. Other mail apps and existing drafts are unaffected.

When this option is selected, a new Reply keeps the original Reply-To destination and starts without the notification's quoted footer. Check the recipient before sending. To restore quoted correspondence, choose **start new message above the quote** and save. The private owner guide records the verified account setup and test evidence.

No passwords, authentication tokens, recovery codes or account login identifiers belong in this public source documentation.
