import type { Patient } from "myclinic-model";
import api from "@/lib/api";
import { mkFormData, type FormData, indexOfLastFormData } from "@/practice/ryouyou-keikakusho/form-data";
import { mkRyouyouKeikakushoData, type RyouyouKeikakushoData } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-data";
import { drawRyouyouKeikakushoShokai } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-shokai-drawer";
import { drawRyouyouKeikakushoKeizoku } from "@/lib/drawer/forms/ryouyou-keikakusho/ryouyou-keikakusho-keizoku-drawer";
import { DateWrapper } from "myclinic-util";
import type { Op } from "@/lib/drawer/compiler/op";
import { printApi } from "@/lib/printApi";
import { getRyouyouKeikakushoMasterText } from "@/practice/ryouyou-keikakusho/helper";

export async function issueRyouyouKeikakusho(patient: Patient): Promise<void> {
  try {
    // 1. Retrieve history of ryouyou keikakusho issueing of the patient
    const history: Partial<FormData>[] = await getRyouyouKeikakushoMasterText(patient.patientId);
    
    // 2. Determine if new or continuous based on history and timing
    const currentDate = DateWrapper.from(new Date());
    const shouldCreateContinuous = shouldCreateContinuousKeikakusho(history, currentDate);
    
    // 3. Create form data
    const formData = createFormData(patient, shouldCreateContinuous, history);
    
    // 4. Generate drawing operations
    const ops = createOps(formData, patient);
    
    // 5. Create PDF and save as patient image
    const filename = await generateAndSavePdf(patient, ops, formData.mode);
    
    // 6. Save the form data to history
    await saveFormDataToHistory(patient, formData, history);
    
    // 7. Print the PDF
    await printPdf(ops);
    
    alert(`療養計画書（${formData.mode === "shokai" ? "初回" : "継続"}）を発行しました。\nPDF: ${filename}`);
    
  } catch (error) {
    console.error("Error issuing ryouyou keikakusho:", error);
    alert("療養計画書の発行中にエラーが発生しました。");
  }
}

function shouldCreateContinuousKeikakusho(history: Partial<FormData>[], currentDate: DateWrapper): DateWrapper | undefined {
  if (history.length === 0) {
    return undefined; // No history, create new (shokai)
  }
  
  const lastIndex = indexOfLastFormData(history);
  if (lastIndex < 0) {
    return undefined;
  }
  
  const lastIssueDate = history[lastIndex].issueDate;
  if (!lastIssueDate) {
    return undefined;
  }
  
  // Check if current month is equal or after 4 months of the last issue date
  const lastDate = DateWrapper.from(lastIssueDate);
  const fourMonthsLater = new Date(lastDate);
  fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4);
  
  return currentDate >= fourMonthsLater;
}

function createFormData(patient: Patient, isContinuous: boolean, history: Partial<FormData>[]): FormData {
  const formData = mkFormData();
  
  // Set basic info
  formData.patientId = patient.patientId;
  formData.issueDate = DateWrapper.from(new Date()).asSqlDate();
  formData.mode = isContinuous ? "keizoku" : "shokai";
  formData.immediates["issue-times"] = (history.length + 1).toString();
  
  // Populate with patient's last form data if exists
  if (history.length > 0) {
    const lastIndex = indexOfLastFormData(history);
    if (lastIndex >= 0) {
      const lastData = history[lastIndex];
      // Copy over relevant fields from last form for continuity
      if (lastData.diseaseDiabetes !== undefined) formData.diseaseDiabetes = lastData.diseaseDiabetes;
      if (lastData.diseaseHypertension !== undefined) formData.diseaseHypertension = lastData.diseaseHypertension;
      if (lastData.diseaseHyperlipidemia !== undefined) formData.diseaseHyperlipidemia = lastData.diseaseHyperlipidemia;
      
      // Copy immediate values if they exist
      if (lastData.immediates) {
        Object.assign(formData.immediates, lastData.immediates);
      }
    }
  }
  
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

async function saveFormDataToHistory(patient: Patient, formData: FormData, history: Partial<FormData>[]): Promise<void> {
  // Add new form data to history
  const newHistory = [formData, ...history];
  
  // Save to backend
  await api.saveRyouyouKeikakushoMasterText(
    patient.patientId,
    JSON.stringify(newHistory)
  );
}

async function printPdf(ops: Op[]): Promise<void> {
  try {
    let req = {
      setup: [],
      pages: [ops],
    }
    await printApi.printDrawer(req, "A4");
  } catch (error) {
    console.error("Printing failed:", error);
    alert("Printing failed.");
  }
}
