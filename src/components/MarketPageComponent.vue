<template>
    <div class="market-page-actions">
        <button class="market-page-actions_to-top" @click="scrollToTop">Вверх</button>
        <button class="market-page-actions_to-pagi" @click="scrollToPagination">К пагинации</button>
        <button class="market-page-actions_items" @click="showItemsData">Предметы</button>
        <button class="market-page-actions_settings" @click="showSettings">Настройки</button>

        <VDialog ref="itemsComponentPopup" @close="$refs.itemsComponent.stopPolling()">
            <BookmarkedItemsData ref="itemsComponent" />
        </VDialog>

        <VDialog ref="settingsComponentPopup">
            <SettingsComponent ref="settingsComponent"></SettingsComponent>
        </VDialog>
    </div>
</template>

<script>
    import BookmarkedItemsData from './BookmarkedItemsData.vue';
    import SettingsComponent from './SettingsComponent.vue';
    import VDialog from './VDialog.vue';

    export default {
        name: "MarketPageComponent",

        components: {
            BookmarkedItemsData,
            SettingsComponent,
            VDialog,
        },

        methods: {
            scrollToPagination() {
                const pagination = document.querySelector('.market_paging');
                const top = pagination.getBoundingClientRect().top;

                window.scrollTo(null, top + window.scrollY - 600);
            },

            showItemsData() {
                this.$refs.itemsComponentPopup.open();
                this.$refs.itemsComponent.startPolling();
            },

            showSettings() {
                this.$refs.settingsComponentPopup.open();
            },

            scrollToTop() {
                window.scrollTo(null, 0);
            },
        }
    }
</script>

<style scoped lang="less">
    .market-page-actions {
        background: black;
        position: fixed;
        top: 0;
        right: 0;
        width: 200px;
        padding: 12px;
        border-radius: 0 0 0 10px;
        z-index: 999;

        &_to-top, &_to-pagi, &_items, &_settings {
            cursor: pointer;
            margin-bottom: 6px;
            width: 100%;
        }
    }
</style>