<script>
import Config from '../config'
import { emit, subscribe } from '../stores/bus'
import LocalStorageService from '../services/local_storage_service'

let headerTitle = 'EpChat'
let channel = null
let isOwner = false
let allReadySubscirbe = false

let user = null
if (LocalStorageService.hasUser()) {
  user = LocalStorageService.getUser()
}

if ( ! allReadySubscirbe) {
  subscribe('layout', (_topic, data) => {
    if (data.event === 'room_header') {
      channel = data.channel
      headerTitle = 'Room: ' + data.channel.id.substring(0, 8)
      if (user !== null) {
        isOwner = (channel.owner_id === user.id)
      }
      // TODO: user === null should never happens here
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

async function onClickRoomLink() {
  let url = Config.web.url + "join/" + channel.id
  navigator.clipboard.writeText(url)
}
</script>


<div class="wrapper">
  {#if channel !== null}
    <header>
      <div class="text-left pl-15">
        {#if isOwner}
          <button class="btn btn-action btn-small" type="button" on:click={onClickInvit}>Invit. Link</button>
        {/if}
      </div>
      <div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <p class="clip" on:click={onClickRoomLink}>{headerTitle}</p>
      </div>
      <div class="text-right pr-15">
        {#if isOwner}
          <button class="btn btn-danger btn-small" type="button" on:click={onClickClose}>Close</button>
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

    p.clip
      cursor: pointer

  main
    padding: 20px

  footer
    background: var(--surface2-color)
    font-size: var(--font-small-3)
    text-align: center
    padding-top: 5px
    padding-bottom: 2px
</style>
