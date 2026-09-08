import {writeFileSync} from 'node:fs';
const art={
rah:'<path d="M20 114Q2 70 26 31L37 5l12 24L65 8l12 35q24 49-1 71Z" fill="#cf7858" stroke="#483d51" stroke-width="4"/><ellipse cx="48" cy="55" rx="22" ry="25" fill="#ffcf8e"/><path d="M26 82h44l9 40H17Z" fill="#8b6061" stroke="#483d51" stroke-width="4"/><circle cx="40" cy="52" r="3"/><circle cx="57" cy="52" r="3"/><path d="M39 65q9 7 18 0" fill="none" stroke="#8b6061" stroke-width="3"/><path d="M47 88l-9 14 10 12 12-12Z" fill="#ffe2a3"/>',
torch:'<path d="M38 61h20v61H38Z" fill="#ac785c" stroke="#483d51" stroke-width="4"/><path d="M19 48Q18 28 42 8L52 33 68 17Q91 64 48 72 21 70 19 48Z" fill="#eea05e" stroke="#f9d390" stroke-width="4"/><path d="M35 56l12-24 15 24Z" fill="#fff0be"/>',
furnace:'<path d="M17 59h62l8 58H9Z" fill="#796673" stroke="#d6b398" stroke-width="4"/><path d="M25 70h46v33H25Z" fill="#352f46"/><path d="M34 99l12-26 16 26Z" fill="#eea05e"/><path d="M14 52h68M23 119h50" stroke="#efc596" stroke-width="7"/>',
vine:'<path d="M15 119Q81 106 48 76T60 7M80 120Q17 105 48 76T32 10" fill="none" stroke="#859d76" stroke-width="10"/><path d="M25 39L3 18q32-6 31 26m30 4 28-19q-2 35-31 30M25 92L1 69q33-5 35 28" fill="#b5bb86"/>',
rope:'<path d="M48 4v79q-34-3-23 26 22 27 46-3 9-23-23-23" fill="none" stroke="#eed2a0" stroke-width="11"/><path d="M38 18h20M38 39h20M38 60h20" stroke="#947457" stroke-width="4"/>'
};
for(const [key,body] of Object.entries(art))writeFileSync(`public/assets/draft/${key}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="128" viewBox="0 0 96 128">${body}</svg>`);
