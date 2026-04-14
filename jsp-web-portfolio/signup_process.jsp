<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="java.util.*" %>
<%-- 회원가입 요청을 실제 데이터에 반영하고 결과를 보여주는 페이지 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원가입 결과</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<% 
request.setCharacterEncoding("UTF-8");

String id = request.getParameter("id");
String passwd = request.getParameter("passwd");
String name = request.getParameter("name");

// 사용자 정보를 저장할 HashMap (application scope에 저장)
Map<String, Map<String, String>> allUsers = (Map<String, Map<String, String>>) application.getAttribute("allUsers");
if (allUsers == null) {
    allUsers = new HashMap<String, Map<String, String>>();
    application.setAttribute("allUsers", allUsers);
}
%>

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6">
            <% if (allUsers.size() >= 2) { %>
                <!-- 가입 마감 -->
                <div class="alert alert-danger text-center">
                    <h4>가입 실패</h4>
                    <p><strong>회원가입이 마감되었습니다.</strong><br>(최대 2명)</p>
                </div>
                <div class="text-center">
                    <a href="login.jsp" class="btn btn-primary">로그인 하러 가기</a>
                </div>
                
            <% } else if (allUsers.containsKey(id)) { %>
                
                <%-- 
                <!-- 중복 아이디 -->
                <div class="alert alert-warning text-center">
                    <h4>가입 실패</h4>
                    <p><strong>이미 존재하는 아이디입니다.</strong><br>다른 아이디를 사용해주세요.</p>
                </div>
                <div class="text-center">
                    <a href="form01.jsp" class="btn btn-primary">다시 가입하기</a>
                </div>
                --%>
                
            <% } else {
                // 새 사용자 정보 저장
                Map<String, String> userInfo = new HashMap<String, String>();
                userInfo.put("passwd", passwd);
                userInfo.put("name", name);

                allUsers.put(id, userInfo);
                application.setAttribute("allUsers", allUsers);
                
                // 사용자 수 업데이트
                application.setAttribute("userCount", allUsers.size());
            %>
                
                <!-- 가입 성공 -->
                <div class="alert alert-success text-center">
                    <h4>가입 완료</h4>
                    <p><strong>회원가입을 완료했습니다!</strong><br>등록된 회원: <%= allUsers.size() %>/2명</p>
                </div>
                
                <div class="text-center mb-4">
                    <p><strong>아이디:</strong> <%= id %></p>
                    <p><strong>이름:</strong> <%= name %></p>
                </div>
                
                <div class="text-center">
                    <a href="login.jsp" class="btn btn-primary">로그인 하러 가기</a>
                </div>
            <% } %>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
