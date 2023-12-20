<script>
import { getContext } from 'svelte'
import Config from '../config'
import LocalStorageService from '../services/local_storage_service'
import { channel } from '../stores/data'
import Socket from '../lib/socket'

let router = getContext('ROUTER')

let user = null
if (LocalStorageService.hasUser()) {
  user = LocalStorageService.getUser()
}

let members = []
let messages = []

// NOTE: Should never happens when entering this page
if (user === null) router.navigate('home')
if ($channel === null) router.navigate('home')

let dom = {
  messages: null,
}

let form = {
  msg: '',
}


// ----------------------------------------------------------
// WebSocket management
// ----------------------------------------------------------
const endpoint = `${Config.web.sock}?u=${user.id}`

let sock = new Socket(endpoint)
let chann = sock.channel($channel.id, {})

sock.onOpen = (_event) => {
  console.log('[Client] Socket Open')
  // When the websocket is connected try to join the channel
  chann.join({user_id: user.id})
}

sock.onClose = (event) => {
  console.log('[Client] Socket Close')
  console.log(event)
}

sock.onError = (error) => {
  console.log('[Client] Socket Error')
  console.log(error)
}

// -----

chann.onJoin = (data) => {
  console.log('[Client] Join channel')
  console.log(data)
  chann.push('ch_members')
}

chann.onClose = (data) => {
  console.log('[Client] Channel has been closed')
  console.log(data)
}

chann.on('ch_members', (data) => { event_ch_members(data) })

chann.on('ch_member_join', (data) => { event_ch_member_join(data) })

chann.on('ch_msg', (data) => { event_ch_msg(data) })

sock.connect()

// -----

function event_ch_members(data) {
  console.log('[Client] ch_member')
  console.log(data)
  members = data.members
}

function event_ch_member_join(data) {
  console.log('[Client] ch_member')
  console.log(data)
  members = [...members, data.member]
}

function event_ch_msg(data) {
  console.log("[Client] ch_msg")
  let msg = {
    id: data.from.id,
    nickname: data.from.nickname,
    msg: data.msg,
    at: data.at
  }
  messages = [...messages, msg]

  // NOTE: Wait redraw before auto-scrolling the message list
  setTimeout(() => {dom.messages.scrollTop = dom.messages.scrollHeight}, 100)
}

// -----

let shiftKeyOn = false

function handleKeyUp(event) {
  if (event.key === 'Shift') shiftKeyOn = false
}

function handleKeyDown(event) {
  if (event.key === 'Shift') {
    shiftKeyOn = true
  }
  else if (event.key === 'Enter' && ! shiftKeyOn) {
    if (form.msg.trim().length === 0) return
    let data = {
      msg: form.msg,
    }
    console.log('-----> send ch_msg')
    chann.push("ch_msg", data)

    // NOTE: Wait before cleaning textarea otherwise the return line stay there
    setTimeout(() => {form.msg = ''}, 100)
  }
}
</script>


<div class="room">
  <div class="users block">
    {#each members as member}
      <p>{member.nickname}</p>
    {/each}
  </div>

  <div class="messages block" bind:this={dom.messages}>
    {#each messages as msg}
      <div class="msg" class:me={msg.id === user.id}>
        <p>{msg.nickname} at {msg.at}</p>
        <pre>{msg.msg}</pre>
      </div>
    {/each}
  </div>

  <div class="ipt block">
    <textarea rows="4" bind:value={form.msg} on:keydown={handleKeyDown} on:keyup={handleKeyUp}></textarea>
  </div>
</div>


<style lang="sass">
p
  margin-bottom: 5px

p
  margin-bottom: 5px

.block
  background: #f2f5f9
  border: 1px solid #d5e0ed
  border-radius: 10px
  padding: 10px

.room
  display: grid
  grid-template-columns: 200px auto
  grid-template-rows: auto 90px
  grid-gap: 10px
  height: calc(100vh - 35px - 35px - 20px - 20px)
  // 100vh - header.height - footer.height - main.padding(top, bottom)

.users
  grid-column: 1
  grid-row: 1 / 3

.messages
  grid-column: 2
  grid-row: 1
  overflow: scroll

.ipt
  grid-column: 2
  grid-row: 2
  textarea
    width: 100%

.msg
  background: #e4e9f0
  border-radius: 5px
  padding: 3px 8px
  margin-top: 10px
  margin-right: 100px

  p
    color: black
    font-size: 0.8rem
    font-style: italic

.me
  background: lavender
  margin-left: 100px
  margin-right: 0

  p
    text-align: right
    color: black
</style>
