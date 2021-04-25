export default async (action, data = {}) => {
    data.action = action;

    return new Promise((resolve) => {
        chrome.runtime.sendMessage('fedgdaldjnomcblnojbfgkjcmbloheeg', data, function(response) {
            resolve(response);
        });
    })
}