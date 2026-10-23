# Owner email setup for the limited beta

Status: production Custom SMTP was OFF in the owner's October 23 screenshot and
explicit confirmation. The owner currently uses Gmail and has no MENEI domain or
business email. No mail credentials or SMTP configuration were created/changed
by Codex. Outside-tester signup is not launch-ready until mail is configured and
real confirmation/recovery delivery is verified. The owner reports the exact
original live URL with trailing slash is saved in both Auth Site URL and Redirect
URLs. Testers do not configure Supabase or create email-provider accounts.

## Gmail SMTP option — owner only

Use the owner's existing Gmail account for a small beta if Google makes App
Passwords available. This requires Google 2-Step Verification. The app password
is created and entered by the owner directly in Google's and Supabase's official
interfaces. Never send it in chat, screenshots, source, frontend config or reports.
A normal Gmail login password is not the SMTP credential for this setup.

1. Open https://myaccount.google.com/apppasswords in the correct Gmail account.
   If needed, first enable 2-Step Verification through Google Account Security.
2. Create an app password named MENEI email. Keep it private for the next step.
   If Google does not offer App Passwords, report the message and choose another
   supported SMTP provider; do not change Google protection policies blindly.
3. Open https://supabase.com/dashboard/project/tdmwpcueqxtnqyonucam/auth/smtp .
   Enable Custom SMTP, fill all required fields, then Save changes:

| Setting | Value |
| --- | --- |
| Sender email | The owner's full Gmail address |
| Sender name | MENEI |
| Host | smtp.gmail.com |
| Port | 587 (TLS/STARTTLS) |
| Username | The same full Gmail address |
| Password | The Google-generated app password, entered only in Supabase |

4. Keep email confirmation enabled. Preserve existing allowed redirect URLs,
   live accounts, server secrets and history. Do not add testers to the Supabase
   project team to bypass default-mail restrictions.
5. Verify a real permitted signup email, callback and password reset after the
   corrected live frontend is staged under release authorization. Owner-account
   creation/confirmation must precede linking the existing beta allowance. Verify
   delivery to a permitted outside-team recipient before sharing the full beta.
   A saved SMTP form, correct URL or generic signup message is not delivery proof.

Gmail may not expose app passwords for some account/security configurations; a
transactional SMTP provider is another supported path. No domain purchase, mail
provider registration, paid plan or credential creation has been authorized or
performed automatically. Only recommend concrete alternatives if Gmail setup is
unavailable or the owner prefers a dedicated sender.

Official references, checked October 23, 2026:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://support.google.com/accounts/answer/185833
- https://support.google.com/mail/answer/7104828

This document contains only setup instructions. The user-facing installation
guide remains start.html; do not add operator credentials/settings to that guide.
