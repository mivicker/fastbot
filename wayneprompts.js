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


function makeResponseEvaluator(startKeywords, includeKeywords) {
    return (function shouldRespond(message) {
        return (
            any(startKeywords.map(kw => message.startsWith(kw)))
            || any(includeKeywords.map(kw => message.includes(kw)))
        )
    });
};


function makeTriggerAdder(startKeywords, includeKeywords) {
    return (function (keyword, placement) {
        if (placement === "start") {
            startKeywords.push(keyword);
        } else if (placement === "anywhere") {
            includeKeywords.push(keyword);
        };
    });
};


function removeKeyword(activeKeywords, keyword) {
    const index = activeKeywords.indexOf(keyword);
    if (index > -1) {
        activeKeywords.splice(index, 1);
    };
};


function makeTriggerRemover (startKeywords, includeKeywords) {
    return (function (keyword, placement) {
        if (placement === "start") {
            removeKeyword(startKeywords, keyword);
        } else if (placement === "anywhere") {
            removeKeyword(includeKeywords, keyword);
        };
    });
};

exports.makeResponseEvaluator = makeResponseEvaluator
exports.makeTriggerAdder = makeTriggerAdder
exports.makeTriggerRemover = makeTriggerRemover
