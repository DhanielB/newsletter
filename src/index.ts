import dotenv from 'dotenv'
import strftime from "strftime"
import axios from "axios"
import { CourierClient } from "@trycourier/courier";

dotenv.config()

const courier = CourierClient(
  { authorizationToken: "pk_prod_CFRJ1GFQD04JZ2HAVC52G9VX1ZGG"}
);

var sendedNewsletter = false
var invalidHour = 0
const currentHour = strftime('%H')
const currentOrientation = strftime("%p").toUpperCase();
console.log(currentHour)

async function trySendNewsletter() {
  if(sendedNewsletter) {
    console.log(`[Core] Cancelling loop of newsletter, Timeout : ${100000}`)
    sendedNewsletter = false
    invalidHour = currentHour
  }

  if(invalidHour != currentHour && sendedNewsletter == false && currentOrientation == "AM" && currentHour == 15) {
    const object = await axios.get('https://newsapi.org/v2/top-headlines?country=br&category=technology&apiKey=843840939423426e833acee9382d8e15')

    const news_one = object.data.articles[0]
    const news_two = object.data.articles[1]
    const news_three = object.data.articles[2]
    const news_four = object.data.articles[3]
    const news_five = object.data.articles[4]

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
        to: {
          email: "dhanielbrandao2@gmail.com"
        },
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

    console.log('[Core] Sended newsletter with sucessfully sent!', requestId)
  }
}

setInterval(() => {
  trySendNewsletter()
}, 1000)
