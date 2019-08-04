<template>
    <div>
        <VDialog :isVisible="dialogShowed" @close="dialogShowed = false">

            <div>
                <label for="showNotifications">
                    <input type="checkbox" id="showNotifications" v-model="settings.showNotifications">

                    Показывать уведомления
                </label>

                <label for="autoUpdateData">
                    <input type="checkbox" id="autoUpdateData" v-model="settings.autoReloadItemsData">

                    Автоматически обновлять данные предметов
                </label>

                <br>
                <br>
            </div>

            <a href="javascript://" @click="loadData">Обновить всё</a>

            <table class="items-table">
                <tr>
                    <td>Название</td>
                    <td>Авто</td>
                    <td>Моя авто</td>
                    <td>Продажа</td>
                    <td>Прибыль</td>
                    <td>Моя прибыль</td>
                    <td>Куп. Прибыль</td>
                    <td>&nbsp;</td>
                </tr>

                <tr v-for="itemData in sortedItemsData" :class="{'off': itemData.profit < 4 && itemData.myAutoProfit < 4 && itemData.status === 'loaded'}">
                    <td>{{itemData.itemName}}</td>

                    <td>
                        <a target="_blank" :href="'/market/listings/570/' + itemData.itemName">
                            {{itemData.auto.toFixed(2)}}
                        </a>
                    </td>

                    <td>
                        <a target="_blank" :href="'/market/listings/570/' + itemData.itemName">
                            {{itemData.myAuto.toFixed(2)}}
                        </a>
                    </td>

                    <td>
                        <a target="_blank" :href="'/market/listings/570/' + itemData.normalizedName">
                            {{itemData.price.toFixed(2)}}
                        </a>
                    </td>

                    <td :class="{
                        green: itemData.profit > 0,
                        red: itemData.profit < 0,
                    }">{{itemData.profit.toFixed(2)}}</td>

                    <td :class="{
                        green: itemData.myAutoProfit > 0,
                        red: itemData.myAutoProfit < 0,
                    }">{{itemData.myAutoProfit.toFixed(2)}}</td>

                    <td :class="{
                        green: itemData.buyProfit > 0,
                        red: itemData.buyProfit < 0,
                    }">{{itemData.buyProfit.toFixed(2)}}</td>

                    <td>
                        <span style="color: red" v-if="itemData.auto - itemData.myAuto < 1">!!!</span>
                        <span @click="getItemInfo(itemData)">Обновить</span> |
                        <span v-if="itemData.status === 'loading'" style="color: red">L</span>
                    </td>
                </tr>
            </table>
        </VDialog>


    </div>
</template>

<script>
    import VDialog from './VDialog.vue';

    import sendMessageToBackground from '../utils/sendMessageToBackground';
    import makeNotification from '../utils/makeNotification';

    import SteamItemsService from '../SteamItemsService';

    export default {
        name: "BookmarkedItemsData",

        components: {
            VDialog,
        },

        data() {
            return {
                dialogShowed: false,
                firstRender: true,
                allItemsData: [],

                settings: {
                    showNotifications: true,
                    autoReloadItemsData: true,
                }
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

            getModifiedItemName(name) {
                return name.startsWith('Inscribed')
                    ? name.replace('Inscribed ', '')
                    : `Inscribed ${name}`;
            },

            open() {
                this.dialogShowed = true;

                if (this.firstRender) {
                    this.loadData();
                    this.firstRender = false;
                }
            },

            async loadData() {
                for (const itemData of this.sortedItemsData) {
                    await this.getItemInfo(itemData);
                }

                const goodProfitItems = this.sortedItemsData.filter(item => item.buyProfit > 7);

                if (goodProfitItems.length && this.settings.showNotifications) {
                    makeNotification({
                        title: 'Есть выгодные предметы!',
                        body: goodProfitItems.map(item => item.itemName).join(', '),
                    });
                }
            }
        },

        created() {
            sendMessageToBackground({ action: 'getSettings' }, async (settings) => {
                this.settings = Object.assign({}, this.settings, settings);
            });

            sendMessageToBackground({ action: 'getBookmarkedItems' }, async (items) => {
                this.allItemsData = items.map((item) => ({
                    ...item,
                    normalizedName: item.itemName.replace('Inscribed ', ''),
                    auto: 0,
                    myAuto: 0,
                    myAutoProfit: 0,
                    price: 0,
                    profit: 0,
                    buyProfit: 0,
                    status: 'loading',
                }));
            });

            setInterval(() => {
                if (this.dialogShowed && this.settings.autoReloadItemsData) {
                    console.log('Reload')
                    this.loadData();
                }
            }, 5 * 60 * 1000);
        },

        watch: {
            settings: {
                deep: true,

                handler(value) {
                    sendMessageToBackground({
                        action: 'updateSettings',
                        settings: value,
                    })
                }
            }
        }
    }
</script>

<style scoped lang="less">
    .items-table {
        color: #ccc;

        td:first-child {
            width: 400px;
        }

        td {
            min-width: 100px;
            padding: 6px 0;
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
    }
</style>