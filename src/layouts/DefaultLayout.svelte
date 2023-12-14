<div class="wrapper">
  <header>
    <p>EpChat</p>
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

  main
    padding: 20px

  footer
    background: var(--surface2-color)
    font-size: var(--font-small-3)
    text-align: center
    padding-top: 5px
    padding-bottom: 2px
</style>
