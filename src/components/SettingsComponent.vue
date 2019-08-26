<template>
    <div class="settings">
        <div class="settings_param">
            <span class="settings_name">Показывать уведомления</span>
            <input class="settings_value-checkbox" type="checkbox" v-model="settings.showNotifications">
        </div>

        <div class="settings_param">
            <span class="settings_name">Автоматически обновлять данные предметов</span>
            <input class="settings_value-checkbox" type="checkbox" v-model="settings.autoReloadItemsData">
        </div>

        <div class="settings_param">
            <span class="settings_name">Цена предмета для оповещения</span>
            <input class="settings_value-input" type="number" v-model.number="settings.notifyOnPrice">
        </div>

        <div class="settings_param">
            <span class="settings_name">Обновлять данные через (минут):</span>
            <input class="settings_value-input" type="number" v-model.number="settings.refreshInterval">
        </div>
    </div>
</template>

<script>
    import sendMessageToBackground from '../utils/sendMessageToBackground';

    export default {
        name: "SettingsComponent",

        data() {
            return {
                settings: {}
            }
        },

        async created() {
            const settings = await sendMessageToBackground('getSettings');

            console.log(settings)

            this.settings = Object.assign({}, settings);
        },

        watch: {
            settings: {
                deep: true,

                handler(value) {
                    console.log('Update')

                    sendMessageToBackground('updateSettings', {
                        settings: value,
                    });

                    // EventBus.$emit('settings-update', value);
                }
            }
        }
    }
</script>

<style scoped>

</style>