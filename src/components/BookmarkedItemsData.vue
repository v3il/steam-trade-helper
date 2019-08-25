<template>
    <div>
        <!--<VDialog :isVisible="dialogShown" @close="dialogShown = false">-->

            <button @click="loadData">Обновить всё</button>

            <div class="separator"></div>

            <table class="items-table">
                <tr>
                    <td>Название</td>
                    <td>Автопокупка</td>
                    <td>Моя автопокупка</td>
                    <td>Продажа</td>
                    <td>Прибыль</td>
                    <td>Моя прибыль</td>
                    <td>Покупка лота</td>
                    <td>Разница автопокупки</td>
                    <td>&nbsp;</td>
                </tr>

                <tr v-for="itemData in sortedItemsData" :class="{'off': itemData.profit < 5 && itemData.myAutoProfit < 5 && itemData.status === 'loaded'}">
                    <td>{{itemData.normalizedName}}</td>

                    <td>
                        <a target="_blank" :href="'/market/listings/570/' + itemData.itemName">
                            {{itemData.auto | format}}
                        </a>
                    </td>

                    <td>
                        <a target="_blank" :href="'/market/listings/570/' + itemData.itemName">
                            {{itemData.myAuto | format}}
                        </a>
                    </td>

                    <td>
                        <a target="_blank" :href="'/market/listings/570/' + itemData.normalizedName">
                            {{itemData.price | format}}
                        </a>
                    </td>

                    <td :class="{
                        green: itemData.profit > 0,
                        red: itemData.profit < 0,
                    }">{{itemData.profit | format}}</td>

                    <td :class="{
                        green: itemData.myAutoProfit > 0,
                        red: itemData.myAutoProfit < 0,
                    }">{{itemData.myAutoProfit | format}}</td>

                    <td :class="{
                        green: itemData.buyProfit > 0,
                        red: itemData.buyProfit < 0,
                    }">{{itemData.buyProfit | format}}</td>

                    <td :class="{
                        red: itemData.auto - itemData.myAuto < 15,
                    }">{{(itemData.myAuto === 0 ? 0 : itemData.auto - itemData.myAuto) | format}}</td>

                    <td>
                        <span
                            class="action-button warn"
                            v-if="itemData.auto - itemData.myAuto < 1 && itemData.status === 'loaded'"
                        >!!!</span>

                        <span v-if="itemData.status !== 'loading'" @click="getItemInfo(itemData)" class="action-button reload">
                            &#x21bb;
                        </span>

                        <span v-if="itemData.status !== 'loading'"  @dblclick="removeItemFromBookmarks(itemData)" class="action-button remove">
                            &times;
                        </span>
                    </td>
                </tr>
            </table>
        <!--</VDialog>-->
    </div>
</template>

<script>
    import VDialog from './VDialog.vue';

    import sendMessageToBackground from '../utils/sendMessageToBackground';
    import makeNotification from '../utils/makeNotification';

    import SteamItemsService from '../service/SteamItemsService';

    import formatPrice from '../vue-mixins/formatPrice';

    import Constants from '../Constants';
    import EventBus from '../EventBus';

    const { STEAM_FEE_MULTIPLIER } = Constants;

    export default {
        name: "BookmarkedItemsData",

        components: {
            VDialog,
        },

        mixins: [
            formatPrice
        ],

        data() {
            return {
                dialogShown: false,
                firstRender: true,
                allItemsData: [],

                settings: {}
            }
        },

        computed: {
            sortedItemsData() {
                const copy = [...this.allItemsData];
                return copy.sort((a, b) => a.itemName.localeCompare(b.itemName));
            }
        },

        methods: {
            async getItemInfo(itemData) {
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
                    }, 500);
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

                itemData.status = 'loaded';
            },

            startPolling() {

                console.log('Start')

                // todo

                this.dialogShown = true;

                if (this.firstRender) {
                    this.loadData();
                    this.firstRender = false;
                }
            },

            stopPolling() {
                console.log('Stop')

                // todo

                this.dialogShown = false;

                // if (this.firstRender) {
                //     this.loadData();
                //     this.firstRender = false;
                // }
            },

            async loadData() {
                for (const itemData of this.sortedItemsData) {
                    await this.getItemInfo(itemData);

                    if (itemData.buyProfit > this.settings.notifyOnPrice) {
                        makeNotification({
                            title: 'Есть выгодные предметы!',
                            body: itemData.normalizedName,
                        }, () => {
                            sendMessageToBackground('openTabs', {
                                urls: [`https://steamcommunity.com/market/listings/570/${itemData.itemName}`],
                            });
                        });
                    }
                }
            },

            async removeItemFromBookmarks(itemData) {
                const { itemId } = itemData;
                const { result } = await sendMessageToBackground('removeFromBookmarks', { itemId });

                if (result) {
                    this.allItemsData = this.allItemsData.filter(item => item.itemId !== itemId);
                }
            }
        },

        async created() {
            const settings = await sendMessageToBackground('getSettings');
            this.settings = Object.assign({}, settings);

            // EventBus.$on('settings-update', (settings) => {
            //     console.log('Update2')
            //
            //     this.settings = Object.assign({}, this.settings, settings);
            // });

            const items = await sendMessageToBackground('getBookmarkedItems');
            this.allItemsData = items.map((item) => ({
                ...item,
                normalizedName: item.itemName.replace('Inscribed ', ''),
                auto: 0,
                myAuto: 0,
                myAutoProfit: 0,
                price: 0,
                profit: 0,
                buyProfit: 0,
                status: 'initialized',
            }));

            setInterval(() => {
                if (this.dialogShown && this.settings.autoReloadItemsData) {
                    console.log('Reload')
                    this.loadData();
                }
            }, this.settings.refreshInterval * 60 * 1000);
        },
    }
</script>

<style scoped lang="less">
    .items-table {
        color: #ccc;

        td:first-child {
            width: 180px;
        }

        td {
            min-width: 60px;
            padding: 3px 12px;
        }

        td.green {
            color: lightgreen;
        }

        td.red {
            color: lightcoral;
        }

        td, a {
            color: #ccc;
        }

        tr.off {
            opacity: 0.3;
        }

        .action-button {
            font-size: 20px;
            display: inline-block;
            margin-right: 12px;
            line-height: 20px;
            cursor: pointer;

            &.remove {
                color: lightcoral;
            }

            &.warn {
                color: red;
            }
        }
    }

    label {
        display: block;
        margin: 6px 0 6px 12px;

        input[type="text"], input[type="number"] {
            background: #121212 !important;
            width: 50px;
            text-align: center;
        }
    }

    .separator {
        margin: 12px 0;
        background: #121212;
        height: 1px;
        width: 100%;
    }
</style>