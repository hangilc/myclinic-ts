<script lang="ts">
  import api from "../api";
  import type { AppEvent, Hotline, HotlineEx } from "../model";
  import { hotlineEntered } from "@/practice/app-events";
  import { onDestroy } from "svelte";

  export let sendAs: string;
  export let sendTo: string;
  let relevants: string[] = [sendAs, sendTo];
  let message: string = "";

  let hotlines: HotlineEx[] = [];
  let lastAppEventId = 0;
  const unsubs: (() => void)[] = [];
  init();

  async function init() {
    const hs: AppEvent[] = await api.listTodaysHotline();
    if (hs.length > 0) {
      lastAppEventId = hs[hs.length - 1].appEventId;
      hotlines = hs
        .map((e) => {
          const appEventId: number = e.appEventId;
          return { appEventId, ...JSON.parse(e.data) };
        })
        .filter(isRelevant)
        .reverse();
    } else {
      hotlines = [];
    }
  }

  function isRelevant(h: HotlineEx): boolean {
    return relevants.includes(h.sender) || relevants.includes(h.recipient);
  }

  unsubs.push(
    hotlineEntered.subscribe((h) => {
      if (h == null) {
        return;
      }
      console.log(h.appEventId, lastAppEventId);
      if (h.appEventId > lastAppEventId) {
        lastAppEventId = h.appEventId;
        const cur = hotlines;
        cur.unshift(h);
        hotlines = cur;
      }
    })
  );

  onDestroy(() => unsubs.forEach((f) => f()));

  async function sendMessage(msg: string) {
    return api.postHotline({
      message: msg,
      sender: sendAs,
      recipient: sendTo
    });
  }

  async function doSend() {
    if (message !== "") {
      await sendMessage(message);
      message = "";
    }
  }

  async function doRoger() {
    return sendMessage("了解");
  }
</script>

<div>
  <textarea bind:value={message} />
  <div>
    <button on:click={doSend}>送信</button>
    <button on:click={doRoger}>了解</button>
    <button>Beep</button>
    <a href="javascript:void(0)">常用</a>
    <a href="javascript:void(0)">患者</a>
  </div>
  <div>
    {#each hotlines as h (h.appEventId)}
      <div>{h.message}</div>
    {/each}
  </div>
</div>
