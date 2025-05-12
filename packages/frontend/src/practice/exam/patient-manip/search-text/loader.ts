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
  offset: number = 0;
  noMoreRemoteData: boolean = false;

  constructor(text: string, patientId: number, nPerPage: number) {
    this.text = text;
    this.patientId = patientId;
    this.nPerPage = nPerPage;
  }

  async load(): Promise<[Text, Visit][]> {
    let acc: [Text, Visit][] = [];
    while( true ){
      console.log("iter");
      if( this.noMoreRemoteData ){
        break;
      }
      let fetched = await this.fetchFromRemote();
      fetched = fetched.map(([t,v]) => {
        t = Object.assign({}, t, { content: skipHikitsugi(t.content).trim()});
        return [t, v];
      })
      fetched = fetched.filter(([t, _v]) => t.content.indexOf(this.text) >= 0);
      acc.push(...fetched);
      if( acc.length >= this.nPerPage) {
        console.log("acc length", acc.length);
        break;
      }
    }
    return acc;
  }

  async fetchFromRemote(): Promise<[Text, Visit][]> {
    let result = await api.searchTextForPatient(
      this.text,
      this.patientId,
      this.nPerPage,
      this.offset,
    );
    if( result.length === 0){
      this.noMoreRemoteData = true;
    }
    this.offset += result.length;
    return result;
  }

  gotoPrev(): boolean {
    if( this.offset === 0 ){
      return false;
    } else {
      this.offset -= this.nPerPage;
      if( this.offset < 0 ){
        this.offset = 0;
      }
      return true;
    }
  }

  gotoNext(): boolean {
    if( this.noMoreRemoteData ){
      return false;
    } else {
      this.offset += this.nPerPage;
      return true;
    }
  }

  getPage(): number {
    return this.page;
  }
  
}


