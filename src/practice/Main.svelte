<script>
  import Exam from "./exam/Exam.svelte";
  import Cashier from "./cashier/Cashier.svelte";

  export let serviceStore;
</script>

<div>
  <Exam isVisible={$serviceStore === "exam"} />
  <Cashier isVisible={$serviceStore === "cashier" } />
</div>