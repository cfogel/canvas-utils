export const googleSlidesSubmission = submission => /^https?:\/\/docs\.google\.com\/presentation\/d\//.test(submission?.url);
export const urlToSlidesId = url => /^https?:\/\/docs\.google\.com\/presentation\/d\/(?<id>[^\/]+)\/edit/.exec(url)?.groups?.id;
export const idToSlidesUrl = id => `https://docs.google.com/presentation/d/${id}/edit`;

/* Changelogs */

const parseResponse = r => r.startsWith(")]}'") ? JSON.parse(r.substring(4)) : JSON.parse(r);
const expandChangelog = changelog => [...changelog.filter(([[t]])=>![4,40].includes(t)),...changelog.filter(([[t]])=>t==4).flatMap(([[,e],...rest])=>e.map(e=>[e,...rest])),...changelog.filter(([[t]])=>t==40).flatMap(([[,[,e]],...rest])=>e.map(e=>[e,...rest]))].toSorted(([,a],[,b])=>a-b);
const parseUser = (id, map) => ({id, name: map?.[id]?.name});
const parseEntry = userMap => (([[type,slide,,sIdx,v],timestamp,user]) => type == 15 ? ({type: 'Insertion',slide,sIdx,value:v,timestamp:new Date(timestamp),user:parseUser(user, userMap),length:v.length}) : type == 16 ? ({type: 'Deletion',slide,sIdx,eIdx:v,timestamp:new Date(timestamp),user:parseUser(user, userMap),length:v -sIdx+1}) : null);

export const getChangelog = async ({path, id}=/^\/(?<path>.*)\/d\/(?<id>.*)\/edit$/.exec(_docs_flag_initialData['docs-crp']).groups,token=_docs_flag_initialData.info_params.token) => {
    const { tileInfo, userMap } = parseResponse(await fetch(`https://docs.google.com/${path}/d/${id}/revisions/tiles?id=${id}&token=${token}`).then(r => r.text()));
    const { changelog } = parseResponse(await fetch(`https://docs.google.com/${path}/d/${id}/revisions/load?id=${id}&start=1&end=${tileInfo.at(-1).end}&token=${token}`).then(r => r.text()));
    return expandChangelog(changelog).filter(([[t]])=>[15,16].includes(t)).map(parseEntry(userMap));
}

export const valueIncludes = (pat, ignoreCase=true) => (c => c.value && (pat instanceof RegExp ? pat : new RegExp(pat,ignoreCase ? 'i' : undefined)).test(c.value));
export const minLength = l => (c => c.length >= l && (!c?.value?.startsWith('data:image/')));