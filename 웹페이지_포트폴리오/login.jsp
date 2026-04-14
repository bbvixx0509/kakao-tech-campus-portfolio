<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- 사용자 아이디와 비밀번호를 입력받는 로그인 페이지 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>로그인</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <h2 class="text-center mb-4">로그인</h2>
                
                <form action="newlogin3.jsp" method="post">
                    <div class="mb-3">
                        <label for="id" class="form-label">아이디</label>
                        <input type="text" class="form-control" id="id" name="id" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="passwd" class="form-label">비밀번호</label>
                        <input type="password" class="form-control" id="passwd" name="passwd" required>
                    </div>
                    
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">로그인</button>
                        <button type="reset" class="btn btn-secondary">다시 입력</button>
                    </div>
                </form>

                <div class="text-center mt-3">
                    <a href="newlogin.jsp">회원가입</a> 
                </div>
            </div>
        </div>
    </div>
</body>
</html>
