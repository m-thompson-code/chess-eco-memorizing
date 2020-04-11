import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./dest/test/test.module').then(m => m.TestModule),
    },
    {
        path: 'practice/:id',
        loadChildren: () => import('./dest/practice/practice.module').then(m => m.PracticeModule),
    },
    {
        path: 'practice/:id/:notation',
        loadChildren: () => import('./dest/practice/practice.module').then(m => m.PracticeModule),
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        onSameUrlNavigation: 'reload'
    })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
