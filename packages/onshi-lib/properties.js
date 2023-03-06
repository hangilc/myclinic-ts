/**
 * オンライン資格確認結果のヘッダー部分を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { JSON } header
 */
function onshiHeader(onshi) {
  return onshi.XmlMsg.MessageHeader;
}

/**
 * オンライン資格確認結果のボディ部分を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { JSON } body
 */
function onshiBody(onshi) {
  return onshi.XmlMsg.MessageBody;
}

/**
 * オンライン資格確認結果の資格有効性（OQSCD006）を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { string } 資格有効性 （有効ならば "1")
 */
function onshiValidity(onshi) {
  return onshiBody(onshi).QualificationValidity;
}

/**
 * オンライン資格確認結果の有効な場合の内容を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { JSON } 有効な結果
 */
function onshiValidResult(onshi) {
  onshiBody(onshi).ResultList[0].ResultOfQualificationConfirmation;
}

/**
 * オンライン資格確認結果の有効な場合の保険者番号を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { string } 保険者番号
 */
function onshiHokenshaBangou(onshi) {
  return onshiValidResult(onshi).InsurerNumber;
}

/**
 * オンライン資格確認結果の有効な場合の被保険者記号を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { string } 被保険者記号
 */
function onshiHihokenhsaKigou(onshi) {
  return onshiValidResult(onshi).InsuredCardSymbol ?? "";
}

/**
 * オンライン資格確認結果の有効な場合の被保険者番号を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { string } 被保険者番号
 */
function onshiHihokenhsaBangou(onshi) {
  return onshiValidResult(onshi).InsuredIdentificationNumber ?? "";
}

/**
 * オンライン資格確認結果の有効な場合の枝番を返す
 * @param { JSON } onshi - オンライン資格確認結果 (onshiSearch の出力)
 * @returns { string } 枝番
 */
function onshiHihokenhsaEdaban(onshi) {
  return onshiValidResult(onshi).InsuredBranchNumber ?? "";
}

module.exports = {
  onshiHeader, 
  onshiBody,
  onshiValidity,
  onshiValidResult,
  onshiHokenshaBangou,
  onshiHihokenhsaKigou,
  onshiHihokenhsaBangou,
  onshiHihokenhsaEdaban,
}