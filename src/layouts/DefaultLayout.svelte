<script>
import Config from '../config'
import { emit, subscribe } from '../stores/bus'
import LocalStorageService from '../services/local_storage_service'

let headerTitle = 'EpChat'
let channel = null
let isOwner = false
let allReadySubscirbe = false

//
// TODO: When navigating from room to home, reset the header
// Channel invit/cloae button must not appear on the home page
//

if ( ! allReadySubscirbe) {
  subscribe('layout', (_topic, data) => {
    if (data.event === 'channel.open') {
      let user = null
      if (LocalStorageService.hasUser()) {
        user = LocalStorageService.getUser()
      }
      channel = data.channel
      headerTitle = 'Room: ' + data.channel.id.substring(0, 8)
      if (user !== null) {
        isOwner = (channel.owner_id === user.id)
      }
      // TODO: user === null should never happens here
    }
    else if (data.event === 'channel.closed') {
      channel = null
    }
    allReadySubscirbe = true
  })
}

// -----

async function onClickInvit() {
  emit('layout', {event: 'click_invit', channel_id: channel.id})
}

async function onClickClose() {
  emit('layout', {event: 'click_close', channel_id: channel.id})
}

async function onClickLeave() {
  emit('layout', {event: 'click_leave', channel_id: channel.id})
}
</script>


<div class="wrapper">
  {#if channel !== null}
    <header>
      <div class="text-left pl-15">
        {#if isOwner}
          <button class="btn btn-action btn-small" type="button" on:click={onClickInvit}>Invitation Link</button>
        {/if}
      </div>
      <div>
        <p>{headerTitle}</p>
      </div>
      <div class="text-right pr-15">
        {#if isOwner}
          <button class="btn btn-danger btn-small" type="button" on:click={onClickLeave}>Leave</button>
          <button class="btn btn-danger btn-small" type="button" on:click={onClickClose}>Close</button>
        {:else}
          <button class="btn btn-danger btn-small" type="button" on:click={onClickLeave}>Leave</button>
        {/if}
      </div>
    </header>
  {:else}
    <header>
      <div></div>
      <p>{headerTitle}</p>
      <div></div>
    </header>
  {/if}
  <main>
    <slot/>
  </main>
  <footer class="footer">
    <p>EpChat</p>
  </footer>
</div>


<style lang="sass">
.wrapper
  display: grid
  grid-template-rows: 45px auto 35px
  min-height: 100vh

  header
    display: grid
    grid-template-columns: repeat(3, 1fr)
    padding-top: 5px
    padding-bottom: 5px
    text-align: center
    background: var(--surface1-color)

    p
      margin-top: 5px

  main
    padding: 20px

  footer
    background: var(--surface2-color)
    font-size: var(--font-small-3)
    text-align: center
    padding-top: 5px
    padding-bottom: 2px
</style>
