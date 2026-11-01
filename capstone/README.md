# Michigan, on foot - Capstone adaptation

Live site: https://phudepzai-coder.github.io/Danang/capstone/

Three pages: index.html (journal), gallery.html (searchable photo collection), about.html (features and credits).

The original Michigan walks text and photographs are from the course exercise by Colleen van Lent / University of Michigan. The exercise is retained at the repository root. This Capstone redesign includes AI assistance and does not claim student authorship of the source photographs. Submit under the template-adaptation option and review course AI rules before attesting to authorship.

## Enhancements
1. Search combined with neighborhood / parks / saved filters and live result count.
2. Saved photographs persisted in localStorage with graceful denied-storage handling.
3. Native modal dialog photo viewer with arrow-key navigation, Escape, and restored focus.
4. Light / dark theme remembered across pages.
5. Three distinct layouts: phone <640px, tablet 640-1023px, desktop >=1024px; footer stays at bottom on short pages.

## Validation
All three HTML files were submitted as source to the W3C Nu validator on 2026-11-01: zero messages. Local html-validate, CSS grammar and DOM-based behavior simulations pass. Visual browser checks are documented separately in the submission evidence; simulations are not a substitute for those checks.

No external fonts, plugins, analytics, or frameworks are loaded. Search and saving are entirely local. Existing photos are re-encoded as WebP without changing their content.
