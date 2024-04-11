import { KouhiInterface, PatientSummary, dateToSqlDate } from "./model";
import * as v from "valibot";
import * as kanjidate from "kanjidate";
import { BaseSchema, ErrorMessage, Pipe, defaultArgs, pipeResult, schemaIssue } from "valibot";

export function validationError(e: any): string {
  if (e instanceof v.ValiError) {
    return e.issues.map(issue => issue.message).join("\n");
  } else if (e instanceof Error) {
    return e.message;
  } else {
    return e.toString();
  }
}

const gengouStrings: string[] = kanjidate.GengouList.map(g => g.kanji);

const DateInputSchema = v.transform(v.object({
  gengou: v.picklist(gengouStrings, "元号のエラー。"),
  nen: v.coerce(v.number("年のエラー。", [v.minValue(1, "年の値が１以上でありません。")]), Number),
  month: v.coerce(v.number("月のエラー。", [v.minValue(1), v.maxValue(12)]), Number),
  day: v.coerce(v.number("日のエラー。", [v.minValue(1), v.maxValue(31)]), Number),
}
), (input) => {
  const y = kanjidate.fromGengou(input.gengou, input.nen);
  return new Date(y, input.month - 1, input.day);
});

export function validateDateInput(obj: any): Date {
  return v.parse(DateInputSchema, obj);
}

export interface SqlDateSchema<TInput = any, TOutput = string> extends BaseSchema<TInput, TOutput> {
  /**
   * The schema type.
   */
  type: 'string';
  /**
   * The error message.
   */
  message: ErrorMessage | undefined;
  /**
   * The validation and transformation pipeline.
   */
  pipe: Pipe<string> | undefined;
}

export function sqlDate(pipe?: Pipe<string>): SqlDateSchema;
export function sqlDate(message?: ErrorMessage, pipe?: Pipe<string>): SqlDateSchema;
export function sqlDate(arg1?: ErrorMessage | Pipe<string>, arg2?: Pipe<string>): SqlDateSchema {
  const [message, pipe] = defaultArgs(arg1, arg2);
  return {
    type: 'string',
    expects: 'sqldate',
    async: false,
    message,
    pipe,
    _parse(input, config) {
      if( typeof input === "string" ){
        if( /^\d{4}-\d{2}-\d{2}$/.test(input.trim()) ){
          return pipeResult(this, input, config);
        }
      }

      // Otherwise, return schema issue
      return schemaIssue(this, sqlDate, input, config);
    },
  };
}


const KouhiSchema = v.object({
  kouhiId: v.number(),
  futansha: v.coerce(v.number("負担者番号のエラー。"), Number),
  jukyuusha: v.coerce(v.number("受給者番号のエラー。"), Number),
  validFrom: v.coerce(v.string(), (input) => {
    if (typeof input === "string") {
      return input;
    } else if (input instanceof Date) {
      return dateToSqlDate(input);
    } else {
      return dateToSqlDate(v.parse(DateInputSchema, input));
    }
  }),
  // validFrom: v.coerce(
  //   v.string("期限開始のエラー。", [v.regex(/^\d{4}-\d{2}-\d{2}$/, "期限開始の形式エラー。")]),
  //   coerceToDate),
  validUpto: v.coerce(
    v.string([v.regex(/^((\d{4}-\d{2}-\d{2})|(0000-00-00))$/)]),
    coerceToUptoDate),
  patientId: v.number(),
  memo: v.union([v.string([v.custom(encodedJson, "メモのJSON形式エラー。")]), v.undefined_()]),
});


export function validateKouhi(obj: any): KouhiInterface {
  const kouhi: KouhiInterface = v.parse(KouhiSchema, obj);
  return kouhi;
}

const PatientSummarySchema = v.object({
  patientId: v.number(),
  content: v.string(),
});

export function validatePatientSummary(obj: any): PatientSummary {
  return v.parse(PatientSummarySchema, obj);
}

function coerceToDate(arg: unknown): unknown {
  if (arg instanceof Date) {
    return dateToSqlDate(arg);
  } else {
    return arg;
  }
}

function coerceToUptoDate(arg: unknown): unknown {
  if (arg instanceof Date) {
    return dateToSqlDate(arg);
  } else if (arg == null || arg === "") {
    return "0000-00-00";
  } else {
    return arg;
  }
}

function encodedJson(s: string): boolean {
  try {
    JSON.parse(s);
    return true;
  } catch (e) {
    return false;
  }
}
