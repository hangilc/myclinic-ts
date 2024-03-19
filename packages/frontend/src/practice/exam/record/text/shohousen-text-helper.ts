import api from "@/lib/api";
import type { Text } from "myclinic-model/model";

const regex = /^.+[にへ]ファックス[(（][+0-9-]*[）)]で送付する/;

export function isFaxToPharmacyText(t: string): boolean {
  const m = t.match(regex);
  console.log("m", m);
  return m != null;
}

export async function confirmOnlinePresc(anchorText: Text): Promise<string | null> {
  let prevText: Text | null;
  try {
    prevText = await getPrevText(anchorText);
  } catch(e: any) {
    alert(`Failed to get previous text: ${e}.\nProceeds anyway.`);
    return null;
  }
  if( !prevText ){
    return "処方箋の入力がありません。";
  }
  if( !isPrescription(prevText.content) ){
    return "処方箋がありません。";
  }
  if( !hasOnline(prevText.content) ){
    return "処方箋に「オンライン対応」の記載がありません。";
  }
  return null;
}

async function getPrevText(text: Text): Promise<Text | null> {
  const texts = await api.listTextForVisit(text.visitId);
  const i = texts.findIndex(t => t.textId === text.textId);
  if( i >= 1 ){
    return texts[i-1];
  } else {
    return null;
  }
}

export async function getFollowingText(text: Text): Promise<Text | null> {
  const texts = await api.listTextForVisit(text.visitId);
  const i = texts.findIndex(t => t.textId === text.textId);

}

function isPrescription(content: string): boolean {
  return /^院外処方/.test(content);
}

function hasOnline(content: string): boolean {
  return /オンライン対応/.test(content);
}

export function isOnlineShohousen(content: string): boolean {
  return hasOnline(content);
}