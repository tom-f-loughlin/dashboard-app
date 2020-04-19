import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { PostsComponent } from './pages/posts/posts.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PermissionsResolver } from 'src/app/shared/resolvers/permission.resolver';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    PostsComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule,
    HttpClientModule
  ],
  providers: [PermissionsResolver],
  bootstrap: [AppComponent]
})
export class AppModule { }
