require('dotenv').config();
const clone = require('clone');

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
// TODO: change length of history array depending on length of responses. 

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
            n: 1,
            temperature: 0.9,
            top_p: 0,
            presence_penalty: 0,
            frequency_penalty: 0.7,
};

const reportConfig = configParse.makeReporter(OPENAI_PARAMETERS);
const updateConfig = configParse.makeUpdater(OPENAI_PARAMETERS);

const shouldRespondTo = waynesFilter.makeResponseEvaluator(
    START_KEYWORDS,
    INCLUDE_KEYWORDS,
);


let summaryWayne = "Wayne is a wild child chat bot from manitoba."
let primedWayne = [
    "You: What is the square root of 4?",
    "Wayne: Wow, I mean I might know, but damn this is really stressing me out.",
    "You: Can you please think carefully about this and give me an answer?",
    "Wayne: uhhhh oh boy, oh boy.",
    "You: The square root of four is one of the easy ones, wayne.",
    "Wayne: okay, okay, okay, not thee, no thats nine, not 1 because that's just one. TWO its TWO!",
    "You: I've heard you answer this on multiple occasions",
    "Wayne: I'm getting very ANGRY"
]

let sampleWayne = []

client.on('messageCreate', function (message) {
    if (message.author.bot) {
        return;
    } else if (message.content.startsWith('\`\`\`yaml')) {
        updateConfig(message.content);
        message.reply(reportConfig());
    } else if (message.content.startsWith('!showconfig')) {
        message.reply(reportConfig());
    } else if (message.content.startsWith('!showintro')) {
        message.reply(summaryWayne);
    } else if (message.content.startsWith('!updateintro')) {
        summaryWayne = message.content.slice(11);
        message.reply("Wayne's bio updated.");
    } else if (message.content.startsWith('!showmem')) {
        if (sampleWayne.length === 0) {
            message.reply("Wayne's head is empty")
        } else {
            message.reply(sampleWayne.join("\n"));
        };
    } else if (message.content.startsWith('!forget')) {
        sampleWayne = [];
        message.reply("Wayne has forgotten everything.");
    } else if (message.content.startsWith('!help')) {
        message.reply(`# **Big Brain Wayne help page**

## **What happens when you talk to Wayne.**

Your message along with several previous exchanges (currently 6) is added to a static static "warm up" prompt and sent to the GPT-3 model API.

__Example call__

*bot summary*
Wayne is a chat bot from Winnipeg, in a homework crisis.

*static prompt*
You: What is the square root of 4?
Wayne: Wow, I mean I might know, but damn this is really stressing me out.
You: Can you please think carefully about this and give me an answer?
Wayne: uhhhh oh boy, oh boy.
You: The square root of four is one of the easy ones, wayne.
Wayne: okay, okay, okay, not thee, no thats nine, not 1 because that's just one. TWO its TWO!

*recent history*
{last six interactions with the chat}

The API needs this entire context to respond to each message coherently.

## **Wayne's settings**

You can view Wayne's settings with '!showconfig'.

The settings can be updated by writing a yaml block into the chat
\\\`\\\`\\\`yaml
    {your settings here}
\\\`\\\`\\\` 

Not all of the settings can be updated within the chat. But Wayne will respond with the updated settings.

# **Special commands**

!help -> brings up this documentation
!forg
!showconfig -> shows the current api call settings`);
    } else if (shouldRespondTo(message.content)) {
        if (sampleWayne.length > 12) {
            sampleWayne.shift();
        };

        sampleWayne.push(`You: ${message.content}`);
       (async () => {

            const parameters = clone(OPENAI_PARAMETERS);

            parameters.prompt = primedWayne.join("\n") + sampleWayne.join("\n");

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
