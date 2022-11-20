<script lang="ts">
  import Exam from "./exam/Exam.svelte";
  import Cashier from "./cashier/Cashier.svelte";
  import type { Writable } from "svelte/store";
  import Phone from "./phone/Phone.svelte";
  
  export let serviceStore: Writable<string>;
</script>

<div>
  <Exam isVisible={$serviceStore === "exam"} />
  <Cashier isVisible={$serviceStore === "cashier" } />
  <Phone isVisible={$serviceStore === "phone"} />
</div>