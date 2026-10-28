'use client';
import {useI18n} from './localization';

import {ReactNode} from 'react';
import {FileText} from 'lucide-react';
import {Judgment} from '@/lib/model';
export const tone=(s:string)=>s==='Conflicting'?'red':s==='Unknown'||s==='Reported'?'amber':s==='Verified'||s==='Supported'?'green':'';
export function Badge({children,tone=''}:{children:ReactNode;tone?:string}){
 return <span className={'badge '+tone}>{children}</span>}
export function Empty({title,detail,action}:{title:string;detail:string;action?:ReactNode}){
 return <div className="empty panel"><FileText size={25}/><h3>{title}</h3><p>{detail}</p>{action}</div>}
export function JudgmentCard({title,value}:{title:string;value?:Judgment}){
 const {t,label,date}=useI18n();return <section className="panel judgment human"><p className="eyebrow">{title}</p><h3>{value?label(value.outcome):t("Not recorded")}</h3><p>{value?.rationale||t("No human judgment has been recorded yet.")}</p>{value&&<small>{value.author} · {date(value.createdAt)}</small>}</section>}
