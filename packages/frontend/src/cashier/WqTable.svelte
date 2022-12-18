<script lang="ts">
  import { calcAge } from "@/lib/calc-age";
  import type { Patient, Visit, Wqueue } from "myclinic-model";
  import * as kanjidate from "kanjidate";

  export let items: [Wqueue, Visit, Patient][];

  function formatDob(birthday: string): string {
    return kanjidate.format(kanjidate.f2, birthday);
  }
</script>

<div class="top">
  <div class="col-state" />
  <div class="col-patient-id" />
  <div class="col-name" />
  <div class="col-yomi" />
  <div class="col-sex" />
  <div class="col-age" />
  <div class="col-birthday" />
  <div class="col-manip" />
  <div class="header-row">
    <div>状態</div>
    <div>患者番号</div>
    <div>氏名</div>
    <div>よみ</div>
    <div>性別</div>
    <div>年齢</div>
    <div>生年月日</div>
    <div>操作</div>
  </div>
  {#each items as item (item[0].visitId)}
    {@const wq = item[0]}
    {@const visit = item[1]}
    {@const patient = item[2]}
    <div class="wq-row">
      <div>{wq.waitStateType.label}</div>
      <div>{patient.patientId}</div>
      <div>{patient.fullName(" ")}</div>
      <div>{patient.fullYomi(" ")}</div>
      <div>{patient.sexType.rep}</div>
      <div>{calcAge(patient.birthday)}才</div>
      <div class="dob">{formatDob(patient.birthday)}</div>
      <div class="manip">
        <div class="manip-content">
          <button>会計</button>
          <a href="javascript:void(0)">診療録</a>
          <svg
            width="1.2rem"
            class="menu-icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .top {
    display: table;
    margin: 20px 0;
    border: 1px solid gray;
    padding: 10px;
    border-radius: 6px;
  }

  .col-state {
    display: table-column;
    width: 3rem;
  }

  .col-patient-id {
    display: table-column;
    width: 4rem;
  }

  .col-name {
    display: table-column;
    width: 6rem;
  }

  .col-yomi {
    display: table-column;
    width: 10rem;
  }

  .col-sex {
    display: table-column;
    width: 2rem;
  }

  .col-age {
    display: table-column;
    width: 3rem;
  }

  .col-birthday {
    display: table-column;
    width: 7.5rem;
  }

  .col-manip {
    display: table-column;
    width: 8rem;
  }

  .header-row {
    display: table-row;
  }

  .header-row > div {
    display: table-cell;
    font-weight: bold;
    font-size: 0.8rem;
  }

  .wq-row {
    display: table-row;
  }

  .wq-row:nth-of-type(2n+1) {
    background-color: #eee;
  }

  .wq-row > div {
    display: table-cell;
    padding: 2px;
  }

  .wq-row .dob {
    font-size: 0.8rem;
  }

  .manip-content {
    display: flex;
    align-items: center;
  }

  .manip-content > a {
    margin-left: 3px;
    line-height: 1;
  }

  .menu-icon {
    color: gray;
    cursor: pointer;
    /* position: relative;
    top: 3px; */
  }

</style>
