'use client';
import {createContext, useContext, useState, type ReactNode, type FormEvent} from 'react';
import {DEFAULT_LOCALE, isLocale, localeCookie, resolveLocale, translate, localizeLabel, localizeError, formatDate, formatNumber, formatCurrency} from '@/lib/localization.mjs';
import type {Locale, MessageKey, MessageParams} from '@/lib/localization.mjs';

const LocaleContext = createContext<{locale: Locale; setLocale: (locale: Locale) => void}>({locale: DEFAULT_LOCALE, setLocale: () => {}});
export function LocaleProvider({initialLocale, children}: {initialLocale: Locale; children: ReactNode}) {
  const [locale, updateLocale] = useState<Locale>(resolveLocale(initialLocale));
  function setLocale(next: Locale) {
    if (!isLocale(next)) return;
    updateLocale(next);
    document.documentElement.lang = next;
    document.title = `KRAVV-IENT | ${translate(next, 'Investment Workspace')}`;
    document.cookie = localeCookie(next, location.protocol === 'https:');
  }
  return <LocaleContext.Provider value={{locale, setLocale}}>{children}</LocaleContext.Provider>;
}
export function useI18n() {
  const {locale, setLocale} = useContext(LocaleContext);
  function clearValidation(event: FormEvent) {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) target.setCustomValidity('');
  }
  function validation(event: FormEvent) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement)) return;
    target.setCustomValidity('');
    if (!target.validity.valid) target.setCustomValidity(translate(locale, target.validity.valueMissing ? 'Please complete this field.' : 'Please enter a valid value.'));
  }
  return {locale, setLocale,
    validation, clearValidation,
    t: (key: MessageKey, params?: MessageParams) => translate(locale, key, params),
    label: (text: string) => localizeLabel(locale, text),
    errorText: (message: unknown) => localizeError(locale, message),
    date: (value: string) => formatDate(locale, value),
    dateTime: (value: string) => formatDate(locale, value, true),
    number: (value: number, options?: Intl.NumberFormatOptions) => formatNumber(locale, value, options),
    currency: (value: number, currency: string) => formatCurrency(locale, value, currency),
  };
}
export function LanguageSwitch() {
  const {locale, setLocale, t} = useI18n();
  return <label className="language-switch"><span>{t('Language')}</span><select aria-label={t('Application language')} value={locale} onChange={event => {if (isLocale(event.target.value)) setLocale(event.target.value)}}><option value="id-ID">Indonesia</option><option value="en-US">English</option></select></label>;
}
