// frontend/server.js
import { createRequire } from "module"
const require = createRequire(import.meta.url)

const { createServer } = require("https")
const { parse } = require("url")
const next = require("next")
import * as fs from "fs"

const port = process.env.PORT || 3000
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Load the certificate and key
const httpsOptions = {
  key: fs.readFileSync("./certs/frontend.key"),
  cert: fs.readFileSync("./certs/frontend.crt"),
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Server listening on https://localhost:${port}`)
  })
})

