# yenombot

## prepare env
```
npm install
cd src
touch ./src/token.js
```

``` javascript
export default {
    botToken: {
        dev: '//TODO: go to @botfather',
        prod: '//TODO: go to @botfather'
    },
    developers: [
        //TODO: paste your telegram id here
    ],
    
    //init tokens data block
    initData: {
        ['some-fucking-init-token']: {
            balanceInit: 666,  //TODO: monthly limit
            paymentGroups: [{
                title: 'Cat 1',
                id: '1'
            }, {
                title: 'Cat 2',
                id: '2'
            }],
            nonUserPaymentGroups: ['Cat 2']
        }
    }
     
}
```
## deploy
```
ssh prod@127.0.0.1
sudo forever stop yenombot
exit
git merge --no-ff feature develop
./deploy release 0.1.2
```
test locally
```
./deploy.sh release 0.1.2 continue
ssh prod@127.0.0.1
sudo forever start yenombot
exit
```

## prod
```
npm install
npm build
npm run serve
```

## start bot
```
/start
/token some-fucking-init-token
/bal init
```