import Vue from "vue";
import ItemDataTooltip from "@/components/ItemDataTooltip.vue";
import MarketPageComponent from "@/components/MarketPageComponent.vue";
import sendMessageToBackground from "@/utils/sendMessageToBackground";

const handleItemPage = () => {
    const id = setInterval(() => {
        if (window.itemid) {
            console.log(window.itemid);

            clearInterval(id);

            document.body.insertAdjacentHTML('beforeend', '<div id="sat-app"></div>');
            new Vue(ItemDataTooltip).$mount('#sat-app');
        }
    }, 20);
};

const handleCSGoItemPage = () => {
    const id = setInterval(() => {
        if (window.itemid) {
            console.log(window.itemid);

            clearInterval(id);

            const w = document.createElement('div');
            w.id = 'asdf';
            w.style.position = 'fixed';
            w.style.width = '30px';
            w.style.height = '30px';
            w.style.background = '#fff';
            w.style.right = 0;
            w.style.zIndex = 10000000;
            w.style.top = 0;
            document.body.appendChild(w);

            w.addEventListener('click', async () => {
                const itemId = window.itemid;
                const itemName = document.getElementById('largeiteminfo_item_name').textContent || '';
                const itemNameEn = decodeURIComponent(location.pathname.split('/').pop());

                await sendMessageToBackground('bookmarkCase', {
                    steamId: itemId,
                    steamName: itemName,
                    steamNameEn: itemNameEn,
                });
            });
        }
    }, 20);
};

const handleMarketPage = () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="sat-app"></div>');
    new Vue(MarketPageComponent).$mount('#sat-app');
};

if (window.location.pathname === '/market/') {
    handleMarketPage();
} else if (/730/g.test(window.location.pathname)) {
    console.log(111);
    handleCSGoItemPage();
} else {
    handleItemPage();
}



