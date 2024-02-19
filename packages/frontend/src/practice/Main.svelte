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
  <Phone isVisible={$serviceStore === "phone"} />
  <JihiKenshin isVisible={$serviceStore === "jihi-kenshin"} />
  <RcptCheck isVisible={$serviceStore === "rcpt-check"} />
  <Rezept isVisible={$serviceStore === "rezept"} />
  <Henrei isVisible={$serviceStore === "henrei" } />
</div>
