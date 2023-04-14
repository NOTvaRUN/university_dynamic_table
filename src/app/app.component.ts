import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { StorageService } from './services/storage.service';

const ELEMENT_DATA = [
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''},
  {name: '', country: '', alpha_two_code: '', web_pages: ''}
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'data_table';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['fav',  'name', 'country', 'code', 'web_pages'];
  isLoading = false;
  value = '';
  // dataSource: MatTableDataSource<any>;
  dataSource: MatTableDataSource<any> = new MatTableDataSource(ELEMENT_DATA);
  @ViewChild(MatSort) sort: MatSort;
  countries: any = {};
  countriesArr: any = [];
  resultsLength = 0;
  selectedCountry = '';

  constructor(public http: HttpClient,
    public storage: StorageService){}

  ngOnInit(){
    this.getDataSource()
  }

  getDataSource(){
    // merge(this.sort?.sortChange, this.paginator?.page).pipe(
    //   startWith({}),
    //   switchMap(()=>{
    //     this.isLoading = true;
    //     return this.http.get<any>('http://universities.hipolabs.com/search').pipe(catchError(() => observableOf(null)));
    //   }),
    //   map(data=>{
    //     this.isLoading = false;
    //     if(data === null){
    //       return []
    //     }

    //     this.resultsLength = data.length;
    //     return data
    //   }
    // )
    // ).subscribe(data=>{
    //   console.log(data);
    // })
    this.isLoading = false;
    let favData = this.storage.getLocalStorage();

    this.http.get<any>('http://universities.hipolabs.com/search').subscribe(resp=>{
      this.isLoading = true;
      console.log(this.isLoading, resp)
      this.dataSource = new MatTableDataSource(resp)
      resp.map((data: any)=>{
        this.countries[data.country] = data.country;
        if(favData){
          if(favData.indexes[data.name]){
            data['addedFav'] = true;
          }
        }
        return data.country
      })
      this.countriesArr = Object.keys(this.countries)
      this.dataSource.paginator = this.paginator;
    })
  }

  setPagination(): void {
    const paginator = setInterval(() => {
      if (this.dataSource) {
        clearInterval(paginator);
        this.dataSource.paginator = this.paginator;
      }
    }, 100);
  }

  navigate(page: string){
    window.open(page, "_blank")
  }

  applyFilter(){
    const filterValue = this.value;
    if(!filterValue){
      if(this.selectedCountry){
        this.applyCountry(this.selectedCountry)
        return;
      }
    }
    this.dataSource.filterPredicate = (data, filter: string) => {
      if(this.selectedCountry){
        if(data.country.toLowerCase().includes(this.selectedCountry.toLowerCase())){
          return data.name.toLowerCase().includes(filter)
        }
      } else {
        return data.name.toLowerCase().includes(filter);
      }
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyCountry(country: string){
    if(!this.selectedCountry){
      if(this.value){
        this.applyFilter()
        return;
      }
    }
    this.dataSource.filterPredicate = (data, filter: string) => {
      if(this.value){
        if(data.name.toLowerCase().includes(this.value.toLowerCase())){
          return data.country.toLowerCase().includes(filter);
        } else {
          return false;
        }
      } else {
        return data.country.toLowerCase().includes(filter);
      }
    };
    this.dataSource.filter = country.trim().toLowerCase();
  }

  addFav(ele: any){
    ele['addedFav'] = true;
    this.saveLocalStorage(ele)
  } 

  saveLocalStorage(ele: any){
    let currentData = this.storage.getLocalStorage();
    console.log(currentData)
    if(!currentData){
      let favs: any = {
        indexes: {}
      }
      favs.indexes[ele['name']] = ele;
      this.storage.setLocalStorage(favs)
    } else {
      currentData.indexes[ele['name']] = ele;
      this.storage.setLocalStorage(currentData)

    }
  }

  removeFav(ele: any){
    let currentData = this.storage.getLocalStorage();
    delete currentData.indexes[ele['name']]

    ele['addedFav'] = false;

    this.storage.setLocalStorage(currentData)
  }

  public favToggled = false;
  toggleFav(){
    this.favToggled = !this.favToggled;
    if(this.favToggled){
      this.dataSource.filterPredicate = (data, filter: string) => {
        return data.addedFav
      };
      
      this.dataSource.filter = 'added'
    } else {
      this.applyFilter()
    }
  }
}
