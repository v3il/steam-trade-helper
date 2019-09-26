<template>
    <div class="items">
        <button @click="loadData">Обновить всё</button>

        <div class="separator"></div>

        <table class="items_table">
            <tr class="items_table-row">
                <td class="items_table-cell items_table-cell-name">Название</td>
                <td class="items_table-cell">Автопокупка</td>
                <td class="items_table-cell">Моя автопокупка</td>
                <td class="items_table-cell">Продажа</td>
                <td class="items_table-cell">Прибыль</td>
                <td class="items_table-cell items_table-cell-my-profit">Моя прибыль</td>
                <td class="items_table-cell items_table-cell-buy-profit">Покупка лота</td>
                <td class="items_table-cell items_table-cell-actions">&nbsp;</td>
            </tr>

            <tr v-for="itemData in sortedItemsData" class="items_table-row" :class="{
                'items_table-row--meager': itemData.isMeagerItem
            }">
                <td class="items_table-cell items_table-cell-name">
                    {{itemData.normalizedName}}
                </td>

                <td class="items_table-cell">
                    <a target="_blank" :href="'/market/listings/570/' + itemData.itemName">
                        {{itemData.auto | format}}
                    </a>
                </td>

                <td class="items_table-cell">
                    <a target="_blank" :href="'/market/listings/570/' + itemData.itemName">
                        {{itemData.myAuto | format}}

                        <span class="items_table-cell-autoprice-diff" :class="{
                            'items_table-cell-autoprice-diff--positive': itemData.autoPriceDiff >= 10,
                            'items_table-cell-autoprice-diff--negative': itemData.autoPriceDiff < 10,
                        }" v-if="itemData.autoPriceDiff > 0">
                            ({{itemData.autoPriceDiff | format}})
                        </span>
                    </a>
                </td>

                <td class="items_table-cell">
                    <a target="_blank" :href="'/market/listings/570/' + itemData.normalizedName">
                        {{itemData.price | format}}
                    </a>
                </td>

                <td class="items_table-cell" :class="{
                    'items_table-cell--positive': itemData.profit > 0,
                    'items_table-cell--negative': itemData.profit < 0,
                }">{{itemData.profit | format}}</td>

                <td class="items_table-cell items_table-cell-my-profit" :class="{
                    'items_table-cell--positive': itemData.myAutoProfit > 0,
                    'items_table-cell--negative': itemData.myAutoProfit < 0,
                }">
                    {{itemData.myAutoProfit | format}}
                </td>

                <td class="items_table-cell items_table-cell-buy-profit" :class="{
                    'items_table-cell--positive': itemData.buyProfit > 0,
                    'items_table-cell--negative': itemData.buyProfit < 0,
                }">{{itemData.buyProfit | format}}</td>

                <td class="items_table-cell items_table-cell-actions" v-if="itemData.status === 'loaded'">
                    <i
                        class="material-icons items_action-btn"
                        @click="getItemInfo(itemData)"
                    >refresh</i>

                    <i
                        class="material-icons items_action-btn items_action-btn-remove"
                        @click="removeItemFromBookmarks(itemData)"
                    >delete</i>
                </td>

                <td class="items_table-cell" v-if="itemData.status === 'loading'">
                    <i v-if="itemData.status === 'loading'"
                       class="material-icons items_action-btn items_action-btn-loader"
                    >cached</i>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
    import sendMessageToBackground from '../utils/sendMessageToBackground';
    import makeNotification from '../utils/makeNotification';

    import SteamItemsService from '../service/SteamItemsService';

    import formatPrice from '../vue-mixins/formatPrice';

    import Constants from '../Constants';

    const { STEAM_FEE_MULTIPLIER } = Constants;

    export default {
        name: "BookmarkedItemsData",

        mixins: [
            formatPrice
        ],

        props: {
            settingsData: {
                type: Object,
                default: () => ({}),
            },

            pollingStarted: {
                type: Boolean,
                default: false,
            }
        },

        data() {
            return {
                allItemsData: [],

                polling: false,
                pollingIntervalId: 0,
            }
        },

        computed: {
            sortedItemsData() {
                const copy = [...this.allItemsData];
                return copy.sort((a, b) => a.itemName.localeCompare(b.itemName));
            },

            settings() {
                return this.settingsData;
            },
        },

        methods: {
            async getItemInfo(itemData) {
                itemData.status = 'loading';

                const itemPrices = await new Promise(async (resolve) => {
                    const data = await SteamItemsService.getItemData(itemData);
                    resolve(data);
                });

                const companionItemPrices = await new Promise(async (resolve) => {
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

                itemData.profit = itemData.price * STEAM_FEE_MULTIPLIER - itemData.auto;
                itemData.buyProfit = itemData.price * STEAM_FEE_MULTIPLIER - itemData.buyPrice;
                itemData.myAutoProfit = itemData.myAuto ? itemData.price * STEAM_FEE_MULTIPLIER - itemData.myAuto : 0;

                itemData.autoPriceDiff = itemData.myAuto > 0 ? itemData.auto - itemData.myAuto : 0;
                itemData.isMeagerItem = itemData.profit < 5 && itemData.myAutoProfit < 5;
                itemData.autoPriceWarn = itemData.myAuto > 0 && itemData.autoPriceDiff < this.settings.minRequiredProfit;

                itemData.status = 'loaded';
            },

            startPolling() {
                console.log('Start');

                this.pollingIntervalId = setInterval(() => {
                    if (this.settings.autoReloadItemsData) {
                        console.log('Reload');
                        this.loadData();
                    }
                }, this.settings.refreshInterval * 60 * 1000);

                this.loadData();
            },

            stopPolling() {
                console.log('Stop');

                clearInterval(this.pollingIntervalId);
            },

            async loadData() {
                for (const itemData of this.sortedItemsData) {
                    if (!this.polling) {
                        return console.log('Stop polling');
                    }

                    await this.getItemInfo(itemData);

                    if (itemData.buyProfit > this.settings.notifyOnPrice) {
                        makeNotification({
                            title: 'Есть выгодные предметы!',
                            body: `${itemData.normalizedName} (${itemData.buyProfit.toFixed(2)})`,
                        }, () => {
                            sendMessageToBackground('openTabs', {
                                urls: [`https://steamcommunity.com/market/listings/570/${itemData.itemName}`],
                            });
                        });
                    }

                    // console.clear();
                }
            },

            async removeItemFromBookmarks(itemData) {
                const { itemId, itemName } = itemData;

                if (confirm(`Удалить "${itemName}" из закладок?`)) {
                    const { result } = await sendMessageToBackground('removeFromBookmarks', { itemId });

                    if (result) {
                        this.allItemsData = this.allItemsData.filter(item => item.itemId !== itemId);
                    }
                }
            }
        },

        async created() {
            const items = await sendMessageToBackground('getBookmarkedItems');

            console.log(items)

            this.allItemsData = items.map((item) => ({
                ...item,
                itemId: item.steamId,
                normalizedName: item.itemName.replace('Inscribed ', ''),
                auto: 0,
                myAuto: 0,
                myAutoProfit: 0,
                price: 0,
                profit: 0,
                buyProfit: 0,
                status: 'initialized',
                isMeagerItem: false,
                autoPriceWarn: false,
            }));
        },

        watch: {
            pollingStarted(value) {
                this.polling = value;

                if (value) {
                    this.startPolling();
                } else {
                    this.stopPolling();
                }
            }
        }
    }
</script>

<style scoped lang="less">
    @import "../common-style";

    .items {
        &_table-row {
            &--meager {
                opacity: 0.3;
            }
        }

        &_table-cell {
            min-width: 60px;
            padding: 3px 12px;
            height: 20px;
            color: #ccc;

            &--positive {
                color: lightgreen;
            }

            &--negative {
                color: lightcoral;
            }
        }

        &_table-cell-name {
            width: 180px;
        }

        &_table-cell-actions {
            display: flex;
        }

        &_table-cell-my-profit {
            border-left: 1px solid #121212;
            text-align: center;
        }

        &_table-cell-buy-profit {
            border-right: 1px solid #121212;
            text-align: center;
        }

        &_action-btn {
            font-size: 19px;
            margin-right: 6px;
            cursor: pointer;
        }

        &_action-btn-remove {
            color: lightcoral;
        }

        &_action-btn-warn {
            color: darkorange;
            vertical-align: bottom;
            font-size: 16px;
        }

        &_action-btn-loader {
            animation: rotate 1s infinite linear;
        }

        &_table-cell-autoprice-diff {
            &--positive {
                color: lightgreen;
            }

            &--negative {
                color: lightcoral;
            }
        }
    }
</style>