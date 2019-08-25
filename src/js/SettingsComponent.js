import Vue from 'vue';

import SettingsComponent from '@/components/SettingsComponent.vue';

document.addEventListener('DOMContentLoaded', () => {
    new Vue(SettingsComponent).$mount('.js-settings-controller');
})