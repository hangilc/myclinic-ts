import { DateWrapper } from "myclinic-util";

export function 使用期限年月日Rep(kigen: string): string {
  return DateWrapper.fromOnshiDate(kigen).render(d => 
    `${d.gengou}${d.nen}年${d.month}月${d.day}日`
  )
}