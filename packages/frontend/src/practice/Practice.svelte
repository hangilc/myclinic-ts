<script lang="ts">
  import "/src/app.scss"
  import Header from "./Header.svelte"
  import TwoCols from "./TwoCols.svelte"
  import DatePicker2 from "@/lib/date-picker/DatePicker2.svelte";

  let b: HTMLElement;
  function doClick(): void {
    let d: DatePicker2 = new DatePicker2({
      target: document.body,
      props: {
        date: new Date(),
        destroy: () => d.$destroy(),
        anchor: b
      }
    });
  }
</script>

<div>
  <Header />
  <TwoCols />
  <button bind:this={b} on:click={doClick}>click</button>
</div>