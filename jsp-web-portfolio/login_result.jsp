<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%-- 로그인 성공 여부에 따라 다음 이동 경로를 안내하는 결과 페이지 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인 결과</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<%
String tof = request.getParameter("tof");
String id = request.getParameter("id");
String errorType = request.getParameter("errorType");

// 세션 정보 가져오기
String userName = (String) session.getAttribute("userName");
Boolean loggedIn = (Boolean) session.getAttribute("loggedIn");

// 현재 등록된 사용자 수 확인
Map<String, Map<String, String>> allUsers = (Map<String, Map<String, String>>) application.getAttribute("allUsers");
int currentUserCount = (allUsers != null) ? allUsers.size() : 0;
%>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <% if ("true".equals(tof)) { %>
                <!-- 로그인 성공 -->
                <div class="alert alert-success text-center">
                    <h4>로그인 성공</h4>
                    <p><strong><%= id %></strong>님 환영합니다!</p>
                </div>
                
                <div class="text-center">
                    <p><strong>이름:</strong> <%= userName %></p>
                    <p><strong>아이디:</strong> <%= id %></p>
                </div>
                
                <div class="d-grid gap-2">
                    <a href="department_home.jsp" class="btn btn-primary">홈페이지로 가기</a>
                    <a href="member_dashboard.jsp" class="btn btn-secondary">회원관리로 가기</a>
                </div>
                
                <div class="text-center mt-3">
                    <a href="logout.jsp">로그아웃</a>
                </div>
                
            <% } else { %>
                <!-- 로그인 실패 -->
                <div class="alert alert-danger text-center">
                    <h4>로그인 실패</h4>
                </div>
                
                <% if ("nouser".equals(errorType)) { %>
                    <div class="alert alert-warning text-center">
                        <strong><%= id %></strong> 아이디가 존재하지 않습니다.
                    </div>
                    
                    <% if (currentUserCount < 2) { %>
                        <p class="text-center">회원가입을 먼저 해주세요!</p>
                        <div class="d-grid gap-2">
                            <a href="signup_form.jsp" class="btn btn-primary">회원가입 하러 가기</a>
                            <a href="login.jsp" class="btn btn-secondary">다시 로그인하기</a>
                        </div>
                    <% } else { %>
                        <p class="text-center">회원가입이 마감되었습니다. (최대 2명)</p>
                        <div class="text-center">
                            <a href="login.jsp" class="btn btn-primary">다시 로그인하기</a>
                        </div>
                    <% } %>
                    
                <% } else if ("wrongpass".equals(errorType)) { %>
                    <div class="alert alert-warning text-center">
                        <strong><%= id %></strong> 아이디는 존재하지만<br>
                        비밀번호가 틀렸습니다.
                    </div>
                    <p class="text-center">비밀번호를 다시 확인해주세요.</p>
                    <div class="text-center">
                        <a href="login.jsp" class="btn btn-primary">다시 로그인하기</a>
                    </div>
                    
                <% } else { %>
                    <div class="alert alert-danger text-center">
                        아이디 또는 비밀번호가 틀렸습니다.<br>
                        다시 시도해주세요.
                    </div>
                    <div class="d-grid gap-2">
                        <a href="login.jsp" class="btn btn-primary">다시 로그인하기</a>
                        <a href="signup_form.jsp" class="btn btn-secondary">회원가입하기</a>
                    </div>
                <% } %>
            <% } %>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
