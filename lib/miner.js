const debug = require("debug");
const WebSocket = require("ws");

class Miner {
  constructor(options, socket) {
    options = options || {};
    this._port = options.port;
    this._server = null;
    this._socket = socket;
    this._eventListeners = {
      connected: [],
      auth: [],
      submit: [],
      error: [],
      close: [],
    };
    this.debug = debug("miner");
    this._socket.on("message", this._onMessage.bind(this));
  }

  start() {
    this._emit("connected");
  }

  on(event, callback) {
    if (this._eventListeners[event]) {
      this._eventListeners[event].push(callback);
    }
  }

  send(type, params) {
    const data = {
      type: type,
      params: params || {},
    };
    this._socket.send(JSON.stringify(data));
    this.debug(`Sent: ${JSON.stringify(data)}`);
  }

  close() {
    if (this._socket) this._socket.close();
  }

  clientIP() {
    return this._clientIP;
  }

  _emit(event, params) {
    const listeners = this._eventListeners[event];
    if (listeners && listeners.length) {
      for (let i = 0; i < listeners.length; ++i) {
        listeners[i](params);
      }
    }
  }

  _onMessage(message) {
    const data = JSON.parse(message);
    this.debug(`Received: ${JSON.stringify(data)}`);
    this._emit(data.type, data.params);
  }

  _onError(error) {
    this.debug(`Error: ${error}`);
    this._emit("error");
    this.close();
  }

  _onClose() {
    this.debug(`Close`);
    this._emit("close");
  }
}

module.exports = Miner;
