import Channel from './channel'

export default class Socket {
  #endpoint = null
  #sock = null
  #pingTimer = null
  #channels = {}

  isOpen = false

  onOpen = (_event) => {}
  onClose = (_event) => {}
  onMessage = (_data) => {}
  onError = (_error) => {}

  //
  // TODO: Make the pingTimer delay a configuration option  ----- DUP-REF-01
  //

  constructor(endpoint) {
    this.endpoint = endpoint
  }

  connect() {
    this.#sock = new WebSocket(this.endpoint)
    this.#sock.onopen = event => this.#internalOnOpen(event)
    this.#sock.onmessage = event => this.#internalOnMessage(event)
    this.#sock.onclose = event => this.#internalOnClose(event)
    this.#sock.onerror = error => this.#internalOnError(error)
  }

  reconnect() {
    // TODO: Add auto-reconnect?
  }

  close() {
  }

  push(data) {
    let json = JSON.stringify(data)
    this.#sock.send(json)
    this.#resetPingTimer()
  }

  // -----

  // TODO: Actually params is unused
  channel(channel_id, params) {
    let channel = new Channel(channel_id, this)
    this.#channels[channel_id] = channel
    return channel
  }

  delete_channel(channel_id) {
    delete this.#channels[channel_id]
  }

  // -----

  #internalOnOpen(event) {
    console.log('[Socket] Open')
    this.isOpen = true
    // TODO: Timer interval must be in config.js ----- DUP-REF-01
    this.#pingTimer = setInterval(() => this.#ping() , 1000*30)
    this.onOpen(event)
  }

  #internalOnMessage(event) {
    console.log('[Socket] Message')

    // TODO: try catch the json parsing
    let data = null
    if (event.data) data = JSON.parse(event.data)
    // TODO: event cannot be null, it must include the channel_id and the event

    console.log(data)

    if (data.event === 'sk_pong') {
      console.log('[Socket] Pong received')
    }
    else {
      this.#resetPingTimer()
  
      let channel = this.#channels[data.channel_id]
      if (channel === null || channel === undefined) {
        console.log('[Socket] Error channel not found')
      }
      else {
        channel.internalOnMessage({
          event: data.event,
          data : data.data,
        })
      }

      this.onMessage(data)
    }
  }

  #internalOnClose(event) {
    console.log('[Socket] Close')
    this.isOpen = false
    clearInterval(this.#pingTimer)
    this.#pingTimer = null
    this.onClose(event)
    //
    // TODO: Try reconnect?
  }

  #internalOnError(error) {
    console.log('[Socket] Error')
    this.onError(error)
  }

  #resetPingTimer() {
    console.log('[Socket] Reset ping timer')
    clearInterval(this.#pingTimer)
    // TODO: Timer interval must be in config.js ----- DUP-REF-01
    this.#pingTimer = setInterval(() => this.#ping() , 1000*30)
  }

  #ping() {
    console.log("[Socket] Send ping at: " + (new Date()).toLocaleTimeString())
    this.#sock.send("sk_ping")
  }
}
