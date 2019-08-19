export default ({ title, body }, clickHandler) => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    } else {
        const notification = new Notification(title, {
            body,
            icon: '',
        });

        notification.onclick = clickHandler;
    }
}