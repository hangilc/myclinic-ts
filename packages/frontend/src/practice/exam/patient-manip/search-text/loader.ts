import api from "@/lib/api";
import type { Text, Visit } from "myclinic-model";
import { skipHikitsugi } from "../../record/text/hikitsugi";

export interface Loader {
  load(): Promise<[Text, Visit][]>;
  gotoPrev(): boolean;
  gotoNext(): boolean;
  getPage(): number;
}

export class SimpleLoader implements Loader {
  text: string;
  patientId: number;
  page: number = 0;
  nPerPage: number;
  totalPages: number;

  constructor(text: string, patientId: number, nPerPage: number, totalPages: number) {
    this.text = text;
    this.patientId = patientId;
    this.nPerPage = nPerPage;
    this.totalPages = totalPages;
  }

  load(): Promise<[Text, Visit][]> {
    return api.searchTextForPatient(
      this.text,
      this.patientId,
      this.nPerPage,
      this.nPerPage * this.page
    );
  }

  gotoPrev(): boolean {
    if( this.page > 0 ){
      this.page -= 1;
      return true;
    } else {
      return false;
    }
  }
  
  gotoNext(): boolean {
    console.log("enter gotoNext", this.page, this.totalPages);
    if( this.totalPages <= 1 || this.page === (this.totalPages - 1) ){
      return false;
    } else {
      this.page += 1;
      console.log("returning true");
      return true;
    }
  }

  getPage(): number {
    return this.page+1;
  }
}

export class SkipLoader implements Loader {
  text: string;
  patientId: number;
  pageOffsets: number[] = [];
  page: number = 0;
  nPerPage: number;

  constructor(text: string, patientId: number, nPerPage: number) {
    this.text = text;
    this.patientId = patientId;
    this.nPerPage = nPerPage;
  }

  async load(): Promise<[Text, Visit][]> {
    if( !(this.page <= this.pageOffsets.length ) ){
      let p = this.page;
      let l = this.pageOffsets.length;
      throw new Error(`should not happen page: ${p}, offsets.length: ${l}`);
    }
    let offset: number;
    let limit: number;
    if( this.page === 0 ){
      offset = 0;
    } else {
      offset = this.pageOffsets[this.page - 1];
    }
    if( this.page === this.pageOffsets.length ){
      limit = this.nPerPage;
    } else {
      limit = this.pageOffsets[this.page] - offset;
    }
    console.log("offset:limit", offset, limit);
    let acc: [Text, Visit][] = [];
    let iter = 0;
    outer: while( true ){
      let fetched = await this.fetchFromRemote(offset, limit);
      const eof = fetched.length < limit;
      for(let [t, v] of fetched) {
        offset += 1;
        let c = t.content;
        c = skipHikitsugi(c).trim();
        if( c.indexOf(this.text) >= 0 ){
          acc.push([Object.assign({}, t, { content: c}), v]);
          if( acc.length === this.nPerPage ){
            if( this.page === this.pageOffsets.length ){
              this.pageOffsets.push(offset);
              break outer;
            }
            
          }
        }
      }
      if( eof ){
        break;
      }
      if( ++iter > 60 ){
        throw new Error("too many iteration");
      }
    }
    return acc;
  }

  async fetchFromRemote(offset: number, limit: number): Promise<[Text, Visit][]> {
    return await api.searchTextForPatient(
      this.text,
      this.patientId,
      limit,
      offset,
    );
  }

  gotoPrev(): boolean {
    if( this.page === 0 ){
      return false;
    } else {
      this.page -= 1;
      return true;
    }
  }

  gotoNext(): boolean {
    if( this.page < this.pageOffsets.length ){
      this.page += 1;
      return true;
    } else {
      return false;
    }
  }

  getPage(): number {
    return this.page + 1;
  }
  
}


