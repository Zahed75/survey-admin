import { HttpInterceptorFn } from '@angular/common/http';
import {  environmentCentral } from '../../enviornments/enviornment';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environmentCentral.apiBaseUrl;

  // Prepend the base URL only if the URL is relative
  const modifiedReq = req.url.startsWith('http')
      ? req
      : req.clone({ url: `${apiUrl}/${req.url}` });

  return next(modifiedReq);
};
