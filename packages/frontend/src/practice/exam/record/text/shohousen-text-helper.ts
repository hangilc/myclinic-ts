const regex = /^.+[にへ]ファックス[(（][+0-9-]*[）)]で送付する/;

export function isFaxToPharmacyText(t: string): boolean {
  return t.match(regex) != null;
}

