<script type="ts">
  export let onSelect: (sel: string) => void;
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <a href="javascript:void(0)" on:click={() => onSelect("registered")}>受付患者選択</a>
  <a href="javascript:void(0)" on:click={() => onSelect("search")}>患者検索</a>
  <a href="javascript:void(0)" on:click={() => onSelect("recent")}>最近の診察</a>
  <a href="javascript:void(0)" on:click={() => onSelect("by-date")}>日付別</a>
</div>
