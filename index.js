const WebSocket = require("ws");
const Proxy = require("./lib/proxy");
const { UAParser } = require("ua-parser-js");

const config = require("./config.json");

const server = new WebSocket.Server({ port: config.miner.port });

server.on("connection", (ws, request) => {
  const ip =
    request.headers["x-forwarded-for"] ||
    request.headers["x-real-ip"] ||
    request.socket.remoteAddress;

  if (!request.headers["user-agent"]) {
    return;
  }
  const { device, os, browser } = UAParser(request.headers["user-agent"]);

  const proxy = new Proxy(
    config,
    ws,
    `${device.model || os.name || browser.name} ${ip}`
  );
  proxy.start();

  ws.on("close", () => {
    proxy.close();
  });
});
