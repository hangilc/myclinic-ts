import { Patient } from "myclinic-model";
import type { OnshiResult } from "onshi-result";
import type { ResultItem } from "onshi-result/ResultItem";
import { convertHankakuKatakanaToZenkakuHiragana } from "./zenkaku";

export function onshiToPatient(onshi: OnshiResult): Patient {
  const resultItem: ResultItem = onshi.resultList[0];
  const { lastName, firstName, lastNameYomi, firstNameYomi } = getName(resultItem);
  const sex = resultItem.sex === "男" ? "M" : "F";
  const birthday = resultItem.birthdate;
  const phone = "";
  const address = resultItem.address ?? "";
  const memo = undefined;
  return new Patient(
    0,
    lastName,
    firstName,
    lastNameYomi,
    firstNameYomi,
    sex,
    birthday,
    address,
    phone,
    memo,
  );
}


function getName(resultItem: ResultItem): { lastName: string, firstName: string, lastNameYomi: string, firstNameYomi: string } {
  const name = resultItem.name;
  const kana = resultItem.nameKana;
  const n = splitName(name);
  const y = kana ? splitYomi(kana) : { lastNameYomi: "", firstNameYomi: "" };
  return Object.assign({}, n, y);
}

function splitName(name: string): { lastName: string, firstName: string } {
  let i = name.indexOf("　");
  if (i < 0) {
    i = name.indexOf(" ");
  }
  if (i > 0) {
    return {
      lastName: name.substring(0, i),
      firstName: name.substring(i + 1)
    }
  } else {
    return {
      lastName: name,
      firstName: "",
    }
  }
}

function splitYomi(kana: string): { lastNameYomi: string, firstNameYomi: string } {
  let i = kana.indexOf(" ");
  if( i > 0 ){
    return {
      lastNameYomi: convertHankakuKatakanaToZenkakuHiragana(kana.substring(0, i)),
      firstNameYomi: convertHankakuKatakanaToZenkakuHiragana(kana.substring(i+1)),
    }
  } else {
    return {
      lastNameYomi: kana,
      firstNameYomi: "",
    }
  }
}

