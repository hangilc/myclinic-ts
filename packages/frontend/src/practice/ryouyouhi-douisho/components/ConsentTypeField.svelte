<script lang="ts">
  export let consentType: "初回の同意" | "再同意";
</script>

<div>
  <div class="title">同意区分</div>
  <div>
    <input type="radio" bind:group={consentType} value="初回の同意" />
    初回の同意
    <input type="radio" bind:group={consentType} value="再同意" /> 再同意
  </div>
</div>

<style>
  .title {
    font-weight: bold;
  }
</style>
