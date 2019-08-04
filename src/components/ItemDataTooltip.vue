<template>
    <div class="st-tooltip" :class="{'big': showAllItemsData}">
        <table v-if="!showAllItemsData">
            <tr>
                <td>{{itemName}}</td>
                <td>{{itemPrice}} ({{itemAutoPrice}})</td>
            </tr>

            <tr>
                <td>{{modifiedItemName}}</td>
                <td>{{modifiedItemPrice}}</td>
            </tr>

            <tr>
                <td>Прибыль</td>
                <td :class="{
                    green: profit > 0,
                    red: profit < 0,
                }">{{profit.toFixed(2)}}</td>
            </tr>

            <tr><td colspan="2">
                <a
                    target="_blank"
                    :href="'https://steamcommunity.com/market/listings/570/' + encodeURIComponent(modifiedItemName)"
                >Поменять местами</a>
            </td></tr>

            <!--<tr><td colspan="2">-->
                <!--<button @click="showBookmarkedItemsPrice">Показать все предметы</button>-->

                <!--{{itemId}}-->
            <!--</td></tr>-->

            <tr>
                <td>
                    <button @click="removeFormBookmarks" v-if="isBookmarked">Remove from bookmarks</button>
                    <button @click="bookmarkItem" v-else>Bookmark item</button>
                </td>
            </tr>
        </table>


    </div>
</template>

<script>
    import axios from 'axios';
    import bookmarkedItems from '../bookmarkedItems';

    import sendMessageToBackground from '../utils/sendMessageToBackground';



    export default {
        name: "ItemDataTooltip",

        data() {
            return {
                itemName: '',
                itemPrice: 0,
                modifiedItemPrice: 0,
                itemAutoPrice: 0,

                isBookmarked: true,

                showAllItemsData: false,
                allItemsData: [],
            }
        },

        computed: {
            modifiedItemName() {
                return this.itemName.startsWith('Inscribed')
                    ? this.itemName.replace('Inscribed ', '')
                    : `Inscribed ${this.itemName}`;
            },

            profit() {
                return this.modifiedItemPrice * 0.87 - this.itemAutoPrice;
            },

            sortedItemsData() {
                const copy = [...this.allItemsData];
                return copy.sort((a, b) => b.myAutoProfit - a.myAutoProfit);
            }
        },

        methods: {
            getItemPrice(itemName) {
                return new Promise((resolve) => {
                    const encodedItemName = encodeURIComponent(itemName);

                    axios.get(`/market/listings/570/${encodedItemName}`)
                        .then((response) => {
                            const div = document.createElement('div');
                            div.insertAdjacentHTML('beforeend', response.data);
                            document.body.appendChild(div);

                            const rows = div.querySelectorAll('.market_home_main_listing_table .market_recent_listing_row');
                            const row = Array.from(rows).filter(row => {
                                return row.textContent.trim().indexOf('Продано!') < 0;
                            })[0];

                            const cell = row.querySelector('.market_listing_price_with_fee');

                            if (cell) {
                                console.log(cell.textContent.trim().replace(',', '.'))

                                resolve(parseFloat(cell.textContent.trim().replace(',', '.')));
                            } else {
                                resolve(0)
                            }

                            div.remove();
                        });
                });
            },

            getItemAutoPrice(itemId) {
                return new Promise((resolve) => {
                    axios.get(`https://steamcommunity.com/market/itemordershistogram?country=UA&language=russian&currency=18&item_nameid=${itemId}&two_factor=0`)
                        .then((response) => response.data)
                        .then((response) => {
                            const itemAutoPrice = response.highest_buy_order
                                ? parseFloat(response.highest_buy_order / 100).toFixed(2)
                                : -1;

                            resolve(itemAutoPrice);
                        });
                });
            },

            getMyAutoPrice(itemName) {
                return new Promise((resolve) => {
                    axios.get(`/market/listings/570/${encodeURIComponent(itemName)}`)
                        .then((response) => {
                            const div = document.createElement('div');
                            div.insertAdjacentHTML('beforeend', response.data);
                            document.body.appendChild(div);

                            const priceElement = div.querySelector('.my_listing_section .market_listing_row .market_listing_price')

                            if (priceElement) {
                                const price = priceElement.textContent.split(' ').pop().trim();
                                const parsedPrice = price.replace(',', '.').replace(/[^0-9.]/g, '');

                                resolve(parseFloat(parsedPrice));
                            } else {
                                resolve(0)
                            }

                            div.remove();
                        });
                })
            },

            showBookmarkedItemsPrice() {
                this.showAllItemsData = true;

                this.allItemsData = bookmarkedItems.map((item) => ({
                    ...item,
                    normalizedName: item.name.replace('Inscribed ', ''),
                    auto: 0,
                    myAuto: 0,
                    myAutoProfit: 0,
                    price: 0,
                    profit: 0,
                }));

                this.allItemsData.forEach((item) => {
                    this.getItemInfo(item);
                });
            },

            getItemInfo(itemData) {
                this.getItemPrice(this.getModifiedItemName(itemData.name))
                    .then((modifiedItemPrice) => {
                        itemData.price = modifiedItemPrice;

                        this.getItemAutoPrice(itemData.id)
                            .then((itemAutoPrice) => {
                                itemData.auto = +itemAutoPrice;

                                this.getMyAutoPrice(itemData.name)
                                    .then((myAutoPrice) => {
                                        itemData.myAuto = myAutoPrice;

                                        itemData.profit = itemData.price * 0.87 - itemData.auto;
                                        itemData.myAutoProfit = itemData.myAuto ? itemData.price * 0.87 - itemData.myAuto : 0;
                                    });
                            });
                    });
            },

            getModifiedItemName(name) {
                return name.startsWith('Inscribed')
                    ? name.replace('Inscribed ', '')
                    : `Inscribed ${name}`;
            },

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

            removeFormBookmarks() {
                sendMessageToBackground({
                    action: 'removeFromBookmarks',
                    itemId: this.itemId,
                }, ({ result }) => {
                    if (result) {
                        this.isBookmarked = false;
                    }
                });
            }
        },

        async created() {
            this.itemName = document.title.replace(/.*Лоты /, '');
            this.itemId = window.itemid;

            sendMessageToBackground({
                action: 'isBookmarked',
                itemId: this.itemId,
            }, ({ result }) => {
                this.isBookmarked = result;
            });

            axios.all([
                this.getItemPrice(this.itemName),
                this.getItemPrice(this.modifiedItemName),
                this.getItemAutoPrice(window.itemid)
            ]).then(([itemPrice, modifiedItemPrice, itemAutoPrice]) => {
                this.itemPrice = itemPrice;
                this.modifiedItemPrice = modifiedItemPrice;
                this.itemAutoPrice = itemAutoPrice;
            });
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
