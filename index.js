require('dotenv').config();
require('./configparse.mjs');
require('./wayneprompts.mjs');

// TODO: run some kind of loop so if wayne hasn't been talked to
// in a while, he will read an article at random from wikipedia or 
// something and talk about it.

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [
    GatewayIntentBits.Guild,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
] });
const { Configuration, OpenAIApi } = require("openai");
const { makeReporter } = require('./configparse.mjs');
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


// These will trigger a response if placed at the beginning of the message
let START_KEYWORDS = ["Wayne"]

// These will trigger if placed anywhere in a message
let INCLUDE_KEYWORDS = []

// These hold the special keyword actions
let CONFIG_KEYWORDS = {
    '!addsummons': '',
    '!removesummons': '',
    '!showconfig': '',
    '\`\`\`yaml': '',
}

// This includes the configuration available to the chat
let OPENAI_PARAMETERS = {
            model: "text-davinci-002",
//            prompt: sampleWayne.join("\n"),
            max_tokens: 500,
            temperature: 0.7,
            top_p: 0.3,
            presence_penalty: 0,
            frequency_penalty: 0.7,
};

const reportConfig = makeReporter(OPENAI_PARAMETERS);

const shouldRespondTo = makeResponseEvaluator(START_KEYWORDS, INCLUDE_KEYWORDS);
const addTrigger = makeTriggerAdder(START_KEYWORDS, INCLUDE_KEYWORDS);
const removeTrigger = makeTriggerRemover(START_KEYWORDS, INCLUDE_KEYWORDS);


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

function telephoneOperator(message, client) {
    if (message.startsWith('\`\`\`yaml')) {
        client.message.send("Unable to configure at this time")
    } else if (message.startsWith('!showconfig')) {
        client.message.send(reportConfig());
    };
}

client.on("messageCreate", telephoneOperator(message, client));

/*
client.on("messageCreate", function(message) {
    if ((message.author.bot) || !(shouldRespondTo(message.content)))
        return;
    garbage = sampleWayne.shift();
    sampleWayne.push(`You: ${message.content}`);
   (async () => {
        const gptResponse = await openai.createCompletion(OPENAI_PARAMETERS);
        sampleWayne.push(gptResponse.data.choices[0].text.replace("\n", " "));
        message.reply(`${gptResponse.data.choices[0].text}`);
    })();
});
*/
client.login(process.env.BOT_TOKEN);
