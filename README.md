# Grand Fable GP (standalone)

The 3D racer from the Ananse Learning Zone as its own installable web app (GitHub Pages: https://ananseclaw-arch.github.io/grand-fable-gp/).

- `index.html`, `app-shim.js`, `sw.js`, `manifest.webmanifest`, `icon-*.png`, `vendor/three.r128.min.js`: this app's own shell.
- `race3d.js` and `assets/`: COPIED from the Learning Zone repo by its `tools/build_standalone.sh` - do not edit them here.
  Change the racer in the Learning Zone, then run `tools/build_standalone.sh <path to this folder>` and commit here.
- Storage: one localStorage key, `gfgp_v1`. Service-worker caches: `gfgp-*` only, scope `./`. It never touches the
  Learning Zone's storage or caches (same origin: ananseclaw-arch.github.io).
