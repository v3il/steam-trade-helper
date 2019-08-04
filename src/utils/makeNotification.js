export default ({ title, body }) => {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    } else {
        new Notification(title, {
            body,
            icon: '',
        });
    }
}