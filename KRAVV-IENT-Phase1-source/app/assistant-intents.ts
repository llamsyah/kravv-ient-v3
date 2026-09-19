export type AssistantIntent='summary'|'unknowns'|'challenge'|'changes';

// This resolver only selects a local demonstration layout. It does not
// generate an answer or transmit the user's message.
const patterns: {intent:AssistantIntent;matches:RegExp}[]=[
  {intent:'summary',matches:/\b(summarize|summary|ringkas|overview)\b/i},
  {intent:'unknowns',matches:/\b(unknown|missing|gap|unresolved)\b|belum\s+tahu/i},
  {intent:'challenge',matches:/\b(challenge|counter|risk|weakness|bantah|kritik)\b/i},
  {intent:'changes',matches:/\b(changed|compare|previous\s+run|latest\s+run|perubahan|bandingkan)\b/i},
];

export function resolveDemoIntent(message:string):AssistantIntent|null {
  return patterns.find(({matches})=>matches.test(message))?.intent??null;
}
