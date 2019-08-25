<template>
    <div>
        <div>
            <input type="checkbox" v-model="settings.showNotifications">

            Показывать уведомления
        </div>

        <div>
            <input type="checkbox" v-model="settings.autoReloadItemsData">

            Автоматически обновлять данные предметов
        </div>

        <div>
            Цена предмета для оповещения
            <input type="number" v-model.number="settings.notifyOnPrice">
        </div>

        <div>
            Обновлять данные через (минут):
            <input type="number" v-model.number="settings.refreshInterval">
        </div>
    </div>
</template>

<script>
    import sendMessageToBackground from '../utils/sendMessageToBackground';

    import EventBus from '../EventBus';

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