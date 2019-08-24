import Vue from 'vue';

import SettingsComponent from '@/components/SettingsComponent.vue';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Ready')

    console.log(document.querySelector('.js-settings-controller'));

    new Vue({
        components: { SettingsComponent },
        template: '<SettingsComponent />'
    }).$mount('.js-settings-controller');
})