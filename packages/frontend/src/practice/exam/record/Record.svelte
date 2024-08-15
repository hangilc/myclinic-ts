<script lang="ts">
  import * as m from "myclinic-model";
  import Title from "./Title.svelte";
  import TwoCols from "./TwoCols.svelte";
  import Text from "./text/Text.svelte";
  import TextForm from "./text/TextForm.svelte";
  import Hoken from "./hoken/Hoken.svelte";
  import ShinryouMenu from "./shinryou/ShinryouMenu.svelte";
  import ShinryouWrapper from "./shinryou/ShinryouWrapper.svelte";
  import ConductMenu from "./conduct/ConductMenu.svelte";
  import ConductWrapper from "./conduct/ConductWrapper.svelte";
  import Payment from "./payment/Payment.svelte";
  import { afterUpdate } from "svelte";
  import { currentVisitId } from "../exam-vars";
  import DrugWrapper from "./drug/DrugWrapper.svelte";
  import api from "@/lib/api";
  import DenshiShohouDialog from "@/lib/denshi-shohou/DenshiShohouDialog.svelte";
  import { DateWrapper } from "myclinic-util";
  import {
  createPrescInfo,
    type PrescInfoData,
    type RP剤情報,
  } from "@/lib/denshi-shohou/presc-info";
  import { onshiPrescReport } from "@/lib/onshi-presc";
  import { getClinicInfo } from "@/lib/cache";
  import { register_presc, sign_presc } from "@/lib/hpki-api";
  import { renderPresc } from "@/lib/denshi-shohou/presc-renderer";
  import * as examples from "@/lib/denshi-shohou/presc-examples";
  import { parseShohousen } from "@/lib/shohousen/parse-shohousen";

  export let visit: m.VisitEx;
  export let isLast: boolean;
  export let onLast: () => void;
  let showNewTextEditor = false;
  let onshiConfirmed: boolean | undefined = undefined;

  probeOnshi();

  async function probeOnshi() {
    const onshi: m.Onshi | undefined = await api.findOnshi(visit.visitId);
    onshiConfirmed = !!onshi;
  }

  function createNewText(): m.Text {
    return new m.Text(0, visit.visitId, "");
  }

  afterUpdate(() => {
    if (isLast) {
      onLast();
    }
  });

  function doRenderTest() {
    let presc: RP剤情報[] = examples.presc_example_7;
    console.log("json", JSON.stringify(presc, undefined, 2));
    let render = parseShohousen(renderPresc(presc)).formatForSave();
    console.log(render);
  }

  async function doNewShohou() {
    const clinicInfo = await getClinicInfo();
    let kikancode = "131" + clinicInfo.kikancode;
    const d: DenshiShohouDialog = new DenshiShohouDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        patient: visit.patient,
        visit: visit.asVisit,
        hokenInfo: visit.hoken,
        at: DateWrapper.from(visit.visitedAt).asSqlDate(),
        onEnter: async (data: PrescInfoData) => {
          let presc = data.RP剤情報グループ;
          console.log("json", JSON.stringify(presc, undefined, 2));

          // const shohou = createPrescInfo(data);
          // const signed = await sign_presc(shohou);
          // console.log("signed", signed);
          // let result = await register_presc(signed, kikancode, "1");
          // console.log("result", result);
        },
      },
    });
  }
</script>

<div class="top" data-type="record" data-visit-id={visit.visitId}>
  <Title bind:visit />
  <TwoCols isCurrent={$currentVisitId === visit.visitId}>
    <div slot="left">
      {#each visit.texts as text, i (text.textId)}
        <Text {text} index={i} />
      {/each}
      {#if showNewTextEditor}
        <TextForm
          text={createNewText()}
          onClose={() => (showNewTextEditor = false)}
        />
      {:else}
        <div>
          <a
            href="javascript:void(0)"
            on:click={() => (showNewTextEditor = true)}>新規文章</a
          >
          <a href="javascript:void(0)" on:click={doNewShohou}>新規処方</a>
          <a href="javascript:void(0)" on:click={doRenderTest}>RenderTest</a>

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
