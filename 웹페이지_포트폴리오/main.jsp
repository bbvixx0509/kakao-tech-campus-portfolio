<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%-- 로그인한 사용자가 회원 목록을 확인하고 삭제할 수 있는 관리 페이지 --%>
<%
    // 사용자 존재 여부 체크
    Boolean loggedIn = (Boolean) session.getAttribute("loggedIn");
    String userId = (String) session.getAttribute("userId");
    String userName = (String) session.getAttribute("userName");
    
    // 로그인하지 않았다면 로그인 페이지로
    if (loggedIn == null || !loggedIn) {
        response.sendRedirect("login.jsp");
        return;
    }
    
    // 현재 로그인한 사용자가 실제 존재하는지 체크
    Map<String, Map<String, String>> allUsers = (Map<String, Map<String, String>>) application.getAttribute("allUsers");
    if (allUsers == null || !allUsers.containsKey(userId)) {
        // 사용자가 삭제되었다면 세션 정리하고 로그인 페이지로
        session.invalidate();
        response.sendRedirect("login.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원 관리</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-12">
                <h2 class="text-center mb-4">회원 관리</h2>
                
                <div class="text-center mb-4">
                    <strong><%= userName %></strong>님 환영합니다!
                </div>
                
                <h3>등록된 회원 목록</h3>
                <% if (allUsers != null && !allUsers.isEmpty()) { %>
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>번호</th>
                                <th>아이디</th>
                                <th>이름</th>
                                <th>삭제</th>
                            </tr>
                        </thead>
                        <tbody>
                            <% 
                            int index = 1;
                            for (Map.Entry<String, Map<String, String>> entry : allUsers.entrySet()) {
                                String userIdKey = entry.getKey();
                                Map<String, String> userInfo = entry.getValue();
                                String name = userInfo.get("name");
                            %>
                            <tr>
                                <td><%= index++ %></td>
                                <td><%= userIdKey %></td>
                                <td><%= name %></td>
                                <td>
                                    <a href="delete_process.jsp?userId=<%= userIdKey %>" 
                                       class="btn btn-danger btn-sm"
                                       onclick="return confirm('정말 삭제하시겠습니까?')">삭제</a>
                                </td>
                            </tr>
                            <% } %>
                        </tbody>
                    </table>
                    
                   
                <% } else { %>
                    <div class="alert alert-info text-center">
                        등록된 회원이 없습니다.
                    </div>
                <% } %>
                
                <div class="text-center mt-4">
                    <a href="home.jsp" class="btn btn-primary me-2">홈으로</a>
                    <a href="newlogin.jsp" class="btn btn-success me-2">회원가입</a>
                    <a href="logout.jsp" class="btn btn-secondary">로그아웃</a>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 
