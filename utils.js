export const removeprops = props => (o => props.reduce((acc,v)=>(({[v]:acc, ...v} = acc), v),o));
export const appendObj = (o,n) => ({...o,...Object.fromEntries(Object.entries(n).map(([k,v])=>Array.isArray(o[k]) ? [k,[...o[k],...v]] : ((o[k]&&v&&(typeof v=='object')&&(typeof o[k]=='object')) ? [k,appendObj(o[k],v)] : [k,v])))});
export const batchMap = (func,data,batchSize=100,res=[]) => Promise.all(data.slice(0,batchSize).map(func)).then(r=> data.length > batchSize ? batchMap(func,data.slice(batchSize),batchSize,[...res,...r]) : [...res,...r]);
