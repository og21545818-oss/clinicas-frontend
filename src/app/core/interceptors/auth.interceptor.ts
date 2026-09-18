import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  const esPeticionAuth =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/registro');

  if (token && !esPeticionAuth) {
    const requestConToken = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(requestConToken);
  }

  return next(req);
};