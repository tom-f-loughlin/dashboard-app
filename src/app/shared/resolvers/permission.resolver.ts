import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';

// For correct implementation accessible routes need to be nested
@Injectable()
export class PermissionsResolver implements Resolve<any> {
    constructor(private auth: AuthService) { }

    resolve(route: ActivatedRouteSnapshot): Observable<boolean> {
        return this.auth.isLoggedIn$.pipe(first());
    }
}