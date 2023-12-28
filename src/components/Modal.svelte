<script>
let dialog

export let header = false
export let footer = false
export let overlayClose = false
export let title = ''

export function toggle() { dialog.open ? close() : open()	}
export function open()   { dialog.showModal() }
export function close()  { dialog.close() }

async function onClickDialog() {
  if (overlayClose) dialog.close()
}
</script>


<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click|self={onClickDialog}>
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="wrapper" on:click|stopPropagation>
    {#if header}
      <header>
        <p>{title}</p>
      </header>
    {/if}
    <div class="content">
      <slot/>
    </div>
    {#if footer}
      <footer>
        <form method="dialog">
          <button class="btn btn-primary" type="button" on:click={() => dialog.close()}>Close</button>
        </form>
      </footer>
    {/if}
  </div>
</dialog>


<style lang="sass">
.wrapper
  display: flex
  flex-direction: column
  background: white

dialog
  top: 15%
  width: 580px
  margin-left: auto
  margin-right: auto
  background: white
  border: none
  border-radius: 8px
  padding: 0 !important
  box-shadow: rgba(125, 125, 125, 0.5) 0px 2px 7px 2px

::backdrop
  background: rgba(213, 220, 226, 0.7)
  backdrop-filter: blur(0.25rem)
  // animation: 0.3s fade-in forwards

.content
  flex: 1 !important
  padding: 15px
  min-height: 200px

header
  background: #95b1d0
  padding: 10px

  p
    text-align: center

footer
  text-align: center
  padding-top: 10px
  padding-bottom: 15px

  button
    padding: 5px 20px

dialog[open]
  animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)

@keyframes zoom
  from
    // transform: scale(0.80)
    transform: scale(0.90)
  to
    transform: scale(1)

dialog[open]::backdrop
  animation: fade 0.2s ease-out

@keyframes fade
  from
    opacity: 0
  to
    opacity: 1
</style>
