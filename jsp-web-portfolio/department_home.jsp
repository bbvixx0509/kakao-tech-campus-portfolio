<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%-- 학과 소개 형태로 구성한 웹 프로젝트의 메인 홈 화면 --%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI소프트웨어학과</title>
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
        <h1 class="text-center mb-4">AI소프트웨어학과에 오신 것을 환영합니다</h1>
        
        <div class="row">
            <div class="col-md-8">
                <h3>공지사항</h3>
                <ul class="list-group mb-4">
                    <li class="list-group-item">
                        <strong>2024-1학기 수강신청 안내</strong>
                        <span class="text-muted">2024.01.15</span>
                    </li>
                    <li class="list-group-item">
                        <strong>졸업작품 발표회 일정 안내</strong>
                        <span class="text-muted">2024.01.10</span>
                    </li>
                    <li class="list-group-item">
                        <strong>취업박람회 참가 신청</strong>
                        <span class="text-muted">2024.01.05</span>
                    </li>
                </ul>
            </div>
            
            <div class="col-md-4">
                <h3>주요 과목</h3>
                <ul class="list-group">
                    <li class="list-group-item">자료구조와 알고리즘</li>
                    <li class="list-group-item">데이터베이스 시스템</li>
                    <li class="list-group-item">웹 프로그래밍</li>
                    <li class="list-group-item">인공지능 기초</li>
                    <li class="list-group-item">소프트웨어 공학</li>
                </ul>
            </div>
        </div>
        
        <div class="row mt-5">
            <div class="col-12">
                <h3>학과 소개</h3>
                <p>AI소프트웨어학과는 4차 산업혁명 시대에 맞는 인재 양성을 목표로 하는 학과입니다. 
                인공지능, 빅데이터, 소프트웨어 개발 등의 분야에서 전문성을 갖춘 인재를 양성합니다.</p>
                
                <h4>주요 특징</h4>
                <ul>
                    <li>최신 AI 기술과 소프트웨어 개발 역량 함양</li>
                    <li>실무 중심의 프로젝트 기반 학습</li>
                    <li>산업체와의 협력을 통한 실무 경험 제공</li>
                    <li>우수한 취업률과 다양한 진로 지원</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html> 
