<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- 회원가입 입력 폼과 아이디 중복 확인 버튼을 제공하는 페이지 --%>
<%
    // 현재 사용자 수 확인 (application scope)
    Integer userCount = (Integer) application.getAttribute("userCount");
    if (userCount == null) {
        userCount = 0;
    }
    
    // 2명 이상이면 가입 마감
    boolean isRegistrationClosed = userCount >= 2;
%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>회원가입</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <h2 class="text-center mb-4">회원가입</h2>
                
                <% if (isRegistrationClosed) { %>
                    <div class="alert alert-danger text-center">
                        <h4>회원가입 마감</h4>
                        <p>최대 2명까지만 가입 가능합니다.</p>
                        <a href="login.jsp" class="btn btn-primary">로그인하러 가기</a>
                    </div>
                <% } else { %>
                    <form action="signup_process.jsp" method="post" onsubmit="return validateForm()">
                        <div class="mb-3">
                            <label for="id" class="form-label">아이디</label>
                            <div class="row">
                                <div class="col-8">
                                    <input type="text" class="form-control" id="id" name="id" required>
                                </div>
                                <div class="col-4">
                                    <button type="button" class="btn btn-outline-primary btn-sm" onclick="checkId()">중복검사</button>
                                </div>
                            </div>
                            <div id="idResult" class="text-muted small mt-1"></div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="passwd" class="form-label">비밀번호</label>
                            <input type="password" class="form-control" id="passwd" name="passwd" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="name" class="form-label">이름</label>
                            <input type="text" class="form-control" id="name" name="name" required>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-success">가입하기</button>
                            <button type="reset" class="btn btn-secondary">다시 입력</button>
                        </div>
                    </form>
                <% } %>
                
                <div class="text-center mt-3">
                    <a href="login.jsp">로그인하러 가기</a>
                </div>
            </div>
        </div>
    </div>

    <script>
    let isIdChecked = false;
    
    function checkId() {
        var id = document.getElementById('id').value;
        if (!id) {
            alert('아이디를 입력해주세요.');
            return;
        }
        
        fetch('check_id_availability.jsp?id=' + encodeURIComponent(id))
            .then(response => response.text())
            .then(data => {
                document.getElementById('idResult').innerHTML = data;
                if (data.includes('사용 가능')) {
                    isIdChecked = true;
                } else {
                    isIdChecked = false;
                }
            });
    }
    
    function validateForm() {
        if (!isIdChecked) {
            alert('아이디 중복검사를 해주세요.');
            return false;
        }
        return true;
    }
    </script>
</body>
</html>
