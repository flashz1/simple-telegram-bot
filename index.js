const TelegramBot = require('node-telegram-bot-api');
const config = require('config');
const request = require('request');

const bot = new TelegramBot(config.get('token'), { polling: true });

const photo = `${__dirname}/src/images/image.jpeg`;

const weatherRequest = msg => {
  request(`${config.get('openWeatherMap.url')}?id=618426&units=metric&APPID=${config.get('openWeatherMap.apiKey')}`, (error, response, body) => {
    if (error) {
      return console.error('Error on request:', error);
    }
  
    const parsedBody = JSON.parse(body);
    const value = Math.floor(parsedBody.list[1].main.temp);
    const output = "The Weather in Chisinau: <b>" + (value > 0 ? "+" + value : value) + "&#8451;</b>";

    outputMsg(msg, output);
  });
};

const currencyRequest = msg => {
  request(`${config.get('currconv.url')}?q=USD_MDL&compact=ultra&apiKey=${config.get('currconv.apiKey')}`, (error, response, body) => {
    if (error) {
      return console.error('Error on request:', error);
    }

    const parsedBody = JSON.parse(body);
    const value = parsedBody["USD_MDL"];
    const output = "Currency Rate For Pair USDMDL today is: <b>" + value + "</b>";

    outputMsg(msg, output);
  });
};

const warningMsg = id => bot.sendMessage(id, "For correct work, please, use only existing commands.")
const outputMsg = ({ chat: { id } }, output) => bot.sendMessage(id, output, {
  parse_mode: "HTML",
});

bot.onText(/^\/+(?!start\b|!dollartomdl\b|!weather\b)(.*)/, ({ chat: { id } }) => warningMsg(id));

bot.onText(/^\/start(.*)/, ({ from: { id } }) => {
  const opts = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Weather in Chisinau',
            callback_data: 'weather'
          },
          {
            text: 'Currency Rate USDMDL',
            callback_data: 'currency'
          },
          {
            text: 'About',
            callback_data: 'about'
          }
        ]
      ]
    }
  };
  bot.sendMessage(id, "Select an Option:", opts);
});

bot.on('callback_query', ({ data, message }) => {
  if (data === 'weather') {
    weatherRequest(message);
  }

  if (data === 'currency') {
    currencyRequest(message);
  }

  if (data === 'about') {
    bot.sendPhoto(message.chat.id, photo, {
      caption: "https://github.com/flashz1"
    });
  }
});

bot.onText(/^\/dollartomdl(.*)/, msg => currencyRequest(msg));
bot.onText(/^\/weather(.*)/, msg => weatherRequest(msg));