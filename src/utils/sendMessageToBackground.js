export default async (action, data) => {
    data.action = action;

    return new Promise((resolve) => {
        chrome.runtime.sendMessage('hgadllghcdohkebcfleepjlagekaloam', data, function(response) {
            resolve(response);
        });
    })
}