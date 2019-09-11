import axios from 'axios';

window.axios = axios;

export default {
    async getItemData(itemData) {
        const { itemName } = itemData;

        const itemPageHTML = await this.getItemPage(itemName);
        const autoPrice = await this.getAutoPrice(itemPageHTML, itemData);

        return {
            autoPrice,
            myAutoPrice: this.getMyAutoPrice(itemPageHTML),
            lowestLotPrice: this.getLowestLotPrice(itemPageHTML),
        }
    },

    getAutoPrice(itemPageHTML, itemData) {
        return new Promise((resolve) => {
            if (!itemData.itemId) {
                return resolve(0);
            }

            const wrapper = document.createElement('div');
            wrapper.insertAdjacentHTML('beforeend', itemPageHTML);
            document.body.appendChild(wrapper);

            window.Market_LoadOrderSpread(itemData.itemId);

            const id = setInterval(() => {
                let autoPriceTable = document.body.querySelector('.market_commodity_orders_table') ||
                    wrapper.querySelector('.market_commodity_orders_table');

                if (!autoPriceTable) {
                    return;
                }

                clearInterval(id);

                const autoPriceCells = autoPriceTable.querySelectorAll('tr td:first-child');

                let result = 0;

                if (autoPriceCells.length) {
                    const price = autoPriceCells[0].textContent.split(' ').pop().trim();
                    const parsedPrice = price.replace(',', '.').replace(/[^0-9.]/g, '');

                    result = parseFloat(parsedPrice);
                }

                wrapper.remove();

                return resolve(result);
            }, 20);
        })
    },

    getMyAutoPrice(itemPageHTML) {
        const wrapper = document.createElement('div');
        wrapper.insertAdjacentHTML('beforeend', itemPageHTML);
        // document.body.appendChild(wrapper);

        const priceElement = wrapper.querySelector('.my_listing_section:not(#tabContentsMyActiveMarketListingsTable) .market_listing_row .market_listing_price');

        let result = 0;

        if (priceElement) {
            const price = priceElement.textContent.split(' ').pop().trim();
            const parsedPrice = price.replace(',', '.').replace(/[^0-9.]/g, '');

            result = parseFloat(parsedPrice);
        }

        // wrapper.remove();

        return result;
    },

    getLowestLotPrice(itemPageHTML) {
        const wrapper = document.createElement('div');
        wrapper.insertAdjacentHTML('beforeend', itemPageHTML);

        const rows = Array.from(
            wrapper.querySelectorAll('.market_home_main_listing_table .market_recent_listing_row') || []
        );

        const priceCells = rows.map(row => row.querySelector('.market_listing_price_with_fee'));

        const prices = priceCells.map((cell) => {
            // Цена или строка "Продано!"
            const value = cell.textContent.trim()
                .replace(',', '.')
                .replace(/[^0-9.]/g, '');

            if (value.length) {
                return parseFloat(value);
            } else {
                return 0;
            }
        });

        const meaningfulPrices = prices.filter(price => price > 0);
        return Math.min.apply(null, meaningfulPrices);
    },

    async getItemPage(itemName) {
        const encodedItemName = encodeURIComponent(itemName);

        try {
            const response = await axios.get(`/market/listings/570/${encodedItemName}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    getModifiedItemName(itemName) {
        return itemName.startsWith('Inscribed')
            ? itemName.replace('Inscribed ', '')
            : `Inscribed ${itemName}`;
    },
}