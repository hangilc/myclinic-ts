import api from "@/lib/api";
import { messageOfOnshiConfirmHokenResult, onshiConfirmHoken } from "@/lib/onshi-query-helper";
import type { Appoint, Koukikourei, Shahokokuho } from "myclinic-model";
import { writable, type Writable } from "svelte/store";

export type ConfirmError = "" | "保険重複" | "確認不成功" | "患者番号なし" | "情報不一致" | "保険なし";

export interface ConfirmStatus {
  isDone: boolean;
  error: ConfirmError;
  message: string;
}

function init(): ConfirmStatus {
  return {
    isDone: false,
    error: "",
    message: "準備中",
  };
}

function duplicateHoken(): ConfirmStatus {
  return {
    isDone: true,
    error: "保険重複",
    message: "保険重複",
  };
}

function noPatientId(): ConfirmStatus {
  return {
    isDone: true,
    error: "患者番号なし",
    message: "患者番号なし",
  };
}

function inconsistent(msg: string): ConfirmStatus {
  return {
    isDone: true,
    error: "情報不一致",
    message: msg,
  }
}

function confirmed(): ConfirmStatus {
  return {
    isDone: true,
    error: "",
    message: "確認成功",
  }
}

function confirmError(msg: string): ConfirmStatus {
  return {
    isDone: true,
    error: "確認不成功",
    message: "確認不成功" + (msg ? " " + msg : ""),
  }
}

function noHoken(): ConfirmStatus {
  return {
    isDone: true,
    error: "保険なし",
    message: "保険なし",
  }
}

export type PatientRep = string;
export type AppointId = number;

export function createConfirm(): Writable<ConfirmStatus> {
  return writable(init());
}

export function startConfirm(appoint: Appoint, date: string, idToken: string, status: Writable<ConfirmStatus>): void {
  async function start() {
    const patientId = appoint.patientId;
    try {

      if (patientId > 0) {
        // const patient = await api.getPatient(patientId);
        const shahoOpt = await api.findAvailableShahokokuho(patientId, date);
        const koukiOpt = await api.findAvailableKoukikourei(patientId, date);
        if (shahoOpt && koukiOpt) {
          status.set(duplicateHoken());
        }
        if (shahoOpt) {
          status.set(await confirmHoken(shahoOpt, date, idToken));
        } else if (koukiOpt) {
          status.set(await confirmHoken(koukiOpt, date, idToken));
        } else {
          status.set(noHoken());
        }
      } else {
        status.set(noPatientId());
      }
    } catch (ex: any) {
      status.set(confirmError(ex.toString()));
    }
  }
  start();
}

export function getPatientRep(appoint: Appoint): string {
  let rep: string = "";
  if (appoint.patientId > 0) {
    rep += `(${appoint.patientId}) `
  }
  return rep + appoint.patientName;
}

async function confirmHoken(hoken: Shahokokuho | Koukikourei, date: string, idToken: string): Promise<ConfirmStatus> {
  const result = await onshiConfirmHoken(hoken, date, { idToken });
  if (!result.ok) {
    return inconsistent(messageOfOnshiConfirmHokenResult(result));
  } else {
    return confirmed();
  }
}
