import handleMarketPage from './handleMarketPage';
import handleItemPage from './handleItemPage';


if (location.pathname === '/market/') {
    handleMarketPage();
} else {
    handleItemPage();
}



