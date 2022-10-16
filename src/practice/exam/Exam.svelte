<script>
  import Header from "./Header.svelte";
  import PatientsByDateBox from "./patients-by-date-box/PatientsByDateBox.svelte";
  import { currentPatient, showPatientsByDate } from "./ExamVars";
  import PatientDisp from "./PatientDisp.svelte";
  import PatientManip from "./PatientManip.svelte";
  import RecordsWrapper from "./RecordsWrapper.svelte";
  import Nav from "./Nav.svelte";
  import MishuuList from "./mishuu-list/MishuuList.svelte";

  export let isVisible = false;
</script>

<div style:display={isVisible ? "" : "none"} class="top">
  <div class="exam-left">
    <Header />
    {#if $currentPatient !== null}
      <PatientDisp patient={$currentPatient} />
      <PatientManip />
      <Nav />
      <RecordsWrapper />
      <Nav />
    {/if}
  </div>
  <div class="exam-right">
    <MishuuList />
    {#if $showPatientsByDate}
      <PatientsByDateBox />
    {/if}
  </div>
</div>

<style>
  .top {
    display: flex;
    align-items: flex-start;
  }

  .exam-left {
    flex: 1 1 auto;
    margin-right: 10px;
  }

  .exam-right {
    flex: 0 0 240px;
    width: 240px;
  }
</style>