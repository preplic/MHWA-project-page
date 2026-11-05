# Publish the project page

This folder is a self-contained static website. No Node.js, build step, server,
analytics service, or CDN is required. All asset paths are relative and work
under a GitHub Pages project subdirectory.

## Preview locally

Open `index.html` directly in your browser, keeping the `assets/` folder beside
it. The embedded video also has playback controls and an **Open video** link.
To serve the page over HTTP from the repository root:

```bash
python tools/preview_server.py --port 8080
```

Open `http://localhost:8080`.
The preview server supports byte-range requests so that seeking and looping work
as they do on a static video host. For a page-only archive, a regular static
server can display the page; byte-range support enables video seeking.

## Set the final links

Edit `site-config.js`:

```javascript
window.MHWA_CONFIG = {
  paperUrl: "https://arxiv.org/abs/2610.14727",
  codeUrl: "https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY",
  projectUrl: "https://YOUR_ACCOUNT.github.io/YOUR_REPOSITORY/",
  arxivId: "2610.14727",
  contactEmail: "panpengcheng19@mails.ucas.ac.cn"
};
```

The arXiv link is configured. An empty code link displays “Coming soon”.
`projectUrl` also sets the canonical URL and absolute social-preview image URL.

## GitHub Pages

For the publicity preview, create a separate page-only repository. Unpack
`MHWA-project-page.zip` into its root, then
publish `main / (root)` through **Deploy from a branch**. Keep `.nojekyll`.
This allows the project page to go online before the implementation is released.

1. Create a public repository, for example `MHWA`.
2. Upload the extracted archive contents to the repository root. `index.html`
   and `assets/` must be at that root; do not upload the ZIP itself.
3. Open **Settings → Pages → Build and deployment**.
4. Choose **Deploy from a branch**, then **main** and **/(root)**, and save.
5. Wait for deployment to finish. The project URL will be
   `https://YOUR_ACCOUNT.github.io/MHWA/`.

To update the page, edit or replace files in the same repository and commit to
the publishing branch. GitHub Pages redeploys the changes at the same URL.
Keep the account name, repository name, and any custom-domain setting unchanged
to preserve that address. A hard refresh may be needed to see changed assets.

Once the implementation is ready for release, the complete repository also has
`.github/workflows/pages.yml`, which publishes `site/`. Select **Settings → Pages
→ Source → GitHub Actions**, then push to `main` or run the workflow manually.
Remember that a public GitHub repository exposes its tracked source files as
well as its Pages artifact.

GitHub's workflow documentation:
https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Video assets

The homepage plays `assets/videos/hero-showcase.mp4`: an MHWA title sequence
followed by rotating four-game scenes with fades. `assets/hero.json` describes
the current montage and is optional for playback. Reported paper metrics are
independent of this demonstration collection. To rebuild the montage from the
available recordings:

```bash
python tools/build_hero_video.py --work /path/to/temporary/render-directory
```

When the full recording collection finishes, the montage is rebuilt automatically.

## Record another collection

Activate the working `mhwa` environment and run from the repository root:

```bash
CHECKPOINT=/path/to/checkpoint GPUS=4,5,6,7 bash eval/record_showcase.sh
```

The per-game settings are in `eval/showcase.json`. Logs, process IDs, native
recordings, status, and exit codes are written outside this repository to
`../MHWA-pre-runs/`. Browser-compatible videos and posters are written here.
After recording finishes, regenerate the standalone archive with:

```bash
python tools/package_preview.py
```
