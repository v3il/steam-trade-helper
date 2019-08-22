<template>
    <div class="item-data">
        <h4 class="item-name">{{itemData.itemName}}</h4>

        <div class="separator"></div>

        <table class="item-info">
            <tr class="item-info__row">
                <td class="item-info__param-name">Автопокупка</td>
                <td class="item-info__param-value" :class="{
                    'item-info__param-value--positive': itemData.profit > 0,
                    'item-info__param-value--negative': itemData.profit < 0,
                }">{{itemData.profit.toFixed(2)}}</td>
            </tr>

            <tr class="item-info__row">
                <td class="item-info__param-name">Моя автопокупка</td>
                <td class="item-info__param-value" :class="{
                    'item-info__param-value--positive': itemData.myAutoProfit > 0,
                    'item-info__param-value--negative': itemData.myAutoProfit < 0,
                }">{{itemData.myAutoProfit.toFixed(2)}}</td>
            </tr>

            <tr class="item-info__row">
                <td class="item-info__param-name">Покупка лота</td>
                <td class="item-info__param-value" :class="{
                    'item-info__param-value--positive': itemData.buyProfit > 0,
                    'item-info__param-value--negative': itemData.buyProfit < 0,
                }">{{itemData.buyProfit.toFixed(2)}}</td>
            </tr>
        </table>

        <div class="separator"></div>

        <a
            target="_blank"
            :href="'https://steamcommunity.com/market/listings/570/' + encodeURIComponent(itemData.companionItemName)"
            class="item-companion-link"
        >Показать смежный предмет</a>

        <div class="separator"></div>

        <div class="item-actions">
            <button class="item-actions__unwatch" @click="removeFromBookmarks" v-if="itemData.isBookmarked">
                Не отслеживать
            </button>

            <button class="item-actions__watch" @click="bookmarkItem" v-else>Отслеживать</button>

            <button class="item-actions__refresh" @click="getItemInfo">Обновить</button>
        </div>
    </div>
</template>

<script>
    import sendMessageToBackground from '../utils/sendMessageToBackground';
    import SteamItemsService from '../service/SteamItemsService';

    import Constants from '../Constants';

    const { STEAM_FEE_MULTIPLIER } = Constants;

    export default {
        name: "ItemDataTooltip",

        data() {
            return {
                itemData: {
                    status: '',
                    itemId: 0,
                    itemName: '',
                    isBookmarked: false,
                    companionItemName: '',
                    profit: 0,
                    buyProfit: 0,
                    myAutoProfit: 0,
                },
            }
        },

        methods: {
            async bookmarkItem() {
                const { itemId, itemName } = this.itemData;
                const { result } = await sendMessageToBackground('addToBookmarks', { itemId, itemName });

                if (result) {
                    this.itemData.isBookmarked = true;
                }
            },

            async removeFromBookmarks() {
                const { itemId } = this.itemData;
                const { result } = await sendMessageToBackground('removeFromBookmarks', { itemId });

                if (result) {
                    this.itemData.isBookmarked = false;
                }
            },

            async getItemInfo() {
                const itemData = this.itemData;

                itemData.status = 'loading';

                const itemPrices = await SteamItemsService.getItemData(itemData);
                const companionItemPrices = await SteamItemsService.getItemData({
                    itemName: itemData.companionItemName,
                });

                const { autoPrice, myAutoPrice, lowestLotPrice } = itemPrices;
                const { lowestLotPrice: companionLowestLotPrice } = companionItemPrices;

                itemData.profit = companionLowestLotPrice * STEAM_FEE_MULTIPLIER - autoPrice;
                itemData.buyProfit = companionLowestLotPrice * STEAM_FEE_MULTIPLIER - lowestLotPrice;
                itemData.myAutoProfit = myAutoPrice ? companionLowestLotPrice * STEAM_FEE_MULTIPLIER - myAutoPrice : 0;

                itemData.status = 'loaded';
            },
        },

        async created() {
            const itemId = window.itemid;
            const itemName = document.title.replace(/.*Лоты /, '');

            this.itemData = Object.assign({}, this.itemData, {
                itemId,
                itemName,
                companionItemName: SteamItemsService.getModifiedItemName(itemName),
            });

            const { result: isItemBookmarked } = await sendMessageToBackground('isBookmarked', { itemId });
            this.itemData.isBookmarked = isItemBookmarked;

            this.getItemInfo();
        }
    }
</script>

<style scoped lang="less">
    @import '../common-style';

    .item-data {
        background: black;
        position: fixed;
        top: 0;
        right: 0;
        width: 250px;
        padding: 12px;
        border-radius: 0 0 0 10px;
        z-index: 99999;
    }

    .item-name {
        font-size: 16px;
    }

    .item-info {
        margin: 12px 0;
    }

    .item-companion-link {
        display: block;
        padding: 3px 0;
        margin-bottom: 12px;
        text-align: center;
    }

    .item-actions {
        text-align: center;

        &__watch, &__unwatch, &__refresh {
            display: inline-block;
            margin: 0 6px;
        }
    }

    .item-info__param-name, .item-info__param-value {
        padding: 3px 0;

        &--positive {
            color: lightgreen;
        }

        &--negative {
            color: lightcoral;
        }
    }

    .item-info__param-name {
        width: 200px;
    }
</style>
