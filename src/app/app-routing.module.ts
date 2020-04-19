import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from 'src/app/pages/home/home.component';
import { LoginComponent } from 'src/app/pages/login/login.component';
import { PostsComponent } from 'src/app/pages/posts/posts.component';
import { PermissionsResolver } from 'src/app/shared/resolvers/permission.resolver';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    resolve: { writePermission: PermissionsResolver },
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  // Todo nested routes
  {
    path: 'posts',
    component: PostsComponent,
    resolve: { writePermission: PermissionsResolver },
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
