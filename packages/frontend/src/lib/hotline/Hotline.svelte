<script lang="ts">
  import api from "../api";
  import type {
    AppEvent,
    HotlineEx,
    Patient,
    Visit,
    Wqueue,
  } from "myclinic-model";
  import { hotlineBeepEntered, hotlineEntered } from "@/app-events";
  import { onDestroy } from "svelte";
  import { getRegulars, hotlineNameRep } from "@/lib/hotline/hotline-config";
  import { printApi } from "../printApi";
  import type { EventEmitter } from "../event-emitter";
  import { popupTrigger, popupTriggerAsync } from "../popup-helper";

  export let sendAs: string;
  export let sendTo: string;
  export let messageTrigger: EventEmitter<string> | undefined = undefined;
  let relevants: string[] = [sendAs, sendTo];
  let regulars: string[] = getRegulars(sendAs);
  let hotlineInput: HTMLTextAreaElement;
  let wqPatients: Patient[] = [];
  let hotlines: HotlineEx[] = [];
  let lastAppEventId = 0;
  const unsubs: (() => void)[] = [];

  init();

  if( messageTrigger ){
    messageTrigger.subscribe(msg => {
      sendMessage(msg);
    });
  }

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
      if (h.appEventId > lastAppEventId) {
        lastAppEventId = h.appEventId;
        const cur = hotlines;
        cur.unshift(h);
        hotlines = cur;
        if( h.recipient === sendAs ){
          printApi.beep();
        }
      }
    })
  );

  unsubs.push(
    hotlineBeepEntered.subscribe((event) => {
      if (event == null) {
        return;
      }
      console.log(event);
      if (event.recipient == sendAs) {
        printApi.beep();
      }
    })
  );

  onDestroy(() => unsubs.forEach((f) => f()));

  async function sendMessage(msg: string) {
    return api.postHotline({
      message: msg,
      sender: sendAs,
      recipient: sendTo,
    });
  }

  async function doSend() {
    const message: string = hotlineInput.value;
    if (message !== "") {
      await sendMessage(message);
      hotlineInput.value = "";
    }
  }

  async function doRoger() {
    return sendMessage("了解");
  }

  function insertIntoMessage(msg: string): void {
    const start = hotlineInput.selectionStart;
    const end = hotlineInput.selectionEnd;
    const left = hotlineInput.value.substring(0, start);
    const right = hotlineInput.value.substring(end);
    const index = msg.indexOf("{}");
    const msgLeft = index < 0 ? msg : msg.substring(0, index);
    const msgRight = index < 0 ? "" : msg.substring(index + 2);
    hotlineInput.value = left + msgLeft + msgRight + right;
    hotlineInput.focus();
    const pos = start + msgLeft.length;
    hotlineInput.selectionStart = pos;
    hotlineInput.selectionEnd = pos;
  }

  function stripPlaceholder(msg: string): string {
    return msg.replaceAll("{}", "");
  }

  async function setupPatients() {
    const wqueue: Wqueue[] = await api.listWqueue();
    const visitIds: number[] = wqueue.map((wq) => wq.visitId);
    const visitMap: Record<number, Visit> = await api.batchGetVisit(visitIds);
    const patientIds: number[] = Object.values(visitMap).map(
      (v) => v.patientId
    );
    const patientMap: Record<number, Patient> = await api.batchGetPatient(
      patientIds
    );
    const patients: Patient[] = [];
    visitIds.forEach((visitId) => {
      const visit = visitMap[visitId];
      const patient = patientMap[visit.patientId];
      if (patient != null && !patients.includes(patient)) {
        patients.push(patient);
      }
    });
    wqPatients = patients;
  }

  function insertPatient(patient: Patient): void {
    insertIntoMessage(`${patient.lastName}${patient.firstName}様、`);
  }

  function doBeep(): void {
    api.hotlineBeep(sendTo);
  }

  function composeRegulars(): [string, () => void][] {
    return regulars.map(r => [stripPlaceholder(r), () => insertIntoMessage(r)]);
  }

  async function composePatients(): Promise<[string, () => void][]> {
    await setupPatients();
    return wqPatients.map(p => [p.fullName(" "), () => insertPatient(p)]);
  }
</script>

<!-- svelte-ignore missing-declaration -->
<div class="top hotline">
  <textarea bind:this={hotlineInput} class="input-textarea" />
  <div class="commands">
    <button on:click={doSend}>送信</button>
    <button on:click={doRoger}>了解</button>
    <button on:click={doBeep}>Beep</button>
    <div class="link-commands">
        <a
          href="javascript:void(0)"
          on:click={popupTrigger(composeRegulars)}
          >常用</a
        >
        <a
          href="javascript:void(0)"
          on:click={popupTriggerAsync(composePatients)}
          >患者</a
        >
        <!-- <div slot="menu" class="popup-menu">
          {#each wqPatients as p}
            <a
              href="javascript:void(0)"
              on:click={() => {
                destroy();
                insertPatient(p);
              }}>{p.lastName} {p.firstName}</a
            >
          {/each}
        </div> -->
    </div>
  </div>
  <div class="messages">
    {#each hotlines as h (h.appEventId)}
      <div>{hotlineNameRep(h.sender)}> {h.message}</div>
    {/each}
  </div>
</div>

<style>
  .input-textarea {
    resize: vertical;
    height: 90px;
    font-size: 14px;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
  }

  .commands {
    margin: 0 0 6px 0;
  }

  .link-commands {
    margin-top: 2px;
  }

  .messages {
    border: 1px solid gray;
    padding: 4px;
    height: 15em;
    font-size: 14px;
    overflow-y: auto;
  }
</style>
