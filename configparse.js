const YAML = require("yaml");


let zeroToOne = (num) => (0 <= num) && (num <= 1);
let zeroToFourK = (num) => (0 <= num) && (num <= 4000);

// TODO: warn user of invalid input

const openAIChecks = {
    max_tokens: zeroToFourK,
    temperature: zeroToOne,
    top_p: zeroToOne,
    presence_penalty: zeroToOne,
    frequency_penalty: zeroToOne,
};


/**
 * strips the formatting ticks from a discord yaml block
 * argument [message] str 
 * return value [cleaned message] str 
 */
function stripTicks(message) {
    return message.substring(8, message.length - 3);
};


/**
 * Takes a yaml message from chat and tries to apply it to the 
 * bot configuration.
 * input: message
 * output: obj
 */
function prepConfig(message) {
    return YAML.parse(stripTicks(message));
};

function validateConfig(configObj) {
    const result = {};
    for (let key of Object.keys(configObj)) {
        if (key in openAIChecks) {
            const checker = openAIChecks[key];
            if (checker(configObj[key])) {
                result[key] = configObj[key];
            };
        };
    };
    return result;
};


/**
 * Closes over an object and returns a function that takes another
 * object from which to update shared values.
 * @function
 */
function makeUpdater(object) {
    return function updateObject(updates) {
        prepped = prepConfig(updates);
        validated = validateConfig(prepped);
        for (let key of Object.keys(object)) {
            if (key in validated) {
                object[key] = validated[key]
            };
        };
    };
};

function dumpYaml(obj) {
    return YAML.stringify(obj);
}

/**
 * Reporter will report out the configuration.
 * @function
 */
function makeReporter(obj) {
    return (function() {
        yabble = dumpYaml(obj);
        return `\`\`\`yaml
${yabble}\`\`\``
    });
};

exports.makeReporter = makeReporter
exports.makeUpdater = makeUpdater
