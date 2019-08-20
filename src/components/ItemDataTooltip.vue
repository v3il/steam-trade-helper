<template>
    <div class="st-tooltip">
        <table>
            <tr>
                <td>{{itemData.itemName}}</td>
                <td>{{itemData.price}} ({{itemData.auto}})</td>
            </tr>

            <tr>
                <td>{{itemData.modifiedItemName}}</td>
                <td>{{// itemData.profit.toFixed(2)}}</td>
            </tr>

            <tr>
                <td>Прибыль</td>
                <td :class="{
                    green: itemData.profit > 0,
                    red: itemData.profit < 0,
                }">{{// itemData.profit.toFixed(2)}}</td>
            </tr>

            <tr><td colspan="2">
                <a
                    target="_blank"
                    :href="'https://steamcommunity.com/market/listings/570/' + encodeURIComponent(itemData.modifiedItemName)"
                >Поменять местами</a>
            </td></tr>

            <tr>
                <td>
                    <button @click="removeFromBookmarks" v-if="itemData.isBookmarked">Убрать из закладок</button>
                    <button @click="bookmarkItem" v-else>Добавить в закладки</button>
                </td>
            </tr>
        </table>


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
                    modifiedItemName: '',
                    price: 0,
                    buyPrice: 0,
                    auto: 0,
                    myAuto: 0,
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
                    itemId: this.itemId,
                    itemName: this.itemName,
                }, ({ result }) => {
                    if (result) {
                        this.isBookmarked = true;
                    }
                })
            },

            removeFromBookmarks() {
                sendMessageToBackground({
                    action: 'removeFromBookmarks',
                    itemId: this.itemId,
                }, ({ result }) => {
                    if (result) {
                        this.isBookmarked = false;
                    }
                });
            },

            async getItemInfo() {
                const itemData = this.itemData;

                itemData.status = 'loading';

                const itemPrices = await new Promise(async (resolve) => {
                    const data = await SteamItemsService.getItemData(itemData);
                    resolve(data);
                });

                const companionItemPrices = await new Promise((resolve) => {
                    setTimeout(async () => {
                        const data = await SteamItemsService.getItemData({
                            itemName: itemData.normalizedName,
                        });

                        resolve(data);
                    }, 1000);
                });

                const { autoPrice, myAutoPrice, lowestLotPrice } = itemPrices;
                const { lowestLotPrice: companionLowestLotPrice } = companionItemPrices;

                itemData.price = companionLowestLotPrice;
                itemData.buyPrice = lowestLotPrice;
                itemData.auto = autoPrice;
                itemData.myAuto = myAutoPrice;

                itemData.profit = itemData.price * 0.87 - itemData.auto;
                itemData.buyProfit = itemData.price * 0.87 - itemData.buyPrice;
                itemData.myAutoProfit = itemData.myAuto ? itemData.price * 0.87 - itemData.myAuto : 0;

                itemData.status = 'loaded';
            },
        },

        async created() {
            const itemName = document.title.replace(/.*Лоты /, '');

            this.itemData = Object.assign({}, {
                itemName,
                modifiedItemName: itemName.replace('Inscribed', ''),
                itemId: window.itemid,
            });

            sendMessageToBackground({
                action: 'isBookmarked',
                itemId: this.itemData.itemId,
            }, ({ result }) => {
                this.itemData.isBookmarked = result;
            });

            this.getItemInfo();
        }
    }
</script>

<style scoped lang="less">
    .st-tooltip {
        background: black;
        position: fixed;
        top: 0;
        right: 0;
        width: 320px;
        padding: 12px;
        border-radius: 0 0 0 10px;
        z-index: 99999;

        &.big {
            width: 600px;

            td:first-child {
                width: 300px;
            }
        }

        a {
            display: block;
            /*text-align: center;*/
            padding: 3px 0;
        }

        td {
            padding: 3px 6px;
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

        tr.off {
            opacity: 0.3;
        }
    }
</style>
