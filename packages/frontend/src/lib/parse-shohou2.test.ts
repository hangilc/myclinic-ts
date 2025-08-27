import { describe, expect, it } from "vitest";
import { _reAmount, _reUneven } from "./parse-shohou2";

describe("parse-shohou2", () => {
  it("should parse amount", () => {
    let m = _reAmount.exec("１錠");
    expect(m).not.toBeNull();
    if( m ){
      expect(m[2]).equals("１");
      expect(m[3]).equals("錠");
    }
    m = _reAmount.exec("１回１錠");
    expect(m).not.toBeNull();
    if( m ){
      expect(m[2]).equals("１");
      expect(m[3]).equals("錠");
    }
    m = _reAmount.exec("ロキソニン錠６０ｍｇ　１回１錠");
    expect(m).not.toBeNull();
    if( m ){
      expect(m[2]).equals("１");
      expect(m[3]).equals("錠");
    }
  });

  it("should parse uneven", () => {
    // let re = new RegExp(_reUneven);
    let m = _reAmount.exec("プレドニン錠５ｍｇ　６錠（３－２－１）");
    expect(m).not.toBeNull();
    if( m ){
      expect(m[4]).toBe("（３－２－１）");
    }
    
  });
})


