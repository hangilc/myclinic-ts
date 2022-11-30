import { invalid_attribute_name_character } from "svelte/internal";
import { Invalid, Valid, ValidationResult } from "../validator";

export function dateSrc(date: Date, errors: string[], prefix?: string): ValidationResult<Date> {
  const pre = prefix == undefined ? [] : [prefix];
  if( errors.length > 0 ){
    return new ValidationResult<Date>(
      errors.map(e => new Invalid(e)),
      pre
    );
  } else {
    return new ValidationResult<Date>(new Valid(date), pre);
  }
}