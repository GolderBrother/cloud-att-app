//登录接口
export const API_LOGIN = "token/login";
//注销
export const API_LOGOUT = "api/v1/user/loginOut";

//获取企业信息
export const API_COMP_GET = "token/register/getCompanyInfo";

//用户人脸上传抠图
export const API_USER_PIC = "token/register/saveUserPic";

//注册
export const API_REGISTER = "token/register/saveUser";

//获取验证码
export const API_CODE_GET = "token/sendMsg/valid";

//重置用户密码
export const API_RESET_PSW = "token/login/resetPassword";

//按状态获取考勤信息
export const API_ATT_INFO = "api/v1/att/getCompanyAttendance";

//员工考勤信息接口
export const API_ATT_EMP_LIST = "api/v1/att/getPersonValidCardPage";

//获取人员列表
export const API_PERS_LIST = "api/v1/user/getUserPage";

//新增人员
export const API_PERS_ADD = "api/v1/user/savePerson";

//编辑人员
export const API_PERS_EDIT = "api/v1/user/changeUserInfo";

//获取人员信息
export const API_PERS_GET = "api/v1/user/getUserInfo";

//获取部门信息
export const API_PERS_DEPT = "api/v1/department/tree";

//获取性别人数统计
export const API_GENDER_GET = "api/v1/user/getGenderRatio";

//获取人员编号
export const API_PERS_PIN = "pers/pin";

//修改用户密码
export const API_PERS_UPDATE_PSW = "api/v1/user/changePassword";

//获取考勤设备
export const API_DEV_LIST = "api/v1/att/getDevicePage";

//获取待办列表(获取未审批补签记录) 
export const API_ATT_WAITLIST = "api/v1/att/getNoApprovedSignByPage";

//补签审批
export const API_ATT_WAIT_PASS = "api/v1/att/auditSign";

//获取已审批补签记录(待办列表接口：包含未审批的请假和补签)
export const API_ATT_SIGNLIST = "api/v1/att/getApprovedSignByPage";

//补签申请
export const API_ATT_SIGNADD = "api/v1/att/saveSign";

//获取个人信息
export const API_PERS_INFO = "api/v1/user/getUserInfo";
//保存个人信息
export const API_PERS_INFO_SAVE = "api/v1/user/changeUserInfo";

//获取人员排班信息
export const API_ATT_SHIFT = "api/v1/att/getAttCalendar";

//判断是否在签到点
export const API_ATT_CHECKIN = "api/v1/att/getAttCalendar";

//打卡
export const API_ATT_PUNCH = "api/v1/att/punchIn";

//打卡列表
export const API_ATT_PUNCHLIST = "api/v1/att/getSignInList";

//获取待办列表(获取未审批请假记录)
export const API_ATT_WAITLEAVELIST = "api/v1/att/getNoApprovedLeaveByPage";
// export const API_ATT_WAITLEAVELIST = "att/waitLeaveList";

//获取已审批请假记录
export const API_ATT_LEAVELIST = "api/v1/att/getApprovedLeaveByPage";
// export const API_ATT_LEAVELIST = "att/leaveList";

//新增请假
export const API_ATT_LEAVEADD = "api/v1/att/saveLeave";

//请假审批
export const API_ATT_LEAVE_PASS = "api/v1/att/auditLeave";

//根据类型获取报表数据统计
export const API_REPORT_GET_BY_TYPE = "api/v1/att/getChartInfo";