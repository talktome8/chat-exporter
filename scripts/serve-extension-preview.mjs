import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve("extension");
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".png": "image/png" };

createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === "/widget-preview.html") {
    const dark = url.searchParams.get("theme") === "dark";
    response.setHeader("Content-Type", "text/html");
    response.end(`<!doctype html><html data-theme="${dark ? "dark" : "light"}"><head><meta charset="utf-8"><style>html,body{height:100%;margin:0}body{background:${dark ? "#111315" : "#f8fafc"};color:${dark ? "#f5f7fa" : "#111827"};font:16px Arial,sans-serif}main{max-width:760px;margin:60px auto;padding:32px}user-query,model-response{display:block;margin:20px 0}input-area-v2{display:block;position:fixed;left:calc(50% - 360px);bottom:32px;width:720px;height:86px;border:1px solid ${dark ? "#3a4047" : "#d0d5dd"};border-radius:28px;background:${dark ? "#202326" : "#fff"}}</style></head><body><main><user-query id="u1"><p>Plan a trip to Japan</p></user-query><model-response id="a1"><p>Here is a complete itinerary.</p></model-response><input-area-v2></input-area-v2></main><script>window.chrome={storage:{local:{get:async()=>({settingsV2:{language:'en',defaultFormat:'md'}})},onChanged:{addListener(){}}},runtime:{getURL:path=>'http://127.0.0.1:4179/'+path,getManifest:()=>({version:'2.0.1'})}};</script><script src="/src/platforms.js"></script><script>ChatExporterPlatforms.select=()=>ChatExporterPlatforms.platforms.find(platform=>platform.id==='gemini');</script><script src="/src/extractor.js"></script><script src="/src/format.js"></script><script src="/src/archive.js"></script><script src="/content/widget.js"></script></body></html>`);
    return;
  }
  const previewStyles = new Set(["/popup-dark-preview.css", "/popup-light-preview.css"]);
  const file = previewStyles.has(pathname)
    ? path.resolve("scripts", pathname.slice(1))
    : path.resolve(root, `.${pathname === "/" ? "/popup.html" : pathname}`);
  if (!file.startsWith(`${root}${path.sep}`) && !previewStyles.has(pathname)) { response.writeHead(403).end(); return; }
  try {
    if (!(await stat(file)).isFile()) throw new Error("not_file");
    response.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    response.setHeader("Cache-Control", "no-store");
    if (pathname === "/popup.html") {
      const html = await readFile(file, "utf8");
      const dark = url.searchParams.get("theme") === "dark";
      const stub = `<script>window.matchMedia=()=>({matches:${dark},addEventListener(){}});window.chrome={storage:{local:{get:async()=>({settingsV2:{dismissedWidgetTip:true}}),set:async()=>{}}},tabs:{query:async()=>[{id:1,url:'https://gemini.google.com/app/qa'}]},scripting:{executeScript:async()=>[{result:{ok:true,adapter:'gemini',platform:'Gemini',supportStatus:'supported',title:'Japan planning conversation',model:'Gemini 2.5 Pro',messages:[{role:'user',text:'Hello'},{role:'assistant',text:'Hi'}],completeness:'complete',warnings:[],scanMode:'full'}}]},runtime:{sendMessage:async()=>({ok:true}),getManifest:()=>({version:'2.0.1'})}};</script>`;
      const themeStylesheet = dark ? "popup-dark-preview.css" : "popup-light-preview.css";
      response.end(html.replace("</head>", `<link rel="stylesheet" href="${themeStylesheet}"></head>`).replace("<body>", `<body>${stub}`));
      return;
    }
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end("Not found");
  }
}).listen(4179, "127.0.0.1");
