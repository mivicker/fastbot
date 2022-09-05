CHAR_TO_TOKEN_RATIO = 0.25;

function estimateTokens(text) {
    return text.length * CHAR_TO_TOKEN_RATIO;
};

function lengthAdjuster(chats, n_tokens) {
    const result = [];
    let tokens_used = 0;
    for (let chat of chats.slice().reverse()) {
        if ((tokens_used + estimateTokens(chat)) > n_tokens) {
            return result;
        };
        result.push(chat);
        tokens_used += estimateTokens(chat);
    };
    return result;
};

function budgetTokens(summary, staticPrompt, maxTokens) {
    currentUsed = estimateTokens(summary) 
                + estimateTokens(staticPrompt.join("\n"));

    return maxTokens - currentUsed;
};

exports.lengthAdjuster = lengthAdjuster;
exports.budgetTokens = budgetTokens;

