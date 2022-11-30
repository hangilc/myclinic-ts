import { Invalid, Valid, ValidationResult } from "../validator";

export function dateSrc(
  date: Date | null | undefined,
  errors: string[],
  prefix?: string
): ValidationResult<Date | null> {
  const pre = prefix == undefined ? [] : [prefix];
  if (date === undefined || errors.length > 0) {
    return new ValidationResult<Date>(
      (errors.length === 0 ? ["Unknown error"] : errors).map(
        (e) => new Invalid(e)
      ),
      pre
    );
  } else {
    return new ValidationResult<Date | null>(new Valid(date), pre);
  }
}
