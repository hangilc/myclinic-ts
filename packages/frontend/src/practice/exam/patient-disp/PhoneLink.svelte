<script lang="ts">
  export let orig: string;
  export let phoneNumber: string;
  export let onClick: (pn: string) => void;

  function doClick(): void {
    onClick(phoneNumber);
  }
</script>

<a href="javascript:void(0)" on:click={doClick}>{orig}</a>