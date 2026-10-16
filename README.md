# Duzup website

Product page for [Duzup](https://github.com/umairxdev/Duzup), a free, offline reminder app for Android.

Plain HTML, CSS and JavaScript. No build step, no dependencies. The download buttons read the latest release from the
GitHub API and link straight to the APK.

## Run locally

```bash
python -m http.server 8080
# open http://localhost:8080
```

## Structure

| Path | What |
|---|---|
| `index.html`, `styles.css`, `script.js` | the page |
| `shots/` | app screenshots (status bar cropped) |
| `assets/` | favicon, app icons, social preview image |
| `llms.txt`, `llms-full.txt` | plain-text summaries for AI assistants |
| `robots.txt`, `sitemap.xml`, `site.webmanifest` | SEO and crawler files |

## Deploy

Served with GitHub Pages from the `main` branch root. If the site address changes, update the URL in `index.html`,
`sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt`.

## License

MIT, see [LICENSE](LICENSE).
