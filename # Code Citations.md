# Code Citations

## License: MIT

https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

````
## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
````

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```


## License: MIT
https://github.com/vuejs/vue-router/blob/779dc5c716f82f097b48536037c4c1d5b7505339/docs-gitbook/ru/essentials/history-mode.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*

```


## License: MIT
https://github.com/dennisreimann/uiengine/blob/6470683971605034e1908183069face5a74a6bcc/docs/deployment.md

```

## **What Was Causing the Issue:**

1. **Aggressive SPA redirect** - Your `_redirects` file was redirecting **everything** to `index.html`, including CSS and JS files
2. **Missing MIME type headers** - The server wasn't explicitly setting content types for assets

## **Fixes Applied:**

✅ **Updated `_redirects`** - Now excludes static assets from HTML redirect  
✅ **Created `netlify.toml`** - Sets explicit MIME types and cache headers for all asset types

## **Alternative Solutions:**

If you're **not using Netlify**, use the appropriate configuration for your hosting:

### **If using Vercel:**

Create `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      },
      "continue": true
    },
    {
      "src": "/.*",
      "dest": "/index.html"
    }
  ]
}
```

### **If using custom server (Nginx):**

Add to your nginx config:

```nginx
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    try_files $uri $uri/ /index.html;
}
```

### **If using Apache:**

Add to `.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## **Next Steps:**

1. \*\*Commit

```

```
