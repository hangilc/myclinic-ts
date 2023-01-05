<script lang="ts">
  import "/src/app.scss";
  import Header from "./Header.svelte";
  import TopRow from "./TopRow.svelte";
  import Column from "./Column.svelte";
  import { ColumnData } from "./column-data";
  import * as kanjidate from "kanjidate";
  import api from "@/lib/api";
  import type { ClinicOperation, AppointTime, Appoint } from "myclinic-model";
  import { dateToSql } from "@/lib/util";
  import { AppointTimeData } from "./appoint-time-data";
  import {
    appointDeleted,
    appointEntered,
    appointTimeDeleted,
    appointTimeEntered,
    appointTimeUpdated,
    appointUpdated,
  } from "@/app-events";

  let startDate: string = getStartDateOf(new Date());
  let cols: ColumnData[] = [];
  let unsubs: (() => void)[] = [];

  initColumns(startDate);

  unsubs.push(appointTimeEntered.subscribe(onAppointTimeEntered));
  unsubs.push(appointTimeUpdated.subscribe(onAppointTimeUpdated));
  unsubs.push(appointTimeDeleted.subscribe(onAppointTimeDeleted));
  unsubs.push(appointEntered.subscribe(onAppointEntered));
  unsubs.push(appointUpdated.subscribe(onAppointUpdated));
  unsubs.push(appointDeleted.subscribe(onAppointDeleted));

  function onAppointTimeEntered(at: AppointTime | null): void {
    if (at == null) {
      return;
    }
    for (let c of cols) {
      if (c.date === at.date) {
        c.addAppointTimeData(new AppointTimeData(at, [], undefined));
        cols = [...cols];
        return;
      }
    }
  }

  function onAppointTimeUpdated(at: AppointTime | null): void {
    if (at == null) {
      return;
    }
    for (let c of cols) {
      if (c.date === at.date) {
        if (c.updateAppointTime(at)) {
          console.log("at", at);
          console.log("c", c);
          cols = [...cols];
          return;
        }
      }
    }
  }

  function onAppointTimeDeleted(at: AppointTime | null): void {
    if (at == null) {
      return;
    }
    for (let c of cols) {
      if (c.date === at.date) {
        if (c.deleteAppointTime(at)) {
          cols = [...cols];
          return;
        }
      }
    }
  }

  function onAppointEntered(a: Appoint | null): void {
    if (a == null) {
      return;
    }
    for (let c of cols) {
      const i = c.findAppointTimeDataIndex(a.appointTimeId);
      if (i >= 0) {
        c.addAppoint(i, a);
        cols = [...cols];
        return;
      }
    }
  }

  function onAppointUpdated(a: Appoint | null): void {
    if (a == null) {
      return;
    }
    for (let c of cols) {
      const i = c.findAppointTimeDataIndex(a.appointTimeId);
      if (i >= 0) {
        c.updateAppoint(i, a);
        cols = [...cols];
        return;
      }
    }
  }

  function onAppointDeleted(a: Appoint | null): void {
    if (a == null) {
      return;
    }
    for (let c of cols) {
      const i = c.findAppointTimeDataIndex(a.appointTimeId);
      if (i >= 0) {
        c.deleteAppoint(i, a);
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
        const appoints = pairs.map((pair) => {
          const [at, as] = pair;
          return new AppointTimeData(at, as, undefined);
        });
        for (let i = appoints.length - 2; i >= 0; i--) {
          const atd = appoints[i];
          if (appoints[i + 1].isRegularVacant) {
            atd.followingVacant = appoints[i + 1].appointTime;
          }
        }
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
