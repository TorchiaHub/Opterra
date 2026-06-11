# Firebase Google Auth README Template

Use this template when a generated frontend includes optional Firebase Google sign-in. Adapt names and paths to the project.

## Firebase Google Sign-In

This app supports optional Google sign-in through Firebase Authentication. Routes remain accessible without signing in unless the product requirements explicitly add protected pages.

Sign-in is used for user-specific features such as saved data, account preferences, or personalized history. Anonymous users can still browse the app.

## 1. Create A Firebase Project

1. Go to the Firebase console.
2. Create a project or choose an existing one.
3. Add a Web app.
4. Copy the Firebase web configuration values.

## 2. Enable Google Provider

1. In Firebase, open Authentication.
2. Go to Sign-in method.
3. Enable Google.
4. Add the support email and save.

## 3. Configure Environment Variables

Create a local environment file and fill in the values from Firebase.

For Next.js:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

For Vite:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 4. Authorized Domains

In Firebase Authentication settings, add every domain that will use sign-in:

- `localhost` for local development
- Your preview deployment domain
- Your production domain

## 5. Route Access Policy

By default, this app does not block routes for signed-out users.

Use this behavior unless the product specifically requires gated pages:

- Public routes render normally.
- Account-only actions show an inline sign-in prompt.
- Save/sync/history features can require sign-in.
- Sign-out returns the user to the same public UI when possible.

## 6. Deployment Notes

Add the same environment variables to the deployment provider. Public Firebase web config values are safe to expose in client builds, but Firebase security rules and backend authorization must still enforce access to private data.
