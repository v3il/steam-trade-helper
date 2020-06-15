<template>
    <div class="settings">
        <div class="settings_param">
            <span class="settings_name">Показывать уведомления</span>
            <input class="settings_value-checkbox" type="checkbox" v-model="settingsData.showNotifications">
        </div>

        <div class="settings_param">
            <span class="settings_name">Автоматически обновлять данные предметов</span>
            <input class="settings_value-checkbox" type="checkbox" v-model="settingsData.autoReloadItemsData">
        </div>

        <div class="settings_param">
            <span class="settings_name">Цена предмета для оповещения</span>
            <input class="settings_value-input" type="number" v-model.number="settingsData.notifyOnPrice">
        </div>

        <div class="settings_param">
            <span class="settings_name">Обновлять данные через (минут):</span>
            <input class="settings_value-input" type="number" v-model.number="settingsData.refreshInterval">
        </div>

        <div class="settings_param">
            <span class="settings_name">Минимальная желаемая прибыль:</span>
            <input class="settings_value-input" type="number" v-model.number="settingsData.minRequiredProfit">
        </div>
    </div>
</template>

<script>
    export default {
        name: "SettingsComponent",

        props: {
            settingsData: {
                type: Object,
                default: () => ({}),
            },
        },
    }
</script>

<style scoped>

</style>