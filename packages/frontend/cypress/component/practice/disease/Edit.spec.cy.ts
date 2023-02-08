import { base } from "@/lib/api";
import Edit from "@/practice/exam/disease2/edit/Edit.svelte";
import { dialogClose, dialogOpen } from "@cypress/lib/dialog";
import { assertDateForm, fillDateForm } from "@cypress/lib/form";
import { ByoumeiMaster, Disease, DiseaseAdj, DiseaseData, DiseaseEndReason, ShuushokugoMaster } from "myclinic-model";

describe("Edit Disease", () => {
  let suspMaster = new ShuushokugoMaster(8002, "の疑い");

  it("should mount", () => {
    cy.mount(Edit, {
      props: {
        diseases: []
      }
    })
  })

  it("should show diseases", () => {
    const diseases = [
      new DiseaseData(
        new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
        new ByoumeiMaster(1, "急性咽頭炎"),
        [
          [new DiseaseAdj(1, 1, 8002), new ShuushokugoMaster(8002, "の疑い")]
        ]
      )
    ];
    cy.mount(Edit, {
      props: {
        diseases
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").contains("急性咽頭炎の疑い");
    cy.get("[data-cy=disease-aux][data-disease-id=1]").contains("(継続、R4.2.1)");
  })

  it("should show edit form after clicking", () => {
    const diseases = [
      new DiseaseData(
        new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
        new ByoumeiMaster(1, "急性咽頭炎"),
        [
          [new DiseaseAdj(1, 1, 8002), suspMaster]
        ]
      )
    ];
    cy.mount(Edit, {
      props: {
        diseases
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").click();
    cy.get("[data-cy=disease-edit-form]").within(() => {
      cy.get("[data-cy=disease-name]").contains("急性咽頭炎の疑い");
      cy.get("[data-cy=start-date-input]").within(() => assertDateForm("2022-02-01"));
      cy.get("[data-cy=end-date-input]").within(() => assertDateForm("0000-00-00"));
      cy.get("[data-cy=end-reason-input]:checked")
        .should("have.attr", "data-reason-code", "N")
    });
  })

  it("should delete disease", () => {
    const diseases = [
      new DiseaseData(
        new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N"),
        new ByoumeiMaster(1, "急性咽頭炎"),
        [
          [new DiseaseAdj(1, 1, 8002), new ShuushokugoMaster(8002, "の疑い")]
        ]
      )
    ];
    let deleted = false;
    cy.mount(Edit, {
      props: {
        diseases,
        onDelete: (diseaseId: number) => {
          expect(diseaseId).equal(1);
        }
      }
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").click();
    console.log("base", base);
    cy.intercept(base + "/delete-disease-ex?*", (req) => {
      console.log("INTERCEPT");
      expect(req.query["disease-id"]).equal("1");
      deleted = true;
      req.reply("true");
    })
    cy.get("[data-cy=delete-link]").click();
    dialogOpen("確認").within(() => {
      cy.get("[data-cy=text]").contains("この病名を削除していいですか？");
      cy.get("button").contains("はい").click();
    })
    dialogClose("確認");
    cy.wrap({}).then(() => expect(deleted).equal(true));
  })

  it("should edit byoumeimaster of disease", () => {
    const origMaster = new ByoumeiMaster(1, "急性咽頭炎");
    const updatedMaster = new ByoumeiMaster(2, "急性気管支炎")
    const origDisease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N");
    const updatedDisease = new Disease(1, 1, 2, "2022-02-01", "0000-00-00", "N");
    const adj = new DiseaseAdj(1, 1, 8002);
    const adjMaster = new ShuushokugoMaster(8002, "の疑い");
    const diseases = [
      new DiseaseData(origDisease, origMaster, [[adj, adjMaster]])
    ];
    const entered = new Cypress.Promise((resolve, reject) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          },
        }
      });
    });
    cy.get("[data-cy=disease-name][data-disease-id=1]").click();
    cy.get("[data-cy=disease-search-input]").type(updatedMaster.name);
    cy.intercept(base + "/search-byoumei-master*", (req) => {
      req.reply([updatedMaster]);
    });
    cy.get("button").contains("検索").click();
    cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains(updatedMaster.name).click();
    cy.get("[data-cy=disease-name]").contains(updatedMaster.name + "の疑い");
    cy.intercept("POST", base + "/update-disease-ex", (req) => {
      const [disease, adjCodes] = JSON.parse(req.body);
      expect(disease).deep.equal(updatedDisease);
      expect(adjCodes).deep.equal([adjMaster.shuushokugocode]);
      req.reply("true");
    }).as("update")
    cy.intercept(base + "/get-disease-ex?*", (req) => {
      const diseaseId = req.query["disease-id"]
      expect(diseaseId).equal("1");
      req.reply([
        updatedDisease,
        updatedMaster,
        [
          [adj, adjMaster]
        ]
      ]);
    }).as("query");
    cy.get("button").contains("入力").click();
    cy.get("@update");
    cy.get("@query", { timeout: 10000 });
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(updatedDisease);
      expect(entered.byoumeiMaster).deep.equal(updatedMaster);
      expect(entered.adjList).deep.equal([[adj, adjMaster]]);
    });
  })

  it("should add shuushokugo", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N");
    const updatedAdj = new DiseaseAdj(1, 1, 8002);
    const updatedAdjMaster = new ShuushokugoMaster(8002, "の疑い");
    const diseases = [new DiseaseData(disease, master, [])];
    const entered = new Cypress.Promise((resolve) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          }
        }
      });
    })
    clickDisease(1);
    clickShuushokugoSearchMode();
    enterSearchText(updatedAdjMaster.name);
    interceptShuushokugoSearch(
      (text, at) => {
        expect(text).equal(updatedAdjMaster.name);
        expect(at).equal("2022-02-01");
      },
      [updatedAdjMaster]
    ).as("search");
    clickSearch();
    cy.wait("@search");
    clickSearchResult(updatedAdjMaster.name);
    assertDiseaseName(master.name + updatedAdjMaster.name);
    interceptUpdateDisease((disease, adjCodes) => {
      expect(disease).deep.equal(disease);
      expect(adjCodes).deep.equal([updatedAdjMaster.shuushokugocode]);
    }).as("update");
    interceptGetDiseaseEx(
      diseaseId => { expect(diseaseId).equal(disease.diseaseId) },
      [
        disease,
        master,
        [[updatedAdj, updatedAdjMaster]]
      ]
    ).as("get")
    clickEnter();
    cy.wait(["@update", "@get"]);
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(disease);
      expect(entered.byoumeiMaster).deep.equal(master);
      expect(entered.adjList).deep.equal([[updatedAdj, updatedAdjMaster]]);
    });
  })

  it("should change start date", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N");
    const updatedDate = "2022-01-27";
    const updatedDisease = Object.assign({}, disease, {
      startDate: updatedDate
    })
    const diseases = [new DiseaseData(disease, master, [])];
    const entered = new Cypress.Promise((resolve) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          }
        }
      });
    })
    clickDisease(1);
    fillStartDate(updatedDate);
    interceptUpdateDisease((disease, adjCodes) => {
      expect(disease).deep.equal(updatedDisease);
      expect(adjCodes).deep.equal([]);
    }).as("update");
    interceptGetDiseaseEx(
      diseaseId => { expect(diseaseId).equal(disease.diseaseId) },
      [
        updatedDisease,
        master,
        []
      ]
    ).as("get")
    clickEnter();
    cy.wait(["@update", "@get"]);
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(updatedDisease);
      expect(entered.byoumeiMaster).deep.equal(master);
      expect(entered.adjList).deep.equal([]);
    })
  })

  it("should change end date", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N");
    const updatedDate = "2022-02-08";
    const updatedDisease = Object.assign({}, disease, {
      endDate: updatedDate
    })
    const diseases = [new DiseaseData(disease, master, [])];
    const entered = new Cypress.Promise((resolve) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          }
        }
      });
    })
    clickDisease(1);
    fillEndDate(updatedDate);
    interceptUpdateDisease((disease, adjCodes) => {
      expect(disease).deep.equal(updatedDisease);
      expect(adjCodes).deep.equal([]);
    }).as("update");
    interceptGetDiseaseEx(
      diseaseId => { expect(diseaseId).equal(disease.diseaseId) },
      [
        updatedDisease,
        master,
        []
      ]
    ).as("get")
    clickEnter();
    cy.wait(["@update", "@get"]);
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(updatedDisease);
      expect(entered.byoumeiMaster).deep.equal(master);
      expect(entered.adjList).deep.equal([]);
    })
  })

  it("should change end reason to cured", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N");
    let updatedEndReason = "C";
    const updatedDisease = Object.assign({}, disease, {
      endReasonStore: updatedEndReason
    })
    const diseases = [new DiseaseData(disease, master, [])];
    const entered = new Cypress.Promise((resolve) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          }
        }
      });
    });
    clickDisease(1);
    clickEndReason(updatedEndReason);
    interceptUpdateDisease((disease, adjCodes) => {
      expect(disease).deep.equal(updatedDisease);
      expect(adjCodes).deep.equal([]);
    }).as("update");
    interceptGetDiseaseEx(
      diseaseId => { expect(diseaseId).equal(disease.diseaseId) },
      [
        updatedDisease,
        master,
        []
      ]
    ).as("get")
    clickEnter();
    cy.wait(["@update", "@get"]);
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(updatedDisease);
      expect(entered.byoumeiMaster).deep.equal(master);
      expect(entered.adjList).deep.equal([]);
    })
  })

  it("should change end reason to stopped", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N");
    let updatedEndReason = "S";
    const updatedDisease = Object.assign({}, disease, {
      endReasonStore: updatedEndReason
    })
    const diseases = [new DiseaseData(disease, master, [])];
    const entered = new Cypress.Promise((resolve) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          }
        }
      });
    });
    clickDisease(1);
    clickEndReason(updatedEndReason);
    interceptUpdateDisease((disease, adjCodes) => {
      expect(disease).deep.equal(updatedDisease);
      expect(adjCodes).deep.equal([]);
    }).as("update");
    interceptGetDiseaseEx(
      diseaseId => { expect(diseaseId).equal(disease.diseaseId) },
      [
        updatedDisease,
        master,
        []
      ]
    ).as("get")
    clickEnter();
    cy.wait(["@update", "@get"]);
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(updatedDisease);
      expect(entered.byoumeiMaster).deep.equal(master);
      expect(entered.adjList).deep.equal([]);
    })
  })

  it("should change end reason to dead", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "N");
    let updatedEndReason = "D";
    const updatedDisease = Object.assign({}, disease, {
      endReasonStore: updatedEndReason
    })
    const diseases = [new DiseaseData(disease, master, [])];
    const entered = new Cypress.Promise((resolve) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          }
        }
      });
    });
    clickDisease(1);
    clickEndReason(updatedEndReason);
    interceptUpdateDisease((disease, adjCodes) => {
      expect(disease).deep.equal(updatedDisease);
      expect(adjCodes).deep.equal([]);
    }).as("update");
    interceptGetDiseaseEx(
      diseaseId => { expect(diseaseId).equal(disease.diseaseId) },
      [
        updatedDisease,
        master,
        []
      ]
    ).as("get")
    clickEnter();
    cy.wait(["@update", "@get"]);
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(updatedDisease);
      expect(entered.byoumeiMaster).deep.equal(master);
      expect(entered.adjList).deep.equal([]);
    })
  })

  it("should change end reason to not ended", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "C");
    let updatedEndReason = "N";
    const updatedDisease = Object.assign({}, disease, {
      endReasonStore: updatedEndReason
    })
    const diseases = [new DiseaseData(disease, master, [])];
    const entered = new Cypress.Promise((resolve) => {
      cy.mount(Edit, {
        props: {
          diseases,
          onUpdate: (updated: DiseaseData) => {
            resolve(updated);
          }
        }
      });
    });
    clickDisease(1);
    clickEndReason(updatedEndReason);
    interceptUpdateDisease((disease, adjCodes) => {
      expect(disease).deep.equal(updatedDisease);
      expect(adjCodes).deep.equal([]);
    }).as("update");
    interceptGetDiseaseEx(
      diseaseId => { expect(diseaseId).equal(disease.diseaseId) },
      [
        updatedDisease,
        master,
        []
      ]
    ).as("get")
    clickEnter();
    cy.wait(["@update", "@get"]);
    cy.wrap(entered).then((entered: any) => {
      expect(entered.disease).deep.equal(updatedDisease);
      expect(entered.byoumeiMaster).deep.equal(master);
      expect(entered.adjList).deep.equal([]);
    })
  })

  it("should add susp", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "C");
    const diseases = [new DiseaseData(disease, master, [])];
    cy.mount(Edit, {
      props: {
        diseases,
        onUpdate: (updated: DiseaseData) => {
        }
      }
    });
    clickDisease(1);
    clickAddSuspLink();
    assertDiseaseName(master.name + "の疑い")
  })

  it("should remove adj", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "C");
    const adj = new DiseaseAdj(1, 1, 8002);
    const adjMaster = new ShuushokugoMaster(8002, "の疑い");
    const diseases = [new DiseaseData(disease, master, [[adj, adjMaster]])];
    cy.mount(Edit, {
      props: {
        diseases,
        onUpdate: (updated: DiseaseData) => {
        }
      }
    });
    clickDisease(1);
    clickDeleteAdjLink();
    assertDiseaseName(master.name)
  })

  it("should cancel", () => {
    const master = new ByoumeiMaster(1, "急性咽頭炎");
    const disease = new Disease(1, 1, 1, "2022-02-01", "0000-00-00", "C");
    const adj = new DiseaseAdj(1, 1, 8002);
    const adjMaster = new ShuushokugoMaster(8002, "の疑い");
    const diseases = [new DiseaseData(disease, master, [[adj, adjMaster]])];
    cy.mount(Edit, {
      props: {
        diseases,
      }
    });
    clickDisease(1);
    clickCancelLink();
    asssertNoDiseaseSelected();
  })
});

function interceptShuushokugoSearch(
  callback: (text: string, at: string) => void,
  result: ShuushokugoMaster[]
) {
  return cy.intercept(base + "/search-shuushokugo-master*", (req) => {
    const query = req.query;
    callback(query["text"] as string, query["at"] as string);
    req.reply(result);
  })
}

function interceptUpdateDisease(
  callback: (disease: Disease, adjCodes: number[]) => void
) {
  return cy.intercept("POST", base + "/update-disease-ex", (req) => {
    const [disease, adjCodes] = JSON.parse(req.body);
    callback(disease, adjCodes);
    req.reply("true");
  });
}

function interceptGetDiseaseEx(callback: (diseaseId: number) => void,
  result: [Disease, ByoumeiMaster, [DiseaseAdj, ShuushokugoMaster][]]) {
  return cy.intercept(base + "/get-disease-ex?*", (req) => {
    const diseaseId = req.query["disease-id"]
    callback(+diseaseId);
    req.reply(result);
  })
}

function clickDisease(diseaseId: number) {
  return cy.get("[data-cy=disease-name][data-disease-id=1]").click();
}

function clickShuushokugoSearchMode() {
  return cy.get("[data-cy=search-shuushokugo-checkbox]").click();
}

function enterSearchText(text: string) {
  return cy.get("[data-cy=disease-search-input]").clear().type(text);
}

function clickSearch() {
  return cy.get("button").contains("検索").click();
}

function clickSearchResult(text: string) {
  return cy.get("[data-cy=search-result] [data-cy=search-result-item]").contains(text).click();
}

function assertDiseaseName(name: string) {
  cy.get("[data-cy=disease-edit-form] [data-cy=disease-name]").should("have.text", name);
}

function asssertNoDiseaseSelected() {
  cy.get("[data-cy=no-disease-selected]");
}

function clickEnter() {
  return cy.get("button").contains("入力").click();
}

function fillStartDate(date: string | Date) {
  cy.get("[data-cy=start-date-input]").within(() => fillDateForm(date))
}

function fillEndDate(date: string | Date) {
  cy.get("[data-cy=end-date-input]").within(() => fillDateForm(date))
}

function clickEndReason(reason: string) {
  cy.get(`[data-cy=end-reason-input][data-reason-code=${reason}]`).click();
}

function clickAddSuspLink() {
  cy.get("[data-cy=susp-link]").click();
}

function clickDeleteAdjLink() {
  cy.get("[data-cy=delete-adj-link]").click();
}

function clickCancelLink() {
  cy.get("[data-cy=cancel-link]").click();
}

