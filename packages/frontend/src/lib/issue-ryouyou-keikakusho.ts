import type { Patient } from "myclinic-model";
import api from "@/lib/api";
import { mkFormData, type FormData, getMostRecent, effectiveFormDataOf } from "@/practice/ryouyou-keikakusho/form-data";
import { mkRyouyouKeikakushoData, type RyouyouKeikakushoData } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
import { drawRyouyouKeikakushoKeizoku } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
import { DateWrapper } from "myclinic-util";
import type { Op } from "@/lib/drawer/compiler/op";
import { printApi } from "@/lib/printApi";
import { getRyouyouKeikakushoMasterText } from "@/practice/ryouyou-keikakusho/helper";

type Task = {
  label: string;
  exec: () => Promise<void>;
}

export async function issueRyouyouKeikakusho(patient: Patient): Promise<void> {
  try {
    let history: Partial<FormData>[] = await getRyouyouKeikakushoMasterText(patient.patientId);
    const currentDate = DateWrapper.from(new Date());
    const shouldCreateContinuous = shouldCreateContinuousKeikakusho(history, currentDate);
    if( shouldCreateContinuous.length === 0 ){
      return;
    }
    const tasks = cvtToTasks(patient, shouldCreateContinuous, history);
    let taskPrompt = `実行しますか？\n${tasks.map(t => t.label).join("\n")}`;
    if( confirm(taskPrompt) ){
      try {
        for(let task of tasks) {
          await task.exec();
        }
      } catch(e) {
        alert(e);
        return;
      }
    }
  } catch (error) {
    console.error("Error issuing ryouyou keikakusho:", error);
    alert("療養計画書の発行中にエラーが発生しました。");
  }
}

function cvtToTasks(
  patient: Patient, dates: DateWrapper[], history: Partial<FormData>[]
): Task[] {
  const tasks: Task[] = [];
  dates.forEach((date, index) => {
    let labels: string[] = [];
    let procs: (() => Promise<any>)[] = [];
    const formData = createFormData(patient, date, history);
    const eff = effectiveFormDataOf(formData);
    const newHistory = [eff, ...history];
    labels.push("保存");
    procs.push(async () => {
      console.log("saving", newHistory);
      await api.saveRyouyouKeikakushoMasterText(
        patient.patientId,
        JSON.stringify(newHistory)
      );
    });
    labels.push("ＰＤＦ保存");
    const ops = createOps(formData, patient);
    procs.push(async () => {
      await generateAndSavePdf(patient, ops, formData.mode)
    });
    if( index === dates.length - 1 ){
      labels.push("印刷");
      procs.push(async () => {
        await printPdf(ops)
      });
    }
    let exec: () => Promise<void> = async () => {
      for(let proc of procs) {
        await proc();
      }
    };
    history = newHistory;
    const label = `${date.asSqlDate()}:${labels.join("・")}`
    return tasks.push({ label, exec });
  })
  return tasks;
}

function shouldCreateContinuousKeikakusho(history: Partial<FormData>[], currentDate: DateWrapper): DateWrapper[] {
  if (history.length === 0) {
    return [currentDate]; // No history, create new (shokai)
  }
  
  const lastFormData = getMostRecent(history);
  if (!lastFormData) {
    console.log("getMostRecent returned undefined");
    return [];
  }
  
  const lastIssueDate = lastFormData.issueDate;
  if (!lastIssueDate) {
    console.log("last history has no issudeDate");
    return [];
  }
  
  let lastDate = DateWrapper.from(lastIssueDate);
  let iter = 0;
  let result: DateWrapper[] = [];
  while(iter++ < 4 ){
    let adjustedLastDate = lastDate;
    if( lastDate.getDay() > 28 ){
      adjustedLastDate = lastDate.setDay(28);
    }
    const fourMonthsLater = adjustedLastDate.incMonth(4);
    const firstDay = fourMonthsLater.setDay(1);
    const lastDay = fourMonthsLater.getLastDayOfSameMonth();
    fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);
    if( firstDay.isAfter(currentDate) ) {
      return result;
    } else if( lastDay.isBefore(currentDate) ){
      result.push(fourMonthsLater);
      lastDate = fourMonthsLater;
    } else {
      result.push(currentDate);
      return result;
    }
  }
  throw new Error("Too many iterations.");
}

function createFormData(
  patient: Patient, date: DateWrapper, history: Partial<FormData>[]
): FormData {
  const formData = mkFormData();
  
  // Set basic info
  formData.patientId = patient.patientId;
  formData.issueDate = date.asSqlDate();
  formData.mode = history.length > 0 ? "keizoku" : "shokai";
  
  // Populate with patient's last form data if exists
  if (history.length > 0) {
    const lastFormData = getMostRecent(history);
    if (lastFormData) {
      const lastData = lastFormData;
      // Copy over relevant fields from last form for continuity
      if (lastData.diseaseDiabetes !== undefined) formData.diseaseDiabetes = lastData.diseaseDiabetes;
      if (lastData.diseaseHypertension !== undefined) formData.diseaseHypertension = lastData.diseaseHypertension;
      if (lastData.diseaseHyperlipidemia !== undefined) formData.diseaseHyperlipidemia = lastData.diseaseHyperlipidemia;
      
      // Copy immediate values if they exist
      if (lastData.immediates) {
        Object.assign(formData.immediates, lastData.immediates);
      }
    }
  } else {
    // ask for diseases
  }
  formData.immediates["issue-times"] = (history.length + 1).toString();
  return formData;
}

function createOps(formData: FormData, patient: Patient): Op[] {
  const ryouyouKeikakushoData = mkRyouyouKeikakushoData();
  
  // Populate patient info
  populatePatientInfo(ryouyouKeikakushoData, patient, formData);
  
  // Populate issue date
  populateIssueDate(ryouyouKeikakushoData, formData);
  
  // Populate diseases
  populateDiseases(ryouyouKeikakushoData, formData);
  
  // Populate immediate values
  populateImmediateValues(ryouyouKeikakushoData, formData);
  
  // Generate drawing operations based on mode
  if (formData.mode === "shokai") {
    return drawRyouyouKeikakushoShokai(ryouyouKeikakushoData);
  } else {
    return drawRyouyouKeikakushoKeizoku(ryouyouKeikakushoData);
  }
}

function populatePatientInfo(data: RyouyouKeikakushoData, patient: Patient, formData: FormData): void {
  data["patient-name"] = `${patient.lastName}${patient.firstName}`;
  
  // Set sex
  if (patient.sex === "M") {
    data["patient-sex-male"] = "1";
    data["patient-sex-female"] = "";
  } else {
    data["patient-sex-male"] = "";
    data["patient-sex-female"] = "1";
  }
  
  // Set birthdate and age
  const birthDate = DateWrapper.from(patient.birthday);
  switch (birthDate.getGengou()) {
    case "明治": data["birthdate-gengou-meiji"] = "1"; break;
    case "大正": data["birthdate-gengou-taishou"] = "1"; break;
    case "昭和": data["birthdate-gengou-shouwa"] = "1"; break;
    case "平成": data["birthdate-gengou-heisei"] = "1"; break;
    case "令和": data["birthdate-gengou-reiwa"] = "1"; break;
  }
  
  data["birthdate-nen"] = birthDate.getNen().toString();
  data["birthdate-month"] = birthDate.getMonth().toString();
  data["birthdate-day"] = birthDate.getDay().toString();
  
  const age = birthDate.getAgeAt(formData.issueDate || new Date());
  data["patient-age"] = age.toString();
}

function populateIssueDate(data: RyouyouKeikakushoData, formData: FormData): void {
  if (formData.issueDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const d = DateWrapper.from(formData.issueDate);
    data["issue-year"] = d.getYear().toString();
    data["issue-month"] = d.getMonth().toString();
    data["issue-day"] = d.getDay().toString();
  }
  
  data["issue-times"] = formData.immediates["issue-times"] || "1";
}

function populateDiseases(data: RyouyouKeikakushoData, formData: FormData): void {
  data["disease-diabetes"] = formData.diseaseDiabetes ? "1" : "";
  data["disease-hypertension"] = formData.diseaseHypertension ? "1" : "";
  data["disease-hyperlipidemia"] = formData.diseaseHyperlipidemia ? "1" : "";
}

function populateImmediateValues(data: RyouyouKeikakushoData, formData: FormData): void {
  // Copy all immediate values from form data to ryouyou keikakusho data
  for (const [key, value] of Object.entries(formData.immediates)) {
    if (key in data && value !== undefined) {
      (data as any)[key] = value;
    }
  }
}

async function generateAndSavePdf(patient: Patient, ops: Op[], mode: string): Promise<string> {
  const timestamp = DateWrapper.fromDate(new Date()).getTimeStamp();
  const filename = `${patient.patientId}-ryouyou-keikaku-${mode}-${timestamp}.pdf`;
  
  // Create PDF file
  await api.createPdfFile(ops, "A4", filename);
  
  // Fetch and save as patient image
  const result = await fetch(api.portalTmpFileUrl(filename));
  if (result.ok) {
    const buf = await result.arrayBuffer();
    const formData = new FormData();
    const blob = new Blob([buf], { type: "application/pdf" });
    formData.append("uploadfile-1", blob, filename);
    await api.uploadPatientImage(patient.patientId, formData);
  }
  
  return filename;
}

async function printPdf(ops: Op[]): Promise<void> {
  try {
    let req = {
      setup: [],
      pages: [ops],
    }
    await printApi.printDrawer(req, "ryouyou");
  } catch (error) {
    console.error("Printing failed:", error);
    alert("Printing failed.");
  }
}
