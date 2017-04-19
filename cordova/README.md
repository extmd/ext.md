ext.md - Cordova
========================

Updating plugins
----------------

Steps needed in XCode when updating cordova sources to new version, so that share extension is back.

1. Prevent everything from src/platform/ios to be copied over Cordova generated sources, by running with `-DskipRestoreIos=true`.
2. Open the extmd Cordova project the way Cordova generated it.
3. Fix code signing by selecting the development team and provisioning profile under Build settings of the project, by typing in search "provisioning".
4. See that the project compiles and installs.
5. Add a new target to the project by clicking "extmd" next to the General tab in the project settings, and from there selecting "Add target..".
6. Select Application Extension -> Share Extension.
7. Set "extmd-share" as the product name, "Extended Mind Technologies Oy" as the organization name, and change language to Swift.
8. Change deployment target in the extmd-share target match extmd app.
9. Go to Build Settings and set values that match those done in phase 3.
10. Resurrect Bridging-Header.h file and under extmd-share -> Build Settings (select show All) -> Swift Compiler Code Generation -> Objective C Bridging Header select "$(PROJECT_DIR)/extmd-share/Bridging-Header.h".
11. Resurrect SharePreprocessor.js and add is as new source to the project.
12. Resurrect images.xcassets and add it to the share extension.
13. Select the Capabilities tab and turn on App Groups for both extmd-share and extmd.
14. Replace content in ShareViewController.swift with code from version control.
15. Replace content in info.plist with code from version control.
16. Select "Use Legacy Swift Language Version" to Yes and iOS deployment version to match main project version.
