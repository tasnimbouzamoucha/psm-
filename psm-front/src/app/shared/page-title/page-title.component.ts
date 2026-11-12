import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb { label: string; link?: string; }

// Titre de page + fil d'Ariane (style Velzon)
@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="row">
      <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
          <h4 class="mb-sm-0">{{ title }}</h4>
          <div class="page-title-right">
            <ol class="breadcrumb m-0">
              @for (c of breadcrumbs; track c.label; let last = $last) {
                <li class="breadcrumb-item" [class.active]="last">
                  @if (c.link && !last) { <a [routerLink]="c.link">{{ c.label }}</a> } @else { {{ c.label }} }
                </li>
              }
            </ol>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PageTitleComponent {
  @Input() title = '';
  @Input() breadcrumbs: Crumb[] = [];
}
