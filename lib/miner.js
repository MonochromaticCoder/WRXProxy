const debug = require("debug");

class Miner {
  constructor(socket) {
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
}

module.exports = Miner;
