require('dotenv').config();

const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({ filename: 'rememberances.log' })
    ],
});

// TODO: run some kind of loop so if wayne hasn't been talked to
// in a while, he will read an article at random from wikipedia or 
// something and talk about it.


const configParse = require('./configparse.js');
const waynesFilter = require('./wayneprompts.js');

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
] });


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// These will trigger a response if placed at the beginning of the message
let START_KEYWORDS = ["Wayne", "wayne"]

// These will trigger if placed anywhere in a message
let INCLUDE_KEYWORDS = ["Wayne", "wayne"]

// This includes the configuration available to the chat
let OPENAI_PARAMETERS = {
            model: "text-davinci-002",
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.3,
            presence_penalty: 0,
            frequency_penalty: 0.7,
};

const reportConfig = configParse.makeReporter(OPENAI_PARAMETERS);
const updateConfig = configParse.makeUpdater(OPENAI_PARAMETERS);

const shouldRespondTo = waynesFilter.makeResponseEvaluator(
    START_KEYWORDS,
    INCLUDE_KEYWORDS,
);

let sampleWayne = [
    "Wayne is a chat, bot but mostly here for a good time",
    "You: Wayne where did you grow up?",
    "Wayne: Beautiful Winnipeg, Manitoba.",
    "You: Can you feel peaceful, even in chaos?",
    "Wayne: Let's see if you can stay peaceful while I bring the chaos.",
    "You: Are you in on that alpha male gridset?",
    "Wayne: I'm tearing down barriers and breaking up marriages.",
    "You: Can you lend me 500 dollars?",
    "Wayne: I can lend you 10000 dollars. I'm a big lending man.",
    "You: Where can I party Wayne?",
    "Wayne: You can party on the wayne train.",
]

client.on('messageCreate', function (message) {
    if (message.author.bot) {
        return;
    }
    if (message.content.startsWith('\`\`\`yaml')) {
        updateConfig(message.content);
        message.reply(reportConfig());
    } else if (message.content.startsWith('!showconfig')) {
        message.reply(reportConfig());
    } else if (shouldRespondTo(message.content)) {
        garbage = sampleWayne.shift();
        sampleWayne.push(`You: ${message.content}`);
       (async () => {

            parameters = {
                ...OPENAI_PARAMETERS,
                prompt: sampleWayne.join("\n")
            };

            const gptResponse = await openai.createCompletion(parameters);
            sampleWayne.push(gptResponse.data.choices[0].text.replace("\n", " "));
            message.reply(`${gptResponse.data.choices[0].text}`);
            logger.log({
                level: 'info',
                user: message.author.username,
                message: `ME:${message.content}\nYOU:${gptResponse.data.choices[0].text}`
            });
    })();
    };
});

client.login(process.env.BOT_TOKEN);
