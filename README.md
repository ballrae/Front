# ⚾️ 볼래? | 인터랙티브 야구 중계 앱

볼래? (Ball래?)는 야구 팬을 위한 실시간 인터랙티브 중계 앱입니다.  
문자 중계, 스트라이크존 시각화, 선수 기록실, 커뮤니티 기능 등을 통해 영상 없이도 몰입감 있는 야구 관람 경험을 제공합니다.

프론트엔드는 **React Native** 기반으로 개발되었으며, **iOS/Android 크로스 플랫폼**을 동시에 대응합니다.



📍 **프로젝트 기간**

2025.03.02 ~ 현재


📍 **사용 스택**

- **Mobile**: `React Native` `React Native CLI` `TypeScript` `Swift` `Kotlin`
- **Backend**: `Django` `RESTful API` `PostgreSQL`
- **Infrastructure**: `Docker` `Apache Kafka` `Airflow`

---

## 💡 주요 구현 기능

### 로그인 및 마이팀 설정
- 카카오 로그인 연동으로 간편한 인증
- 로그인 후 10개 구단 중 마이팀 선택 → 앱 전체에 팀 정보 반영
- 팀 선택 시 하이라이트 처리 및 변경 확인 메시지 출력
<img width="3669" alt="step1" src="https://github.com/user-attachments/assets/4e18cb40-37fd-4860-9757-0d590d5fa1f3" />

---

### 문자 중계 및 실시간 경기
- 최근 경기 리스트 제공 → 클릭 시 실시간 중계 화면 이동
- 스트라이크존, 주자 위치, 투수 정보 시각화
- 회차별 문자 중계: 구종/구속/결과 출력
- 현재 더미 기반이며, 추후 실시간 크롤링 연동 예정

<img width="3669" alt="step2" src="https://github.com/user-attachments/assets/3ea97a97-b782-4ea4-8b64-bd9e84faf807" />

---

### 기록실 (투수/타자 별)
- 전체 선수 검색 기능 제공
- 투수/타자 포지션에 따라 다른 지표와 레이아웃 표시
- 기본/심화/가치 스탯을 나눠 시각화
- 수평 슬라이더 & 레이더 차트 기반 시각 요소 구성
<img width="3669" alt="step3" src="https://github.com/user-attachments/assets/ae491593-6c4c-415d-9240-613c02e6797e" />

---

### 팀별 커뮤니티 게시판
- 10개 구단별 전용 게시판 제공
- 게시글 목록/작성 기능, 이미지 첨부 지원
- 게시판별 날짜별 정렬 기능
<img width="3670" alt="step4" src="https://github.com/user-attachments/assets/6e583dca-3dc2-4b95-b9ed-a99459217d7c" />

---

### 댓글 및 욕설 필터링
- 댓글/좋아요 기능 포함, 실시간 반영
- 욕설 필터링 모델 연동 → 비속어 마스킹 처리
- 클린한 커뮤니티 환경을 위한 UX 개선
<img width="3670" alt="step5" src="https://github.com/user-attachments/assets/649f3949-aa81-4014-82f0-9ed38859dab6" />


---

## 🔗 관련 링크

- 🔗 [ballrae 조직 페이지](https://github.com/ballrae)
- 🔗 [Backend Repository](https://github.com/ballrae/Back)
- 📬 Contact: jihee5100@sookmyung.ac.kr
