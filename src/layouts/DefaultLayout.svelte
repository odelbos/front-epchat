<script>
import Config from '../config'
import { emit, subscribe } from '../stores/bus'

let headerTitle = 'EpChat'
let channelId = null

function onClickRoomLink(_e) {
  let url = Config.web.url + "join/" + channelId
  navigator.clipboard.writeText(url)
}

subscribe('layout', (_topic, data) => {
  if (data.event === 'room_header') {
    channelId = data.channel_id
    headerTitle = 'Room: ' + data.channel_id.substring(0, 8)
  }
})

// -----

async function onClickInvit() {
  emit('layout', {event: 'click_invit', channel_id: channelId})
}

async function onClickClose() {
  emit('layout', {event: 'click_close', channel_id: channelId})
}
</script>


<div class="wrapper">
  {#if channelId !== null}
    <header>
      <div class="text-left pl-15">
        <button class="btn btn-action btn-small" type="button" on:click={onClickInvit}>Invit. Link</button>
      </div>
      <div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <p class="clip" on:click={onClickRoomLink}>{headerTitle}</p>
      </div>
      <div class="text-right pr-15">
        <button class="btn btn-danger btn-small" type="button" on:click={onClickClose}>Close</button>
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
