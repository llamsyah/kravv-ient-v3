import messages from './localization-messages.json' with {type: 'json'};
export const SUPPORTED_LOCALES = ['id-ID', 'en-US'];
export const DEFAULT_LOCALE = 'id-ID';
export const LOCALE_COOKIE = 'kravv-locale';
export const isLocale = value => value === 'id-ID' || value === 'en-US';
export const resolveLocale = value => isLocale(value) ? value : DEFAULT_LOCALE;
export function localeFromCookie(cookie = '') {
  const values = cookie.split(';').map(s => s.trim()).filter(s => s.startsWith(LOCALE_COOKIE + '='));
  return resolveLocale(values.length === 1 ? values[0].slice(LOCALE_COOKIE.length + 1) : undefined);
}
export function localeCookie(locale, secure = false) {
  if (!isLocale(locale)) throw new Error('Unsupported locale');
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax${secure ? '; Secure' : ''}`;
}
export const hasMessage = key => typeof key === 'string' && Object.hasOwn(messages, key);
export function translate(locale, key, params = {}) {
  const language = resolveLocale(locale);
  const text = hasMessage(key) ? (language === 'id-ID' ? messages[key] || key : key) : (language === 'id-ID' ? 'Teks belum tersedia.' : 'Text unavailable.');
  return text.replace(/\{(\w+)\}/g, (_, name) => Object.hasOwn(params, name) ? String(params[name]) : '…');
}
// Only call for application-owned labels or enum values, never user content.
export const localizeLabel = (locale, text) => hasMessage(text) ? translate(locale, text) : text;
const fields = {companyName:'Company name',website:'Company website',sector:'Sector',geography:'Geography',name:'Case name',owner:'Owner',investmentStage:'Investment stage',thesis:'Investment thesis',role:'Active role',status:'Status',source:'Source',label:'Fact or claim',value:'Reported value / statement',kind:'Information class',excerpt:'Source excerpt',locator:'Page, sheet, cell, or URL',text:'Question',category:'Category',priority:'Priority',rationale:'Rationale',participants:'Decision participants',outcome:'Outcome',resolution:'Response / resolution (required when answered or resolved)',date:'Date',actual:'Actual reported outcome',type:'Document type',runId:'Analysis run',id:'Record'};
export function localizeError(locale, message) {
  if (hasMessage(message)) return translate(locale, message);
  const pdfErrors = [
    [/^The stored size of (.{1,250}) changed\. Reload and try again\.$/, 'The stored size of {name} changed. Reload and try again.'],
    [/^(.{1,250}) could not be read completely\. Please upload it again\.$/, '{name} could not be read completely. Please upload it again.'],
    [/^(.{1,250}) does not have a supported PDF header and end marker\. Upload the original PDF\.$/, '{name} does not have a supported PDF header and end marker. Upload the original PDF.'],
    [/^(.{1,250}) is not an uploaded PDF\. Select an original \.pdf file\.$/, '{name} is not an uploaded PDF. Select an original .pdf file.'],
    [/^(.{1,250}) is empty or has invalid size metadata\.$/, '{name} is empty or has invalid size metadata.'],
    [/^(.{1,250}) exceeds the 10 MiB analysis input limit\. The original upload remains available\.$/, '{name} exceeds the 10 MiB analysis input limit. The original upload remains available.'],
    [/^(.{1,250}) is unavailable in document storage\. Please upload it again\.$/, '{name} is unavailable in document storage. Please upload it again.'],
  ];
  for (const [pattern, key] of pdfErrors) {const match=typeof message==='string'&&pattern.exec(message);if(match)return translate(locale,key,{name:match[1]});}
  const match = typeof message === 'string' && /^(Please complete |Invalid )(\w+)\.?$/.exec(message);
  if (match && Object.hasOwn(fields, match[2])) return translate(locale, match[1] === 'Invalid ' ? 'Invalid value for {field}.' : 'Please complete {field}.', {field: localizeLabel(locale, fields[match[2]])});
  return translate(locale, 'The operation could not be completed. Your input is retained. Please check and try again.');
}
export function formatDate(locale, value, time = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return translate(locale, 'Date unavailable');
  return new Intl.DateTimeFormat(resolveLocale(locale), {day:'numeric',month:'short',year:'numeric',...(time ? {hour:'2-digit',minute:'2-digit'} : {})}).format(date);
}
export const formatNumber = (locale, value, options = {}) => new Intl.NumberFormat(resolveLocale(locale), options).format(value);
export const formatCurrency = (locale, value, currency) => formatNumber(locale, value, {style:'currency',currency});
