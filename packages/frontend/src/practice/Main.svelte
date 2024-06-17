<script lang="ts">
  import Exam from "./exam/Exam.svelte";
  import type { Writable } from "svelte/store";
  import Phone from "./phone/Phone.svelte";
  import { currentPatient } from "./exam/exam-vars";
  import JihiKenshin from "./jihi-kenshin/JihiKenshin.svelte";
  import RcptCheck from "./RcptCheck.svelte";
  import Rezept from "./Rezept.svelte";
  import Henrei from "./Henrei.svelte";
  import Cashier from "@/cashier/Cashier.svelte";
  import BigChar from "./BigChar.svelte";
  import FaxShohousen from "./fax-shohousen/FaxShohousen.svelte";
  import HoumonKango from "./houmon-kango/HoumonKango.svelte";
  import Shujii from "./shujii/Shujii.svelte";
  import RyouyouKeikakusho from "./ryouyou-keikakusho/RyouyouKeikakusho.svelte";
  import PrintSetting from "./print-setting/PrintSetting.svelte";
  import Scan from "@/practice/scan/Scan.svelte";
  import Refer from "./refer/Refer.svelte";
  import Shindansho from "./shindansho/Shindansho.svelte";

  export let serviceStore: Writable<string>;

  currentPatient.subscribe((p) => {
    if (p == null) {
      document.title = "診察";
    } else {
      document.title = `(${p.patientId}) ${p.fullName("")}`;
    }
  });
</script>

<div>
  <Exam isVisible={$serviceStore === "exam"} />
  {#if $serviceStore === "cashier"}
    <Cashier isAdmin={true} />
  {/if}
  {#if $serviceStore === "fax-shohousen"}<FaxShohousen />{/if}
  <HoumonKango isVisible={$serviceStore === "houmon-kango"} />
  <RyouyouKeikakusho isVisible={$serviceStore === "ryouyou-keikakusho"} />
  <Shujii isVisible={$serviceStore === "shujii"} />
  {#if $serviceStore === "print-setting"}
    <PrintSetting />
  {/if}
  {#if $serviceStore === "scan"}
    <Scan />
  {/if}
  <Refer isVisible={$serviceStore === "refer"} />
  {#if $serviceStore === "shindansho"}
    <Shindansho />
  {/if}
  {#if $serviceStore === "phone"}
    <Phone />
  {/if}
  <JihiKenshin isVisible={$serviceStore === "jihi-kenshin"} />
  <RcptCheck isVisible={$serviceStore === "rcpt-check"} />
  <Rezept isVisible={$serviceStore === "rezept"} />
  <Henrei isVisible={$serviceStore === "henrei"} />
  <BigChar isVisible={$serviceStore === "big-char"} />
</div>
