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