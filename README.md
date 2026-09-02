# Brody's Home School Portal

2026–2027 · Grade 7. Static GitHub Pages portal with assignments, five baseline assessments, learning logs, portfolio records, and parent diagnostic reports.

Start at `index.html`. Parents use Reports → Open parent reports to initialize a local passphrase and review/export completed diagnostics. Student diagnostics never display scores or answer keys.

Deploy the repository root through GitHub Pages. No build or package installation is required. Use an HTTP server for local preview; JSON assessment data cannot reliably load from file:// URLs.

Records remain device/browser-local. Export Full Record regularly. Parent reports provide a conservative backup merge. A public static host cannot make source answer keys secret or prevent deliberate storage tampering.

See [Implementation notes, standards, QA, and parent review](IMPLEMENTATION-NOTES.md).
