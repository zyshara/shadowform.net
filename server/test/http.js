import { request } from "node:http";

export async function listen(app) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  return server;
}

export function get(server, path, host = "shadowform.localhost", headers = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: "127.0.0.1", port: server.address().port, path,
      headers: { host, ...headers },
    }, res => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        resolve({ status: res.statusCode, headers: { get: name => res.headers[name] ?? null },
          text: async () => body, json: async () => JSON.parse(body) });
      });
    });
    req.on("error", reject); req.end();
  });
}
