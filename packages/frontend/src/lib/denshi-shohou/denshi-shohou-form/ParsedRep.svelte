<script lang="ts">
  export let parsed: {
    name: string;
    amount: string;
    usage: string;
    times: string | undefined;
  };
</script>

<div>{parsed.name}</div>
<div>{parsed.amount}</div>
<div>{parsed.usage}</div>
<div>{parsed.times ?? ""}</div>
