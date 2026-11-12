import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  info = '';
  showPassword = false;
  year = new Date().getFullYear();

  constructor(private fb: FormBuilder, private auth: AuthService,
              private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    const q = this.route.snapshot.queryParamMap;
    if (q.get('expired')) this.info = 'Votre session a expiré, reconnectez-vous.';
    if (q.get('registered')) this.info = 'Inscription réussie ! Vous pouvez vous connecter.';
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.auth.login(this.loginForm.value).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        this.error = err.status === 0
          ? 'Serveur injoignable. Spring Boot est-il démarré ?'
          : (err.error?.message ?? 'Email ou mot de passe incorrect');
      }
    });
  }
}
