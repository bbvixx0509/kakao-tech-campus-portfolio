<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- 세션을 종료하고 로그아웃 완료 메시지를 보여주는 페이지 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그아웃</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<%
// 세션 정보 가져오기 (무효화 전에)
String userName = (String) session.getAttribute("userName");

// 세션 무효화
session.invalidate();
%>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <div class="alert alert-info text-center">
                <h4>로그아웃 완료</h4>
                <% if (userName != null) { %>
                    <p><%= userName %>님, 안전하게 로그아웃되었습니다.</p>
                <% } else { %>
                    <p>로그아웃되었습니다.</p>
                <% } %>
                <p>이용해 주셔서 감사합니다!</p>
            </div>
            
            <div class="text-center">
                <a href="login.jsp" class="btn btn-primary">다시 로그인하기</a>
            </div>
        </div>
    </div>
</div>
</body>
</html> 
