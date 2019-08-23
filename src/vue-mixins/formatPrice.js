export default {
    filters: {
        format(value) {
            if (value === 0) {
                return '—';
            }

            if (typeof value === 'number') {
                return value.toFixed(2);
            }

            return value;
        }
    }
}