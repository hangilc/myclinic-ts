<script lang="ts">
  import * as m from "myclinic-model";
  import Title from "./Title.svelte";
  import TwoCols from "./TwoCols.svelte";
  import Text from "./text/Text.svelte";
  import NewTextForm from "./text/NewTextForm.svelte";
  import Hoken from "./hoken/Hoken.svelte";
  import ShinryouMenu from "./shinryou/ShinryouMenu.svelte";
  import ShinryouWrapper from "./shinryou/ShinryouWrapper.svelte";
  import ConductMenu from "./conduct/ConductMenu.svelte";
  import ConductWrapper from "./conduct/ConductWrapper.svelte";
  import Payment from "./payment/Payment.svelte";
  import { afterUpdate } from "svelte";
  import { currentVisitId, kensaDataClipboard } from "../exam-vars";
  import DrugWrapper from "./drug/DrugWrapper.svelte";
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import { initPrescInfoData } from "@/lib/denshi-shohou/visit-shohou";
  import UnregisteredShohouDialog from "@/lib/denshi-shohou/UnregisteredShohouDialog.svelte";
  import { type PrescInfoData } from "@/lib/denshi-shohou/presc-info";
  import { TextMemoWrapper } from "@/lib/text-memo";
  import NewDenshiShohouDialog from "@/lib/denshi-shohou/NewDenshiShohouDialog.svelte";

  export let visit: m.VisitEx;
  export let isLast: boolean;
  export let onLast: () => void;
  let showNewTextEditor = false;
  let onshiConfirmed: boolean | undefined = undefined;

  $: hasKensaData = $kensaDataClipboard.patientId === visit.patient.patientId;

  probeOnshi();

  async function probeOnshi() {
    const onshi: m.Onshi | undefined = await api.findOnshi(visit.visitId);
    onshiConfirmed = !!onshi;
  }

  afterUpdate(() => {
    if (isLast) {
      onLast();
    }
  });

  async function doNewShohouPrevVersion() {
    const clinicInfo = await cache.getClinicInfo();
    const shohou = initPrescInfoData(
      visit.asVisit,
      visit.patient,
      visit.hoken,
      clinicInfo,
    );
    const d: UnregisteredShohouDialog = new UnregisteredShohouDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "新規処方",
        shohou,
        onDelete: undefined,
        at: visit.visitedAt.substring(0, 10),
        onSave: async (shohou: PrescInfoData) => {
          const text = new m.Text(0, visit.visitId, "");
          TextMemoWrapper.setTextMemo(text, {
            kind: "shohou",
            shohou,
            prescriptionId: undefined,
          });
          await api.enterText(text);
        },
        onRegistered: async (shohou: PrescInfoData, prescriptionId: string) => {
          const text = new m.Text(0, visit.visitId, "");
          TextMemoWrapper.setTextMemo(text, {
            kind: "shohou",
            shohou,
            prescriptionId: prescriptionId,
          });
          await api.enterText(text);
        },
      },
    });
  }

  async function doNewShohou() {
    const clinicInfo = await cache.getClinicInfo();
    const d: NewDenshiShohouDialog = new NewDenshiShohouDialog({
      target: document.body,
      props: {
        visit,
        clinicInfo,
        destroy: () => d.$destroy(),
      },
    });
  }

  async function doPasteKensa() {
    let data = $kensaDataClipboard;
    if (data.patientId === visit.patient.patientId) {
      let kensaText = data.text;
      let newText: m.Text = {
        textId: 0,
        visitId: visit.visitId,
        content: kensaText,
      };
      await api.enterText(newText);
      kensaDataClipboard.set({ patientId: 0, text: "" });
    }
  }
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div class="top" data-type="record" data-visit-id={visit.visitId}>
  <Title bind:visit />
  <TwoCols isCurrent={$currentVisitId === visit.visitId}>
    <div slot="left">
      {#each visit.texts as text, i (text.textId)}
        <Text
          {text}
          index={i}
          at={visit.visitedAt.substring(0, 10)}
          kouhiList={visit.hoken.kouhiList}
		  patientId={visit.patient.patientId}
        />
      {/each}
      {#if showNewTextEditor}
        <NewTextForm
          visitId={visit.visitId}
          onClose={() => (showNewTextEditor = false)}
        />
      {:else}
        <div>
          <a
            href="javascript:void(0)"
            on:click={() => (showNewTextEditor = true)}>新規文章</a
          >
          <a href="javascript:void(0)" on:click={doNewShohouPrevVersion}
            >新規処方（旧）</a
          >
          <a href="javascript:void(0)" on:click={doNewShohou}>新規処方</a>
          {#if hasKensaData}
            <a href="javascript:void(0)" on:click={doPasteKensa}>検査貼付</a>
          {/if}
        </div>
      {/if}
    </div>
    <div slot="right">
      <Hoken bind:visit {onshiConfirmed} />
      <ShinryouMenu {visit} />
      <ShinryouWrapper {visit} />
      <DrugWrapper {visit} />
      <ConductMenu {visit} />
      <ConductWrapper conducts={visit.conducts} {visit} />
      <Payment {visit} />
    </div>
  </TwoCols>
</div>

<style>
  .top {
    margin-bottom: 10px;
  }
</style>
