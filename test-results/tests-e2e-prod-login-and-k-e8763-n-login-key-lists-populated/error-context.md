# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - generic [ref=e6]:
      - img "Nexa" [ref=e8]
      - heading "Sign in to Nexa ERP" [level=1] [ref=e9]
      - paragraph [ref=e10]: Manage your business with the Nexa AI Engine
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]: Email address
        - textbox "you@company.com" [ref=e14]
      - generic [ref=e15]:
        - generic [ref=e16]: Password
        - textbox "••••••••" [ref=e17]
        - link "Forgot password?" [ref=e19] [cursor=pointer]:
          - /url: /forgot-password
      - button "Sign in" [ref=e20] [cursor=pointer]
    - generic [ref=e23]: or continue with
    - generic [ref=e25]:
      - button "Continue with Google" [ref=e26] [cursor=pointer]:
        - generic [ref=e27]: Google
      - button "Continue with Microsoft" [ref=e28] [cursor=pointer]:
        - generic [ref=e29]: Microsoft
    - paragraph [ref=e30]: © Nexa ERP — All rights reserved
  - alert [ref=e31]
```