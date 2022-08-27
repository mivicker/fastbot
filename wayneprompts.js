// These will trigger a response if placed at the beginning of the message
START_KEYWORDS = []

// These will trigger if placed anywhere in a message
INCLUDE_KEYWORDS = []

/**
 * any works like python's any returns if any val
 * in a list of bools is true.
 *
 * input: array of booleans
 * output: boolean
 */
function any(conditions) {
    if (conditions.length === 0) {
        return false;
    };
    for (const condition of conditions) {
        if (condition) {
            return true;
        };
    };
    return false;
};

/**
 * Checks message content to see if keyword is present
 * input: message str
 * output: shouldResponse boolean
 */
function shouldRespond(message) {
    return (
        any(START_KEYWORDS.map(kw => message.startsWith(kw)))
        || any(INCLUDE_KEYWORDS.map(kw => message.includes(kw)))
    );
};

/**
 * Adds a word to the list that summons wayne.
 *
 * input 1: word to add
 * input 2: placement valid options: ["start", "anywhere"]
 * 
 * updates either keyword array and returns undefined
 *
 */
function addKeyword(keyword, placement) {
    if (placement === "start") {
        START_KEYWORDS.push(keyword);
    } else if (placement === "anywhere") {
        INCLUDE_KEYWORDS.push(keyword);
    };
};

/**
 * removes a element from a list of strings if it matches toRemove
 *
 * input 1: keywords array to filter
 * input 2: word to remove
 * 
 * output: array with word filtered
 *
 */
function removeEntry(keywords, toRemove) {
    return keywords.filter(kw => kw !== toRemove);
};

/**
 * Removes a keyword from specified placement list
 * input 1: word to remove
 * input 2: placement valid options: ["start", "anywhere"]
 * 
 * updates either keyword array and returns undefined
 */
function removeKeyword(keyword, placement) {
    if (placement === "start") {
        START_KEYWORDS = removeEntry(START_KEYWORDS, keyword);
    } else if (placement === "anywhere") {
        INCLUDE_KEYWORDS = removeEntry(INCLUDE_KEYWORDS, keyword);
    };
};

