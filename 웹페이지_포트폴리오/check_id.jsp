<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%-- 회원가입 전에 아이디 중복 여부를 비동기로 확인하는 페이지 --%>
<%
request.setCharacterEncoding("UTF-8");

String id = request.getParameter("id");

// 저장된 사용자 정보 가져오기
Map<String, Map<String, String>> allUsers = (Map<String, Map<String, String>>) application.getAttribute("allUsers");
if (allUsers == null) {
    allUsers = new HashMap<String, Map<String, String>>();
}

boolean exists = allUsers.containsKey(id);

if (exists) {
    out.print("<span class='text-danger'>이미 사용중인 아이디입니다</span>");
} else {
    out.print("<span class='text-success'>사용 가능한 아이디입니다</span>");
}
%> 
