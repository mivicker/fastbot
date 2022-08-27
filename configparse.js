const yaml = require("js-yaml");

inputString = `\`\`\`yaml
first value: some important data
second value: more important data
third value: even less important data
\`\`\``

/**
 * strips the formatting ticks from a discord yaml block
 * argument [message] str 
 * return value [cleaned message] str 
 */
function stripTicks(message) {
    return message.substring(8, message.length - 3);
}


