import Vue from 'vue';
import MarketPageComponent from '@/components/MarketPageComponent.vue';


export default () => {
    document.body.insertAdjacentHTML('beforeend', '<div id="sat-app"></div>');
    new Vue(MarketPageComponent).$mount('#sat-app');
}