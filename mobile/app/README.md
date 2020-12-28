# mobile app

## development

start locally

```
npm start
```

### native releases

1. bump `package.json` version number
2. native:
   - iOS: click on App in Xcode > General > update **Version** and **Build** (or `ios/App/App.xcodeproj/project.pbxproj` `MARKETING_VERSION` and `CURRENT_PROJECT_VERSION`)
   - android: `android/app/build.gradle` update **versionCode** and **versionName**
3. merge to master
4. `npm run build:android:prod && npm run build:ios:prod`
5. build natively:
   - iOS: Product > Archive
   - android: Build > Generate Signed Bundle / APK > App Bundle > Release

###### screenshots

- iPhone XS Max for 6.5"
- iPhone 8+ for 5.5"
- Pixel 3

