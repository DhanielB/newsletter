import dotenv from 'dotenv'
import strftime from "strftime"
import axios from "axios"
import { CourierClient } from "@trycourier/courier";

dotenv.config()

const courier = CourierClient(
  { authorizationToken: "pk_prod_CFRJ1GFQD04JZ2HAVC52G9VX1ZGG"}
);

var allowDebug = true
var sendedNewsletter = false
var invalidHour = 0

console.log(`[Core] Starting on ${new Date().getHours()}:${new Date().getMinutes()}...`)

async function trySendNewsletter() {
  const minutes = new Date().getMinutes()
  const hours = new Date().getHours()

  var date = `${minutes}:${hours}`
  var currentHour = minutes

  if(allowDebug) {
    console.log(`[Core] Trying... Date : ${date}, Current Hour : ${currentHour}, Invalid Hour : ${invalidHour}, sendedNewsletter : ${sendedNewsletter}, isValid: ${invalidHour != currentHour && sendedNewsletter == false && currentHour == 31}`)
  }

  if(sendedNewsletter) {
    console.log(`[Core] Cancelling loop of newsletter...`)
    sendedNewsletter = false
    invalidHour = currentHour
    setTimeout(() => {
      allowDebug = true
    }, 60 * 1000)
    setTimeout(() => {
      invalidHour = 0
      console.log('[Core] Its been 2 hours since it was sent restarting invalidHour to (0)...')
    }, ((60 * 1000) * 60) * 2)
  }

  if(invalidHour != currentHour && sendedNewsletter == false && currentHour == 31) {
    const object = await axios.get('https://newsapi.org/v2/top-headlines?sources=google-news-br&apiKey=843840939423426e833acee9382d8e15')

    const news_one = object.data.articles[0]
    const news_two = object.data.articles[1]
    const news_three = object.data.articles[2]
    const news_four = object.data.articles[3]
    const news_five = object.data.articles[4]

    news_one.title.replace(/<[^>]*>?/gm, '')
    news_two.title.replace(/<[^>]*>?/gm, '')
    news_three.title.replace(/<[^>]*>?/gm, '')
    news_four.title.replace(/<[^>]*>?/gm, '')
    news_five.title.replace(/<[^>]*>?/gm, '')

    news_one.description.replace(/<[^>]*>?/gm, '')
    news_two.description.replace(/<[^>]*>?/gm, '')
    news_three.description.replace(/<[^>]*>?/gm, '')
    news_four.description.replace(/<[^>]*>?/gm, '')
    news_five.description.replace(/<[^>]*>?/gm, '')
    
    const news_text = `
      ${news_one.title}
      \t${news_one.description}
      - ${news_one.source.name}

      ${news_two.title}
      \t${news_two.description}
      - ${news_two.source.name}

      ${news_one.title}
      \t${news_one.description}
      - ${news_one.source.name}

      ${news_three.title}
      \t${news_three.description}
      - ${news_three.source.name}

      ${news_four.title}
      \t${news_four.description}
      - ${news_four.source.name}

      ${news_five.title}
      \t${news_five.description}
      - ${news_five.source.name}
    `

    const { requestId } = await courier.send({
      message: {
        content: {
          title: "CHEGOU! A sua newsletter de hoje delicinha!",
          body: news_text
        },
        to: [
          {
            email: "dhanielbrandao2@gmail.com"
          }
        ],
        routing: {
          method: "single",
          channels: ["email"]
        },
        channels : {
          email: {
            providers: ["gmail"] 
          }
        },
      }
    });

    sendedNewsletter = true
    allowDebug = false

    console.log('[Core] Sended newsletter with sucessfully sent!', requestId)
  }
}

setInterval(() => {
  trySendNewsletter()
}, 1000)
