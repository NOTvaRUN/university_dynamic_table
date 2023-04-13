import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  setLocalStorage(data: any){
    localStorage.setItem('storage', btoa(JSON.stringify(data)));
  }

  getLocalStorage(){
    let d: any = localStorage.getItem('storage')
    if(!d) {
      return false;
    }
    return JSON.parse(atob(d));
  }
}
