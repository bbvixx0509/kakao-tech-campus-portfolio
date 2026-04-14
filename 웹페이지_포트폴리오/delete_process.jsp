<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%-- 선택한 회원 계정을 application scope에서 삭제하는 처리 페이지 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원 삭제</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<% 
request.setCharacterEncoding("UTF-8");

String deleteId = request.getParameter("userId");

// 사용자 정보 가져오기
Map<String, Map<String, String>> allUsers = (Map<String, Map<String, String>>) application.getAttribute("allUsers");
if (allUsers == null) {
    allUsers = new HashMap<String, Map<String, String>>();
    application.setAttribute("allUsers", allUsers);
}
%>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <% if (deleteId != null && allUsers.containsKey(deleteId)) {
                // 삭제할 사용자 정보 저장 (삭제 전에)
                Map<String, String> deletedUser = allUsers.get(deleteId);
                String deletedName = deletedUser.get("name");
                
                // 사용자 삭제
                allUsers.remove(deleteId);
                application.setAttribute("allUsers", allUsers);
                application.setAttribute("userCount", allUsers.size());
            %>
                <div class="alert alert-success text-center">
                    <h4>회원 삭제 완료</h4>
                    <p><strong><%= deleteId %></strong> (<%= deletedName %>) 님의 계정이 삭제되었습니다.</p>
                    <p>현재 등록된 회원: <%= allUsers.size() %>/2명</p>
                </div>
            <% } else { %>
                <div class="alert alert-danger text-center">
                    <h4>삭제 실패</h4>
                    <p>삭제할 회원을 찾을 수 없습니다.</p>
                </div>
            <% } %>
            
            <div class="text-center">
                <a href="login.jsp" class="btn btn-secondary">로그인으로 가기</a>
            </div>
        </div>
    </div>
</div>
</body>
</html> 
