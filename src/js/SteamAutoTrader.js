import handleMarketPage from './handleMarketPage';
import handleItemPage from './handleItemPage';


if (window.location.pathname === '/market/') {
    handleMarketPage();
} else {
    handleItemPage();
}



