<script>
import { setContext, onMount } from "svelte"
import Router from '../core/router'

export let routes           // Routes configuration

let layout = null           // Current kayout
let component = null        // Current component
let history = []
let request = null          // Current request

let router = new Router(window, routes)

router.listen(() => {
  layout = router.currentRoute.layout
  component = router.currentRoute.component
  history = router.history
  request = router.history[router.history.length - 1]
})

setContext('ROUTER', router)

window.onpopstate = () => {
  console.log("on pop state")
  router.resolve()
}

onMount(() => {
  router.resolve()
})
</script>

{#if layout}
  <svelte:component this={layout} {request} {history}>
    <svelte:component this={component} {request} {history}/>
  </svelte:component>
{:else}
  <svelte:component this={component} {request} {history}/>
{/if}
