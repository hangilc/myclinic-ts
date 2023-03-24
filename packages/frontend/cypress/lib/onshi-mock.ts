import type { OnshiKakuninQuery } from "@/lib/onshi-confirm";
import { OnshiResult } from "onshi-result";
import { MessageBody } from "onshi-result/dist/MessageBody";
import { MessageHeader } from "onshi-result/dist/MessageHeader";
import { XmlMsg } from "onshi-result/dist/XmlMsg";
import { fromSqlDateTime } from "onshi-result/util";

export function mockSuccessResult(q: OnshiKakuninQuery): OnshiResult {
  const messageHeader = new MessageHeader({
    ProcessExecutionTime: fromSqlDateTime(toSqlDate(new Date())),
    QualificationConfirmationDate: froSqlDate(q.confirmationDate),
    MedicalInstitutionCode: "1234567",
  });
  const messageBody = new MessageBody();  
  const xmlMsg = new XmlMsg(messageHeader, messageBody);
  const origJson: object = {
    
  }
  return new OnshiResult(xmlMsg, origJson);
}