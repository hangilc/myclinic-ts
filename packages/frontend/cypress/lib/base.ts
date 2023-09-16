import { getBase } from "@/lib/api";

export function apiBase(): string {
  switch(Cypress.testingType) {
    case "e2e": return Cypress.env("baseUrl");
    // case "e2e": return Cypress.env("API");
    case "component": return getBase();
    default: return "";
  }
}