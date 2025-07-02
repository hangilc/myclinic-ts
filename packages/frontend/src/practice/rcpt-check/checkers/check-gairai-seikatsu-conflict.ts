import type { VisitEx } from "myclinic-model";
import type { CheckError } from "../check";

export async function checkGairaiSeikactsuConflict(visits: VisitEx[]): Promise<CheckError[]> {
  const checkErrors: CheckError[] = [];
  
  for (let visit of visits) {
    let hasGairaiKanriKasan = false;
    let hasSeikactsuShukanbyoKanri = false;
    
    for (let shinryou of visit.shinryouList) {
      const name = shinryou.master.name;
      
      // 外来管理加算をチェック
      if (name === "外来管理加算") {
        hasGairaiKanriKasan = true;
      }
      
      // 生活習慣病管理料をチェック（生活習慣病管理料１、生活習慣病管理料２など）
      if (name.startsWith("生活習慣病管理料")) {
        hasSeikactsuShukanbyoKanri = true;
      }
    }
    
    // 同じ診察で両方が算定されている場合はエラー
    if (hasGairaiKanriKasan && hasSeikactsuShukanbyoKanri) {
      checkErrors.push({
        code: `外来管理加算と生活習慣病管理料は同時に算定できません ${visit.visitedAt}`,
      });
    }
  }
  
  return checkErrors;
}