import WebSocket from 'ws';
import dotenv from 'dotenv';
import axios from 'axios';
import Bottleneck from "bottleneck";

dotenv.config()

const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 500
});

const twitter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 1000
})

let webhook = process.env.WEBHOOK
let zigzagws = new WebSocket(process.env.WEBSOCKET)

zigzagws.on('open', onWsOpen);

function onWsOpen() {
    console.log('connected')
    zigzagws.on('message', handleMessage);
    zigzagws.on('close', onWsClose);
    zigzagws.send(JSON.stringify({ 'op': 'marketsreq', 'args': [1, true] }));

}

function onWsClose() {
    console.log("Websocket closed. Restarting");

    setTimeout(() => {
        zigzagws = new WebSocket(process.env.WEBSOCKET);
        zigzagws.on('open', onWsOpen);
        zigzagws.on('error', onWsClose);
    }, 5000);
}

async function handleMessage(json) {
    const msg = JSON.parse(json);

    if (msg.op == 'marketinfo2') {
        for (let i = 0; i < msg.args[0].length; i++) {
            zigzagws.send(JSON.stringify({ "op": "subscribemarket", "args": [1, msg.args[0][i].alias] }));
        }
    }

    if (msg.op == 'orderstatus') {
        if (msg.args[0][0].length == 5) {
            let chainID = msg.args[0][0][0]
            let orderID = msg.args[0][0][1]
            const receiptreqmsg = { op: "orderreceiptreq", args: [chainID, orderID] }
            zigzagws.send(JSON.stringify(receiptreqmsg))
        }
    }

    if (msg.op == 'orderreceipt') {
        // limiter.schedule(() => {
        //     getTxDetails(msg.args)
        //         .then(res => {
        //             if (res) {
        //                 parseData(res)
        //             }
        //         })
        // })
        twitter.schedule(() => {
            getTxDetails(msg.args)
                .then(res => {
                    if (res) {
                        parseTweet(res)
                    }
                })
        })
    }
}

const getTxDetails = async function (tx) {

    if (tx[9] == 'r') {
        return
    }
    console.log(tx)
    let txHash = tx[11]
    let buySell;
    let txType = tx[3]

    if (txType == 'b') {
        buySell = 'Buy'
    } else {
        buySell = 'Sell'
    }

    let price = tx[4]
    let amount = tx[5]
    let txVol = price * amount;
    let txDetails = { size: txVol, hash: txHash, pair: tx[2], type: buySell }
    // console.log(`tx details returned: ${txDetails}`)
    return txDetails
}

const parseTweet = async function (details) {
    const text = details.hash
    sendTweet(text)
}

const sendTweet = async function (hash) {

    var data = JSON.stringify({
        "text": `${hash}`
    });

    var config = {
        method: 'post',
        url: 'https://api.twitter.com/2/tweets',
        headers: {
            'Authorization': 'OAuth oauth_consumer_key="ttnDRxWc01nK0V9LQjDeTxwJ6",oauth_token="1499223809420926982-0xXJ7QZAfREofBNFQtGq2KOPaWuH6g",oauth_signature_method="HMAC-SHA1",oauth_timestamp="1646510628",oauth_nonce="Dfw4PhtmyxR",oauth_version="1.0",oauth_signature="SWz%2BrVDvcRSvI6KU7G0eiGo84L8%3D"',
            'Content-Type': 'application/json',
            'Cookie': 'guest_id=v1%3A164565039285370727'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
            console.log(error);
        });

}

const parseData = async function (txDetails) {
    let emojiArray = []
    let colours;

    if (txDetails.type == "Buy") {
        emojiArray.push("💎", "🤲", "🚀", "🌕", "🐂", "📈", "💰", "🏦");
        colours = 65310
    } else {
        emojiArray.push("🧻", "🤲", "🤦‍♂️", "🚨", "🐻", "📉", "💸", "🚽");
        colours = 16711680
    }

    if (txDetails.size > 1) {

        let payload = {
            "username": "ZZ Whale Watcher",
            "content": "",
            "embeds": [
                {
                    "author": {
                        "name": "ZigZag Exchange",
                        "url": "https://trade.zigzag.exchange/"
                    },
                    "title": `🐋🔍 Whale Sighting ${emojiArray[0]}${emojiArray[1]}`,
                    "url": `https://zkscan.io/explorer/transactions/${txDetails.hash}`,

                    "color": colours,
                    "fields": [
                        {
                            "name": `${emojiArray[4]}**Pair**${emojiArray[5]}`,
                            "value": `${txDetails.pair}`,
                            "inline": true
                        },
                        {
                            "name": `${emojiArray[2]}**Type**${emojiArray[3]}`,
                            "value": `${txDetails.type}`,
                            "inline": true
                        },
                        {
                            "name": `${emojiArray[6]}**Size**${emojiArray[7]}`,
                            "value": `${txDetails.size.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
                            "inline": true
                        }
                    ],
                    "footer": {
                        "text": "Made by @DefiBuilderETH, powered by ZigZag",
                        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Twitter-logo.svg/1200px-Twitter-logo.svg.png"
                    }
                }
            ]
        }
        pingWebhook(payload)
    }
}

const pingWebhook = async function (payload) {
    axios
        .post(webhook, payload)
        .then(res => {
            console.log(`statusCode: ${res.status}`)
        })
        .catch(error => {
            console.error(error.response)
        })
}