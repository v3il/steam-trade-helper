import Vue from 'vue';
import RootComponent from '@/components/RootComponent.vue';

export default () => {
    const id = setInterval(() => {
        if (window.itemid) {
            console.log(window.itemid);

            clearInterval(id);

            document.body.insertAdjacentHTML('beforeend', '<div id="sat-app"></div>');
            new Vue(RootComponent).$mount('#sat-app');
        }
    }, 20);
}