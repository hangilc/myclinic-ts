<script type="ts">
  import SideMenu from "./SideMenu.svelte";
  import Main from "./Main.svelte";
  import { writable } from "svelte/store";
  import Hotline from "@/lib/hotline/Hotline.svelte";

  const service = writable("main");

</script>

<div class="two-cols">
  <div class="left">
    <div class="left-box">
      <SideMenu serviceStore={service} />
    </div>
    <div class="left-box">
      <Hotline sendAs="reception" sendTo="practice" />
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
