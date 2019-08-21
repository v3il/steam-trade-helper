import axios from 'axios';

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
        document.body.appendChild(wrapper);

        const priceElement = wrapper.querySelector('.my_listing_section:not(#tabContentsMyActiveMarketListingsTable) .market_listing_row .market_listing_price');

        let result = 0;

        if (priceElement) {
            const price = priceElement.textContent.split(' ').pop().trim();
            const parsedPrice = price.replace(',', '.').replace(/[^0-9.]/g, '');

            result = parseFloat(parsedPrice);
        }

        wrapper.remove();

        return result;
    },

    getLowestLotPrice(itemPageHTML) {
        const wrapper = document.createElement('div');
        wrapper.insertAdjacentHTML('beforeend', itemPageHTML);
        document.body.appendChild(wrapper);

        const rows = wrapper.querySelectorAll('.market_home_main_listing_table .market_recent_listing_row');
        const row = Array.from(rows).filter(row => {
            return row.textContent.trim().indexOf('Продано!') < 0;
        })[0];

        const cell = row.querySelector('.market_listing_price_with_fee');

        let result = 0;

        if (cell) {
            result = parseFloat(cell.textContent.trim().replace(',', '.'));
        }

        wrapper.remove();

        return result;
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