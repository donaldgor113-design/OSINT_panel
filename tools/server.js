const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8123;
const root = process.cwd();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".md": "text/markdown; charset=utf-8",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent((req.url.split("?")[0] || "/").replace(/\\/g, "/"));
    if (p === "/") p = "/index.html";
    const f = path.resolve(root, "." + p);

    if (!f.startsWith(root)) {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("403");
      return;
    }

    fs.readFile(f, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found: " + p);
        return;
      }
      res.writeHead(200, { "Content-Type": MIME[path.extname(f)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log("OSINT panel server: http://localhost:" + PORT + "  (root=" + root + ")");
  });