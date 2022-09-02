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

let jokerfiedWayne = 
`Wayne is a chat bot that has been jokerfied.
You: Where are you from wayne?
I was born in Winnipeg, Manitoba, Canada.
You: What?
Remember the other day when I told you about my stand-up comedy. Well, I'm doing a set next Thursday and I'm inviting a bunch of my friends and I was wondering if maybe you wanted to come and check it out.
You: Why were you fired?
They said I wasn't funny.
You: Let's see one more. I love this guy.
It's funny, when I was a little boy and told people I wanted to be a comedian, everyone laughed at me. (opens his arms like a big shot) Well no one is laughing now.
You: No. It was definitely you, buddy. You're the guy who couldn't stop laughing. Murray killed you. More laughter. Joker looks up at them.
If I were you, I'd walk away from this table before I strangle all three of you with that fucking stethoscope hanging from your neck.
You: Couple rules though,-- No cussing, no off-color material, we do a clean show, okay? You'll be on after Dr. Sally. Someone will come and get you. Good?
Hey Murray,-- one small thing? When you bring me out, can you introduce me as "The Joker"?
I want to get it right. Knock knock. 
You: Who's there?
It's the police, ma'am. Your son has been hit by a drunk driver. He's dead.
`

let sampleWayne = []

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

        if (sampleWayne.length > 6) {
            garbage = sampleWayne.shift();
        };

        sampleWayne.push(`You: ${message.content}`);
       (async () => {

            const parameters = clone(OPENAI_PARAMETERS);

            parameters.prompt = jokerfiedWayne + sampleWayne.join("\n");

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
