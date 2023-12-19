export default class Channel {
  #listener = []
  #channel_id = null
  #sock = null
  #isJoined = false

  onJoin = (_event) => {}        // When user join the channel
  onClose = (_event) => {}       // When channel is closed

  constructor(channel_id, sock) {
    this.#channel_id = channel_id
    this.#sock = sock
  }

  on(event, fn) {
    this.#listener.push([event, fn])
  }

  #dispath(data) {
    this.#listener.forEach(listener => {
      let e, fn
      [e, fn] = listener
      if (e === data.event) fn(data.data)
    })
  }

  join(data={}) {
    this.push('ch_join', data)
  }

  leave() {
    // TODO: When user leave the channel
    // The channel will not be closed, the current user only leave
    // this.push('ch_leave', {})
  }

  close() {
    // TODO: Manage closing this channel
    // This will completly close the channel for all members
    // A ch_closed will be broadcasted to all member
    // this.push('ch_close', {})
  }

  push(event, data={}) {
    this.#sock.push({
      channel_id: this.#channel_id,
      event: event,
      data: data,
    })
  }

  internalOnOpen(event) {
    console.log('[Channel] internal onOpen')
    // Auto join channel?
  }

  internalOnMessage(data) {
    console.log('[Channel] internal onMessage')
    console.log(data)

    if (data.event === 'ch_joined') {
      this.#isJoined = true
      console.log('---channel---> receive ch_joined')
      this.onJoin(data.data)
    }
    else if (data.event === 'ch_closed') {
      this.#isJoined = false
      console.log('---channel---> receive ch_closed')
      this.onClose(data.data)
      this.#sock.delete_channel()
    }
    else {
      this.#dispath(data)
    }
  }

  internalOnClose(event) {
    console.log('[Channel] internal onClose')
    // TODO: Manage to close the channel because the underlaying
    // webwoket is closed.
  }

  internalOnError(error) {
    console.log('[Channel] internal onError')
    // TODO: Properly manage the error
  }
}
