# JSP 기반 웹 애플리케이션

JSP와 Bootstrap을 사용해 만든 웹 프로젝트입니다.  
회원가입, 로그인, 회원 목록 확인, 회원 삭제, 로그아웃까지 기본적인 웹 서비스 흐름을 페이지 단위로 나누어 구현했습니다.

## 페이지 흐름

1. `project_intro.jsp`: 프로젝트 소개와 전체 진입 화면 역할을 하는 파일입니다.
2. `signup_form.jsp`: 회원가입 정보를 입력하는 화면입니다.
3. `check_id_availability.jsp`: 회원가입 과정에서 아이디 중복 여부를 확인하는 파일입니다.
4. `signup_process.jsp`: 회원가입 폼에서 전달된 값을 실제로 처리하는 파일입니다.
5. `login.jsp`: 로그인 화면입니다.
6. `login_process.jsp`: 로그인 요청을 처리하고 세션 상태를 만드는 파일입니다.
7. `login_result.jsp`: 로그인 성공 여부와 처리 결과를 보여 주는 파일입니다.
8. `member_dashboard.jsp`: 회원 목록을 보여 주고 관리 기능으로 이어지는 화면입니다.
9. `delete_member.jsp`: 회원 삭제를 처리하는 파일입니다.
10. `logout.jsp`: 세션을 종료하고 로그아웃을 처리하는 파일입니다.
11. `department_home.jsp`: 메인 홈 화면 역할을 하는 페이지입니다.
12. `curriculum_overview.jsp`: 학과 커리큘럼 소개 페이지입니다.
13. `notice_board.jsp`: 공지사항 페이지입니다.

## 화면 예시

### 로그인 화면
<img src="./화면%20예시/login_screen.png" alt="로그인 화면" width="680">

### 회원 관리 화면
<img src="./화면%20예시/member_dashboard.png" alt="회원 관리 화면" width="680">

### 메인 홈 화면
<img src="./화면%20예시/department_home.png" alt="메인 홈 화면" width="680">

## 이 프로젝트에서 확인할 수 있는 점

- 회원가입과 로그인 기능이 화면 파일과 처리 파일로 어떻게 나뉘는지
- `session`을 이용해 로그인 상태를 유지하는 기본 방식
- 여러 JSP 파일이 역할별로 분리되어 있을 때 웹 흐름이 어떻게 구성되는지

## 사용 기술

- `JSP`
- `Java`
- `Bootstrap`
