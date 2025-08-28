# Password Manager (React + TypeScript + Firebase)

### 1) Firebase setup
- Create a Firebase project in the console.
- Enable Email/Password in Authentication.
- Create a Cloud Firestore database (Start in production mode).
- Create a Storage bucket (default settings).
- Get your web app config and create a `.env` file in project root:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id
```

### 2) Firestore security rules (basic)
Adjust in Firebase console > Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /accounts/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
      allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### 3) Storage security rules (basic)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /accounts/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4) Run locally

```
npm install
npm run dev
```

Open the URL shown by Vite.

### Notes
- This demo stores passwords in plaintext in Firestore. For real use, encrypt secrets client-side before upload (e.g., Web Crypto API) and never store raw passwords.

### Deploy to Vercel
1. Push the project to a Git repo (GitHub/GitLab/Bitbucket).
2. In Vercel, import the repo.
3. Set Environment Variables in Vercel project settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Build command: `npm run build`, Output directory: `dist` (auto-detected).
5. Deploy. Client-side routing works via `vercel.json` rewrites.
