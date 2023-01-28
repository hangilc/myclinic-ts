<div>
  受付
  {#if import.meta.env.MODE === "test-client"}
  <span data-cy="test-flag">(Test-Client)</span>
  {/if}
</div>

<style>
  div {
    font-size: 40px;
    color: white;
    background-color: #17a2b8;
    padding: 16px;
  }
</style>