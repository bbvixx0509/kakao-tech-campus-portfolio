<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%-- 로그인 요청을 처리하고 세션에 로그인 상태를 저장하는 페이지 --%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>

<% 
request.setCharacterEncoding("UTF-8");

String loginid = request.getParameter("id");
String loginpasswd = request.getParameter("passwd");

// 저장된 사용자 정보 가져오기
Map<String, Map<String, String>> allUsers = (Map<String, Map<String, String>>) application.getAttribute("allUsers");
if (allUsers == null) {
    allUsers = new HashMap<String, Map<String, String>>();
    application.setAttribute("allUsers", allUsers);
}

String tof = "false";
String errorType = "";  // 오류 타입 구분

// 회원가입된 사용자들과 비교
if(loginid != null && loginpasswd != null) {
    Map<String, String> userInfo = allUsers.get(loginid);
    
    if(userInfo == null) {
        // 아이디가 존재하지 않음
        errorType = "nouser";
    } else if(!loginpasswd.equals(userInfo.get("passwd"))) {
        // 아이디는 있지만 비밀번호가 틀림
        errorType = "wrongpass";
    } else {
        // 로그인 성공
        tof = "true";
        // 세션에 로그인 정보 저장
        session.setAttribute("loggedIn", true);
        session.setAttribute("userId", loginid);
        session.setAttribute("userName", userInfo.get("name"));
    }
}
	
response.sendRedirect("login_result.jsp?tof=" + tof + "&id=" + loginid + "&errorType=" + errorType);
%>
</body>
</html>
