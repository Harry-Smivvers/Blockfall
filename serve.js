// Lokaler Test-Server für Blockfall (z. B. zum Testen auf dem iPhone im WLAN).
// Start:  node serve.js [port]      (Standard-Port 8080, liefert diesen Ordner aus)
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os");
const root = path.resolve(__dirname), port = +process.argv[2] || 8080;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json", ".webmanifest": "application/manifest+json" };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(root, path.normalize(p).replace(/^(\.\.[\/\\])+/, ""));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Nicht gefunden"); }
    // index.html hat wegen der Artifact-Version keinen Doctype -> hier ergänzen (sonst Quirks-Modus)
    if (path.extname(file) === ".html" && !/^\s*<!doctype/i.test(data.toString("utf8", 0, 100)))
      data = Buffer.concat([Buffer.from("<!doctype html>\n"), data]);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(data);
  });
  console.log(new Date().toLocaleTimeString(), req.socket.remoteAddress, req.url);
}).listen(port, "0.0.0.0", () => {
  console.log(`Server läuft auf Port ${port}. Im WLAN öffnen:`);
  for (const list of Object.values(os.networkInterfaces()))
    for (const a of list || []) if (a.family === "IPv4" && !a.internal) console.log(`  http://${a.address}:${port}`);
  console.log("Beenden mit Strg+C");
});
