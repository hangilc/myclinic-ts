<script lang="ts">
  import api from "../api";
  import type { AppEvent, Hotline, HotlineEx } from "../model";
  import { hotlineEntered } from "@/practice/app-events";
  import { onDestroy } from "svelte";
  import { getRegulars } from "@/lib/hotline/hotline-config"
    import Pulldown from "../Pulldown.svelte";

  export let sendAs: string;
  export let sendTo: string;
  let relevants: string[] = [sendAs, sendTo];
  let message: string = "";
  let regulars: string[] = getRegulars(sendAs);
  let regularAnchor: HTMLElement;
  let regularPulldown: Pulldown;
  let hotlineInput: HTMLTextAreaElement;

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

  function doRegulars(): void {
    regularPulldown.open();
  }

  function insertIntoMessage(msg: string): void {
    const start = hotlineInput.selectionStart
    val end = hotlineInput.selectionEnd
    val left = hotlineInput.value.substring(0, start)
    val right = hotlineInput.value.substring(end)
    val index = s.indexOf("{}")
    val msgLeft = if index < 0 then s else s.substring(0, index)
    val msgRight = if index < 0 then "" else s.substring(index + 2)
    hotlineInput.value = left + msgLeft + msgRight + right
    hotlineInput.focus()
    val pos = start + msgLeft.size
    hotlineInput.selectionStart = pos
    hotlineInput.selectionEnd = pos
  }
</script>

<div>
  <textarea bind:value={message} bind:this={hotlineInput}/>
  <div>
    <button on:click={doSend}>送信</button>
    <button on:click={doRoger}>了解</button>
    <button>Beep</button>
    <a href="javascript:void(0)" on:click={doRegulars} bind:this={regularAnchor}>常用</a>
    <a href="javascript:void(0)">患者</a>
  </div>
  <div>
    {#each hotlines as h (h.appEventId)}
      <div>{h.message}</div>
    {/each}
  </div>
</div>
<Pulldown anchor={regularAnchor} bind:this={regularPulldown}>
  <svelte:fragment>
    {#each regulars as r}
    <a href="javascript:void(0)" on:click={() => insertIntoMessage(r)}>{r}</a>
    {/each}
  </svelte:fragment>
</Pulldown>
