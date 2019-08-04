import FirebaseItemsService from '../FirebaseItemsService';

chrome.runtime.onMessageExternal.addListener(async function(message, sender, sendResponse) {
    const { action } = message;

    if (action === 'addToBookmarks') {
        const { itemId, itemName } = message;
        const result = await FirebaseItemsService.addToBookmarks({ itemId, itemName });

        sendResponse({ result });
    }

    if (action === 'removeFromBookmarks') {
        const { itemId } = message;
        const result = await FirebaseItemsService.removeFromBookmarks({ itemId });

        sendResponse({ result });
    }

    if (action === 'isBookmarked') {
        const { itemId } = message;
        const result = await FirebaseItemsService.isBookmarked({ itemId });

        sendResponse({ result });
    }

    if (action === 'getBookmarkedItems') {
        const items = await FirebaseItemsService.getAllBookmarkedItems();

        sendResponse(items);
    }


});