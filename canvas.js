import { CANVAS_TOKEN, CANVAS_ENDPOINT } from "./config.js";
import { appendObj, batchMap } from "./utils.js";
export const CANVAS_GET_INIT = {
    method: "GET",
    headers: {
        Authorization: `Bearer ${CANVAS_TOKEN}`
    }
};

export const canvasParams = ({fields, exclude_fields, ...rest}) => new URLSearchParams([
    ...(fields ? fields.map(f=>['response_fields[]',f]) : []),
    ...(exclude_fields ? exclude_fields.map(e=>['exclude_response_fields[]',e]) : []), 
    ...Object.entries(rest).filter(([k,v])=>['string','number','boolean'].includes(typeof(v))), 
    ...Object.entries(rest).filter(([k,v])=>Array.isArray(v)).flatMap(([k,vals])=>vals.map(v=>[`${k}[]`,v]))]);
export const headers = (token, ctype) => Object.assign({
    Authorization: `Bearer ${token}`
}, ctype ? {
    'Content-Type': ctype
} : {});
export const getPaginated = async (resource, options, list = []) => {
    const r = await fetch(resource, options);
    const nextLink = r.headers.get('link').split(',').find(l => l.includes('rel="next"'));
    return nextLink ? getPaginated(/^<([^>]*)>/.exec(nextLink)[1], options, [...list, ...(await r.json())]) : [...list, ...(await r.json())];
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

/**
 * 
 * @param {number} course - Course ID
 * @param {number} assignment - Assignment ID
 * @param {Object} [options]
 * @param {string[]} [options.include]
 * @param {boolean} [options.override_assignment_dates]
 * @param {boolean} [options.needs_grading_count_by_section]
 * @param {boolean} [options.all_dates]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object>}
 */
export const getAssignment = (course, assignment, { include, ...rest } = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}?${canvasParams({include,...rest})}`, CANVAS_GET_INIT).then(r => r.json());

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options] 
 * @param {string[]} [options.include]
 * @param {string} [options.search_term]
 * @param {boolean} [options.override_assignment_dates]
 * @param {boolean} [options.needs_grading_count_by_section]
 * @param {string} [options.bucket]
 * @param {number[]} [options.assignment_ids]
 * @param {string} [options.order_by]
 * @param {boolean} [options.post_to_sis]
 * @param {boolean} [options.new_quizzes]
 * @param {number} [options.per_page=100]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const listAssignments = (course, { include, fields, exclude_fields, per_page = 100, assignment_ids, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments?${canvasParams({include,fields,exclude_fields,per_page,assignment_ids,...rest})}`, CANVAS_GET_INIT);

/* Assignment Groups */

/**
 * 
 * @param {number} course - Course ID
 * @param {number} group - Assignment Group ID
 * @param {Object} [options] 
 * @param {string[]} [options.include]
 * @param {boolean} [options.override_assignment_dates]
 * @param {number} [options.grading_period_id]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object>}
 */
export const getAssignmentGroup = (course, group, { include, ...rest } = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignment_groups/${group}?${canvasParams({include,...rest})}`, CANVAS_GET_INIT).then(r => r.json());

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options] 
 * @param {string[]} [options.include]
 * @param {(number[]|string)} [options.assignment_ids]
 * @param {string[]} [options.exclude_assignment_submission_types]
 * @param {boolean} [options.override_assignment_dates]
 * @param {number} [options.grading_period_id]
 * @param {boolean} [options.scope_assignments_to_student]
 * @param {number} [options.per_page=100]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const listAssignmentGroups = (course, { include, fields, exclude_fields, per_page = 100, assignment_ids, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignment_groups?${canvasParams({include,fields,exclude_fields,per_page,assignment_ids,...rest})}`, CANVAS_GET_INIT);

/* Courses */

/**
 * 
 * @param {Object} [options] 
 * @param {string} [options.enrollment_type]
 * @param {number} [options.enrollment_role_id]
 * @param {string} [options.enrollment_state]
 * @param {boolean} [options.exclude_blueprint_courses]
 * @param {string[]} [options.include]
 * @param {string} [options.state]
 * @param {number} [options.per_page=100]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const listCourses = ({ include, fields, exclude_fields, per_page = 100, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses?${canvasParams({include,fields,exclude_fields,per_page,...rest})}`, CANVAS_GET_INIT);

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options] 
 * @param {string[]} [options.include]
 * @param {number} [options.teacher_limit]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object>}
 */
export const getCourse = (course, { include, ...rest } = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}?${canvasParams({include,...rest})}`, CANVAS_GET_INIT).then(r => r.json());

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options]
 * @param {string[]} [options.permissions]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object>}
 */
export const getCoursePermissions = (course, { permissions, ...rest } = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/permissions?${canvasParams({permissions,...rest})}`, CANVAS_GET_INIT).then(r => r.json());

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options] 
 * @param {string[]} [options.enrollment_type]
 * @param {number} [options.enrollment_role_id]
 * @param {string[]} [options.include]
 * @param {number} [options.user_id]
 * @param {number[]} [options.users] - User IDs
 * @param {string[]} [options.enrollment_state]
 * @param {number} [options.per_page=100]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const listCourseUsers = (course, { include, fields, exclude_fields, per_page = 100, enrollment_type, users, enrollment_state, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/users?${canvasParams({include,fields,exclude_fields,per_page,enrollment_type,'user_ids':users,enrollment_state,...rest})}`, CANVAS_GET_INIT);

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options] 
 * @param {string[]} [options.type]
 * @param {string[]} [options.role]
 * @param {string[]} [options.state]
 * @param {string[]} [options.include]
 * @param {number} [options.user_id]
 * @param {number} [options.grading_period_id]
 * @param {number} [options.per_page=100]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const listCourseEnrollments = (course, { include, fields, exclude_fields, per_page = 100, type, state, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/enrollments?${canvasParams({include,fields,exclude_fields,per_page,type,state,...rest})}`, CANVAS_GET_INIT);

/* Grade Change Log */

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options] 
 * @param {number} [options.assignment] - Assignment ID
 * @param {number} [options.student_id]
 * @param {number} [options.grader_id]
 * @param {string} [options.start_time]
 * @param {string} [options.end_time]
 * @param {number} [options.per_page=100]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const getGradeChanges = async (course, { assignment, student_id, grader_id, fields, exclude_fields, per_page = 100, ...rest } = {}) => {
    const { events, linked } = await getPaginatedObj(`${CANVAS_ENDPOINT}/api/v1/audit/grade_change?course_id=${course}&${canvasParams({assignment_id:assignment,student_id,grader_id,fields,exclude_fields,per_page,...rest})}`, CANVAS_GET_INIT);
    return events.map(({links:{course,student,grader,page_view,assignment},event_type,id,...rest})=>({student: linked.users?.find(({id})=>id==student)?.name, assignment: linked.assignments?.find(({id})=>id==assignment)?.name, ...rest, grader: linked.users?.find(({id})=>id==grader)?.name, id}));
}

export const graderCounts = changes => Object.entries(Object.groupBy(changes,s=>s.grader)).map(([k,v])=>[k,[...new Set(v.map(s=>s.student))]]);

/* Submissions */

/**
 * 
 * @param {number} course - Course ID
 * @param {number} assignment - Assignment ID
 * @param {Object} updates 
 * @returns {Promise<Object>}
 */
export const updateGrades = (course, assignment, updates) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}/submissions/update_grades`, {
    method: "POST",
    headers: headers(CANVAS_TOKEN, 'application/json'),
    body: JSON.stringify(updates)
}).then(r => r.json());

/**
 * 
 * @param {number} course - Course ID
 * @param {Object} [options] 
 * @param {number[]} [options.students=['all']] - Student IDs
 * @param {number[]} [options.assignments] - Assignment IDs
 * @param {boolean} [options.post_to_sis]
 * @param {string} [options.submitted_since] - Formatted as ISO 8601 YYYY-MM-DDTHH:MM:SSZ
 * @param {string} [options.graded_since] - Formatted as ISO 8601 YYYY-MM-DDTHH:MM:SSZ
 * @param {number} [options.grading_period_id]
 * @param {string} [options.workflow_state]
 * @param {string} [options.enrollment_state]
 * @param {boolean} [options.state_based_on_date]
 * @param {string} [options.order]
 * @param {string} [options.order_direction]
 * @param {string[]} [options.include=['user','assignment','submission_comments','submission_history']]
 * @param {number} [options.per_page=25]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const listSubmissions = (course, { students, assignments, include = ['user','assignment','submission_comments','submission_history'], fields, exclude_fields, per_page = 25, ...rest} = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/students/submissions?${canvasParams({include,fields,exclude_fields,per_page,'student_ids':students ?? ['all'],'assignment_ids':assignments,...rest,grouped:true})}`, CANVAS_GET_INIT).then(r => r.flatMap(s => s.submissions));

/**
 * 
 * @param {number} course - Course ID
 * @param {number} assignment - Assignment ID
 * @param {Object} [options] 
 * @param {string[]} [options.include=['user','submission_comments','submission_history']]
 * @param {number} [options.per_page=100]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object[]>}
 */
export const getAssignmentSubmissions = (course, assignment, { include = ['user','submission_comments','submission_history'], fields, exclude_fields, per_page = 100, ...rest } = {}) => getPaginated(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}/submissions?${canvasParams({include,fields,exclude_fields,per_page,...rest})}`, CANVAS_GET_INIT);

/**
 * 
 * @param {number} course - Course ID
 * @param {number} assignment - Assignment ID
 * @param {number} user - User ID
 * @param {Object} [options] 
 * @param {string[]} [options.include=['user','assignment','submission_comments','submission_history']]
 * @param {string[]} [options.fields]
 * @param {string[]} [options.exclude_fields]
 * @returns {Promise<Object>}
 */
export const getSubmission = (course, assignment, user, { include = ['user','assignment','submission_comments','submission_history'], ...rest} = {}) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/assignments/${assignment}/submissions/${user}?${canvasParams({include,...rest})}`, CANVAS_GET_INIT).then(r => r.json());

/**
 * 
 * @param {number} course - Course ID
 * @param {number} assignment - Assignment ID
 * @param {number[]} [extraUsers] - Extra IDs to add to list
 * @returns {Promise<number[]>}
 */
export const getExcusedUsers = async (course, assignment, extraUsers=[]) => [...extraUsers, ...((await getAssignmentSubmissions(course,assignment,{include:null,fields:['user_id','excused']})).filter(({excused})=>excused).map(({user_id})=>user_id))];

export const expandSubmissionHistory = submissions => [...submissions,...submissions.filter(({attempt})=>attempt>1).flatMap(({submission_history,assignment,user,submission_comments})=>submission_history.slice(0,-1).map(s=>({...s,submission_history,submission_comments,assignment,user,old_attempt:true})))].toSorted((a,b)=>a.id-b.id);
export const formatSubmission = ({id, user:{name} = {}, assignment:{name:assignment} = {}, ...s}) => ({id,name,assignment,...s});

/* Progress */

/**
 * 
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export const getProgress = id => fetch(`${CANVAS_ENDPOINT}/api/v1/progress/${id}`, CANVAS_GET_INIT).then(r => r.json());

/* Analytics */

/**
 * 
 * @param {number} course - Course ID
 * @param {number} user - User ID
 * @returns {Promise<Object>}
 */
export const getUserParticipation = (course, user) => fetch(`${CANVAS_ENDPOINT}/api/v1/courses/${course}/analytics/users/${user}/activity`,CANVAS_GET_INIT).then(r=>r.json());

/**
 * 
 * @param {number} course - Course ID
 * @param {number} [batchSize=1] 
 * @returns {Promise<Object[]>}
 */
export const userAccessReports = (course, batchSize=1) => listCourseUsers(course).then(users => batchMap(async ({id,name}) => [name, await fetch(`${CANVAS_ENDPOINT}/courses/${course}/users/${id}/usage`).then(r=>r.text()).then(r=>[...r.replaceAll(/\n/g,'').matchAll(/<tr.*?readable_name">(?<content>[^<]*).*?view_score">(?<timesViewed>[^<]*).*?participate_score">(?<timesParticipated>[^<]*).*?data-timestamp="(?<lastViewed>[^"]*).*?<\/tr>/g).map(l=>l.groups)])],users,batchSize));
