import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: string, args: string): unknown {

    if(!args) return value;
    const re = new RegExp("("+args+")", 'igm');
    value= value.replace(re, '<span class="highlighted-text">$1</span>');

    return value;
  }

}
