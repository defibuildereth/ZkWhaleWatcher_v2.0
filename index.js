import WebSocket from 'ws';
import dotenv from 'dotenv';
import axios from 'axios';
import fetch from 'node-fetch';


let pairs = {
    "ETH-USDT": {
        "side": "d",
        "priceFeedPrimary": "cryptowatch:588",
        "priceFeedSecondary": "cryptowatch:6631",
        "slippageRate": 1e-5,
        "maxSize": 0.12,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "ETH-USDC": {
        "side": "d",
        "priceFeedPrimary": "cryptowatch:6631",
        "priceFeedSecondary": "cryptowatch:588",
        "slippageRate": 1e-5,
        "maxSize": 0.12,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "ETH-DAI": {
        "side": "d",
        "priceFeedPrimary": "cryptowatch:63533",
        "priceFeedSecondary": "cryptowatch:588",
        "slippageRate": 1e-5,
        "maxSize": 0.12,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "ETH-FRAX": {
        "side": "d",
        "priceFeedPrimary": "cryptowatch:6631",
        "priceFeedSecondary": "cryptowatch:588",
        "slippageRate": 1e-5,
        "maxSize": 0.12,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "WBTC-USDT": {
        "priceFeedPrimary": "cryptowatch:579",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 0.01,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "WBTC-USDC": {
        "priceFeedPrimary": "cryptowatch:6630",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 0.01,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "WBTC-DAI": {
        "priceFeedPrimary": "cryptowatch:63532",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 0.01,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "USDC-USDT": {
        "priceFeedPrimary": "cryptowatch:6636",
        "priceFeedSecondary": null,
        "slippageRate": 1e-9,
        "maxSize": 3000,
        "minSize": 0.000001,
        "minSpread": 0.0001,
        "active": true
    },
    "DAI-USDT": {
        "priceFeedPrimary": "cryptowatch:61475",
        "priceFeedSecondary": "cryptowatch:138169",
        "slippageRate": 1e-9,
        "maxSize": 300,
        "minSize": 0.000001,
        "minSpread": 0.0001,
        "active": true
    },
    "DAI-USDC": {
        "priceFeedPrimary": "cryptowatch:136253",
        "priceFeedSecondary": null,
        "slippageRate": 1e-9,
        "maxSize": 300,
        "minSize": 0.000001,
        "minSpread": 0.0001,
        "active": true
    },
    "ETH-WBTC": {
        "priceFeedPrimary": "cryptowatch:580",
        "priceFeedSecondary": "cryptowatch:95",
        "slippageRate": 1e-4,
        "maxSize": 0.12,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "LINK-USDC": {
        "priceFeedPrimary": "cryptowatch:11355",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 11,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "YFI-USDC": {
        "priceFeedPrimary": "cryptowatch:63516",
        "priceFeedSecondary": "cryptowatch:137881",
        "slippageRate": 1e-4,
        "maxSize": 0.01,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "LUNA-USDC": {
        "priceFeedPrimary": "cryptowatch:63703",
        "priceFeedSecondary": "cryptowatch:255538",
        "slippageRate": 1e-4,
        "maxSize": 4,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "UNI-USDC": {
        "priceFeedPrimary": "cryptowatch:65082",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 30,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "AAVE-USDC": {
        "priceFeedPrimary": "cryptowatch:92863",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 1,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "FTM-USDC": {
        "priceFeedPrimary": "cryptowatch:60449",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 200,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "SOL-USDC": {
        "priceFeedPrimary": "cryptowatch:813172",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 4,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "MATIC-USDC": {
        "priceFeedPrimary": "cryptowatch:789796",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 200,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "FRAX-USDC": {
        "priceFeedPrimary": "cryptowatch:137609",
        "priceFeedSecondary": null,
        "slippageRate": 1e-9,
        "maxSize": 400,
        "minSize": 0.000001,
        "minSpread": 0.0001,
        "active": true
    },
    "FRAX-USDT": {
        "priceFeedPrimary": "cryptowatch:137607",
        "priceFeedSecondary": null,
        "slippageRate": 1e-9,
        "maxSize": 400,
        "minSize": 0.000001,
        "minSpread": 0.0001,
        "active": true
    },
    "DYDX-ETH": {
        "priceFeedPrimary": "cryptowatch:2592956",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 70,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "COMP-ETH": {
        "priceFeedPrimary": "cryptowatch:63268",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 3,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "MKR-ETH": {
        "priceFeedPrimary": "cryptowatch:59167",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 0.2,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    },
    "AVAX-ETH": {
        "priceFeedPrimary": "cryptowatch:980555",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 4,
        "minSize": 0.000001,
        "minSpread": 0.0005,
        "active": true
    },
    "METIS-ETH": {
        "priceFeedPrimary": "cryptowatch:739840",
        "priceFeedSecondary": null,
        "slippageRate": 1e-4,
        "maxSize": 2,
        "minSize": 0.000001,
        "minSpread": 0.001,
        "active": true
    }
}

dotenv.config()

// console.log(process.env.WEBHOOK)

let webhook = process.env.WEBHOOK

let zigzagws = new WebSocket(process.env.WEBSOCKET)

zigzagws.on('open', onWsOpen);

function onWsOpen() {
    zigzagws.on('message', handleMessage);
    zigzagws.on('close', onWsClose);
    for (let market in pairs) {
        if (pairs[market].active) {
            // indicateLiquidityInterval = setInterval(() => indicateLiquidity(market), 5000);
            const msg = { op: "subscribemarket", args: [1, market] };
            zigzagws.send(JSON.stringify(msg));
        }
    }
}

function onWsClose() {
    console.log("Websocket closed. Restarting");
}

async function handleMessage(json) {
    const msg = JSON.parse(json);
    if (msg.op == 'fills') {
        // console.log(msg.args[0][0])
        await getTransactionDetails(msg.args[0][0])
        .then(res => {
            parseData(res)
        })
    }
}

const getTransactionDetails = async function (tx) {
    let txDetails;
    let txHash = tx[7]

    let tokenString = tx[2].split('-')

    let token;
    let buySell;
    let txType = tx[3]

    if (txType == 'b') {
        token = tokenString[0]
        buySell = 'Buy'
    } else {
        token = tokenString[1]
        buySell = 'Sell'
    }

    await fetch(`https://api.zksync.io/api/v0.2/tokens/${token}/priceIn/usd`)
        .then((res) => res.json())
        .then(data => {
            let amount = tx[5];
            let price = data.result.price;
            let txVol = amount * price
            txDetails = { size: txVol, hash: txHash, pair: tx[2], type: buySell }
        })
    return txDetails
}


const parseData = async function (txDetails) {
    
    let payload = {
        "username": "ZZ Whale Watcher",
        "content": "",
        "embeds": [
            {
                "author": {
                    "name": "ZigZag Exchange",
                    "url": "https://trade.zigzag.exchange/"
                },
                "title": `🐋 Whale Sighting 🔍`,
                "url": `https://zkscan.io/explorer/transactions/${txDetails.hash}`,

                "color": 15258703,
                "fields": [
                    {
                        "name": "💸 **Pair** 💎",
                        "value": `${txDetails.pair}`,
                        "inline": true
                    },
                    {
                        "name": "💰 **Type** 💵",
                        "value": `${txDetails.type}`,
                        "inline": true
                    },
                    {
                        "name": "💰 **Size** 💵",
                        "value": `${txDetails.size.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
                        "inline": true
                    }


                ],
                "footer": {
                    "text": "Made by @DefiBuilderETH, powered by ZkSync API",
                    "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Twitter-logo.svg/1200px-Twitter-logo.svg.png"
                }
            }
        ]
    }
    pingWebhook(payload)
}

const pingWebhook = async function (payload) {
    axios
        .post(webhook, payload)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
            // console.log(res)
        })
        .catch(error => {
            console.error(error.response.statusText)
        })
}