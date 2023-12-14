<script>
</script>

<div class="wrapper">
  <header>
    <p>EpChat</p>
  </header>
  <main>
    <slot/>
  </main>
  <footer class="footer mt-auto py-3">
    <div class="container">
      <span class="text-muted">EpChat</span>
    </div>
  </footer>
</div>


<style lang="sass">
.wrapper
  display: flex
  flex-direction: column
  min-height: 100vh

  main
    display: flex
    flex-direction: column
    flex: 1
    padding: 20px
    background: #eaeaea

footer
  background-color: grey
  text-align: center
</style>
