export function escapeHtml(s) {
    return s ? String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])) : '';
}

export function mapPlatform(p) {
    if (p === 'whatsapp') return 'WhatsApp';
    if (p === 'sms') return 'SMS';
    return p || '—';
}

export function formatTs(sec) {
    try {
        if (!sec) return '';
        const d = new Date(sec * 1000);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
    } catch {
        return '';
    }
}