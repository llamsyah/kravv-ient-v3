'use client';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {useI18n} from './localization';

export function safeReportUrl(value: string): string | undefined {
  if ([...value].some(character=>character.charCodeAt(0)<=32||character.charCodeAt(0)===127) || !/^https?:\/\//i.test(value)) return undefined;
  try {const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password ? url.href : undefined;} catch {return undefined;}
}

export default function ReportMarkdown({source}: {source: string}) {
  const {t}=useI18n();
  return <div className="report-markdown"><Markdown
    remarkPlugins={[remarkGfm]}
    // No rehype-raw: HTML stays escaped text. It is never inserted or executed.
    allowedElements={['h1','h2','h3','h4','h5','h6','p','strong','em','del','blockquote','ul','ol','li','a','img','code','pre','hr','br','table','thead','tbody','tr','th','td','input','sup','section']}
    unwrapDisallowed
    urlTransform={value=>safeReportUrl(value)}
    components={{
      h1:({children})=><h2>{children}</h2>,h2:({children})=><h2>{children}</h2>,h3:({children})=><h2>{children}</h2>,
      h4:({children})=><h3>{children}</h3>,h5:({children})=><h4>{children}</h4>,h6:({children})=><h5>{children}</h5>,
      a:({href,children})=>href?<a href={href} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer">{children}</a>:<span>{children}</span>,
      img:({alt})=><span className="report-media-label">{alt || t('Embedded media omitted')}</span>,
      input:({checked})=><input type="checkbox" checked={Boolean(checked)} disabled readOnly tabIndex={-1}/>,
      table:({children})=><div className="report-table-scroll" role="region" aria-label={t('Report table')} tabIndex={0}><table>{children}</table></div>,
    }}
  >{source}</Markdown></div>;
}
