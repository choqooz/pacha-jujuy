import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS } from '@angular/forms';

function verificarFormatoEmail(c: AbstractControl) {

  if (c.value == null) return null;
  if (/^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/.test(c.value) == false) {
    return { formatoEmail: true }
  }
  return null;
}

@Directive({
  selector: '[formato-email]',
  providers: [
    { provide: NG_VALIDATORS, multi: true, useValue: verificarFormatoEmail }
  ]

})
export class FormatoEmail {

  constructor() { }

}
