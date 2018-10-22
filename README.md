# kintone-customize-uploader

[![npm version](https://badge.fury.io/js/%40kintone%2Fcustomize-uploader.svg)](https://badge.fury.io/js/%40kintone%2Fcustomize-uploader)
[![CircleCI](https://circleci.com/gh/kintone/customize-uploader.svg?style=shield)](https://circleci.com/gh/kintone/customize-uploader)
[![Build Status](https://travis-ci.org/kintone/customize-uploader.svg?branch=master)](https://travis-ci.org/kintone/customize-uploader)

A kintone customize uploader

## Usage
```
% npm install @kintone/customize-uploader
% ./node_modules/.bin/kintone-customize-uploader
--domain ${yourDomain} \
--username ${yourLoginName} \
--password ${yourPassword} \
${manifestFile}
```

or

```
% npm install -g @kintone/customize-uploader
% kintone-customize-uploader \
--domain ${yourDomain} \
--username ${yourLoginName} \
--password ${yourPassword} \
${manifestFile}
```

If you want to upload the customize files automatically when a file is updated, you can use `--watch` option.

```
% kintone-customize-uploader \
--domain ${yourDomain} \
--username ${yourLoginName} \
--password ${yourPassword} \
--watch \
${manifestFile}
```

## Options
```
  Usage
    $ kintone-customize-uploader <manifestFile>
  Options
    --domain Domain of your kintone
    --username Login username
    --password User's password
    --basic-auth-username Basic Authentication username
    --basic-auth-password Basic Authentication password
    --proxy Proxy server
    --watch Watch the changes of customize files and re-run
    --lang Using language (en or ja)
    --guest-space-id Guest space ID for uploading files
    You can set the values through environment variables
    domain: KINTONE_DOMAIN
    username: KINTONE_USERNAME
    password: KINTONE_PASSWORD
    basic-auth-username: KINTONE_BASIC_AUTH_USERNAME
    basic-auth-password: KINTONE_BASIC_AUTH_PASSWORD
    proxy: HTTPS_PROXY or HTTP_PROXY
```

If you omit the options, you can input the options interactively.
```
% kintone-customize-uploader customize-manifest.json
? Input your domain: example.cybozu.com
? Input your username: sato
? Input your password: [hidden]
```

## Example
This is an example of `customize-manifest.json` .
```json
{
    "app": "1",
    "scope": "ALL",
    "desktop": {
        "js": [
            "https://js.cybozu.com/jquery/3.3.1/jquery.min.js",
            "sample/customize.js"
        ],
        "css": [
            "sample/51-modern-default.css"
        ]
    },
    "mobile": {
        "js": [
            "https://js.cybozu.com/jquery/3.3.1/jquery.min.js"
        ]
    }
}
```
- `app` : The app id where to upload customize files to (`"APP_ID"`)
- `scope`: The scope to apply your customization (`"ALL"` || `"ADMIN"` || `"NONE"`)
- `desktop`: The customize files applied in PC view  (`"js": []` || `"css": []`)
- `mobile`: The customize files applied in mobile view (`"js": []`)

To upload files, run the `kintone-customize-uploader` .
```
% kintone-customize-uploader
? Input your domain: example.cybozu.com
? Input your username: sato
? Input your password: [hidden]

sample/customize.js has been uploaded!
sample/51-modern-default.css has been uploaded!
JavaScript/CSS files have been uploaded!
Customize setting has been updated!
Wait for deploying completed...
Wait for deploying completed...
Wait for deploying completed...
Setting has been deployed!
```

In this exapmle, JavaScript and CSS Customization is set as below.
![Example screenshot of JavaScript and CSS Customization](docs/example_setting.PNG)

## LICENSE
MIT License
