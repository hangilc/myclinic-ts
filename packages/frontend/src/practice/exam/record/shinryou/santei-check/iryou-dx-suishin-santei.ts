import type { VisitEx } from "myclinic-model";
import { listShinryouOfRecentMonths, shinryouListIncludes } from "./santei-check-helper";
import type { ShinryouCheckProc } from "./record-shinryou-types";

const name医療ＤＸ推進体制整備加算１ = "医療ＤＸ推進体制整備加算１（初診）";
const name医療ＤＸ推進体制整備加算２ = "医療ＤＸ推進体制整備加算２（初診）";
const name医療ＤＸ推進体制整備加算３ = "医療ＤＸ推進体制整備加算３（初診）";
const code医療ＤＸ推進体制整備加算１ = 111703470;
const code医療ＤＸ推進体制整備加算２ = 111703570;
const code医療ＤＸ推進体制整備加算３ = 111703370;

export async function adaptToShoshinForIryouDxSuishin(visit: VisitEx, checked: boolean,
  dxKasanLevel: number | undefined)
	: Promise<ShinryouCheckProc[]> {
	  if (checked) {
        let code = 0;
        let name = "";
        if( dxKasanLevel === 1 ){
          code = code医療ＤＸ推進体制整備加算１;
          name = name医療ＤＸ推進体制整備加算１;
        } else if( dxKasanLevel === 2 ){
          code = code医療ＤＸ推進体制整備加算２;
          name = name医療ＤＸ推進体制整備加算２;
        } else if( dxKasanLevel === 3 ){
          code = code医療ＤＸ推進体制整備加算３;
          name = name医療ＤＸ推進体制整備加算３;
        }
        if( code && name ){
		  let shinryouList = await listShinryouOfRecentMonths(visit, 1);
		  if (!shinryouListIncludes(shinryouList, code)) {
		    return [{ name, check: true }];
		  } else {
		    return [{ name, check: false }];
		  }
        } else {
          return [];
        }
	  } else {
		return [
		  { name: name医療ＤＸ推進体制整備加算１, check: false },
		  { name: name医療ＤＸ推進体制整備加算２, check: false },
		  { name: name医療ＤＸ推進体制整備加算３, check: false },
		];
	  }
    }
