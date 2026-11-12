import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="container-fluid">
        <div class="row">
          <div class="col-sm-6">{{ year }} © Projects Manager (PSM)</div>
          <div class="col-sm-6"><div class="text-sm-end d-none d-sm-block">SmartSoft Solutions — Spring Boot &amp; Angular</div></div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}
