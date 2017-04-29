# yenombot

## prepare env
```
npm install
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
    //initTokens: [''],//TODO: paste your tokens for /token command

    //init tokens data block
    //initData: { [initToken]: { /* init data */ } }
    initData: {
        ['some-fucking-init-token']: {
            balanceInit: 666,  //TODO: monthly limitÏ
            paymentGroups: [{
                title: 'Cat 1',
                id: '1'
            }, {
                title: 'Cat 2',
                id: '2'
            }]
        }
    }
     
}
```