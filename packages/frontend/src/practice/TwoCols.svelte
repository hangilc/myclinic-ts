<script lang="ts">
  import SideMenu from "./SideMenu.svelte";
  import Main from "./Main.svelte";
  import { writable } from "svelte/store";
  import Hotline from "@/lib/hotline/Hotline.svelte";
  import { hotlineTrigger } from "@/lib/event-emitter";

  const service = writable("exam");

</script>

<div class="two-cols">
  <div class="left">
    <div class="left-box">
      <SideMenu serviceStore={service} />
    </div>
    <div class="left-box">
      <Hotline sendAs="practice" sendTo="reception" messageTrigger={hotlineTrigger} />
    </div>
  </div>
  <div class="right"><Main serviceStore={service} /></div>
</div>

<style>
  .two-cols {
    display: flex;
    align-items: flex-start;
    margin-top: 6px;
  }

  .left {
    flex: 0 0 200px;
    margin: 0 6px 10px 0;
  }

  .left-box {
    margin-bottom: 10px;
  }

  .left-box :global(.hotline a) {
    font-size: 80%;
  }

  .right {
    flex: 1 1 auto;
    margin: 0 0 10px 6px;
  }
</style>
