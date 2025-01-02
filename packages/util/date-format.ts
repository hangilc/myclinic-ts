import { pad } from "./pad";
import { DateWrapper, DateWrapperLike } from "./date-util";

export const FormatDate = {
  f2(date: DateWrapperLike): string {
    return DateWrapper.from(date).render(d =>
      `${d.gengou}${d.nen}年${d.month}月${d.day}日`
    )
  },

  f5(date: DateWrapperLike): string {
    return DateWrapper.from(date).render(d =>
      `${d.gengou}${pad(d.nen, 2, "0")}年${pad(d.month, 2, "0")}月${pad(d.day, 2, "0")}日`
    )
  },

  f9(date: DateWrapperLike): string {
    return DateWrapper.from(date).render(d =>
      `${d.gengou}${d.nen}年${d.month}月${d.day}日（${d.youbi}） ${d.getAmPm()}${d.getAmPmHours()}時${d.getMinutes()}分`
    )
  },

  monthDayWeek(date: DateWrapperLike): string {
    return DateWrapper.from(date).render(d => 
      `${d.month}月${d.day}日（${d.youbi}）`
    )
  }
}