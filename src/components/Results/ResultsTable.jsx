
import { mapPlatform, formatTs, escapeHtml } from '../../utils/formatters';

const LinkCell = ({ message }) => {
    const hasLink = message.has_link || !!message.link_url;
    const url = message.link_url || '';
    if (!hasLink || !url) return null;
    return <a className="linkcell" href={encodeURI(url)} target="_blank" rel="noopener">{escapeHtml(url)}</a>;
};

const Badge = ({ children }) => <span className="badge">{children}</span>;

function ResultsTable({ results, isGuard = false }) {
    if (!results || results.length === 0) {
        return null;
    }

    const headers = isGuard
        ? ['№', 'Приложение', 'Статус', 'Контент', 'Временная метка', 'Имя отправителя', 'Контакт отправителя', 'Имя получателя', 'Контакт получателя', 'Тема']
        : ['№', 'Приложение', 'Статус', 'Направление', 'Контент', 'Вложения', 'Тип медиа', 'Временная метка', 'Имя', 'Контакт', 'Тема', 'Ссылка', 'Оценка'];

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {results.map((m, i) => {
                        const score = m.score != null ? Number(m.score).toFixed(3) : '—';
                        if (isGuard) {
                            return (
                                <tr key={m.message_id || i}>
                                    <td>{i + 1}</td>
                                    <td>{mapPlatform(m.platform)}</td>
                                    <td>{m.status || 'Active'}</td>
                                    <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{escapeHtml(m.text_data)}</td>
                                    <td>{m.formatted_timestamp || formatTs(m.timestamp)}</td>
                                    <td>{escapeHtml(m.sender_name)}</td>
                                    <td>{escapeHtml(m.sender_phone)}</td>
                                    <td>{escapeHtml(m.receiver_name)}</td>
                                    <td>{escapeHtml(m.receiver_phone)}</td>
                                    <td>{escapeHtml(m.chat_subject)}</td>
                                </tr>
                            );
                        }
                        return (
                            <tr key={m.message_id || i}>
                                <td>{i + 1}</td>
                                <td>{mapPlatform(m.platform)}</td>
                                <td>{m.status || 'Active'}</td>
                                <td>{m.from_me ? 'Отправленные' : 'Полученные'}</td>
                                <td style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{escapeHtml(m.text_data)}</td>
                                <td><Badge>{(m.has_media || m.has_link) ? 'Да' : 'Нет'}</Badge></td>
                                <td>{escapeHtml(m.media_type || '')}</td>
                                <td>{m.formatted_timestamp || formatTs(m.timestamp)}</td>
                                <td>{escapeHtml(m.from_me ? m.receiver_name : m.sender_name)}</td>
                                <td>{escapeHtml(m.from_me ? m.receiver_phone : m.sender_phone)}</td>
                                <td>{escapeHtml(m.chat_subject)}</td>
                                <td><LinkCell message={m} /></td>
                                <td>{score}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ResultsTable;