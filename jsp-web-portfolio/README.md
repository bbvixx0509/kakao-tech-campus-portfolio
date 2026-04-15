# JSP Web Portfolio

JSP와 Bootstrap을 사용해 만든 웹 페이지 실습 프로젝트입니다.  
회원가입부터 로그인, 회원 관리, 로그아웃까지 기본적인 흐름이 연결되도록 구성했습니다.

## 페이지 구성

- `project_intro.jsp`: 프로젝트 안내 화면
- `login.jsp`: 로그인 입력 화면
- `signup_form.jsp`: 회원가입 입력 화면
- `check_id_availability.jsp`: 아이디 중복 확인
- `signup_process.jsp`: 회원가입 처리
- `login_process.jsp`: 로그인 처리
- `login_result.jsp`: 로그인 결과 확인
- `member_dashboard.jsp`: 회원 목록과 관리 화면
- `delete_member.jsp`: 회원 삭제 처리
- `logout.jsp`: 로그아웃 처리
- `department_home.jsp`: 메인 홈 화면
- `curriculum_overview.jsp`: 커리큘럼 소개 화면
- `notice_board.jsp`: 공지 화면

## 보면 좋은 부분

- 회원가입과 로그인 흐름이 페이지 단위로 나뉘어 있는 점
- `application` scope로 회원 정보를 관리한 방식
- `session` scope로 로그인 상태를 처리한 방식
- JSP 파일마다 역할이 바로 보이도록 이름과 설명을 정리한 점

## 사용 기술

- `JSP`
- `Java`
- `Bootstrap`
