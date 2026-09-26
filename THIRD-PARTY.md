# Third-party material

The code in this repository is MIT (see `LICENSE`). These pieces are someone else's work and keep their own terms.

## Shipped in the app

| What | Where | Licence |
|---|---|---|
| xkcd colour survey names | `scripts/data/xkcd-rgb.txt` → `src/generated/colors-*.csv` | CC0-1.0 — [xkcd.com/color/rgb](https://xkcd.com/color/rgb/) |
| CSS named colours | `scripts/data/css-named-colors.json` → `src/generated/colors-*.csv` | W3C [CSS Color Module Level 4](https://www.w3.org/TR/css-color-4/#named-colors); names are a published standard |
| Word encoder, fine-tuned from `sentence-transformers/all-MiniLM-L6-v2` | `public/word-encoder/` | Apache-2.0 — [huggingface.co/sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). The fine-tuned weights are a derivative and stay under Apache-2.0. |
| Bebas Neue, Libre Baskerville, IBM Plex Mono | via `@fontsource/*` | OFL-1.1 |
| npm dependencies | `node_modules/` | Permissive, enforced by `just licenses` (`scripts/check-licenses.ts`) |

## Build time only, never shipped

| What | Where | Licence |
|---|---|---|
| GloVe 6B word vectors | downloaded by `just fetch-glove` into a gitignored cache; only derived neighbour tables are committed | ODC-PDDL-1.0 — [nlp.stanford.edu/projects/glove](https://nlp.stanford.edu/projects/glove/) |
| Python training deps | `training/` | Permissive, enforced by `scripts/check-python-licenses.py` when `training/.venv` exists |
| `@img/sharp-libvips-*` | pulled in by `@huggingface/transformers` for Node | LGPL-3.0, dynamically linked. Reviewed exception: Node-only, never in the browser bundle. |
| `lightningcss` | pulled in by Tailwind v4 | MPL-2.0. Reviewed exception: build-time CSS tooling, used unmodified, never in the bundle. |

## In the repo, not MIT, not shipped

| What | Where | Licence |
|---|---|---|
| Wikipedia "List of colors" | `guidance/references/colors.csv` | CC-BY-SA — [en.wikipedia.org/wiki/List_of_colors](https://en.wikipedia.org/wiki/List_of_colors). The original library; the app replaced it with the CC0 xkcd + CSS set. Kept for the eval history. |
