export const removeprops = props => (o => props.reduce((acc,v)=>(({[v]:acc, ...v} = acc), v),o));
export const appendObj = (o,n) => ({...o,...Object.fromEntries(Object.entries(n).map(([k,v])=>Array.isArray(o[k]) ? [k,[...o[k],...v]] : ((o[k]&&v&&(typeof v=='object')&&(typeof o[k]=='object')) ? [k,appendObj(o[k],v)] : [k,v])))});
