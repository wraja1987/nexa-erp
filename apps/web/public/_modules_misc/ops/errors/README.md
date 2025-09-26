If using a reverse proxy in front (Nginx/Traefik), you can apply cache and CORS rules similarly.

Nginx example:
```
location ^~ /_next/static/ {
  add_header Cache-Control "public, max-age=31536000, immutable" always;
}
location ^~ /api/ {
  add_header Cache-Control "no-store" always;
  if ($http_origin ~* ^https?://(nexaai\.co\.uk|www\.nexaai\.co\.uk)$) {
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Vary Origin always;
    add_header Access-Control-Allow-Methods "GET,POST,PUT,PATCH,DELETE,OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    if ($request_method = OPTIONS) { return 204; }
  }
}
location / {
  add_header Cache-Control "s-maxage=60, stale-while-revalidate=300" always;
}
error_page 502 /errors/502.html;
error_page 503 /errors/503.html;
error_page 504 /errors/504.html;
location /errors/ {
  alias <repo>/ops/errors/;
}
```

Traefik example (headers middleware):
```
http:
  middlewares:
    api-cors:
      headers:
        accessControlAllowMethods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"]
        accessControlAllowHeaders: ["Content-Type","Authorization"]
        accessControlAllowOriginList: ["https://nexaai.co.uk","https://www.nexaai.co.uk"]
        addVaryHeader: true
```

