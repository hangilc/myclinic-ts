<script type="ts">
  export let onSelect: (sel: string) => void;
  export let destroy: () => void;
</script>

<div class="top" data-cy="select-patient-menu">
  <a
    href="javascript:void(0)"
    on:click={() => {
      destroy();
      onSelect("registered");
    }}>受付患者選択</a
  >
  <a
    href="javascript:void(0)"
    on:click={() => {
      destroy();
      onSelect("search");
    }}>患者検索</a
  >
  <a
    href="javascript:void(0)"
    on:click={() => {
      destroy();
      onSelect("recent");
    }}>最近の診察</a
  >
  <a
    href="javascript:void(0)"
    on:click={() => {
      destroy();
      onSelect("appoint");
    }}>予約患者</a
  >
  <a
    href="javascript:void(0)"
    on:click={() => {
      destroy();
      onSelect("by-date");
    }}>日付別</a
  >
</div>

<style>
  .top a {
    display: block;
    color: black;
    margin-bottom: 4px;
    line-height: 1;
  }

  .top a:last-of-type {
    margin-bottom: 0;
  }
</style>
