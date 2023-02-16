import { ColumnData } from "@/appoint/column-data";
import Column from "@/appoint/Column.svelte";
import { ClinicOperation } from "myclinic-model";
import { ClinicOperationCode } from "myclinic-model/model";
import { mkColumnData } from "./column-helper";

describe("Column (appoint)", () => {
  it("should mount", () => {
    cy.mount(Column, {
      props: {
        data: mkColumnData()
      }
    })
  });

  it("should have appoints", () => {
    cy.mount(Column, { props: {
      data: mkColumnData()
    }});
  })
})