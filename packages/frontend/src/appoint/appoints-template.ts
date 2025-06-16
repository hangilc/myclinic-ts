import api from "@/lib/api";
import { cache } from "@/lib/cache";
import { AppointTime } from "myclinic-model";
import { DateWrapper } from "myclinic-util";


export type DayOfWeek = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface AppointTemplate {
  from: string; // "09:40"
  to: string; // "10:00"
  kind: string;
  capacity: number;
}

export interface AppointsTemplateEntry {
  "day-of-week": DayOfWeek[] | "*";
  "appoints": AppointTemplate[];
}

export type AppointsTemplate = AppointsTemplateEntry[];

export function templateToAppointTime(date: string, src: AppointTemplate): AppointTime {
  return new AppointTime(
    0, date, src.from, src.to, src.kind, src.capacity
  );
}

function selectAppoints(dow: DayOfWeek, tmpl: AppointsTemplate): AppointTemplate[] {
  for(let entry of tmpl) {
    if( entry["day-of-week"] === "*" ){
      return entry.appoints;
    } else {
      if( entry["day-of-week"].includes(dow) ){
        return entry.appoints;
      }
    }
  }
  return [];
}

export async function createAppointTimesFromTemplate(date: string): Promise<AppointTime[]> {
  const dayOfWeek: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const tmpl = await cache.getAppointsTemplate();
  const dateWrapper = DateWrapper.from(date);
  const dow = dayOfWeek[dateWrapper.getDayOfWeek()];
  const appointTemplates = selectAppoints(dow, tmpl);
  const result: AppointTime[] = [];
  for(let at of appointTemplates) {
    const appointTime = new AppointTime(
      0, date, at.from, at.to, at.kind, at.capacity
    );
    result.push(appointTime);
  }
  return result;
}

export function validateAppointsTemplate(src: any): AppointsTemplate {
  if (!Array.isArray(src)) {
    throw new Error("AppointsTemplate must be an array");
  }

  const validDaysOfWeek: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timePattern = /^\d{2}:\d{2}:\d{2}$/;

  return src.map((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error(`Entry at index ${index} must be an object`);
    }

    if (!entry.hasOwnProperty("day-of-week")) {
      throw new Error(`Entry at index ${index} missing "day-of-week" property`);
    }

    if (!entry.hasOwnProperty("appoints")) {
      throw new Error(`Entry at index ${index} missing "appoints" property`);
    }

    let dayOfWeek = entry["day-of-week"];
    if (dayOfWeek !== "*") {
      if (!Array.isArray(dayOfWeek)) {
        if( dayOfWeek === "Sun" || dayOfWeek === "Mon" || dayOfWeek === "Tue" ||
          dayOfWeek === "Wed" || dayOfWeek === "Thu" || dayOfWeek === "Fri" ||
          dayOfWeek === "Sat" ){
            dayOfWeek = [dayOfWeek];
          }
        else {
          throw new Error(
            `Entry at index ${index}: "day-of-week" must be ` +
              `"*", "Sun", "Mon", ... or an array`);
        }
      }
      for (const day of dayOfWeek) {
        if (typeof day !== "string" || !validDaysOfWeek.includes(day as DayOfWeek)) {
          throw new Error(`Entry at index ${index}: invalid day-of-week "${day}"`);
        }
      }
    }

    if (!Array.isArray(entry.appoints)) {
      throw new Error(`Entry at index ${index}: "appoints" must be an array`);
    }

    const appoints = entry.appoints.map((appoint: any, appointIndex: number) => {
      if (typeof appoint !== "object" || appoint === null) {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex} must be an object`);
      }

      if (!appoint.hasOwnProperty("from")) {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex} missing "from" property`);
      }
      if (typeof appoint.from !== "string") {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex}: "from" must be a string`);
      }
      if (!timePattern.test(appoint.from)) {
		console.error("appoint.from", appoint.from);
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex}: "from" must be in format "HH:MM:SS"`);
      }

      if (!appoint.hasOwnProperty("to")) {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex} missing "to" property`);
      }
      if (typeof appoint.to !== "string") {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex}: "to" must be a string`);
      }
      if (!timePattern.test(appoint.to)) {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex}: "to" must be in format "HH:MM"`);
      }

      if (!appoint.hasOwnProperty("kind")) {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex} missing "kind" property`);
      }
      if (typeof appoint.kind !== "string") {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex}: "kind" must be a string`);
      }

      if (!appoint.hasOwnProperty("capacity")) {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex} missing "capacity" property`);
      }
      if (typeof appoint.capacity !== "number") {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex}: "capacity" must be a number`);
      }
      if (appoint.capacity < 0) {
        throw new Error(
          `Entry at index ${index}, ` +
            `appoint at index ${appointIndex}: "capacity" must be zero or positive`);
      }

      return {
        from: appoint.from,
        to: appoint.to,
        kind: appoint.kind,
        capacity: appoint.capacity
      };
    });

    return {
      "day-of-week": dayOfWeek,
      "appoints": appoints
    };
  });
}
