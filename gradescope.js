import { CANVAS_GET_INIT, canvasParams, getAssignmentSubmissions, getPaginated } from "./canvas.js";
import { CANVAS_ENDPOINT, COURSE_ID, MISSING_EXEMPT } from "./config.js";

export const csvToUpdates = async (csv=CSV,course=COURSE_ID) => {
    const users = await getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/users?${canvasParams({fields:['email','id'],per_page:100})}`,CANVAS_GET_INIT);
    const scores = (Array.isArray(csv) ? csv : csv.split('\n').map(s=>s.split(','))).slice(1)
        .filter(([,,,,,score])=>score!='')
        .map(([,,,email,,score])=>({email,score,id:users.find(user=>user.email.toLowerCase()==email)?.id}))
        .filter(({id})=>id);
    return ({grade_data:Object.fromEntries(scores.map(({score,id})=>[id,{posted_grade:score}]))});
}

export const missingUpdates = async (assignment=ASSIGNMENT,course=COURSE_ID,ex=MISSING_EXEMPT) => {
    const submissions = await getAssignmentSubmissions(course,assignment,{include:['user'],fields:['user_id','score','user']});
    const missing = submissions.filter(({score,user_id})=>!score&&!ex.includes(user_id));
    return ({grade_data: Object.fromEntries(missing.map(s=>[s.user_id,({posted_grade:0})]))});
}
