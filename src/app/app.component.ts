import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { StorageService } from './services/storage.service';
import { debounceTime, distinctUntilChanged, fromEvent, map, of, switchMap, tap, pipe } from 'rxjs';

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

  @ViewChild('uniSearchInput', {static: true}) uniSearchInput: ElementRef;
  isLoading = false;
  searchInput = '';
  dataSource: any;
  originalDataSource: any;
  countries: any = {};
  countriesArr: any = [];
  resultsLength = 0;
  selectedCountry = '';
  public pageSize: number = 10;
  public itemsOnTable: Array<any> = ELEMENT_DATA;
  public startIndex: number = 0;
  public favToggled = false;

  constructor(public http: HttpClient,
    public storage: StorageService){}

  

  ngOnInit(){
    this.getDataSource()
  }

  /**
   * init start, get the metdata and create the maps for future reference
   */
  getDataSource(){
    this.isLoading = false;
    let favData = this.storage.getLocalStorage();

    this.http.get<any>('http://universities.hipolabs.com/search').subscribe(resp=>{
      this.isLoading = true;
      this.dataSource = resp
      this.originalDataSource = [...resp]
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

      this.createCurrentTableIndex()
      this.uniSearch()


    }, (err)=>{
      alert(err.message)
      alert("retrying in ten seconds...")
      setTimeout(()=>{
        this.getDataSource();
      }, 10000)
      
    })
  }


  /**
   * common function to update the tables current index.
   */
  createCurrentTableIndex(){
    if(typeof this.pageSize == 'string'){
      this.pageSize = parseInt(this.pageSize)
    }
    this.itemsOnTable = this.dataSource.slice(this.startIndex, this.startIndex + this.pageSize);
  }

  /**
   * pagination function, to change the current page.
   * @param type where the page should be navigated to
   */
  changePage(type: string){
    switch(type){
      case "next":
        this.startIndex = this.startIndex + this.pageSize
        break;
      case "last":
        this.startIndex = this.dataSource.length - this.pageSize
        break;
      case "pageSizeChanged":
        break;
      case "previous":
        this.startIndex = this.startIndex - this.pageSize
        break;
      case "first":
        this.startIndex = 0
        break;
    }
    this.createCurrentTableIndex()

  }

  /**
   * add element to favs
   * @param ele element that needs to be added to favs
   */
  addFav(ele: any){
    ele['addedFav'] = true;
    this.saveLocalStorage(ele)
  } 

  /**
   * save element to local storage
   * @param ele element to save
   */
  saveLocalStorage(ele: any){
    let currentData = this.storage.getLocalStorage();
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

  /**
   * remove element from local storage
   * @param ele removed element
   */
  removeFav(ele: any){
    let currentData = this.storage.getLocalStorage();
    delete currentData.indexes[ele['name']]

    ele['addedFav'] = false;

    this.storage.setLocalStorage(currentData)
  }

  /**
   * toggle favorites filter
   */
  toggleFav(){
    this.favToggled = !this.favToggled;
    this.searchInput = '';
    if (this.favToggled) {
      this.dataSource = this.originalDataSource.filter((item: any)=>{
        return item.addedFav;
      })
    } else {
      this.dataSource = [...this.originalDataSource]
    }
    this.startIndex = 0;
    this.createCurrentTableIndex()
  }


  /**
   * apply country filer.
   */
  applyCountry(){
    this.dataSource = this.originalDataSource.filter((item: any)=>{
      return item.country == this.selectedCountry
    })
    this.startIndex = 0;
    this.createCurrentTableIndex()
  }

  /**
   * clear country filter
   */
  clearCountry(){
    this.dataSource = [...this.originalDataSource]
    this.startIndex = 0;
    this.createCurrentTableIndex()
  }

  /**
   * to track
   * @param index current index
   * @param uni object
   * @returns which element to track by
   */
  uniTrackBy(index:number, uni:any) {
    return uni.name;
  }

  /**
   * page to navigate to
   * @param page nav url
   */
  navigate(page: string){
    window.open(page, "_blank")
  }

  /**
   * university object search by all fields
   */
  uniSearch(){
    const search$ = fromEvent(this.uniSearchInput.nativeElement, 'keyup').pipe(
      map((event: any)=> event.target.value),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap((element: any)=>{
        return of(this.originalDataSource.filter((item: any) => {
            let input = this.searchInput.toLowerCase()
            if(item.name.toLowerCase().includes(input)){
              return true;
            } else if(item.alpha_two_code.toLowerCase().includes(input)){
              return true;
            } else if(item.country.toLowerCase().includes(input)){
              return true;
            } else if(item['state-province']?.toLowerCase().includes(input)){
              return true;
            } else if(
              item['domains'].find((item: any)=>{
                return item.toLowerCase().includes(input)
              })?.length
            ){
              return true;
            } else if( item['web_pages'].find((item: any)=>{
              return item.toLowerCase().includes(input)
            })?.length){
              return true;
            }else {
              return false;
            }
          }))
      })

    )

    search$.subscribe((data)=>{
      this.selectedCountry = '';
      this.dataSource = data
      this.startIndex = 0;
      this.createCurrentTableIndex()
    })
  }
}
