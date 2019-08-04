<template>
    <div class="st-tooltip">
        <div @click="scrollToTop">To top</div>
        <div @click="scrollToPagination">To pagi</div>
        <div @click="showItemsData">Items</div>

        <BookmarkedItemsData ref="bid"></BookmarkedItemsData>
    </div>
</template>

<script>
    import BookmarkedItemsData from './BookmarkedItemsData.vue';

    export default {
        name: "MarketPageComponent",

        components: {
            BookmarkedItemsData,
        },

        methods: {
            scrollToPagination() {
                const pagination = document.querySelector('.market_paging');
                const top = pagination.getBoundingClientRect().top;

                window.scrollTo(null, top + window.scrollY - 600);
            },

            showItemsData() {
                this.$refs.bid.open();
            },

            scrollToTop() {
                window.scrollTo(null, 0);
            },
        }
    }
</script>

<style scoped lang="less">
    .st-tooltip {
        background: black;
        position: fixed;
        top: 0;
        right: 0;
        /*width: 100px;*/
        padding: 12px;
        border-radius: 0 0 0 10px;
        z-index: 99999;

        div {
            cursor: pointer;
            margin-bottom: 6px;
        }
    }
</style>