<script lang="ts">
  import { onDestroy } from "svelte";
  import { currentPatient } from "./exam-vars";
  import api from "@/lib/api";
  import type { Visit } from "myclinic-model";
  import { DateWrapper } from "myclinic-util";
  import ChevronDown from "@/icons/ChevronDown.svelte";

  const unsubs: (() => void)[] = [];
  let epochs: { id: number; text: string; visit: Visit }[] = [];
  let index = 1;
  let showMenu = false;
  let showEditor = false;
  let editorContent = "";

  unsubs.push(
    currentPatient.subscribe(async (patient) => {
      if (patient) {
        await fetchEpochs(patient.patientId);
      } else {
        epochs = [];
      }
    })
  );

  onDestroy(() => unsubs.forEach((sub) => sub()));

  async function fetchEpochs(patientId: number) {
    const texts = await api.searchTextForPatient(
      "[[EPOCH]]",
      patientId,
      200,
      0
    );
    texts.sort((a, b) => -a[1].visitedAt.localeCompare(b[1].visitedAt));
    epochs = texts.map(([t, v]) => ({
      id: index++,
      text: t.content,
      visit: v,
    }));
  }

  function formatEpoch(e: { text: string }): string {
    let t = e.text.replaceAll(/\[\[EPOCH\]\]\s*\n?/g, "");
    t = t.replaceAll(/^●.*\n?/gm, "");
    t = t.trim();
    t = t.replaceAll("\n", "<br />\n");
    return t;
  }

  function formatDate(at: string): string {
    return DateWrapper.from(at).render(
      (d) => `${d.getGengou()}${d.getNen()}年${d.getMonth()}月${d.getDay()}日`
    );
  }

  async function doReload() {
    const patient = $currentPatient;
    if (patient) {
      await fetchEpochs(patient.patientId);
      showMenu = false;
    }
  }

  function doList() {
    onList(false);
  }

  function doListReverse() {
    onList(true);
  }

  function onList(reverse: boolean) {
    if (showEditor) {
      editorContent = "";
      showEditor = false;
    } else {
      const es = [...epochs];
      es.sort((a, b) => {
        return a.visit.visitedAt.localeCompare(b.visit.visitedAt);
      });
      if( reverse ){
        es.reverse();
      }
      const ss = es
        .map((epoch) => {
          const date = DateWrapper.from(
            epoch.visit.visitedAt.substring(0, 10)
          ).render(
            (d) => `【${d.getYear()}年${d.getMonth()}月${d.getDay()}日}】`
          );
          let text = epoch.text;
          text = text.replaceAll(/\[\[EPOCH\]\]\s*\n?/g, "");
          return `${date}${text}`.trim();
        })
        .join("\n");
      editorContent = ss;
      showEditor = true;
    }
  }
</script>

<div>
  {#if epochs.length > 0}
    <div>
      <span style="font-weight:bold">エポック</span>
      <a
        href="javascript:void(0)"
        style="position:relative;top:3px;"
        on:click={() => (showMenu = !showMenu)}
      >
        <ChevronDown />
      </a>
    </div>
    {#if showMenu}
      <div>
        <a href="javascript:void(0)" on:click={doReload}>リロード</a>
        <span class="sep">|</span>
        <a href="javascript:void(0)" on:click={doList}>リスト作成</a>
        <span class="sep">|</span>
        <a href="javascript:void(0)" on:click={doListReverse}
          >リスト作成（逆順）</a
        >
      </div>
      {#if showEditor}
        <textarea
          style="width:95%;resize:vertical;height:10em;"
          bind:value={editorContent}
        ></textarea>
      {/if}
    {/if}
  {/if}
  {#each epochs as epoch (epoch.id)}
    <div class="epoch">
      <div class="date">{formatDate(epoch.visit.visitedAt)}</div>
      <div>{@html formatEpoch(epoch)}</div>
    </div>
  {/each}
</div>

<style>
  .epoch {
    margin: 10px 0;
    font-size: 14px;
    padding: 4px;
    border-radius: 6px;
    border: 1px solid gray;
  }

  .epoch .date {
    color: green;
  }

  .sep {
    opacity: 0.3;
    position: relative;
    top: -2px;
  }
</style>
