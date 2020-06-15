import Vue from "vue";
import ItemDataTooltip from "@/components/ItemDataTooltip.vue";
import MarketPageComponent from "@/components/MarketPageComponent.vue";

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

const handleMarketPage = () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="sat-app"></div>');
    new Vue(MarketPageComponent).$mount('#sat-app');
};

if (window.location.pathname === '/market/') {
    handleMarketPage();
} else {
    handleItemPage();
}



