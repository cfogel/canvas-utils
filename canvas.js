import { CANVAS_TOKEN, CANVAS_ENDPOINT } from "./config.js";
import { appendObj } from "./utils.js";
export const CANVAS_GET_INIT = {
    method: "GET",
    headers: {
        Authorization: `Bearer ${CANVAS_TOKEN}`
    }
};

export const arrayParams = (key, values) => `${key}[]=${values.join(`&${key}[]=`)}`;
export const canvasParams = ({ include, fields, exclude_fields, per_page, ...rest }) => [
    ...(include ? [arrayParams('include', include)] : []),
    ...(fields ? [arrayParams('response_fields', fields)] : []),
    ...(exclude_fields ? [arrayParams('exclude_response_fields', exclude_fields)] : []),
    ...(per_page ? [`per_page=${per_page}`] : []),
    ...(Object.entries(rest).filter(([k,v])=>v!=undefined).map(([k, v]) => `${k}=${v}`))
].join('&');
export const headers = (token, ctype) => Object.assign({
    Authorization: `Bearer ${token}`
}, ctype ? {
    'Content-Type': ctype
} : {});
export const getPaginated = async (resource, options, list = []) => {
    const r = await fetch(resource, options);
    const nextLink = r.headers.get('link').split(',').find(l => l.includes('rel="next"'));
    return nextLink ? getPaginated(/^<([^>]*)>/.exec(nextLink)[1], options, [...list, ...(await r.json())]) : [...list, ...(await r.json())]
}
export const getPaginatedObj = async (resource, options, list = {}) => {
    const r = await fetch(resource, options);
    const nextLink = r.headers.get('link').split(',').find(l => l.includes('rel="next"'));
    if (nextLink) {
        return getPaginatedObj(/^<([^>]*)>/.exec(nextLink)[1], options, appendObj(list,(await r.json())));
    } else {
        return appendObj(list,(await r.json()));
    }
}

/* Assignments */

export const getAssignment = (course, assignment, { include, fields, exclude_fields, ...rest } = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}?${canvasParams({include,fields,exclude_fields,...rest})}`, CANVAS_GET_INIT).then(r => r.json());
export const listAssignments = (course, { include, fields, exclude_fields, per_page = 100, assignment_ids, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments?${canvasParams({include,fields,exclude_fields,per_page,...rest})}${assignment_ids ? `&${arrayParams('assignment_ids',assignment_ids)}` : ''}`, CANVAS_GET_INIT);

/* Courses */

export const listCourses = ({ include, fields, exclude_fields, per_page = 100, state, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses?${canvasParams({include,fields,exclude_fields,per_page,...rest})}${state ? `&${arrayParams('state',state)}` : ''}`, CANVAS_GET_INIT);
export const getCourse = (course, { include, fields, exclude_fields, ...rest } = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}?${canvasParams({include,fields,exclude_fields,...rest})}`, CANVAS_GET_INIT).then(r => r.json());
export const getCoursePermissions = (course, { permissions, fields, exclude_fields } = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/permissions?${permissions ? `${arrayParams('permissions',permissions)}&` : ''}${canvasParams({fields,exclude_fields})}`, CANVAS_GET_INIT).then(r => r.json());
export const listCourseUsers = (course, { include, fields, exclude_fields, per_page = 100, enrollment_type, users, enrollment_state, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/users?${canvasParams({include,fields,exclude_fields,per_page,...rest})}${enrollment_type ? `&${arrayParams('enrollment_type',enrollment_type)}` : ''}${users ? `&${arrayParams('user_ids',users)}` : ''}${enrollment_state ? `&${arrayParams('enrollment_state',enrollment_state)}` : ''}`, CANVAS_GET_INIT);

/* Grade Change Log */

export const getGradeChanges = async (course, { assignment, student_id, grader_id, fields, exclude_fields, per_page = 100, ...rest } = {}) => {
    const { events, linked } = await getPaginatedObj(`${CANVAS_ENDPOINT}/api/v1/audit/grade_change?course_id=${course}&${canvasParams({assignment_id:assignment,student_id,grader_id,fields,exclude_fields,per_page,...rest})}`, CANVAS_GET_INIT);
    return events.map(({links:{course,student,grader,page_view,assignment},event_type,id,...rest})=>({student: linked.users?.find(({id})=>id==student)?.name, assignment: linked.assignments?.find(({id})=>id==assignment)?.name, ...rest, grader: linked.users?.find(({id})=>id==grader)?.name, id}))
}

export const graderCounts = changes => Object.entries(Object.groupBy(changes,s=>s.grader)).map(([k,v])=>[k,[...new Set(v.map(s=>s.student))]])

/* Submissions */

export const updateGrades = (course, assignment, updates) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}/submissions/update_grades`, {
    method: "POST",
    headers: headers(CANVAS_TOKEN, 'application/json'),
    body: JSON.stringify(updates)
}).then(r => r.json());

export const listSubmissions = (course, { students, assignments, include = ['user','assignment','submission_comments','submission_history'], fields, exclude_fields, per_page = 25, ...rest} = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/students/submissions?${arrayParams('student_ids',students ?? ['all'])}&${canvasParams({include,fields,exclude_fields,per_page,...rest,grouped:true})}${assignments ? `&${arrayParams('assignment_ids',assignments)}` : ''}`, CANVAS_GET_INIT).then(r => r.flatMap(s => s.submissions));
export const getAssignmentSubmissions = (course, assignment, { include = ['user','submission_comments','submission_history'], fields, exclude_fields, per_page = 100, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}/submissions?${canvasParams({include,fields,exclude_fields,per_page,...rest})}`, CANVAS_GET_INIT);
export const getSubmission = (course, assignment, user, { include = ['user','assignment','submission_comments','submission_history'], fields = [], exclude_fields = []} = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}/submissions/${user}?${canvasParams({include,fields,exclude_fields})}`, CANVAS_GET_INIT).then(r => r.json());

export const expandSubmissionHistory = submissions => [...submissions,...submissions.filter(({attempt})=>attempt>1).flatMap(({submission_history,assignment,user,submission_comments})=>submission_history.slice(0,-1).map(s=>({...s,submission_history,submission_comments,assignment,user,old_attempt:true})))].toSorted((a,b)=>a.id-b.id)
export const formatSubmission = ({id, user:{name} = {}, assignment:{name:assignment} = {}, ...s}) => ({id,name,assignment,...s})

/* Progress */

export const getProgress = id => fetch(`${CANVAS_ENDPOINT}/api/v1/progress/${id}`, CANVAS_GET_INIT).then(r => r.json());

