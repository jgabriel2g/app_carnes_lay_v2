import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ActivationEnd } from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
import { IonTabs } from "@ionic/angular/standalone";
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  standalone: true,
  imports:[
    IonicModule,
    CommonModule
  ]
})
export class MobileMenuComponent  implements OnDestroy {

  public routeStep!: number
  public routeStepSubs$ : Subscription;
  public activeFill:string ='';
    constructor(private router: Router,  private route: ActivatedRoute) {
     this.routeStepSubs$ = this.getDataRoutes()
                            .subscribe( ({route}) =>  {
                              this.routeStep = Number(route);
                              console.log(route)
                          });
     }
  ngOnDestroy(): void {
    this.routeStepSubs$.unsubscribe()
  }
  getDataRoutes(){
    return this.router.events
    .pipe(
      filter( (event:any) => event instanceof ActivationEnd),
      filter( (event: ActivationEnd)=> event.snapshot.firstChild === null  ),
      map( (event: ActivationEnd)=> event.snapshot.data  ),
    )
  };

}
