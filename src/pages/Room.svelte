<script>
import { getContext, onMount } from 'svelte'
import Config from '../config'
import LocalStorageService from '../services/local_storage_service'
import { channel } from '../stores/data'

let router = getContext('ROUTER')

let user = null
if (LocalStorageService.hasUser()) {
  user = LocalStorageService.getUser()
}

// NOTE: Should never happens when entering this page
if (user === null) router.navigate('home')
if ($channel === null) router.navigate('home')

let form = {
  msg: '',
}


// ----------------------------------------------------------
// WebSocket management
// ----------------------------------------------------------
const endpoint = `${Config.web.sock}`

let sock = new WebSocket(endpoint)

sock.onopen = function(event) {
  console.log("[open] Connection established")
  console.log(event)
  console.log("Sending ping to server")
  sock.send("ping")
}

sock.onmessage = function(event) {
  console.log('[message data]:')
  console.log(event)
}

sock.onclose = function(event) {
  if (event.wasClean) {
    console.log("[close] Connection closed cleanly")
    console.log(event)
  } else {
    // e.g. server process killed or network down
    // event.code is usually 1006 in this case
    console.log('[close] Connection died')
    console.log(event)
  }
}

sock.onerror = function(error) {
  console.log("[error] : ")
  console.log(error)
}
</script>


<div class="room">
  <div class="users block">
    <p>User 1</p>
    <p>User 2</p>
    <p>User 3</p>
  </div>

  <div class="messages block">
    <div class="msg">
      <p>User 1 at 1768595</p>
      <pre>message</pre>
    </div>
    <div class="msg me">
      <p>User 2 at 1768595</p>
      <pre>message</pre>
    </div>
  </div>

  <div class="ipt block">
    <textarea rows="4" bind:value={form.msg}></textarea>
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
