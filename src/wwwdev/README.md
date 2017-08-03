# node react www server

## prepare env
```
cd ./src
git submodule init
git submodule update
cd ./lib
git checkout master
cd ../..
npm install
```

## settings
### main config
```
nano ./src/config.js
```
### www config
```
nano ./src/config.js
```

## development
### start react hotload dev-server
```
npm run wwwStart
```
### start node www server
```
npm run start
```

## prod
```
npm run wwwBuild
```
builds to ./wwwroot

//TODO: copy ./wwwroot to the right place?
```
npm install
npm build
npm run serve
```

## integration to another project
### copy / modify
* `./src/wwwdev`
* `.babelrc`
* `package.json`
* `postcss.config.js`
* `webpack.config.js`
* `webpack.loaders.js`
* `webpack.production.config.js`
