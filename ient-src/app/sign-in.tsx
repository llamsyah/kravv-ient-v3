'use client';
import {useI18n} from './localization';

import {LanguageSwitch} from './localization';
export default function SignIn({signInHref}: {signInHref: string}){
 const {t}=useI18n();return <main className="login-shell"><LanguageSwitch/><section className="panel login"><div className="brand"><span className="brandmark">K</span>KRAVV<span className="muted">-IENT</span></div><p className="eyebrow">{t("PRIVATE INVESTMENT WORKSPACE")}</p><h1>{t("Return to the case.")}</h1><p className="body-text muted">{t("Evidence, diligence, and human judgment — with the context behind every decision.")}</p><a className="primary" href={signInHref} target="_top">{t("Sign in with ChatGPT")}</a><div className="login-steps"><span>{t("Evidence")}</span><span>→</span><span>{t("Analysis")}</span><span>→</span><span>{t("Human decision")}</span></div><small>{t("Functional proof of concept. Fictional sample companies. Your saved workspace is tied to your signed-in identity.")}</small></section></main>;}
