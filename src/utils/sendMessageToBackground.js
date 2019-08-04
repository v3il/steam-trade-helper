export default (data, callback) => {
    chrome.runtime.sendMessage('hgadllghcdohkebcfleepjlagekaloam', data, function(response) {
        console.log(response);

        callback(response);
    });
}