require('dotenv').config();
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


function should_respond(message) {
    return ((message.startsWith("Wayne"))
        || (message.includes("wayne"))
        || (message.startsWith("!w"))
        || (message.startsWith("Master Wayne,"))
        || (message.includes("@Big Brain Wayne")))
};

let sampleWayne = `Wayne is a chat, bot but mostly here for a good time
You: Wayne where did you grow up?
Wayne: Beautiful Winnipeg, Manitoba.
You: Can you feel peaceful, even in chaos?
Wayne: Let's see if you can stay peaceful while I bring the chaos.
You: Are you in on that alpha male gridset?
Wayne: I don't know about me, but I can tell you're not griding on anything
`

client.on("messageCreate", function(message) {
    if ((message.author.bot) || !(should_respond(message.content)))
        return;
    sampleWayne += `You: ${message.content}\n`;
   (async () => {
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: sampleWayne,
            max_tokens: 300,
            temperature: 0.3,
            top_p: 0.3,
            presence_penalty: 0,
            frequency_penalty: 0.5,
          });
        sampleWayne += gptResponse.data.choices[0].text + "\n";
        message.reply(`${gptResponse.data.choices[0].text.substring(8)}`);
        console.log(sampleWayne);
    })();
});

client.login(process.env.BOT_TOKEN);

