<template>
    <div class="st-tooltip">
        <h4>{{itemData.itemName}}</h4>

        <div class="separator"></div>

        <table>
            <tr>
                <td>Автопокупка</td>
                <td :class="{
                    green: itemData.profit > 0,
                    red: itemData.profit < 0,
                }">{{itemData.profit.toFixed(2)}}</td>
            </tr>

            <tr>
                <td>Моя автопокупка</td>
                <td :class="{
                    green: itemData.myAutoProfit > 0,
                    red: itemData.myAutoProfit < 0,
                }">{{itemData.myAutoProfit.toFixed(2)}}</td>
            </tr>

            <tr>
                <td>Покупка лота</td>
                <td :class="{
                    green: itemData.buyProfit > 0,
                    red: itemData.buyProfit < 0,
                }">{{itemData.buyProfit.toFixed(2)}}</td>
            </tr>
        </table>

        <div class="separator"></div>

        <a
            target="_blank"
            :href="'https://steamcommunity.com/market/listings/570/' + encodeURIComponent(itemData.companionItemName)"
        >Показать смежный предмет</a>

        <div class="separator"></div>

        <div class="actions-wrap">
            <button @click="removeFromBookmarks" v-if="itemData.isBookmarked">Не отслеживать</button>
            <button @click="bookmarkItem" v-else>Отслеживать</button>

            <button @click="getItemInfo">Обновить</button>
        </div>
    </div>
</template>

<script>
    import sendMessageToBackground from '../utils/sendMessageToBackground';
    import SteamItemsService from '../SteamItemsService';

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
            bookmarkItem() {
                sendMessageToBackground({
                    action: 'addToBookmarks',
                    itemId: this.itemData.itemId,
                    itemName: this.itemData.itemName,
                }, ({ result }) => {
                    if (result) {
                        this.itemData.isBookmarked = true;
                    }
                })
            },

            removeFromBookmarks() {
                sendMessageToBackground({
                    action: 'removeFromBookmarks',
                    itemId: this.itemData.itemId,
                }, ({ result }) => {
                    if (result) {
                        this.itemData.isBookmarked = false;
                    }
                });
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

                itemData.profit = companionLowestLotPrice * 0.87 - autoPrice;
                itemData.buyProfit = companionLowestLotPrice * 0.87 - lowestLotPrice;
                itemData.myAutoProfit = myAutoPrice ? companionLowestLotPrice * 0.87 - myAutoPrice : 0;

                itemData.status = 'loaded';
            },
        },

        async created() {
            const itemName = document.title.replace(/.*Лоты /, '');

            this.itemData = Object.assign({}, this.itemData, {
                itemName,
                companionItemName: SteamItemsService.getModifiedItemName(itemName),
                itemId: window.itemid,
            });

            sendMessageToBackground({
                action: 'isBookmarked',
                itemId: this.itemData.itemId,
            }, ({ result }) => {
                this.itemData.isBookmarked = result;
            });

            await this.getItemInfo();
        }
    }
</script>

<style scoped lang="less">
    .st-tooltip {
        background: black;
        position: fixed;
        top: 0;
        right: 0;
        width: 250px;
        padding: 12px;
        border-radius: 0 0 0 10px;
        z-index: 99999;

        table {
            margin: 12px 0;
        }

        .separator {
            margin: 12px 0;
            background: #121212;
            height: 1px;
            width: 100%;
        }

        &.big {
            width: 600px;

            td:first-child {
                width: 300px;
            }
        }

        a {
            display: block;
            padding: 3px 0;
            margin-bottom: 12px;
            text-align: center;
        }

        button {
            display: inline-block;
            margin: 0 auto;
            margin-right: 12px;
        }

        td {
            padding: 3px 0;
        }

        td.green {
            color: lightgreen;
        }

        td.red {
            color: lightcoral;
        }

        td:first-child {
            width: 200px;
        }

        .actions-wrap {
            text-align: center;
        }

        h4 {
            font-size: 16px;
        }
    }
</style>
