<script>
import Config from '../config'
import { subscribe } from '../stores/bus'

let headerTitle = 'EpChat'
let channelId = null

function onClickRoomLink(_e) {
  let url = Config.web.url + "join/" + channelId
  navigator.clipboard.writeText(url)
}

subscribe('layout', (_topic, data) => {
  if (data.event === 'channel') {
    headerTitle = 'Room: ' + data.channel_id.substring(0, 8)
    channelId = data.channel_id
  }
})
</script>


<div class="wrapper">
  <header>
    <!-- <p>EpChat</p> -->
    {#if channelId !== null}
      <p class="clip" on:click={onClickRoomLink}>{headerTitle}</p>
    {:else}
      <p>{headerTitle}</p>
    {/if}
  </header>
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
  grid-template-rows: 35px auto 35px
  min-height: 100vh

  header
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
