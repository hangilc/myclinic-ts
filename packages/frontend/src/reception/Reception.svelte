<script lang="ts">
  import "/src/app.scss"
  import Header from "./Header.svelte"
  import TwoCols from "./TwoCols.svelte"

</script>

<div class="top">
  <Header />
  <TwoCols />
</div>

<style>
  .top {
    margin: 0 10%;
  }
</style>