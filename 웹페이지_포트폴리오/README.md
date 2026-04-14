# 웹페이지 포트폴리오

JSP와 Bootstrap을 사용해 만든 간단한 웹 페이지 프로젝트입니다.  
회원가입, 로그인, 메인 페이지, 공지 페이지, 회원 삭제 흐름을 포함하고 있습니다.

## Page Flow

| 파일 | 역할 |
| --- | --- |
| `welcome.jsp` | 프로젝트 시작 안내 페이지 |
| `login.jsp` | 로그인 입력 페이지 |
| `newlogin.jsp` | 회원가입 입력 페이지 |
| `check_id.jsp` | 아이디 중복 확인 |
| `newlogin2.jsp` | 회원가입 처리 |
| `newlogin3.jsp` | 로그인 처리 |
| `newlogin4.jsp` | 로그인 결과 출력 |
| `main.jsp` | 회원 목록 및 관리 화면 |
| `delete_process.jsp` | 회원 삭제 처리 |
| `logout.jsp` | 로그아웃 처리 |
| `home.jsp` | 메인 홈 화면 |
| `curriculum.jsp` | 커리큘럼 페이지 |
| `notice.jsp` | 공지 페이지 |

## Key Points

- `application` scope를 이용한 회원 정보 저장
- `session` scope를 이용한 로그인 상태 관리
- Bootstrap 기반 UI 구성
- JSP 페이지 단위 기능 분리

