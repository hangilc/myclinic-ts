import api from "@/lib/api";
import { AppointTime } from "myclinic-model";
import type { AppointTimeData } from "./appoint-time-data";
import { appointTimeTemplate } from "./appoint-vars";
import AppointTimeDialog from "./AppointTimeDialog.svelte";
import OnshiConfirmForDate from "./OnshiConfirmForDate.svelte";

export async function doAddAppointTime(date: string, siblings: AppointTimeData[]) {
  const tmpl = new AppointTime(0, date, "", "", 
    appointTimeTemplate.kind, appointTimeTemplate.capacity);
  const d: AppointTimeDialog = new AppointTimeDialog({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      title: "新規予約枠",
      data: tmpl,
      siblings,
      onEnter: async (a: AppointTime) => {
        await api.addAppointTime(a);
        Object.assign(appointTimeTemplate, {
          kind: a.kind,
          capacity: a.capacity,
        })
      }
    }
  })
}

export function doOnshiConfirm(date: string, siblings: AppointTimeData[]) {
  const d: OnshiConfirmForDate = new OnshiConfirmForDate({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      date,
      siblings,
    }
  })
}
