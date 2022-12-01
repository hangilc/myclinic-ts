import { Invalid, Valid, ValidationResult } from "../validator";

export function dateSrc(
  date: Date | null | undefined,
  errors: Invalid[]
): ValidationResult<Date | null> {
  if (date === undefined || errors.length > 0) {
    return new ValidationResult<Date>(
      errors.length === 0 ? [new Invalid("Unknown error")] : errors
    );
  } else {
    return new ValidationResult<Date | null>(new Valid(date));
  }
}
