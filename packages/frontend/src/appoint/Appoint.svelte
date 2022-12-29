<script lang="ts">
  import "/src/app.scss";
  import Header from "./Header.svelte";
  import TopRow from "./TopRow.svelte";
  import Column from "./Column.svelte";
  import { ColumnData } from "./column-data";
  import * as kanjidate from "kanjidate";
  import api from "@/lib/api";
  import type {
    ClinicOperation,
    AppointTime as AppointTimeModel,
    Appoint as AppointModel,
  } from "myclinic-model";
  import { dateToSql } from "@/lib/util";
  import { AppointTimeData } from "./appoint-time-data";
  import { appointEntered, appointTimeEntered } from "@/app-events";

  let startDate: string = getStartDateOf(new Date());
  let cols: ColumnData[] = [];
  let unsubs: (() => void)[] = [];

  initColumns(startDate);

  unsubs.push(appointTimeEntered.subscribe(onAppointTimeEntered));
  unsubs.push(appointEntered.subscribe(onAppointEntered));

  function onAppointTimeEntered(at: AppointTimeModel | null): void {
    if (at == null) {
      return;
    }
    for (let c of cols) {
      if (c.date === at.date) {
        c.addAppointTimeData(new AppointTimeData(at, []));
        cols = [...cols];
        return;
      }
    }
  }

  function onAppointEntered(a: AppointModel | null): void {
    if( a == null ){
      return;
    }
    for(let c of cols){
      const atd = c.findAppointTimeData(a.appointTimeId);
      if( atd != undefined ){
        atd.addAppoint(a);
        cols = [...cols];
        return;
      }
    }
  }

  function getStartDateOf(date: Date): string {
    return dateToSql(kanjidate.firstDayOfWeek(date));
  }

  async function initColumns(startSqlDate: string) {
    const startDate = new Date(startSqlDate);
    const dates = kanjidate.dateRange(startDate, 7);
    const map = await api.batchResolveClinicOperations(dates);
    const proms = dates
      .filter((d) => {
        const op: ClinicOperation = map[dateToSql(d)];
        return !(op.code === "regular-holiday");
      })
      .map(async (d) => {
        const pairs = await api.listAppoints(d);
        const appoints = pairs.map((pair) => new AppointTimeData(...pair));
        const sqldate = dateToSql(d);
        return new ColumnData(sqldate, map[sqldate], appoints);
      });
    cols = await Promise.all(proms);
  }

  function doMoveWeeks(n: number): void {
    const d = kanjidate.addDays(new Date(startDate), n * 7);
    startDate = dateToSql(d);
    initColumns(startDate);
  }

  function doThisWeek(): void {
    startDate = getStartDateOf(new Date());
    initColumns(startDate);
  }

  async function doCreateAppoints() {
    const upto = kanjidate.addDays(new Date(startDate), 6);
    await api.fillAppointTimes(startDate, upto);
  }
</script>

<div class="top">
  <div>
    <Header />
    <TopRow
      onCreateAppoints={doCreateAppoints}
      onMoveWeeks={doMoveWeeks}
      onThisWeek={doThisWeek}
    />
    <div class="cols-wrapper">
      {#each cols as col}
        <Column data={col} />
      {/each}
    </div>
  </div>
</div>

<style>
  .top {
    display: flex;
    justify-content: center;
    margin: 10px 0;
  }

  .cols-wrapper {
    display: flex;
    justify-content: center;
  }

  .cols-wrapper > :global(div) {
    margin-right: 16px;
  }

  .cols-wrapper > :global(div:last-of-type) {
    margin-right: 0;
  }
</style>
