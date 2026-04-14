<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- 공지사항과 학사 일정을 표 형식으로 보여주는 페이지 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>공지사항 - AI소프트웨어학과</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-primary">
        <div class="container">
            <a class="navbar-brand text-white" href="department_home.jsp">AI소프트웨어학과</a>
            <div class="navbar-nav ms-auto">
                <a class="nav-link text-white" href="department_home.jsp">홈</a>
                <a class="nav-link text-white" href="curriculum_overview.jsp">교육과정</a>
                <a class="nav-link text-white" href="notice_board.jsp">공지사항</a>
           
            </div>
        </div>
    </nav>

    <div class="container mt-4">
        <h1 class="text-center mb-4">공지사항</h1>
        
        <div class="row">
            <div class="col-12">
                <h3>최신 공지</h3>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>날짜</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>2024-1학기 수강신청 안내</td>
                            <td>2024.01.15</td>
                        </tr>
                        <tr>
                            <td>2</td>
                            <td>졸업작품 발표회 일정 안내</td>
                            <td>2024.01.10</td>
                        </tr>
                        <tr>
                            <td>3</td>
                            <td>취업박람회 참가 신청</td>
                            <td>2024.01.05</td>
                        </tr>
                        <tr>
                            <td>4</td>
                            <td>겨울계절학기 수강신청</td>
                            <td>2023.12.20</td>
                        </tr>
                        <tr>
                            <td>5</td>
                            <td>학과 세미나 개최 안내</td>
                            <td>2023.12.15</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="row mt-5">
            <div class="col-md-6">
                <h3>학사 일정</h3>
                <ul class="list-group">
                    <li class="list-group-item">2024.02.26 - 2024-1학기 개강</li>
                    <li class="list-group-item">2024.03.04 - 수강신청 변경 마감</li>
                    <li class="list-group-item">2024.04.15 - 중간고사 시작</li>
                    <li class="list-group-item">2024.06.10 - 기말고사 시작</li>
                    <li class="list-group-item">2024.06.21 - 여름방학 시작</li>
                </ul>
            </div>
            
            <div class="col-md-6">
                <h3>학과 행사</h3>
                <ul class="list-group">
                    <li class="list-group-item">AI 해커톤 대회 (3월)</li>
                    <li class="list-group-item">코딩 테스트 특강 (4월)</li>
                    <li class="list-group-item">취업 특강 (5월)</li>
                    <li class="list-group-item">졸업작품 발표회 (6월)</li>
                    <li class="list-group-item">학과 MT (9월)</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html> 
