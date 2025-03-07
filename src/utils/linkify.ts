/**
 * 将文本中的URL转换为HTML链接，并保留换行符
 * @param text 需要处理的文本
 * @returns 处理后的HTML文本
 */
export function linkify(text: string): string {
    // URL正则表达式
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // 替换URL为HTML链接
    const linkedText = text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });

    // 将换行符转换为<br>标签
    return linkedText.replace(/\n/g, '<br>');
}

/**
 * 将HTML链接转换回纯文本URL，并保留换行符
 * @param html 包含HTML链接的文本
 * @returns 纯文本
 */
export function delinkify(html: string): string {
    // 将<br>标签转换回换行符
    const textWithLineBreaks = html.replace(/<br\s*\/?>/gi, '\n');

    // 创建临时DOM元素
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = textWithLineBreaks;

    // 获取纯文本内容
    return tempDiv.textContent || tempDiv.innerText || '';
}
