export const googleSlidesSubmission = submission => /^https?:\/\/docs\.google\.com\/presentation\/d\//.test(submission?.url);
export const urlToSlidesId = url => /^https?:\/\/docs\.google\.com\/presentation\/d\/(?<id>[^\/]+)\/edit/.exec(url)?.groups?.id;
export const idToSlidesUrl = id => `https://docs.google.com/presentation/d/${id}/edit`;

/* Changelogs */

const parseResponse = r => r.startsWith(")]}'") ? JSON.parse(r.substring(4)) : JSON.parse(r);
const expandChangelog = changelog => [...changelog.filter(([[t]])=>t!=4),...changelog.filter(([[t]])=>t==4).flatMap(([[,e],...rest])=>e.map(e=>[e,...rest]))].toSorted(([,a],[,b])=>a-b)
const parseEntry = userMap => (([[type,slide,,sIdx,v],timestamp,user]) => type == 15 ? ({type: 'Insertion',slide,sIdx,value:v,timestamp:new Date(timestamp),user:userMap[user]?.name,length:v.length}) : type == 16 ? ({type: 'Deletion',slide,sIdx,eIdx:v,timestamp:new Date(timestamp),user:userMap[user]?.name,length:v-sIdx+1}) : null)

export const getChangelog = async (id=/\/(?<id>[^/]*)\/edit/.exec(document.location.pathname).groups.id,token=_docs_flag_initialData.info_params.token) => {
    const { tileInfo, userMap } = parseResponse(await fetch(`https://docs.google.com/presentation/d/${id}/revisions/tiles?id=${id}&token=${token}`).then(r => r.text()));
    const { changelog } = parseResponse(await fetch(`https://docs.google.com/presentation/d/${id}/revisions/load?id=${id}&start=1&end=${tileInfo.at(-1).end.toString()}&token=${token}`).then(r => r.text()));
    return expandChangelog(changelog).filter(([[t]])=>[15,16].includes(t)).map(parseEntry(userMap))
}

export const valueIncludes = re => (c => c.value && re.test(c.value));