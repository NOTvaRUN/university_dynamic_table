import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, map, startWith, switchMap } from 'rxjs';
import {merge, Observable, of as observableOf} from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'data_table';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['fav', 'code', 'name', 'state', 'country', 'domains', 'web_pages'];
  isLoading = false;
  value = '';
  // dataSource: MatTableDataSource<any>;
  dataSource: MatTableDataSource<any>;
  @ViewChild(MatSort) sort: MatSort;
  countries: any = {};
  countriesArr: any = [];
  resultsLength = 0;
  selectedCountry = '';

  constructor(public http: HttpClient){}

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


    this.http.get<any>('http://universities.hipolabs.com/search').subscribe(resp=>{
      this.dataSource = new MatTableDataSource(resp)
      resp.map((data: any)=>{
        this.countries[data.country] = data.country;
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

  applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = function(data, filter: string): boolean {
      return data.name.toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  applyCountry(country: string){
    console.log(country);
    this.dataSource.filterPredicate = function(data, filter: string): boolean {
      return data.country.toLowerCase().includes(filter);
    };
    this.dataSource.filter = country.trim().toLowerCase();
  }
}
