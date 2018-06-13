# ext.md – minimal task and note organizer

2017 Extended Mind Technologies Oy.

All Rights Reserved.

All information contained herein is, and remains the property of Extended Mind Technologies Oy.


## Minikube setup

On OSX:

```
minikube start --vm-driver hyperkit --memory=8192 --bootstrapper=kubeadm --extra-config=apiserver.authorization-mode=RBAC
```

## New Piwik database setup

1. Don't unpack the MariaDB database and don't attach volumes from extmd-site to the piwik container.
2. Run `mvn doocker:start` in E2E. NOTE: Starting may fail because empty Mariadb setup takes a lot of time. 
3. Navigate to `localhost:8008/analytics/index.php` and click Next a few times.
4. Change database server to `mariadb` (use docker alias DNS routing), `root` as user, `rootpwd` as password, `piwik` as database name.
5. Super user login `piwik` and `piwikpwd` (use whatever email).
6. Website name "extended mind".
7. Set URL to `http://localhost:8008`.
8. Use default settings for the rest.
9. If for some reason the :8008 part of the config file fails to work, run bash in the `piwik` container and `sed -i 's/localhost/localhost:8008/g' /var/www/html/config/config.ini.php` to replace the trusted host.
10. After logging in, press the settings icon in the top right corner, and navigate to plugins.
11. Activate the custom dimensions plugin on the left. NOTE: You might see an empty page, but full page refresh works.
12. Configure as custom dimensions in the Action scope the following: 1: DIMENSION_PACKAGING_ID, 2: DIMENSION_VERSION_ID, 3: DIMENSION_USER_TYPE, 4: DIMENSION_SUBSCRIPTION_TYPE, 5: DIMENSION_COHORT.
13. Log out of the admin interface.
14. Extract the created Piwik config.ini.php.
15. Shut down containers with `mvn docker:stop`.
