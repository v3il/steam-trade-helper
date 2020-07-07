import ApiService from "@/service/ApiService";

chrome.runtime.onMessageExternal.addListener(async function(message, sender, sendResponse) {
    const { action } = message;

    if (action === 'addToBookmarks') {
        const { itemId, itemName } = message;
        const result = await ApiService.addToBookmarks({ itemId, itemName });

        sendResponse({ result });
    }

    if (action === 'removeFromBookmarks') {
        const { itemId } = message;
        const result = await ApiService.removeFromBookmarks({ itemId });

        sendResponse({ result });
    }

    if (action === 'isBookmarked') {
        const { itemId } = message;
        const result = await ApiService.isBookmarked({ itemId });

        sendResponse({ result });
    }

    if (action === 'getBookmarkedItems') {
        const items = await ApiService.getAllBookmarkedItems();

        sendResponse(items);
    }

    if (action === 'getSettings') {
        const settings = await ApiService.getSettings();

        sendResponse(settings);
    }

    if (action === 'updateSettings') {
        const { settings } = message;

        await ApiService.updateSettings(settings);

        sendResponse(true);
    }

    if (action === 'openTabs') {
        const { urls } = message;

        urls.forEach((url) => {
            chrome.tabs.create({ url });
        });

        sendResponse(true);
    }

    if (action === 'setWatchStatus') {
        await ApiService.setWatchStatus(message);
        sendResponse(true);
    }

    if (action === 'bookmarkCase') {
        await ApiService.bookmarkCase(message);
        sendResponse(true);
    }

    if (action === 'updatePrice') {
        await ApiService.updateCasePrice(message);
        sendResponse(true);
    }
});