<script>
import { getContext } from 'svelte'
import { emit, subscribe } from '../stores/bus'
import Config from '../config'
import LocalStorageService from '../services/local_storage_service'
import { channel } from '../stores/data'
import Socket from '../lib/socket'
import Modal from '../components/Modal.svelte'

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

// -----

subscribe('layout', (_topic, data) => {
  if (data.event === 'click_invit') {
    chann.push('adm_invit_link', {channel_id: $channel.id})
  }
})

subscribe('layout', (_topic, data) => {
  if (data.event === 'click_close') {
    confirmModal.text = 'Are you sure you want to close the Chat Room?'
    confirmModal.yesCallback = onConfirmClose
    confirmModal.dom.open()
  }
})

subscribe('layout', (_topic, data) => {
  if (data.event === 'click_leave') {
    confirmModal.text = 'Are you sure you want to leave the Chat Room?'
    confirmModal.yesCallback = onConfirmLeave
    confirmModal.dom.open()
  }
})

// -----

async function onClickGotoHome() {
  router.navigate('home')
}

async function onClickCopy() {
  navigator.clipboard.writeText(gui.invitLink)
  dom.invitLinkModal.close()
}

// -----

async function onConfirmLeave() {
  console.log('On click confirm leave Yes !')
  // TODO: Implement leave Chat Room
}

async function onConfirmClose() {
  console.log('On click confirm close Yes !')
  // TODO: Implement close Chat Room
}

// -----

let gui = {
  isChannelClosed: false,
  invitLink: '',
}

let confirmModal = {
  dom: null,
  text: 'Are you sure?',
  yesCallback: null,
}

let dom = {
  messages: null,
  closeModal: null,
  invitLinkModal: null,
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
  if ($channel.owner_id === user.id) {
    chann.push('ch_join', {user_id: user.id})
  }
  else {
    chann.push('ch_join_with_token', {user_id: user.id, token: $channel.token})
  }
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
  emit('layout', {event: 'room_header', channel: $channel})
  chann.push('ch_members')
}

chann.onClose = (data) => {
  console.log('[Client] Channel has been closed')
  console.log(data)

  if (data.reason === 'ch_no_activity') {
    // TODO: Set the message
    console.log('Closed because of inactivity')
  }
  else {
    console.log('Unknown reason')
  }

  gui.isChannelClosed = true
  dom.closeModal.open()

  // TODO: Close the websocket?
}

chann.on('ch_members', (data) => { event_ch_members(data) })

chann.on('ch_member_join', (data) => { event_ch_member_join(data) })

chann.on('ch_member_leave', (data) => { event_ch_member_leave(data) })

chann.on('ch_msg', (data) => { event_ch_msg(data) })

chann.on('adm_invit_link', (data) => { event_adm_invit_link(data) })

chann.on('ch_error', (data) => { event_ch_error(data) })

sock.connect()

// -----

function event_ch_members(data) {
  console.log('[Client] ch_member')
  console.log(data)
  members = data.members
}

function event_ch_member_join(data) {
  console.log('[Client] ch_member_join')
  console.log(data)
  members = [...members, data.member]
}

function event_ch_member_leave(data) {
  console.log('[Client] ch_member_leave')
  console.log(data)
  members = members.filter((u) => u.id !== data.user.id)
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

function event_adm_invit_link(data) {
  console.log('[Client] adm_invit_link')
  console.log(data)
  let url = Config.web.url + "join/" + data.token
  gui.invitLink = url
  dom.invitLinkModal.open()
}

function event_ch_error(data) {
  console.log('[Client] ch_error')
  console.log(data)
  //
  // TODO: Implement 'ch_error' event
  //
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
    chann.push("ch_msg", data)

    // NOTE: Wait before cleaning textarea otherwise the return line stay there
    setTimeout(() => {form.msg = ''}, 100)
  }
}
</script>


<div class="room">
  <div class="users block">
    {#if gui.isChannelClosed}
      <p class="closed">Room Closed</p>
      <p class="mt-20 text-italic text-sm">No activity since 10mn</p>
    {:else}
      {#each members as member}
        <p>{member.nickname}</p>
      {/each}
    {/if}
  </div>

  <div class="messages block" bind:this={dom.messages}>
    {#each messages as msg}
      <div class="msg" class:me={msg.id === user.id}>
        <p>{msg.nickname} at {msg.at}</p>
        <pre>{msg.msg}</pre>
      </div>
    {/each}
  </div>

  {#if gui.isChannelClosed}
    <div class="link-hp">
      <button class="btn btn-primary" type="button" on:click={onClickGotoHome}>Go to HomePage</button>
    </div>
  {:else}
    <div class="ipt block">
      <textarea rows="4" bind:value={form.msg} on:keydown={handleKeyDown} on:keyup={handleKeyUp}></textarea>
    </div>
  {/if}
</div>

<Modal bind:this={dom.closeModal} header={true} footer={'close'} overlayClose={true} title="Room Closed">
  <p class="mt-20">The chat rooom has been closed by the server because of reaching 10mn of inactivity.</p>
</Modal>

<Modal bind:this={dom.invitLinkModal} header={true} overlayClose={true} title="Invitation Link">
  <p class="mt-20">Link: {gui.invitLink}</p>
  <p class="mt-40 text-center">
    <button class="btn btn-primary" type="button" on:click={onClickCopy}>Copy</button>
  </p>
</Modal>

<Modal bind:this={confirmModal.dom} header={true} footer={'yes-no'} overlayClose={true} on:click-yes={confirmModal.yesCallback} title="Confirm">
  <p class="mt-20 text-center">{confirmModal.text}</p>
</Modal>


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
  height: calc(100vh - 45px - 35px - 20px - 20px)
  // NOTE: 100vh - header.height - footer.height - main.padding(top, bottom)
  // TODO: move all that constants into css --var

.users
  grid-column: 1
  grid-row: 1 / 3

  p.closed
    margin-top: 20px
    color: white
    background: red
    text-align: center

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

.link-hp
  text-align: center
  padding-top: 10px
</style>
