# Log

## Log Index

167. 2026-06-26 회선 선택 로그인(방문자 식별자 주입) 구현 — 헤더 우측 visitor 라벨+로그인 버튼, 로그인 모달에 telecom_test_lines 넓은 테이블(단일 선택). 선택 회선ID(line_id)를 Target 식별자(웹 thirdPartyId/네이티브 setThirdPartyId)로 주입→refreshOffers로 배너·팝업 즉시 개인화. VisitorContext(+브리지)·LoginModal·VisitorMenu 신설, refreshOffers 플랫폼 분기, AppHeader 우측 위젯 배치
166. 2026-06-26 통신사 테스트 DB(lgu_target_test) 연결·회선 조회 API — 별도 DB/유저(lgu)·telecom_test_lines(회선 그레인) 신규. 백엔드 2번째 비동기 엔진(telecom_db.py) 추가, config telecom_db 파싱, GET /api/telecom/lines·/{line_id}(약정 D-day·단말 사용개월 파생) 라우터, main 라우터 등록·lifespan 정리
165. 2026-06-26 네이티브 띠배너 연동 — 네이티브 전용 배너 mbox(msdk) 분리·앱 진입 시 Mobile SDK 일괄 조회→웹과 동일 파서/Context/컴포넌트로 표시. config.mobile_env.adobe_sdk_mboxes.banner_sdk_mbox_names 추가, retrieveTargetContents(배치) 신설, TargetPageBootstrap 웹/네이티브 통합
164. 2026-06-23 띠배너 FOUC 제거 — Context에 bannersReady 플래그 추가, 부트스트랩 완료 전 Top/BottomBanner 미렌더(기본문구→오퍼 깜빡임 방지), 네이티브/실패 시 즉시 ready로 기존 동작 유지
163. 2026-06-22 배너 전용 mbox 분리(B안) — config mboxes.banner_mbox_names(리스트) 추가, 부트스트랩 offers 요청에 bootstrap_mbox + 배너 mbox들을 한 요청에 동봉(_run_delivery 다중 mbox화), 배너별 독립 활동으로 location 충돌 해소
162. 2026-06-22 띠배너 파서 배열 content 지원 — 단일 mbox(부트스트랩) 한 활동으로 상단+하단 띠배너 동시 처리(같은 mbox에 활동 2개 시 충돌로 1개만 서빙되는 문제 해결), 단일 객체 하위호환
161. 2026-06-22 띠배너 CTA 새창/현재창 선택 — 오퍼에 ctaTarget("_self"/"_blank") 추가, 열기 로직을 openBannerCta 공용함수로 분리(웹: 현재창 location.assign / 새창 window.open noopener, 네이티브: Linking), TopBanner/BottomBanner 중복 제거
160. 2026-06-22 띠배너 endAt 마케터 친화 입력 — useCountdown 에 _normalizeEndAt 추가("2026-06-22"→그날 23:59:59 / "YYYY-MM-DD HH:mm" 허용, 타임존 생략 시 KST(+09:00)), 풀 ISO 하위호환·Hermes/V8 공백형식·날짜만 UTC 어긋남 해소
159. 2026-06-22 띠배너 카운트다운(마감 타이머) 추가 — 기존 top/bottom-banner 계약 재사용(endAt/expiredTitle만 확장), 공용 useCountdown 훅 신설, TopBanner/BottomBanner 진행중 남은시간·만료문구 노출(endAt 없으면 하위호환)
158. 2026-06-19 docs/main 04 v3.5 — 부록 C(JSON 오퍼 타입별 적용) event-popup·top/bottom-banner·캐러셀·A/B imageUrl·추천 Design 샘플·페이지/mbox 매트릭스·bootstrap 다중 오퍼 예시
157. 2026-06-19 LGU+ 스타일 상/하단 띠배너 도입 — 앱 네임 라벨 아래(상단)·푸터 위(하단) 전역 배치, StripBanner/TopBanner/BottomBanner 컴포넌트 분리, Target top-banner/bottom-banner 오퍼 연동(파서·Context·bootstrap), Stack 헤더를 AppHeader 로 분리
156. 2026-06-09 docs/adobe/04_CAMPAIGN_AUDIENCE.md 신규 — 외부(Adobe Campaign) 세그먼트→Target 오디언스 연동 가이드(3경로 비교·권장 ②속성적재 아키텍처·흐름/의사코드·식별자 정합·지연별 수단·U+ 맥락)
155. 2026-06-05 docs/adobe 03 추천 디자인 categoryId 빈값 원인·해결 정정 — $entity.category(없는 속성)·$entity.categoryId(multi-value 직접출력 불가) → categoriesList #foreach 로 교체(사용자 A안 검증 완료)
154. 2026-06-05 프론트 env 민감정보 git 제외 — config.{dev,prd}.json 추적 해제(로컬 보존)·example 2종 신설(민감 4필드 플레이스홀더)·.gitignore·loadConfig 주석·docs 04 §17/§18 동기화
153. 2026-06-05 docs 점검 — docs/adobe·docs/main stale 참조 없음(구 명칭은 log 이력에만). docs/main 04 부록 B.3에 식별자 발급 주체 원칙(thirdPartyId=임의지정 / tntId·ECID=받아서 재사용) 보강
152. 2026-06-05 docs/main 04 v3.4 — 부록 B(네이티브 서버사이드/하이브리드 연동) 추가: 앱→백엔드(Python/Java SDK)→Delivery API 구조·[A]/[B] 비교·ECID(marketing_cloud_visitor_id) 스티칭/하이브리드·시나리오별 권장
151. 2026-06-05 SDK 예시 명명 일관화 — 가격 짝 entity_value↔entities_total_value 통일·TELECOM 상수 접미사 통일(_PROFILE_PARAMS)·get_offers_example params→mbox_parameters·네이티브 payload total→entitiesTotalValue(+entityValue/attrs/profile 연결)
150. 2026-06-05 SDK 예시 추천 가격 의미 분리 — order_total(전환 총액, 묶음=합계)·entity_value(단건 카탈로그가) 별도 인자화(묶음 시 entity.value 오기입 방지)
149. 2026-06-05 SDK 예시 추천 호출 가격 하드코딩(1000.0) 제거 — price·purchased_ids 인자화(order.total·entity.value 반영, 묶음 구매 지원)
148. 2026-06-05 adobe_backend_example 검수 — API/객체/반환 구조 공식·운영코드와 일치 확인, client docstring·주석의 stale "mbox 이름" 문구 2곳만 정정
147. 2026-06-05 SDK 예시 client 설정에서 미사용 mbox 필드(offer/recs_mbox_name) 제거 — 초기화에 불필요(요청 시 인자 전달)·죽은 설정 정리
146. 2026-06-05 SDK 예시 4-B 주석 보강 — profile.* 와 entity.* 분리 이유·유용/주의점(프로필 만료·덮어쓰기·PII)·profile script(user.*) vs 전달 파라미터 구분 요약(py/native)
145. 2026-06-05 SDK 예시 엔터티 속성을 [예약(Adobe 기본)]/[커스텀(통신사 제안)]으로 분리 표기·entity.margin 등 예약 누락 보완·커스텀 속성 추가(공식 문서 근거)·profile.* vs crs.* 구분 주석
144. 2026-06-05 SDK 예시 베이스 모델에 통신사(텔코) 확장 반영(엔터티/프로필 속성 템플릿·조회/전환 신호 빌더)·전 필드 용도 주석·py import 누락(VisitorId) 수정
143. 2026-06-05 Adobe SDK 예시 패키지 신설(adobe_backend_example: Web Python SDK 3파일 / adobe_frontend_example: Native SDK 3파일) — 최소 구성·자기완결형·요청/반환 주석
142. 2026-06-04 docs/main 04 §14.5 SDK 객체 레퍼런스 추가(@adobe/react-native-aeptarget Target/TargetParameters/TargetRequestObject/TargetProduct/TargetOrder·공식 링크) v3.3
141. 2026-06-04 추천 전용 mbox(target-rec-msdk-mbox) 분리 — XT 활동과 location 충돌 제거(config·loadConfig·common·RecommendationScreen·문서)
140. 2026-06-04 추천 네이티브 코드 점검·경량 리팩토링(recommendationData toRecord DRY·렌더 중복계산 제거·docstring 동기화)
139. 2026-06-04 docs/adobe/02_AB.md 신규 — A/B 테스트 가이드(개념·활동 3종·트래픽/통계·네이티브 Form/mbox·abtest 매핑)
138. 2026-06-04 docs/adobe/01_XT.md 신규 — XT(Experience Targeting) 가이드(개념·3단계·오디언스/우선순위·네이티브 Form/mbox·xttest 매핑) + 03 §2.4 실제 구독 반영
137. 2026-06-04 docs/adobe/03_RECOMMANDATION.md 필기노트 스타일 전면 재정리 + §2.4 고객 데이터 평면(Customer Attributes·recipient_id 조인) 추가
136. 2026-06-04 docs/adobe/03_RECOMMANDATION.md 신규 — 추천 Zero→Live 세팅 가이드(카탈로그·Collection·Criteria·Design·Activity·부가옵션)
135. 2026-06-04 docs/main 04 v3.2 — 네이티브 추천(Recommendations) 완전 가이드(§15)·테스트 화면 3종·mobile_env·푸터 두 줄 반영
134. 2026-06-04 추천 데이터 적재를 묶음 구매(랜덤 2~5품목/주문)로 변경(co-purchase 쌍 가속·Adobe 250자 가드레일 내)
133. 2026-06-04 푸터 탭 7개를 두 줄(4 + 3) 레이아웃으로 변경(좁은 화면에서 모두 노출)
132. 2026-06-04 네이티브 SDK 추천(Recommendations) 테스트 화면 추가(데이터 적재 루프 + 추천 가져오기)·푸터 탭(추천 SDK)
131. 2026-06-04 방문자 패널 공용화(VisitorPanel)·A/B 화면에 식별자/초기화 추가·경험 초기화에 ECID 재발급(resetIdentities) 적용
130. 2026-06-02 네이티브 SDK 래퍼(adobeMobileTarget 3파일)를 target-native-frontend/native 로 이관·import 정리
129. 2026-06-02 네이티브 테스트 화면 mbox 하드코딩 폴백 제거(미설정 경고)·공용 모듈(common)로 배너/스타일 중복 제거
128. 2026-06-02 네이티브 Target 테스트 화면 패키지 이관(target-native-frontend)·XT/A·B 테스트 개편·Assurance 전역 자동세션·안드로이드 몰입형 내비바
127. 2026-06-02 AB 이미지 테스트를 native-target-abtest 화면으로 분리(ab-image 파서 제거·단일 imageUrl 계약)
126. 2026-06-02 global mbox(첫 로드 자동 호출) 추가 + AB 이미지 오퍼(ab-image) 중앙 적용
125. 2026-06-02 프론트 config 모바일 전용값을 mobile_env 블록으로 통합(web/mobile 구분)
124. 2026-06-02 Target Property 토큰 주입(config) + SDK 테스트 화면 A/B 이미지 영역 추가
123. 2026-06-02 네이티브 SDK 테스트 화면 KeyboardAvoidingView 적용(입력 시 키보드 가림 방지)
122. 2026-06-02 하단 푸터 safe-area inset 반영(모바일 제스처 바/홈버튼 클릭 충돌 방지)
121. 2026-06-01 모바일 확장 설치 검증 + 가이드 문서(04) v3.1 갱신(검증 매트릭스·event-popup 공용·리팩토링 반영)
120. 2026-06-01 모바일 SDK 경로에서도 event-popup 오퍼 시 웹과 동일한 EventPopup 표시
119. 2026-06-01 백엔드 요청 모델 공통 베이스(_TargetVisitorRequest)로 Offers/ProfileTest 중복 필드 통합
118. 2026-06-01 웹 mbox 백엔드 단일 소스(bootstrap 역할)·프론트 fetch 공통화(targetHttp)·백엔드 _run_delivery 중복 제거
117. 2026-06-01 프론트 mbox 설정을 네이티브 전용 adobe_sdk_mboxes로 분리(웹 경로는 상수화)
116. 2026-06-01 docs/main 04 Adobe Target 가이드 전면 재작성(v3.0·웹/네이티브 분리·모바일 SDK 기술)
115. 2026-06-01 네이티브 Adobe Target SDK 연동(AEPCore/AEPTarget/AEPAssurance·플랫폼 분리)
114. 2026-06-01 스크롤 테스트 페이지 500개·행별 스크롤 퍼센트·중앙 정렬
113. 2026-06-01 하단 푸터에 스크롤 테스트 탭 추가
112. 2026-06-01 스크롤 이벤트 테스트 페이지(/at-test/scroll-test) 추가
111. 2026-06-01 세션 저장소 웹/네이티브 범용화(sessionStore + AsyncStorage)
110. 2026-05-18 메인 ScrollView `nativeID=mainScreenScrollArea`
109. 2026-05-18 메인 라우트 `/main` 분리·루트 `/at-test/` 리다이렉트
108. 2026-05-18 웹 digitalData 라우트별 pageName 동기화
107. 2026-05-15 Target bootstrap mbox 정리(target-ready-mbox·mbox별 dedupe·preload 제거)
106. 2026-05-15 Target location 범용 구조(TargetPageBootstrap·useTargetLocation·dedupe offers)
105. 2026-05-14 쿠폰 목록: recommendation-test용 recipient_id 추적·복사·초기화
104. 2026-05-14 recommendation-test: content `{meta, items}` 파싱·`recommendations_meta`
103. 2026-05-14 docs/main 03·04: CORS(main)·recommendation categoryId·build_delivery_id 문서 정합
102. 2026-05-14 쿠폰 목록·CSV 컬럼 순서(created→recipient→캠페인→워크플로)
101. 2026-05-14 CORS dev localhost Origin 정규식·cors_origins 정규화
100. 2026-05-14 CORS preflight OPTIONS 400(private-network) 완화
99. 2026-05-14 쿠폰 목록·CSV recipient_id당 1행(중복 제거)
98. 2026-05-14 쿠폰 목록 필터·CSV(현재/전체)·coupon_id 제거
97. 2026-05-13 미푸시 작업 일괄 푸시(Adobe·문서·프로필·추천 테스트 UI)
96. 2026-05-13 README를 docs/main 기준으로 정합(구조·실행·Adobe·디버그)
95. 2026-05-13 docs/main 04 v2.2 recommendation-test·프론트 정합(문서만)
94. 2026-05-13 recommendation-test: customerIds·Product·build_delivery_id 확장
93. 2026-05-13 docs/main 04 v2.1·02/03 Adobe 링크(연관 문서·저장소·브리지·트랙 제거)
92. 2026-05-13 추천 테스트: ss(매장) 제외·entity.categoryId 미전송
91. 2026-05-13 recommendation-test: price 필드·Delivery Order 객체
90. 2026-05-13 recs_mbox_name 을 config.adobe.json·target_config 에 반영
89. 2026-05-13 Target 연결 검증·docs/main 전면 갱신·main.py 주석 정합
88. 2026-05-13 targetRecommendationTest 를 utils 로 이동·AT_RECS_* 를 targetSession 에 구획
87. 2026-05-13 전역 하단 푸터(AppFooter)·메인·프로필·추천 테스트 이동
86. 2026-05-13 profile-test: Alert 제거·EventPopup·event-popup 오퍼 연동
85. 2026-05-13 Recommendation 테스트 페이지·백엔드 `/api/target/recommendation-test` 추가
84. 2026-05-12 profile-test 모델·함수 포맷을 offers 와 1대1 정렬(가독성)
83. 2026-05-12 profile-test mbox 이름을 config.adobe.json 의 offer_mbox_name 으로 단일화
82. 2026-05-12 profile-test 를 named mbox(target-local-mbox)로 전환·MboxRequest.profile_parameters 사용
81. 2026-05-12 tntId 클라이언트 생성 제거 — thirdPartyId 중심·Adobe 서버 생성 tntId 재활용
80. 2026-05-12 Adobe Target 백엔드 4파일 전면 리팩터(global mbox 분기·중복 헬퍼·배너 주석 제거, 581→334줄)
79. 2026-05-12 profile-test 패널 응답 중심 리팩터·백엔드 sent_profile_params 제거
78. 2026-05-12 profile-test 응답 offers content 원본(dict|str) 유지·response_tokens 옵션별 부착
77. 2026-05-12 profile-test 패널: testNotVal 버튼·popup 오퍼 감지·매칭 결과 표시
76. 2026-05-12 profile script test 엔드포인트·프론트 패널·라우트 추가
75. 2026-05-11 원격 동기화: Adobe 05-11 일괄 반영·`backend/env/config.dev.json` 제외
74. 2026-05-11 Adobe offers parameters 단일화(profileParameters 제거)
73. 2026-05-11 Adobe Phase0: target_cookie·session_id·profileParameters 분리
72. 2026-05-11 Adobe target_backend 경량 리팩터(주석·함수 통합·ASCII 검증을 config로)
71. 2026-05-11 target_delivery_utils VisitorId import 주석 요약 보강
70. 2026-05-11 docs/main 04 v3.0.1 JSON 키 id vs import VisitorId 설명
69. 2026-05-11 docs/main 04 v3.0·README·02/03 Adobe 교차 참조 및 VisitorId 주석
68. 2026-05-11 Adobe Delivery `id` 명명(tntId·thirdPartyId) 및 offers 파이프라인
67. 2026-05-08 Adobe offers 엔드포인트 함수명 충돌 해소
66. 2026-05-08 Adobe except 로그 메시지 요약(가독성 중심)
65. 2026-05-08 Adobe 설정 로드 경로 단순화(app.config 경유 제거)
64. 2026-05-08 Adobe Target 파일 역할 분리 리팩토링(라우터/디버그/유틸/파서)
63. 2026-05-08 Adobe Target 전수 점검 후 경량 정리(미사용/중복 제거)
62. 2026-05-08 Adobe Target offers-only 리팩토링(notification/track 제거)
61. 2026-05-08 Target notification 후 `refreshOffers`·`profile_params`·offers fetch 공통화
60. 2026-05-08 Adobe `notif_mbox_name`·`target-click-mbox`·라우터 `send_notifications` 명명 정합
59. 2026-05-08 Target 클릭 API `POST /api/target/notifications` 권장·`/track` 레거시 병행
58. 2026-05-08 갤러리 썸네일 클릭 시 Target track 전송·`sendAdobeTargetTrack` 공통화
57. 2026-05-08 Target offers/track에 `clickEvent*` 쿠키 평탄 params 전달
56. 2026-05-08 Adobe Target event-popup·click 쿠키(실행기-only)·팝업 Context
55. 2026-05-08 Adobe `config.adobe.json` Git 제외·example 템플릿·프론트 postinstall
54. 2026-05-07 Adobe config.adobe.json 중첩(administration/mboxes) 로드 수정·프론트 mboxes 정규화
53. 2026-05-07 Adobe 설정 경로 명시·프론트 BRIDGE 주석 통일(backend/env·frontend/env config.adobe.json)
52. 2026-05-07 app/config·main 어도비 BRIDGE 주석 보강(위치·구분선)
51. 2026-05-07 Adobe config.adobe.json 을 backend/env·frontend/env 로 이동
50. 2026-05-07 Adobe Target 백·프 패키지 통합 및 config.adobe.json 분리
49. 2026-05-07 Adobe Target 백엔드 mbox 기본값 config 정합(offer_mbox_name·track_mbox_name·Pydantic Field)
48. 2026-05-07 Adobe Target 1차 리팩토링(04 v2.1 런타임·track 응답, 진단 parse_execute 분기)
47. 2026-05-07 docs/main 04 v2.0 Adobe Target 가이드 재작성·PRD 연관 문서(04) 행 추가
46. 2026-05-07 docs/main 04 v1.6 Delivery 클릭 알림 용도(6.3)·tokens 한계(6.4)·로그 40~45·코드 정합
45. 2026-05-07 Adobe Target mbox 이름 frontend/env config 로 분리(offer=target-local-mbox·track=click-tracking-mbox)
44. 2026-05-07 Adobe Target 진단 로그 보강(request 요약 1줄·response.to_dict() 분할 덤프·track 엔드포인트 동일 적용)
43. 2026-05-07 Adobe Target offers 빈 배열 진단 로그 재도입(요청 to_str 분할·응답 page_load.options/mboxes 풀이)
42. 2026-05-07 Adobe Target LocationParseError 원인(ApiClient TypeWithDefault 메타클래스) 진단 및 디버그 코드 제거
41. 2026-05-07 Adobe Target DeliveryRequest.property 직렬화 검증용 디버그(AT_DEBUG_DELIVERY 토글)
40. 2026-05-07 Adobe Target autoPlay 미동작 수정(파서 lenient·진단 로그·MIN 가드 제거)
39. 2026-05-07 Adobe Target 코드 시각 구분(전용/혼합 배너)·파일명 접두사 미적용 정책
38. 2026-05-07 Adobe Target 오퍼 Context·ImageCarousel adobeOffer prop·autoPlay
37. 2026-05-07 docs/main 04 Adobe Target 가이드 v1.3(로그 31~36·코드 정합)
36. 2026-05-07 Adobe Target 글로벌 mbox pageLoad 전환(NoGlobalMbox 400)
35. 2026-05-07 Adobe Target 검증: track·offers 방문자 정합(adobeTargetSession)·docs/main 04 갱신
34. 2026-05-07 Adobe Target tntId(hex.28_0)·OffersRequest.tnt_id·응답 tntId 재사용
33. 2026-05-07 Adobe Target Delivery visitorId(thirdPartyId) 필수 반영·ApiException 400
32. 2026-05-07 Adobe Target URL 파싱 오류 400·502 상세·웹 pointerEvents LogBox
31. 2026-05-07 Adobe Target 설정 문자열 strip 및 설정 캐시 안내
30. 2026-05-07 docs/main 04 Adobe Target 연동 가이드 작성
29. 2026-05-07 Adobe Target 라우터 to_thread·웹 카드 boxShadow 분기
28. 2026-05-07 Adobe Target 설정 ASCII 검증 및 ConfigError 시 HTTP 400
27. 2026-05-07 Adobe Target 오퍼 프리로드 응답 로그 res.ok 분기
26. 2026-05-07 Adobe Target 프론트 API 베이스 URL을 api_url(8010)과 정합
25. 2026-05-07 Adobe Target 백엔드 의존성·Delivery API 모델 정합
24. 2026-05-06 Adobe Target Python SDK 백엔드·Expo 연동
23. 2026-05-06 Adobe RN SDK 제거 및 Python SDK 전환 준비
22. 2026-05-06 dev CORS에 Expo 웹 출처(8081) 추가
21. 2026-05-06 쿠폰 목록 recipient_id·테이블 가로 스크롤
20. 2026-05-06 git pull 및 손상 원격 ref 정리
19. 2026-04-28 CouponTable 페이징 반응형(밀도·줄바꿈)
18. 2026-04-28 docs/main 아키 변경 반영(env 분리·CORS 설정화)
17. 2026-04-28 env 프론트·백엔드 분리 및 설정 경로 전환
16. 2026-04-28 docs/main 01~03 고객용 문서 정비
15. 2026-04-28 CouponTable 페이지 직접 입력 점프(Enter/blur) 추가
14. 2026-04-28 쿠폰 keyset 페이징 전환·cursor CSV·맨뒤 최적화
13. 2026-04-28 coupons CSV API 추가·CouponTable 서버 다운로드 전환·맨앞/맨뒤 버튼
1. 2026-04-28 백엔드·CouponTable 점검 반영(reltuples 0 폴백·ORM NOT NULL·CSV BOM)
2. 2026-04-28 FastAPI 쿠폰 API·웹 CouponTable·deploy·gitignore
3. 2026-04-27 env 이미지 라벨 LGU·KT·SKT
4. 2026-04-27 README Windows venv pip 명령 정리
5. 2026-04-27 Python venv·requirements.txt·gitignore 문서화
6. 2026-04-27 환경별 config __DEV__ 분기·deploy.sh·README·REQUIREMENTS
7. 2026-04-27 GitHub main 초기 푸시 및 loadConfig dev/prd 분기
8. 2026-04-27 프로젝트 폴더 git init 및 GitHub origin 연결
9. 2026-04-27 갤러리 한 줄·번호 선택·기본 숨김 UI 수정
10. 2026-04-27 frontend 폴더로 Expo 앱 이전 (모노레포)
11. 2026-04-27 AT_TEST_PAGE Expo 풀 코드 구현 (PRD 정합)
12. 2026-04-27 docs/main AT_TEST_PAGE PRD v1.0 작성

## Log Body

167. 2026-06-26 회선 선택 로그인(방문자 식별자 주입) 구현
Purpose: 테스트 웹앱에 "로그인" 개념을 도입. 통신사 회선(telecom_test_lines) 1건을 선택해 로그인하면 그 회선ID(line_id)가 Adobe Target 식별자로 적용되어, 회선별로 어떤 띠배너/팝업이 나가는지 즉시 확인할 수 있게 함. 고객사 실제 환경에서 회원ID를 thirdPartyId 로 쓰는 흐름을 그대로 모사.
Changes:
- VisitorContext(visitorContext.tsx) 신설 + 브리지(@/context/VisitorContext): 로그인 회선 상태(sessionStore 복원) + login/logout. 웹=thirdPartyId 세션키 주입/제거(tnt·쿠키·세션 초기화로 익명/타회선 혼선 방지), 네이티브=setTargetVisitor(resetExperience+setThirdPartyId)/resetTargetExperience. 로그인/로그아웃 후 refreshOffers 호출.
- targetContext.refreshOffers 를 플랫폼 분기: 웹=프록시 bootstrap mbox, 네이티브=Mobile SDK 배너 mbox 재조회(식별자 변경 반영). targetApp 에 VisitorProvider 래핑(AdobeTargetProvider 안쪽).
- LoginModal(components/login): GET /api/telecom/lines 조회 → 넓은 테이블(가로 스크롤, 13컬럼: 회선ID·고객명·등급·요금제·망·월요금·약정만료+D-day·단말·데이터%·결합·연령·해지위험·수신동의), 단일 행 선택(재클릭 시 교체), 우측 상단 취소/로그인.
- VisitorMenu(components/login): 헤더 우측. 비로그인=visitor+로그인 버튼, 로그인=회선ID·고객명+로그아웃 버튼. AppHeader 를 절대 중앙 타이틀 + 우측 위젯 레이아웃으로 변경.
- telecomLinesApi(components/login): 회선 목록 fetch + TelecomLine 타입.
Changed files: frontend/adobe_frontend/target_frontend/context/visitorContext.tsx, frontend/context/VisitorContext.tsx, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/components/login/{telecomLinesApi.ts,LoginModal.tsx,VisitorMenu.tsx}, frontend/components/AppHeader.tsx

166. 2026-06-26 통신사 테스트 DB(lgu_target_test) 연결·회선 조회 API
Purpose: 추천 테스트용 recipient_id 데이터와 분리해, 통신사(디바이스/회선 중심) 마케팅을 시연할 별도 DB를 신규 연결. 회선ID(line_id)를 Adobe Target 식별자(CustomerId/thirdPartyId) 키로 쓰는 회선 그레인 테스트 데이터(~30행) 조회 API 추가.
Changes:
- DB: 동일 서버에 유저 `lgu`·DB `lgu_target_test`·테이블 `telecom_test_lines`(식별자 line_id/customer_id + 요금제·약정만료·단말·데이터사용률·등급·결합·연령대·해지위험·수신동의 등) 신설, 합성 30행 적재.
- config: `telecom_db` 블록(dev/prd.example) 추가. config.py에 `_parse_db_block` + `Settings.telecom_db`(Optional) 파싱.
- telecom_db.py 신규: 추천용 database.py(ibank_test_data)와 분리된 2번째 비동기 엔진/세션 + `TelecomTestLine` ORM(조회 전용) + 목록/단건 Select + dispose.
- schemas.py: `TelecomLineOut`(약정 D-day·단말 사용개월 파생 포함)·`TelecomLinesResponse` 추가.
- routers/telecom.py 신규: `GET /api/telecom/lines`(customer_id·customer_grade 선택 필터)·`GET /api/telecom/lines/{line_id}`(단건, 404 처리). today 기준 파생값 계산.
- main.py: telecom 라우터 prefix=/api 등록, lifespan에서 `dispose_telecom_engine` 호출.
Changed files: backend/app/config.py, backend/app/telecom_db.py, backend/app/schemas.py, backend/app/routers/telecom.py, backend/app/main.py, backend/env/config.dev.json, backend/env/config.prd.example.json

165. 2026-06-26 네이티브(Mobile SDK) 띠배너 연동
Purpose: 웹 전용이던 띠배너 오퍼를 네이티브에도 적용. 웹/모바일 SDK 구현 차이에 맞추되, 채널별로 다른 이벤트 운용이 가능하도록 네이티브 전용 배너 mbox(별도 활동)로 분리. 오퍼 JSON 계약·파서·Context·컴포넌트는 웹과 공유.
Changes:
- config: `mobile_env.adobe_sdk_mboxes.banner_sdk_mbox_names`(리스트) 추가 — dev/prd 및 example 2종. 값 `target-tbanner-msdk-mbox`/`target-bbanner-msdk-mbox`.
- loadConfig: `AdobeSdkMboxesConfig.banner_sdk_mbox_names?: string[]` 타입 추가.
- adobeMobileTarget(native/.ts): `retrieveTargetContents(mboxNames, default?, params?)` 신설 — 단일 retrieveLocationContent 로 배너 mbox 일괄 조회(웹 base 는 [] 반환 no-op).
- TargetPageBootstrap: 웹/네이티브 통합. 네이티브는 SDK로 배너 mbox 조회→콘텐츠를 `{offers:[{content}]}` 로 감싸 기존 parseAdobeTargetOffersPayload 재사용→상/하단 배너 Context 반영→ready. 웹 경로(프록시)·FOUC 가드 유지.
- 표시 컴포넌트(TopBanner/BottomBanner)는 이미 _layout 공용이라 네이티브에서도 그대로 렌더(코드 변경 없음).
- 운영: 네이티브 전용 mbox에 별도 Target 활동 생성 필요(오퍼 JSON은 웹과 동일 형식). Property 토큰은 init 시 이미 주입.
Changed files: frontend/utils/loadConfig.ts, frontend/env/config.{dev,prd}.json, frontend/env/config.{dev,prd}.example.json, frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.ts, frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.native.ts, frontend/adobe_frontend/target_frontend/app/TargetPageBootstrap.tsx

164. 2026-06-23 띠배너 FOUC(기본문구→오퍼 깜빡임) 제거
Purpose: 페이지 첫 로드 시 배너가 기본 문구로 떴다가 비동기 부트스트랩 응답 도착 후 오퍼로 바뀌는 깜빡임을 제거.
Changes:
- targetContext: `bannersReady`(boolean) 상태·setter 추가. `useAdobeTargetBannersReady`/`useAdobeTargetSetBannersReady` 훅 신설. refreshOffers finally에서 ready=true.
- TargetPageBootstrap: 웹은 offers 응답(성공·실패 무관) `.finally`에서 ready=true, 네이티브/SSR 등 부트스트랩 없는 경로는 즉시 ready=true(기존 기본문구 노출 유지).
- TopBanner/BottomBanner: `!ready`면 렌더하지 않음(`!ready || closed`). 완료 후에만 오퍼/기본값 확정 렌더.
- 트레이드오프: 완료 전 미렌더라 배너가 약간 늦게 나타나며 1회 레이아웃 시프트 가능(잘못된 문구 깜빡임은 사라짐).
Changed files: frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/app/TargetPageBootstrap.tsx, frontend/components/banners/TopBanner.tsx, frontend/components/banners/BottomBanner.tsx

163. 2026-06-22 배너 전용 mbox 분리(B안)
Purpose: 한 mbox에 활동 2개를 걸면 location을 선점한 1개만 서빙되는 충돌을 근본 제거. 배너를 target-ready-mbox에서 떼어내 배너 전용 mbox(각자 독립 활동)로 분리하고, 부트스트랩 offers 1요청에 함께 싣는다(추가 왕복 없음). 기존 _run_delivery/offers_from_execute/프런트 파서 재활용.
Changes:
- config: `mboxes.banner_mbox_names`(문자열 리스트) 추가 — 배너 mbox를 자유롭게 추가(예: target-tbanner-mbox, target-bbanner-mbox). 미설정 시 기존과 동일 동작.
- target_config: AdobeTargetSettings.banner_mbox_names(tuple) 추가, `_str_list` 헬퍼(공백·중복 제거)로 파싱.
- target_adobe_router: `_run_delivery`가 단일 mbox→`list[MboxRequest]` 수신(ExecuteRequest.mboxes=mboxes). profile_test/recommendation_test 호출부는 `[mbox]`로 유지. `_resolve_offers_mbox_names` 신설 — bootstrap이고 본문 mbox 미지정 시 primary 뒤에 배너 mbox 동봉(index 0..n). 응답에 `mboxes` 목록 포함.
- 프런트 변경 없음: 파서가 mbox 구분 없이 type(top/bottom-banner)으로 라우팅하므로 배너 mbox 응답을 그대로 수용.
Changed files: backend/env/config.adobe.json, backend/env/config.adobe.example.json, backend/adobe_backend/target_backend/target_config.py, backend/adobe_backend/target_backend/target_adobe_router.py

162. 2026-06-22 띠배너 파서 배열 content 지원
Purpose: 같은 mbox(부트스트랩 `target-ready-mbox`)에 활동을 2개(상단용·하단용) 걸면 Adobe Target이 location을 선점한 1개 활동만 서빙해 하단 띠배너가 응답에 빠지는 문제 해결. 라이브 응답 3회 직접 확인 결과 옵션이 top-banner 1개만 반환됨을 검증.
Changes:
- 파서 `parseAdobeTargetOffersPayload`: offers[] 각 항목 content가 배열이면 원소를 개별 후보로 펼쳐 처리(활동 하나로 상단+하단 동시 전달). 단일 객체는 [객체]로 그대로 처리(하위호환).
- 헬퍼 분리: `_parseContentValue`(객체/배열/문자열→파싱), `_coerceOfferContentList`(항목→후보 객체 목록), `_coerceContentValue`(단일 객체화·배열 제외, 네이티브 event-popup 경로 유지).
- 권장 운영: 하단 띠배너 전용 활동을 별도로 두지 말고, 부트스트랩 mbox를 소유한 XT 활동 1개에서 experience별로 `[상단배너, 하단배너]` 배열 오퍼를 내려줄 것.
Changed files: frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts

161. 2026-06-22 띠배너 CTA 새창/현재창 선택
Purpose: 띠배너 CTA 클릭 시 새창/현재창을 오퍼에서 고를 수 있게 한다. 기존엔 Linking.openURL 이라 웹에서 항상 새 탭으로 열렸음.
Changes:
- 파서: `AdobeTargetBannerOffer` 에 `ctaTarget`("_self"|"_blank") 선택 필드 추가, `_toBannerOffer` 추출.
- 공용 함수 신설 `openBannerCta(url, target)`: 웹은 _self→`window.location.assign`(현재창), 그 외/미지정→`window.open(..., "_blank", "noopener,noreferrer")`(새창, 기존 동작 기본). 네이티브는 `Linking.openURL`(외부 브라우저).
- TopBanner/BottomBanner: 인라인 Linking 분기를 제거하고 `openBannerCta(ctaUrl, offer?.ctaTarget)` 로 통일(중복 제거).
- 하위호환: ctaTarget 미지정 시 기존처럼 새창. 오퍼 계약·StripBanner 변경 없음.
- 검증: 변경 4파일 린트 0건, `tsc --noEmit` 통과(exit 0).
Changed files: frontend/components/banners/openBannerCta.ts(신규), frontend/components/banners/TopBanner.tsx, frontend/components/banners/BottomBanner.tsx, frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, docs/log/log.md

160. 2026-06-22 띠배너 endAt 마케터 친화 입력
Purpose: 카운트다운 종료시각 `endAt` 을 마케터가 타임존·T 구분자 없이 쉽게 쓸 수 있게 하고, Date.parse 직접 사용 시의 엔진별 차이(공백형식 Hermes/V8 불일치, 날짜만 입력 시 UTC 자정으로 9시간 어긋남)를 제거.
Changes:
- useCountdown.ts 에 `_normalizeEndAt(raw)` 추가: 정규식으로 "YYYY-MM-DD[ |T]HH:MM[:SS]?[Z|±HH:MM]?" 를 받아 KST 기준 ISO 로 재조립 후 Date.parse. 시간 생략 시 그날 23:59:59, 타임존 생략 시 +09:00 채움. 인식 못 하는 형태는 Date.parse 위임(완전 커스텀 문자열 호환).
- 허용 입력: "2026-06-22"(→그날 23:59:59 KST) / "2026-06-22 23:59" / "2026-06-22 18:00:00" / 풀 ISO "...+09:00"(하위호환).
- `endAt` 미지정·무효 시 비활성(기존과 동일). 오퍼 계약·StripBanner·파서 변경 없음.
- 검증: useCountdown.ts 린트 0건, `tsc --noEmit` 통과(exit 0).
Changed files: frontend/components/banners/useCountdown.ts, docs/log/log.md

159. 2026-06-22 띠배너 카운트다운(마감 타이머) 추가
Purpose: 상/하단 띠배너에 "마감까지 남은시간" 카운트다운을 붙인다. 새 오퍼 type 없이 기존 top-banner/bottom-banner 계약을 그대로 재사용하고, 오퍼에 `endAt`(ISO8601 종료시각)과 `expiredTitle`(만료 후 문구)만 선택 필드로 확장. `endAt` 이 없으면 기존 일반 띠배너와 100% 동일하게 동작(하위호환).
Changes:
- 파서: `AdobeTargetBannerOffer` 에 `endAt`·`expiredTitle` 선택 필드 추가, `_toBannerOffer` 에서 두 필드 추출(targetOfferParser.ts, 이미 반영됨).
- 공용 훅 신설: `useCountdown(endAt)` → `{ label, active, expired }`. endMs 기준 1초 간격 갱신, 남은시간을 "N일 HH:MM:SS"(일=0 생략)로 포맷, 종료 시 expired. endAt 무효/미지정 시 비활성.
- TopBanner/BottomBanner: `useCountdown` 연결. 진행 중에는 본문 줄에 "{남은시간} 남음" 노출, 만료 시 `expiredTitle` 있으면 제목 교체. StripBanner 는 변경 없이 재사용.
- 검증: 변경 4파일 린트 0건, `tsc --noEmit` 통과(exit 0).
Changed files: frontend/components/banners/useCountdown.ts(신규), frontend/components/banners/TopBanner.tsx, frontend/components/banners/BottomBanner.tsx, frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, docs/log/log.md

158. 2026-06-19 docs/main 04 v3.5 — 부록 C(JSON 오퍼 타입별 적용)

Purpose: JSON 오퍼를 받아 화면에 반영하는 기능(팝업·띠배너·캐러셀·A/B·추천)을 Adobe Activity 작성자·운영자가 한 문서에서 찾을 수 있도록 부록 C 로 정리.

Changes:

- `docs/main/04`: **부록 C** 신설 — 공통 파싱 규칙·페이지/mbox 매트릭스·type별 JSON 샘플(event-popup, top/bottom-banner, carousel buttonText/autoPlayMs, native imageUrl, recommendations items)·bootstrap 다중 오퍼 응답 예시·구현 파일表·FAQ
- §6.2·§19·문서 이력 v3.5·읽는 순서(4부) 보강

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

157. 2026-06-19 LGU+ 스타일 상/하단 띠배너 도입
Purpose: LG유플러스에서 자주 쓰는 상단 고정(앱 네임 라벨 아래)·하단 고정(푸터 위) 띠배너를 우리 Expo(웹+Android) 앱에 컴포넌트로 명확히 분리해 도입. 띠배너 영역에는 추후 Adobe Target 오퍼가 적용되도록 bootstrap 응답 파싱까지 연결하고, 오퍼가 없을 때는 위치 확인용 기본 문구("상단/하단 띠배너 위치")만 노출.
Changes:
- 컴포넌트 분리: `StripBanner`(공용 1줄 띠 UI: 텍스트+CTA+닫기, LGU+ 마젠타 #E6007E 기반) / `TopBanner`(마젠타 바, 흰색 텍스트, 헤더 바로 아래) / `BottomBanner`(밝은 배경+마젠타 강조 CTA+상단 헤어라인, 푸터 바로 위). 닫기는 세션 동안 숨김.
- 레이아웃 재구성: 기존 Stack 기본 헤더(앱 네임 라벨)를 `AppHeader`(동일 파란 바·가운데 흰색 타이틀·상단 safe-area inset)로 분리하고 Stack 은 `headerShown:false`. `_layout` 순서 = AppHeader → TopBanner → Stack 화면 → BottomBanner → AppFooter. 모든 페이지 전역 노출(효율·LGU 공지형 패턴).
- Target 오퍼 연동(추가만, 기존 흐름 불변): `targetOfferParser` 에 `AdobeTargetBannerOffer` 타입 + `top-banner`/`bottom-banner` content(type) 추출(title/body/ctaText/ctaUrl/backgroundColor/textColor). `targetContext` 에 top/bottomBanner 상태·훅(use*TopBanner/use*BottomBanner·set*)·refreshOffers 반영. `TargetPageBootstrap` 가 bootstrap 응답에서 두 배너 오퍼 set.
- 검증: 변경 8파일 린트 0건, `tsc --noEmit` 통과(exit 0). parseAdobeTargetOffersPayload 기존 호출부(ProfileTestPanel·context·bootstrap)는 필요한 필드만 구조분해라 하위호환 유지.
Changed files: frontend/components/banners/StripBanner.tsx(신규), frontend/components/banners/TopBanner.tsx(신규), frontend/components/banners/BottomBanner.tsx(신규), frontend/components/AppHeader.tsx(신규), frontend/app/_layout.tsx, frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/app/TargetPageBootstrap.tsx, docs/log/log.md

156. 2026-06-09 docs/adobe/04_CAMPAIGN_AUDIENCE.md 신규 — 외부(Adobe Campaign) 세그먼트→Target 오디언스 연동 가이드
Purpose: 가입 시스템이 관할 밖이고 세그가 Campaign에서 운영되는 U+ 상황에서, Campaign이 만든 대상자를 Target 오디언스로 넘기는 경로·지연·식별자 조건을 study-notes 스타일로 정리.
Changes:
- 3경로 비교: ①Experience Cloud 공유 오디언스(Campaign 워크플로, 24~36h, ECID/Declared ID) / ②속성 적재(recipient_id+플래그 → CRS·Bulk/Single Profile API, 지연 통제, profile.* 규칙) / ③RT-CDP→Target(준실시간, AEP 필요).
- 권장 = ②(앱이 이미 thirdPartyId=recipient_id 사용): 데이터 흐름·의사코드·식별자 정합(3곳 키 일치)·지연별 수단표(요청파라미터/Single/Bulk/공유오디언스/RT-CDP).
- 가드레일·U+ 제약 3개에 대한 답·공식 문서 링크 6종(Campaign 공유, Importing/exporting 24~36h, People Core Service, AAM→Target, RT-CDP destination, Profile API).
Changed files: docs/adobe/04_CAMPAIGN_AUDIENCE.md(신규), docs/log/log.md

155. 2026-06-05 docs/adobe 03 추천 디자인 categoryId 빈값 원인·해결 정정 — $entity.category(없는 속성)·$entity.categoryId(multi-value 직접출력 불가) → categoriesList #foreach 로 교체(사용자 A안 검증 완료)
Purpose: 추천 반환 JSON 의 categoryId 가 빈값("")으로 오던 문제. 원인=디자인 토큰이 존재하지 않는 $entity.category 였고, $entity.categoryId 로 바꿔도 multi-value 라 Adobe 가 직접 출력을 차단(공식 FAQ). 검증된 categoriesList 방식으로 문서 정정.
Changes:
- §5.3 디자인(JSON) 스니펫 entity1~5 의 categoryId 를 "#foreach($c in $entityN.categoriesList)$c#end" 로 교체.
- §5.3 하단에 원인·해결 주의문(FAQ 링크) 추가, §5.4 카테고리 표시 불가 항목에 categoriesList/displayCategory 해법 명시.
- §5.2 변수표에 $entityN.categoriesList 행 추가.
- 앱 전송(entity.categoryId)은 정상이라 변경 없음(필터·어피니티에 필요).
Changed files: docs/adobe/03_RECOMMANDATION.md

154. 2026-06-05 프론트 env 민감정보 git 제외 — config.{dev,prd}.json 추적 해제(로컬 보존)·example 2종 신설(민감 4필드 플레이스홀더)·.gitignore·loadConfig 주석·docs 04 §17/§18 동기화
Purpose: frontend/env/config.dev.json 의 모바일 SDK 민감정보(adobe_mobile_app_id·adobe_target_property_token·assurance_session_url·assurance_session_pin)가 그대로 커밋되던 문제를, 백엔드 config.adobe.json 방식과 동일하게 example만 저장소에 유지하도록 정리.
Changes:
- frontend/env/config.dev.example.json, config.prd.example.json 신설 — 민감 4필드만 플레이스홀더, 나머지(port·url·mbox·images)는 기본값 유지.
- .gitignore: frontend/env/config.dev.json, config.prd.json 추가(저장소엔 example만).
- 이미 추적되던 두 파일 git rm --cached 로 추적 해제(로컬 파일은 보존, loadConfig 정적 import 유지).
- loadConfig.ts 상단 주석에 "민감정보 git 제외·example 복사" 안내 추가.
- docs/main 04 §17 설정표(프론트 행: 포함→제외+example)·§18 체크리스트 9 (example 복사·mobile_env 입력) 동기화.
Changed files: .gitignore, frontend/env/{config.dev.example.json,config.prd.example.json}, frontend/utils/loadConfig.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md

153. 2026-06-05 docs 점검 — docs/adobe·docs/main stale 참조 없음(구 명칭은 log 이력에만). docs/main 04 부록 B.3에 식별자 발급 주체 원칙(thirdPartyId=임의지정 / tntId·ECID=받아서 재사용) 보강
Purpose: 최근 변경(example 패키지 명명 통일·부록 B)이 문서에 반영돼야 하는지 docs/adobe·docs/main 전수 점검하고, 사용자가 두 번 질문한 ECID 발급/재사용 혼동을 부록에 영구 정리.
Changes:
- 점검 결과: docs/adobe(01_XT·02_AB·03_RECOMMANDATION)는 이번 변경과 무관 → 수정 없음. docs/main 04 본문은 example 심볼을 기술하지 않아 stale 참조 없음(구 명칭 order_total/_TEMPLATE 등은 log 이력에만 존재 → 이력은 보존).
- docs/main 04 부록 B.3에 "식별자 발급 주체" 표·원칙 추가: thirdPartyId(내가 임의 지정) vs tntId·ECID(Adobe 발급→받아 저장→재사용, 임의 생성 금지). 하이브리드=SDK ECID 읽어 재사용 / 순수 서버사이드=응답으로 받은 값 저장·재전송(§4 패턴) 명시.
- 문서 이력 3.4 행에 보강 내용 반영.
Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md

152. 2026-06-05 docs/main 04 v3.4 — 부록 B(네이티브 서버사이드/하이브리드 연동) 추가: 앱→백엔드(Python/Java SDK)→Delivery API 구조·[A]/[B] 비교·ECID(marketing_cloud_visitor_id) 스티칭/하이브리드·시나리오별 권장
Purpose: 네이티브도 백엔드 컨트롤러(Python/Java SDK)로 연동 가능한지에 대한 설명을 가이드 부록으로 영구화하고, ECID 주입=하이브리드 개념을 정리.
Changes:
- `## 부록 B` 신설: B.1 두 아키텍처([A] Mobile SDK+Tags / [B] 서버사이드)·다이어그램, B.2 비교표, B.3 식별자 스티칭(ECID=marketing_cloud_visitor_id 주입·하이브리드 정의·시퀀스·앱 Identity.getExperienceCloudId·백엔드 build_visitor_id 확장 지점), B.4 시나리오별 권장.
- 문서 이력 v3.4 행 추가.
Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md

151. 2026-06-05 SDK 예시 명명 일관화 — 가격 짝 entity_value↔entities_total_value 통일·TELECOM 상수 접미사 통일(_PROFILE_PARAMS)·get_offers_example params→mbox_parameters·네이티브 payload total→entitiesTotalValue(+entityValue/attrs/profile 연결)
Purpose: order_total/entity_value 처럼 용도는 비슷한데 이름이 동떨어진 짝을 보는 사람 친화적으로 통일하고, 백엔드·프론트 example 패키지 전반의 명명 규칙을 재점검.
Changes:
- 가격 어휘 통일(도메인/호출자용): entity_value(단건 카탈로그가) ↔ entities_total_value(전체 합계). Adobe 객체 미러 빌더 build_order/buildOrder 는 SDK 원래 이름 total 유지.
  - backend delivery: order_total → entities_total_value, 시그니처에 entity_value 인접 배치·주석 정렬.
  - backend base_model build_purchase_signal_mbox: total → entities_total_value.
  - native base_model RecommendationPayload: total → entitiesTotalValue, entityValue?(단건가) 추가. buildPurchaseSignal: total → entitiesTotalValue.
  - native target_native_sdk sendRecommendationData: payload.total → payload.entitiesTotalValue, 미사용이던 entityAttrs/profileParams/entityValue 까지 실제 연결(entity.value 포함).
- TELECOM 상수 3종 접미사 병렬화: TELECOM_PROFILE_PARAMS_TEMPLATE → TELECOM_PROFILE_PARAMS (py/native, _RESERVED·_CUSTOM 와 통일).
- 호출자용 인자명 통일: get_offers_example params → mbox_parameters (네이티브 mboxParameters 와 짝). 단명 로컬변수 params·SDK 미러 빌더 total 은 유지.
- 검증: py_compile 통과, 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/{delivery_python_sdk.py, base_model_python_sdk.py}, frontend/adobe_frontend/adobe_frontend_example/{base_model_native_sdk.ts, target_native_sdk.ts}

150. 2026-06-05 SDK 예시 추천 가격 의미 분리 — order_total(전환 총액, 묶음=합계)·entity_value(단건 카탈로그가) 별도 인자화(묶음 시 entity.value 오기입 방지)
Purpose: 직전 변경에서 price 하나를 order.total 과 entity.value 양쪽에 써, 묶음 구매 시 entity.value(=단건 카탈로그 가격)에 합계가 잘못 들어가던 의미 충돌 수정.
Changes:
- get_recommendations_example 인자 분리: price → order_total(주문 전환 총액: 묶음=합계, 단건=품목가), entity_value(entity_id 단건 카탈로그 가격, 미지정 시 entity.value 미전송) 추가.
- order.total 은 order_total 사용, entity.value 는 entity_value 로만 세팅. 함수/모듈 docstring·주석에 두 값의 의미 차이 명시.
- 검증: py_compile 통과, 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/delivery_python_sdk.py

149. 2026-06-05 SDK 예시 추천 호출 가격 하드코딩(1000.0) 제거 — price·purchased_ids 인자화(order.total·entity.value 반영, 묶음 구매 지원)
Purpose: 품목별 가격이 다른 실제 환경을 반영하도록, 테스트 전제(동일 가격)에 묶여 하드코딩됐던 추천 호출의 가격을 파라미터화. 패키지 내 다른 하드코딩/재사용성 저하 지점도 점검.
Changes:
- get_recommendations_example 에 price(기본 0.0)·purchased_ids(기본 [entity_id]) 인자 추가.
  - order.total 을 1000.0 고정 → price 사용. price>0 이면 parameters 에 entity.value(소수점 포맷) 추가(정렬·Inclusion Rule).
  - 단일 [entity_id] 고정 → purchased_ids 로 묶음 구매 가능.
- 점검 결과: 나머지(uuid 자동 order id/third_party_id, EXAMPLE_SETTINGS placeholder, timeout=3000, TELECOM 템플릿 예시값)는 의도된 자동생성/플레이스홀더/템플릿이라 수정 불필요.
- 모듈 docstring 시그니처 갱신, 함수 주석에 가격/묶음 설명 추가.
- 검증: py_compile 통과, 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/delivery_python_sdk.py

148. 2026-06-05 adobe_backend_example 검수 — API/객체/반환 구조 공식·운영코드와 일치 확인, client docstring·주석의 stale "mbox 이름" 문구 2곳만 정정
Purpose: 공식 문서·오픈소스(target-python-sdk)·운영 코드(target_backend) 기준으로 예시 패키지의 오류 검수.
Changes:
- 검증(정확): TargetClient.create(client/organization_id/timeout), get_offers({"request":...}) dict 반환(response/target_cookie/...), 응답 속성(execute.mboxes[].options[].content/type·id.tnt_id/third_party_id·status), 객체 시그니처(VisitorId/CustomerId/MboxRequest/Product/Order/DeliveryRequest/ModelProperty), ApiException.status, delivery_api_client 전이의존, timeout ms — 모두 운영코드와 일치.
- 정정: client_python_sdk.py 모듈 docstring의 "…타임아웃·mbox 이름)" → "…타임아웃)", [설정] 주석 "administration·mboxes 블록" → "administration 블록"(직전 mbox 필드 제거와 정합).
- 검증: py_compile 통과, 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/client_python_sdk.py

147. 2026-06-05 SDK 예시 client 설정에서 미사용 mbox 필드(offer/recs_mbox_name) 제거 — 초기화에 불필요(요청 시 인자 전달)·죽은 설정 정리
Purpose: "client 설정에 offer/recs mbox 를 미리 정의한 게 필수인가" 질문 검증. TargetClient.create 는 client/organization_id/timeout 만 사용하고, mbox 이름은 delivery 함수가 인자로 받으므로 settings 의 두 필드는 어디서도 참조되지 않는 죽은 설정임을 확인 → 제거.
Changes:
- AdobeTargetSettings 에서 offer_mbox_name·recs_mbox_name 필드 삭제, EXAMPLE_SETTINGS 의 두 값 삭제.
- 각 필드에 초기화 필수/요청용 구분 주석 추가, "mbox 이름은 요청 시 인자로 전달(delivery_python_sdk 참고)" 안내 주석 추가.
- 모듈 docstring 의 AdobeTargetSettings 설명 갱신.
- 검증: py_compile(client/delivery) 통과, 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/client_python_sdk.py

146. 2026-06-05 SDK 예시 4-B 주석 보강 — profile.* 와 entity.* 분리 이유·유용/주의점(프로필 만료·덮어쓰기·PII)·profile script(user.*) vs 전달 파라미터 구분 요약(py/native)
Purpose: "profile 값을 쓰려면 profile script 정의·activate가 필요한가, 엔터티와 왜 분리하나"라는 질문에 대한 핵심을 베이스 모델 4-B 주석에 요약 명시.
Changes:
- 정정: 단순 전달 profile.* 는 스크립트 없이 오디언스 타겟 가능 / profile script(user.*)는 파생·계산값 필요 시에만 정의(요청마다 서버 평가).
- 분리 이유 요약: entity.*='아이템'(Catalog·Collection·Inclusion·Design / 키=entity.id) vs profile.*='사람'(오디언스·타겟 / 키=tntId·thirdPartyId) — 저장소·소비단계 상이. 접점은 Inclusion Rule 비교(entity.id≠profile.currentPlan=보유상품 제외).
- 유용(피드 없이 실시간 개인화)/주의(프로필 만료 기본 14일·영속 저장소 아님·last-write 덮어쓰기·PII 금지 → 영속/대량은 crs.*) 요약.
- base_model_python_sdk.py(4-B)·base_model_native_sdk.ts(4-B) 동일 반영(예시 대칭 유지).
- 검증: py_compile 통과, 프론트 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/base_model_python_sdk.py, frontend/adobe_frontend/adobe_frontend_example/base_model_native_sdk.ts

145. 2026-06-05 SDK 예시 엔터티 속성을 [예약(Adobe 기본)]/[커스텀(통신사 제안)]으로 분리 표기·entity.margin 등 예약 누락 보완·커스텀 속성 추가(공식 문서 근거)·profile.* vs crs.* 구분 주석
Purpose: 사용자 요청대로 "Adobe가 기본 제공하는 엔터티 속성(그대로 연동 가능)"과 "직접 정의하는 커스텀 속성(추가 제안용)"을 명확히 구분. 공식 문서(Recommendations > Entity Attributes)를 근거로 예약 속성 목록을 정정·보완하고, 통신사에 유용한 커스텀 속성을 추가.
Changes:
- 공식 문서 확인: 예약 속성 = entity.id/name/categoryId/brand/pageUrl/thumbnailUrl/message/inventory/value/margin, entity.environment=시스템 예약(사용 불가). 커스텀 최대 100개(단일/다중값).
- base_model_python_sdk.py / base_model_native_sdk.ts 4-A 를 두 상수로 분리:
  - TELECOM_ENTITY_ATTRS_RESERVED(예약): 누락됐던 entity.margin 추가, inventory 값을 수량(1)·value 소수점·categoryId 콤마 다중분류·id 문자제한 등 공식 제약을 주석화. entity.environment 사용불가 주석.
  - TELECOM_ENTITY_ATTRS_CUSTOM(커스텀): 기존 network/dataAllowance/contractTerm/deviceCompat + 신규 subscriptionType/bundleType/promoEndDate/discount/popularity 추가(각 용도 주석).
- 4-B(profile.*): Adobe 예약어가 아니라 전송 시 생성·갱신되는 설계임을 명시 + 이미 CRM에 있는 값은 crs.<통합코드>.* 로 매칭 권장(배치=crs / 실시간=profile, 보완 관계) 주석 추가.
- 모듈 docstring의 상수명 갱신(RESERVED/CUSTOM 분리 반영).
- 검증: backend py_compile 통과, 프론트 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/base_model_python_sdk.py, frontend/adobe_frontend/adobe_frontend_example/base_model_native_sdk.ts

144. 2026-06-05 SDK 예시 베이스 모델에 통신사(텔코) 확장 반영(엔터티/프로필 속성 템플릿·조회/전환 신호 빌더)·전 필드 용도 주석·py import 누락(VisitorId) 수정
Purpose: 다음 고객(통신사) 웹/앱 SDK 구축을 대비해, 추천 신호로 활용 가능한 영역(엔터티 속성·프로필 속성·조회/전환 신호)을 예시 베이스 모델에 미리 정의. "쓸 수 있는 후보를 펼쳐두고 필요 없는 것을 지워 쓰는" 방식으로 활용하도록 각 값 옆에 용도 주석을 명시.
Changes:
- base_model_python_sdk.py: 기존 빌더(build_visitor_id/customer_id/mbox/product/order/delivery_request) 각 인자에 용도 인라인 주석 추가. [TELECOM] 섹션 신설 — TELECOM_ENTITY_ATTRS_TEMPLATE(entity.*: id/name/categoryId/value/inventory/brand/message/thumbnail/pageUrl + 커스텀 network/dataAllowance/contractTerm/deviceCompat), TELECOM_PROFILE_PARAMS_TEMPLATE(profile.*: currentPlan/contractEndDate/dataUsageGB/deviceModel/familyBundle/ageBand/churnRisk), build_view_signal_mbox(order 없음=조회 신호)/build_purchase_signal_mbox(order=전환 신호). + 누락돼 있던 VisitorId import 추가(런타임 NameError 예방).
- base_model_native_sdk.ts: RecommendationPayload 에 entityAttrs/profileParams 선택 필드 + 전 필드 주석. buildProduct/buildOrder/buildParameters/buildRequest 인자 주석. [TELECOM] 섹션 — TELECOM_ENTITY_ATTRS_TEMPLATE/TELECOM_PROFILE_PARAMS_TEMPLATE, buildViewSignal(조회)/buildPurchaseSignal(전환) 빌더.
- 각 속성 주석에 Collection 필터·Inclusion Rule·Attribute Weighting·디자인 노출 등 쓰임을 표기.
- 검증: backend py_compile 통과, 프론트 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/base_model_python_sdk.py, frontend/adobe_frontend/adobe_frontend_example/base_model_native_sdk.ts

143. 2026-06-05 Adobe SDK 예시 패키지 신설(adobe_backend_example: Web Python SDK 3파일 / adobe_frontend_example: Native SDK 3파일) — 최소 구성·자기완결형·요청/반환 주석
Purpose: 실제 운영 코드와 별개로, 새 시스템 구축·대고객 설명·한눈 파악에 바로 쓸 수 있는 "최소 SDK 구성 예시" 패키지를 Web(Python SDK)·Native(Mobile SDK) 두 갈래로 정제 제작. 다른 내부 모듈에 의존하지 않는 자기완결형(임포트는 SDK·표준 라이브러리만)으로 구성하고, 패키지 설치는 주석, API 콜·요청/반환은 예시 주석으로 명시.
Changes:
- backend/adobe_backend/adobe_backend_example 신설(Web 서버사이드 Python SDK 기준):
  - __init__.py: 패키지 개요(구성 파일·사용 범위).
  - client_python_sdk.py: 설정 dataclass(자격·property·mbox) + TargetClient.create 싱글톤 초기화 + property 토큰.
  - base_model_python_sdk.py: Adobe Delivery 객체 빌더(VisitorId/CustomerId/MboxRequest/Product/Order/DeliveryRequest).
  - delivery_python_sdk.py: get_offers 호출 + 오퍼/식별자 파싱 + 추천(meta/items) 예시 + FastAPI 연동 주석.
- frontend/adobe_frontend/adobe_frontend_example 신설(Native Mobile SDK 기준):
  - init_native_sdk.ts: initializeWithAppId(1회) + target.propertyToken 주입 + Assurance 세션.
  - base_model_native_sdk.ts: Adobe 객체 빌더(TargetParameters/TargetProduct/TargetOrder/TargetRequestObject) + RecommendationPayload 타입.
  - target_native_sdk.ts: retrieveLocationContent(Promise) + 식별자 조회 + 방문자 set/reset(resetIdentities) + 추천 학습 전송, 요청/반환 예시 주석.
- 검증: backend py_compile 통과, 프론트 린트 무오류.
Changed files: backend/adobe_backend/adobe_backend_example/{__init__.py,client_python_sdk.py,base_model_python_sdk.py,delivery_python_sdk.py}, frontend/adobe_frontend/adobe_frontend_example/{init_native_sdk.ts,base_model_native_sdk.ts,target_native_sdk.ts}

142. 2026-06-04 docs/main 04 §14.5 SDK 객체 레퍼런스 추가(@adobe/react-native-aeptarget Target/TargetParameters/TargetRequestObject/TargetProduct/TargetOrder·공식 링크) v3.3
Purpose: 코드에서 import하는 Adobe 모바일 Target SDK 객체들의 역할·생성자·공식 문서 위치를 가이드 문서에 정리해, 추후 코드 열람 시 바로 레퍼런스를 찾도록 함.
Changes:
- 04 §14.5 신규: Target/TargetParameters/TargetRequestObject/TargetProduct/TargetOrder 표(역할·본 프로젝트 생성자) + 공식 문서 3개 링크(Adobe API 레퍼런스·RN target 패키지 README·npm).
- 문서 이력 v3.3 추가.
Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md

141. 2026-06-04 추천 전용 mbox(target-rec-msdk-mbox) 분리 — XT 활동과 location 충돌 제거(config·loadConfig·common·RecommendationScreen·문서)
Purpose: 추천 화면이 XT 와 동일 mbox(target-msdk-mbox)를 써서 추천 조회 시 XT event-popup 오퍼가 반환되던 충돌 해결. 추천 전용 mbox 를 신설해 XT/A·B/추천이 각자 mbox 로 독립 동작하게 함.
Changes:
- config.dev.json·config.prd.json: `adobe_sdk_mboxes` 에 `rec_sdk_mbox_name: "target-rec-msdk-mbox"` 추가.
- loadConfig.ts: AdobeSdkMboxesConfig 에 `rec_sdk_mbox_name?` 추가(주석 보강).
- common.tsx: `REC_MBOX` export 추가(docstring 갱신).
- RecommendationScreen.tsx: 적재·조회·SupportBanner 의 mbox 를 OFFER_MBOX→REC_MBOX 로 교체, ready 판정도 REC_MBOX 기준. docstring 갱신.
- 문서: 03_RECOMMANDATION(§6·§7·§9 증상·§10·이력 v1.3), 04(§14.2·14.3·15.1·15.2·15.3·15.4·설정표) 추천 mbox 표기를 target-rec-msdk-mbox 로 갱신(XT 의 target-msdk-mbox 는 유지).
- Target UI 작업 필요: 추천 활동 Location 을 target-rec-msdk-mbox 로 지정 후 게시(코드 외 수동 단계).
- 검증: tsc --noEmit 통과, 린트 클린.
Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/utils/loadConfig.ts, frontend/adobe_frontend/target-native-frontend/common.tsx, frontend/adobe_frontend/target-native-frontend/RecommendationScreen.tsx, docs/adobe/03_RECOMMANDATION.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md

140. 2026-06-04 추천 네이티브 코드 점검·경량 리팩토링(recommendationData toRecord DRY·렌더 중복계산 제거·docstring 동기화)
Purpose: 구현된 추천 기능·유틸 코드를 전체 점검하고, 검증된 SDK 래퍼는 보존하면서 가독성·중복만 안전하게 개선.
Changes:
- recommendationData.ts: 반복되던 `item as Record`·`o.entity as Record` 캐스팅을 공통 헬퍼 `toRecord()` 로 통합(hasUsefulValue/parseRecommendations/pickRecLabel/pickRecId). 동작 동일, 가독성 향상.
- RecommendationScreen.tsx: 추천 슬롯 렌더에서 `pickRecId(slot)` 2회 호출을 1회 계산(label/recId 변수화)으로 정리.
- docstring 동기화(rule 2.6): recommendationData.ts에 pickRecId 추가, RecommendationScreen.tsx 의존성 표기 pickRandomEntity→pickRandomEntities·pickRecId 보강.
- 점검 결과 native 래퍼(adobeMobileTarget.native.ts: setTargetVisitor/sendTargetRecommendationData/resetTargetExperience 등)는 가드클로즈·try/catch·자원정리 양호 → 변경 없음.
- 검증: tsc --noEmit 통과, 린트 클린.
Changed files: frontend/adobe_frontend/target-native-frontend/recommendationData.ts, frontend/adobe_frontend/target-native-frontend/RecommendationScreen.tsx

139. 2026-06-04 docs/adobe/02_AB.md 신규 — A/B 테스트 가이드(개념·활동 3종·트래픽/통계·네이티브 Form/mbox·abtest 매핑)
Purpose: XT·추천 가이드와 동일한 필기노트 스타일로, 공식 문서를 요약해 A/B 테스트 개념부터 트래픽 분배·통계·네이티브 적용까지 한눈에 보는 가이드를 신규 작성.
Changes:
- 신규 docs/adobe/02_AB.md 생성. §0 3단계 흐름도, §1 용어 7개, §2 활동 3종(Manual/Auto-Allocate/Auto-Target), §3 생성 순서(VEC/Form), §4 트래픽 분배·통계(랜덤 수렴·표본 크기·신뢰도 95%/power 80%·고정 배정), §5 Goals&Settings, §6 네이티브 Form/mbox(이미지 imageUrl 계약), §7 본 프로젝트 abtest 매핑(global mbox 진입 자동호출·좌우 이미지·resizeMode contain), §8 가드레일(50/50 고정 배정·경험 초기화), 부록 공식 링크. (모든 다이어그램 ASCII)
Changed files: docs/adobe/02_AB.md

138. 2026-06-04 docs/adobe/01_XT.md 신규 — XT(Experience Targeting) 가이드(개념·3단계·오디언스/우선순위·네이티브 Form/mbox·xttest 매핑) + 03 §2.4 실제 구독 반영
Purpose: 추천 가이드와 동일한 필기노트 스타일로, 공식 문서를 요약해 XT(경험 타게팅) 개념부터 세팅·우선순위·네이티브 적용까지 한눈에 보는 가이드를 신규 작성. 더불어 본 프로젝트의 실제 Customer Attributes 구독 내용을 추천 문서에 반영.
Changes:
- 신규 docs/adobe/01_XT.md 생성. §0 Zero→Live 3단계 흐름도, §1 용어 6개, §2 XT vs A/B, §3 생성 순서(VEC/Form), §4 오디언스·경험·우선순위(순서=우선순위 흐름도·전환·All Visitors 폴백), §5 Goals&Settings(리포팅·우선순위 0~999), §6 네이티브 Form/mbox(VEC 불가·crs.* 오디언스), §7 활동 간 우선순위(tiebreaker), §8 본 프로젝트 xttest 매핑, §9 가드레일, 부록 공식 링크. (모든 다이어그램 ASCII)
- 03_RECOMMANDATION.md §2.4: 본 프로젝트 실제 구성(CSV 드래그업로드·.fin 불필요, Target 구독 속성 campaign_label/workflow_label/recipient_id→crs.*) 표 추가, §10 고객 주입 행 갱신, 문서 이력 v1.2.
Changed files: docs/adobe/01_XT.md, docs/adobe/03_RECOMMANDATION.md

137. 2026-06-04 docs/adobe/03_RECOMMANDATION.md 필기노트 스타일 전면 재정리 + §2.4 고객 데이터 평면(Customer Attributes·recipient_id 조인) 추가
Purpose: 문서 가독성 개선 요청에 따라 내용을 누락 없이 보존하면서 짧은 구문·불릿·화살표 중심의 필기노트 스타일로 전면 재작성하고, 직전 논의(상품 평면 vs 고객 평면) 내용을 정식 섹션으로 편입.
Changes:
- 전 섹션을 산문 → 노트형(핵심 굵게·화살표·축약)으로 재정리(흐름도·표·링크 등 기존 정보 보존).
- §2.4 신규: 고객(Customer) 데이터 평면 = Customer Attributes. recipient_id가 setThirdPartyId(=mbox3rdPartyId)로 crs.* 프로필에 조인되는 메커니즘·FTP(.fin)·구독 제한(5/200)·조인 3조건 정리(공식 문서 근거).
- §3.2 오해 정리(컬렉션=Entity, 고객속성=Audience/Profile 매칭) 노트형으로 압축, §4.5에 Entity Attribute Matching 보강.
- §9 가드레일에 Customer Attributes 행·증상(crs.* 빈값) 추가, §10 요약에 Feed/고객주입 분리 명시, 부록에 Customer Attributes·Entity Attribute Matching 링크 추가.
- 문서 이력 v1.1 추가.
Changed files: docs/adobe/03_RECOMMANDATION.md

136. 2026-06-04 docs/adobe/03_RECOMMANDATION.md 신규 — 추천 Zero→Live 세팅 가이드(카탈로그·Collection·Criteria·Design·Activity·부가옵션)
Purpose: 아무것도 세팅 안 된 상태에서 추천 활동을 만들고 적용하기까지의 전체 흐름·각 구성요소 세팅법·부가 옵션을, 비종사자도 이해하도록 흐름도·부가설명과 함께 정리(공식 문서 근거).
Changes:
- 신규 docs/adobe 폴더에 03_RECOMMANDATION.md 생성.
- §0 Zero→Live 전체 흐름도(6단계), §1 용어, §2 카탈로그 주입(entity.id 규칙·속성·Feed/API/mbox 3방법), §3 Collection 생성·규칙(AND), §4 Criteria(알고리즘 유형·Key·Backup Content 결정 흐름도·Inclusion Rules·Attribute Weighting·우리 매핑), §5 Design(Velocity 변수·우리 JSON 예시·자주 막히는 점), §6 Activity 폼 기반 생성·게시(흐름도), §7 조회·검증, §8 부가옵션(Exclusions/Promotions/Sequence/Feeds/Settings), §9 가드레일·증상별 점검, §10 본 프로젝트 매핑, 부록 공식 링크.
- 직전 질문(Inclusion Rules/Attribute Weighting) 설명을 §4.5~4.6에 통합.
- 흐름도는 mermaid 미지원 뷰어(예: Cursor 미리보기)에서도 보이도록 모두 텍스트(ASCII, ```text) 다이어그램으로 작성.
- 오해 정정 추가: 컬렉션 데이터는 Customer Attribute가 아니라 Entity(카탈로그) 속성으로 정의(§3.2), Customer/Profile 속성은 Audience·Criteria의 Profile Attribute Matching에서 사용(§4.5)·부록 링크 추가.
Changed files: docs/adobe/03_RECOMMANDATION.md
Purpose: 추천 기능을 처음 보는 사람도 이해하도록 구성요소·흐름·세팅 순서·기본(backup/default) 동작·가드레일을 정리하고, 그간 변경(화면 개편·mobile_env·푸터)을 문서에 동기화.
Changes:
- §15 신규: 구성요소 표, 데이터 적재→학습→조회 mermaid 흐름도, Target UI 세팅 순서, 앱 적재 순서, "기본 디폴트" 답(Criteria/Backup/Default 3층·결정 흐름도), 가드레일(250자·61일 등), 구현 매핑.
- §14.1~2: 초기화 스니펫·설정 키를 `mobile_env`(app_id/property_token/assurance/sdk_mboxes) 기준으로 갱신.
- §14.3: 테스트 화면을 3종(XT `/xttest`·A·B `/abtest`·추천 SDK `/recommendation`)으로 갱신, 공용(VisitorPanel/SupportBanner)·환경변수 mbox·푸터 두 줄(4+3) 명시.
- 섹션 번호 15~19 → 16~20, 읽는 순서 TOC·FAQ(추천 2건)·문서 이력(v3.2) 갱신.
Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md

134. 2026-06-04 추천 데이터 적재를 묶음 구매(랜덤 2~5품목/주문)로 변경(co-purchase 쌍 가속·Adobe 250자 가드레일 내)
Purpose: "People Who Bought This, Bought That(BOUGHT_CF)"는 같은 주문/사용자의 함께 구매 쌍으로 학습되므로, 한 주문에 여러 품목을 묶어 보내 co-purchase 데이터를 빠르게 적재.
Changes:
- 가드레일 확인(Adobe Target limits): purchasedProductIds 개당 50자·콤마 연결 총 250자(초과 시 400). 우리 entity.id 2자리 기준 약 80개까지 가능하나 신호 희석 방지 위해 현실적 2~5개로 제한.
- 타입 RecommendationData: price → total(주문 합계) + purchasedProductIds(string[])로 변경.
- adobeMobileTarget.native: TargetOrder(orderId, total, purchasedProductIds)로 묶음 전송(빈 배열이면 대표 entityId 단일 사용).
- recommendationData: pickRandomEntity → pickRandomEntities(min/max, 부분 Fisher-Yates 중복 없음), BUNDLE_MIN/BUNDLE_MAX(2/5) 상수 추가.
- RecommendationScreen: 매 틱 2~5품목 묶음 전송, 로그 "수신자 ← 품목 N개 (id:...)", 안내 문구·docstring 갱신.
- 점검: tsc --noEmit 통과, 린트 0. 웹 .ts no-op 시그니처만 타입 반영.
Changed files: frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.types.ts, frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.native.ts, frontend/adobe_frontend/target-native-frontend/recommendationData.ts, frontend/adobe_frontend/target-native-frontend/RecommendationScreen.tsx

133. 2026-06-04 푸터 탭 7개를 두 줄(4 + 3) 레이아웃으로 변경(좁은 화면에서 모두 노출)
Purpose: 탭이 7개로 늘며 한 줄 배치가 좁아져, 가로 스크롤 대신 두 줄로 나눠 모든 탭을 항상 노출.
Changes:
- AppFooter: 단일 행 → 두 행(상단 메인/프로필/추천 테스트/스크롤, 하단 XT/A·B/추천 SDK)으로 분리, 행 사이 구분선(rowDivider) 추가, bar 를 column 방향으로 변경(safe-area 하단 패딩은 유지).
- 점검: tsc --noEmit 통과, 린트 0.
Changed files: frontend/components/AppFooter.tsx

132. 2026-06-04 네이티브 SDK 추천(Recommendations) 테스트 화면 추가(데이터 적재 루프 + 추천 가져오기)·푸터 탭(추천 SDK)
Purpose: 웹 추천 패널을 참고하되, 네이티브 AEPTarget SDK 로 추천 학습 데이터를 적재하고 추천을 조회하는 전용 화면을 추가. mbox 는 기존 offer mbox(target-msdk-mbox) 사용.
Changes:
- 알고리즘 확인: Adobe 문서상 "People Who Bought This, Bought That" 는 구매(order, productPurchasedId=entity.id) 이벤트로 학습됨 → 데이터 적재는 entity 파라미터 + TargetProduct + TargetOrder(구매) 전송으로 구현.
- recommendationData.ts: 고정 recipient_id 10개·메뉴 엔티티 60개(웹과 동일)·pickRandomEntity/parseRecommendations/pickRecLabel/pickRecId. 활동 디자인 출력 계약 `{meta, items:[{entityId,name,categoryId,stCode}]}`(criteria "BOUGHT_CF based on Most Viewed Item")에 맞춰 파싱, 추천 부족 시 미해결 토큰($entity5.* 등)·빈 슬롯은 제거.
- 네이티브 래퍼(adobeMobileTarget): `setTargetVisitor`(resetExperience 후 setThirdPartyId 순서로 수신자 분리)·`sendTargetRecommendationData`(entity+product+order 전송) 추가, 웹 .ts 는 no-op, 타입 RecommendationData 추가.
- RecommendationScreen: ① "추천 데이터 보내기"/"보내기 멈춤" 토글 — 1초 간격으로 수신자 순차 순회 + 무작위 메뉴를 구매로 전송(누계·최근 로그 표시, 언마운트 시 인터벌 정리). ② 수신자 선택 후 "추천 가져오기"(thirdPartyId 기준 offer mbox 조회·Top5·원본 JSON).
- 라우트 app/recommendation.tsx(@adobe-native/RecommendationScreen re-export), 푸터에 recsdk 탭("추천 SDK", /recommendation) 추가.
- 점검: tsc --noEmit 통과, 린트 0. 웹/백엔드 경로 변경 없음(네이티브 SDK 직접 호출).
Changed files: frontend/adobe_frontend/target-native-frontend/recommendationData.ts, frontend/adobe_frontend/target-native-frontend/RecommendationScreen.tsx, frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.native.ts, frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.ts, frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.types.ts, frontend/app/recommendation.tsx, frontend/components/AppFooter.tsx

131. 2026-06-04 방문자 패널 공용화(VisitorPanel)·A/B 화면에 식별자/초기화 추가·경험 초기화에 ECID 재발급(resetIdentities) 적용
Purpose: A/B 화면 하단에 XT 의 방문자 정보·초기화 양식을 동일하게 추가하고, "경험 초기화해도 값이 안 바뀌는" 문제(ECID 잔존으로 서버 프로필 복원)를 해결.
Changes:
- 원인/수정: `Target.resetExperience()`는 tntId 만 지워 기존 ECID 로 A/B 배정이 복원됨 → `resetTargetExperience()` 에 `MobileCore.resetIdentities()` 추가해 ECID 까지 재발급(새 방문자로 재추첨).
- 공용화: common 에 `EMPTY_IDS` + `VisitorPanel`(방문자 식별자 표시·ID 새로고침·경험 초기화) 추가, `btnDanger`·`idText` 스타일을 commonStyles 로 이동.
- XtTestScreen: 인라인 방문자 블록·로컬 스타일 제거하고 VisitorPanel 사용(코드 축소).
- AbTestScreen: ids 상태 추가, 조회 시 ID 갱신, 하단에 VisitorPanel 배치(기존 단순 "초기화" 버튼은 경험 초기화로 통합 — 식별자 제거 + 표시 비움).
- 점검: tsc 로 `MobileCore.resetIdentities()` 타입 확인(@adobe/react-native-aepcore v7 존재). 웹 no-op 은 변경 없음.
Changed files: frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.native.ts, frontend/adobe_frontend/target-native-frontend/common.tsx, frontend/adobe_frontend/target-native-frontend/XtTestScreen.tsx, frontend/adobe_frontend/target-native-frontend/AbTestScreen.tsx

130. 2026-06-02 네이티브 SDK 래퍼(adobeMobileTarget 3파일)를 target-native-frontend/native 로 이관·import 정리
Purpose: 네이티브 전용 SDK 래퍼가 공용 target_frontend 아래 있던 것을, 네이티브 묶음(target-native-frontend) 하위로 옮겨 위치 일관성을 맞추고 import 를 정리.
Changes:
- 이관: `target_frontend/native/{adobeMobileTarget.ts, .native.ts, .types.ts}` → `target-native-frontend/native/` (빈 폴더 삭제). docstring 모듈 경로 갱신.
- import 갱신: 화면(XtTest/AbTest)은 동일 패키지 상대경로 `./native/adobeMobileTarget`(+ .types), targetApp 은 `@adobe-native/native/adobeMobileTarget` 별칭 사용.
- 3파일 리팩토링 점검: 이미 가드 클로즈·함수 40줄 미만·하드코딩 mbox 없음·플랫폼 분리(.ts/.native.ts) 규칙에 부합 → 동작 코드는 변경 없이 위치/문서만 정리(불필요한 변경 자제).
Changed files: frontend/adobe_frontend/target-native-frontend/native/adobeMobileTarget.ts(신규), .native.ts(신규), .types.ts(신규), frontend/adobe_frontend/target_frontend/native/*(삭제), frontend/adobe_frontend/target-native-frontend/XtTestScreen.tsx, AbTestScreen.tsx, frontend/adobe_frontend/target_frontend/app/targetApp.tsx

129. 2026-06-02 네이티브 테스트 화면 mbox 하드코딩 폴백 제거(미설정 경고)·공용 모듈(common)로 배너/스타일 중복 제거
Purpose: 테스트 화면의 mbox 하드코딩 폴백이 설정 누락을 가려 디버깅을 방해하는 문제를 제거하고, 두 화면의 배너/스타일 중복을 공용 모듈로 모아 가독성·코드량을 개선.
Changes:
- 하드코딩 폴백 제거: `?? "target-msdk-mbox"`·`?? "target-global-msdk-mbox"` → config 값만 사용(없으면 ""). 미설정이면 SupportBanner 가 "mbox 미설정(환경변수 확인)" 경고를 띄워 디버깅 시 누락이 드러나게 함.
- 공용 모듈 신설 `target-native-frontend/common.tsx`: OFFER_MBOX/GLOBAL_MBOX(config, 폴백 없음) + SupportBanner(웹 미지원/mbox 미설정/정상 3분기) + commonStyles(컨테이너·타이틀·배너·라벨·버튼·결과박스).
- XtTestScreen/AbTestScreen: 공용 모듈을 사용하도록 정리(배너 JSX·중복 스타일 ~60줄 제거, 화면 고유 스타일만 로컬 유지). AB 는 GLOBAL_MBOX 미설정 시 자동 호출 스킵.
- 점검: targetApp 의 appId 는 이미 `?? ""`(폴백 없음)로 안전. 웹/공용 targetHttp 의 `?? "http://localhost:8010"` 는 web 경로라 이번 native 범위에서 제외(현재 config 에 api_url 항상 존재).
Changed files: frontend/adobe_frontend/target-native-frontend/common.tsx(신규), frontend/adobe_frontend/target-native-frontend/XtTestScreen.tsx, frontend/adobe_frontend/target-native-frontend/AbTestScreen.tsx

128. 2026-06-02 네이티브 Target 테스트 화면 패키지 이관(target-native-frontend)·XT/A·B 테스트 개편·Assurance 전역 자동세션·안드로이드 몰입형 내비바
Purpose: 어도비 타겟 네이티브 테스트 화면을 app/ 에서 adobe_frontend 하위로 이관하고, XT/A·B 테스트 화면 요구사항을 반영하며, Assurance 를 전역 1회 자동 적용하고, 모바일 홈버튼이 푸터를 가리는 문제를 몰입형 내비게이션 바로 해결.
Changes:
- 패키지 구조: `adobe_frontend/target-native-frontend/` 신설 + tsconfig `@adobe-native/*` 별칭. 화면 구현(XtTestScreen/AbTestScreen)을 이관하고 `app/xttest.tsx`·`app/abtest.tsx` 는 default re-export 래퍼만 둠. 기존 `app/native-target-test.tsx`·`app/native-target-abtest.tsx` 삭제(라우트 /xttest, /abtest).
- XT 테스트(XtTestScreen): mbox 입력폼·Assurance 입력폼/버튼 제거(환경변수 고정값 사용). 버튼 '오퍼 가져오기'→'XT 테스트'. 반환 콘텐츠·방문자 식별자·경험 초기화·event-popup 유지.
- 전역 init: `mobile_env.assurance_session_url`(+참고용 pin) 환경변수 추가, `targetApp` 에서 SDK init 후 Assurance 세션을 전역 1회 자동 시작(웹 no-op, PIN 은 앱 내 입력).
- A/B 테스트(AbTestScreen): 진입 시 global mbox 자동 호출. 친절 안내문구 추가, 중앙을 좌(기본 default.png)/우(오퍼 imageUrl) 2열로 배치, contain 으로 라인 폭 자동 맞춤. 버튼·받은 오퍼(JSON)·초기화 유지.
- 푸터: 라벨 'SDK 테스트'→'XT 테스트', 'AB 테스트'→'A/B 테스트', 라우트 /xttest·/abtest 로 갱신.
- 안드로이드 몰입형: `expo-navigation-bar` 설치, app.json 플러그인(visibility hidden) + `_layout` 에서 setBehaviorAsync('overlay-swipe')·setVisibilityAsync('hidden') 적용 → 홈/제스처 바가 평소 숨겨지고 하단 스와이프 시만 노출(웹/iOS 미적용). ※ 네이티브 재빌드 필요.
Changed files: frontend/tsconfig.json, frontend/app.json, frontend/app/_layout.tsx, frontend/app/xttest.tsx(신규), frontend/app/abtest.tsx(신규), frontend/adobe_frontend/target-native-frontend/XtTestScreen.tsx(신규), frontend/adobe_frontend/target-native-frontend/AbTestScreen.tsx(신규), frontend/app/native-target-test.tsx(삭제), frontend/app/native-target-abtest.tsx(삭제), frontend/components/AppFooter.tsx, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/utils/loadConfig.ts, frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/package.json

127. 2026-06-02 AB 이미지 테스트를 native-target-abtest 화면으로 분리(ab-image 파서 제거·단일 imageUrl 계약)

Purpose: 요소별 전용 파서는 기업 앱 확장성에 부적합하므로 ab-image 파서를 제거하고, AB 이미지 테스트를 단순한 전용 화면으로 분리한다. 시스템은 "오퍼 JSON 의 imageUrl" 단일 계약만 두고 변형은 Target 활동에서 결정.

Changes:

- `adobe_frontend/.../utils/targetOfferParser.ts`: `AdobeTargetImageOffer` 타입·`parseAdobeTargetImageOfferContent` 제거(docstring 동기화). event-popup 파서는 유지
- `app/native-target-test.tsx`: 첫 로드 global mbox useEffect·abImageUrl·AB 이미지 영역·관련 import/스타일 제거 → SDK 테스트 본래 화면으로 환원
- `app/native-target-abtest.tsx`(신규): global mbox 호출 → `JSON.parse(raw).imageUrl` 인라인 추출(전용 파서 없음) → 중앙 이미지 적용, 없으면 default.png 폴백, `<Image source={{uri}}>` 주의(크기/https/onError) 반영. 다시 불러오기·초기화 버튼
- `components/AppFooter.tsx`: 'AB 테스트' 탭(`/native-target-abtest`) 추가
- 검증: `npx tsc --noEmit` 통과, 린트 0

Changed files: frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, frontend/app/native-target-test.tsx, frontend/app/native-target-abtest.tsx, frontend/components/AppFooter.tsx, docs/log/log.md

126. 2026-06-02 global mbox(첫 로드 자동 호출) 추가 + AB 이미지 오퍼(ab-image) 중앙 적용

Purpose: 웹 bootstrap 역할의 global mbox 를 모바일에 추가해, SDK 테스트 화면 첫 로드 시 1회 자동 호출로 AB 이미지를 분배·적용한다. 기존 '오퍼 가져오기' 버튼/offer mbox 는 그대로 유지.

Changes:

- `env/config.dev.json`·`env/config.prd.json`: `mobile_env.adobe_sdk_mboxes` 에 `global_sdk_mbox_name: "target-global-msdk-mbox"` 추가
- `utils/loadConfig.ts`: `AdobeSdkMboxesConfig.global_sdk_mbox_name?` 추가(주석으로 offer/global 역할 구분)
- `adobe_frontend/.../utils/targetOfferParser.ts`: `AdobeTargetImageOffer` 타입 + `parseAdobeTargetImageOfferContent(content)` 추가(`{type:"ab-image", imageUrl|url|image}` 해석, 공용 `_coerceContentValue` 재사용)
- `app/native-target-test.tsx`: 첫 로드 `useEffect` 1회 → `retrieveTargetContent(GLOBAL_MBOX)` → ab-image 파싱 → 중앙 이미지에 원격 URL 적용(`<Image source={{uri}}>`), 없으면 `getImage("default.png")` 폴백, `onError` 폴백, 경험 초기화 시 함께 리셋. 버튼/offer 경로 무변경
- 검증: `npx tsc --noEmit` 통과, 린트 0

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/utils/loadConfig.ts, frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, frontend/app/native-target-test.tsx, docs/log/log.md

125. 2026-06-02 프론트 config 모바일 전용값을 mobile_env 블록으로 통합(web/mobile 구분)

Purpose: frontend/env/config 에 web·mobile 값이 섞여 있어, 모바일(네이티브 SDK) 전용 값을 `mobile_env` 블록으로 묶어 명확히 구분한다(사용자 요청).

Changes:

- `env/config.dev.json`·`env/config.prd.json`: `adobe_mobile_app_id`·`adobe_target_property_token`·`adobe_sdk_mboxes` 를 모두 `mobile_env` 하위로 이동(web/공용 값 port·base_url·api_url·app_title·images 는 최상위 유지)
- `utils/loadConfig.ts`: `MobileEnvConfig` 인터페이스 신설(3개 키 포함), `AppConfig` 에서 개별 키 제거 후 `mobile_env?: MobileEnvConfig` 로 대체. 모듈 docstring 갱신
- `app/targetApp.tsx`: `config.mobile_env?.adobe_mobile_app_id`/`...adobe_target_property_token` 으로 참조 변경
- `app/native-target-test.tsx`: `config.mobile_env?.adobe_sdk_mboxes?.offer_sdk_mbox_name` 으로 참조 변경
- 검증: `npx tsc --noEmit` 통과, 잔여 구참조 0건

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/utils/loadConfig.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/app/native-target-test.tsx, docs/log/log.md

124. 2026-06-02 Target Property 토큰 주입(config) + SDK 테스트 화면 A/B 이미지 영역 추가

Purpose: Adobe Target 활동을 특정 Property(at_property)로 구획한 경우 모바일 요청에 토큰을 실어 매칭시키고, SDK 테스트 화면에 A/B 검증용 이미지 영역을 추가한다.

Changes:

- `env/config.dev.json`·`env/config.prd.json`: `adobe_target_property_token` 추가(하드코딩 대신 config 분리). 값 `c851da4c-8201-3d44-b91a-4dc532f7ec72`
- `utils/loadConfig.ts`: `AppConfig.adobe_target_property_token?` 타입·docstring 추가
- `native/adobeMobileTarget.native.ts`: `initAdobeMobileTarget(appId, propertyToken?)`로 확장, 초기화 후 `MobileCore.updateConfiguration({ "target.propertyToken": token })` 주입(토큰 있을 때만)
- `native/adobeMobileTarget.ts`(웹 no-op): 시그니처만 동일하게 맞춤
- `app/targetApp.tsx`: `config.adobe_target_property_token` 을 init 에 전달
- `app/native-target-test.tsx`: '오퍼 가져오기' 버튼 하단에 A/B 테스트 이미지 영역(`getImage("default.png")`, 높이 140 contain) 추가. 기존 `imageMap` 패턴 재사용

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/utils/loadConfig.ts, frontend/adobe_frontend/target_frontend/native/adobeMobileTarget.native.ts, frontend/adobe_frontend/target_frontend/native/adobeMobileTarget.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/app/native-target-test.tsx, docs/log/log.md

123. 2026-06-02 네이티브 SDK 테스트 화면 KeyboardAvoidingView 적용(입력 시 키보드 가림 방지)

Purpose: 모바일에서 mbox/Assurance URL 입력칸을 탭하면 키보드가 입력창을 가려 입력 내용이 안 보이는 불편을 RN 기본 KeyboardAvoidingView로 해결한다.

Changes:

- `app/native-target-test.tsx`: ScrollView를 `KeyboardAvoidingView`(iOS=padding/Android=height)로 감쌈. `keyboardShouldPersistTaps="handled"`·`keyboardDismissMode="on-drag"` 추가로 키보드 떠 있어도 버튼 1탭 동작·드래그로 닫기. `s.flex` 스타일 추가, docstring 갱신
- 입력칸이 있는 화면은 이 화면 1개뿐이라 변경 범위 한정(다른 테스트 페이지엔 TextInput 없음)

Changed files: frontend/app/native-target-test.tsx, docs/log/log.md

122. 2026-06-02 하단 푸터 safe-area inset 반영(모바일 제스처 바/홈버튼 클릭 충돌 방지)

Purpose: 모바일에서 하단 푸터 탭이 기기 제스처 바/홈버튼과 위치가 겹쳐 클릭이 어려운 문제를 safe-area 하단 inset 반영으로 해결한다.

Changes:

- `app/_layout.tsx`: `react-native-safe-area-context`의 `SafeAreaProvider`를 `GestureHandlerRootView` 하위에 추가(누락돼 있던 Provider). 웹은 inset=0이라 기존과 동일
- `components/AppFooter.tsx`: `useSafeAreaInsets()`로 하단 inset 사용. 네이티브만 `insets.bottom + FOOTER_BOTTOM_GAP(=18)`로 시스템 내비(제스처 바/홈버튼) 위에 간격을 두고, 웹은 홈버튼이 없으므로 기존 `WEB_BOTTOM_PADDING(=10)` 유지(Platform 분기). 간격은 상수로 조절
- 두 파일 상단 docstring [Dependencies]/[Main Functions] 동기화

Changed files: frontend/app/_layout.tsx, frontend/components/AppFooter.tsx, docs/log/log.md

121. 2026-06-01 모바일 확장 설치 검증 + 가이드 문서(04) v3.1 갱신(검증 매트릭스·event-popup 공용·리팩토링 반영)

Purpose: Tags 모바일 속성에 설치된 확장이 프로젝트에 올바로 적용됐는지 검증하고, 그 결과·시스템 적용 내용·그간의 리팩토링 정리를 가이드 문서에 가독성 있게 반영한다.

Changes:

- 검증(코드 변경 없음): `package.json`·`node_modules/@adobe`·`aepcore/src/index.ts` 확인. Core·Identity·Lifecycle·Signal(aepcore)·Target(aeptarget)·Assurance(aepassurance) 적용 확인. **Profile(UserProfile)** 만 대응 npm(`react-native-aepuserprofile`) 미설치 → 미등록(Target mbox/event-popup 테스트엔 불필요, 선택)
- `docs/main/04`: §9 설치 확장 목록을 현재 속성 기준으로 명확화. §10.1 "설치 확장 ↔ 프로젝트 검증" 매트릭스 신설(상태 ✅/⚠️). §11 노출/클릭 알림 미연결 범위 명시. §8 네이티브 시퀀스에 event-popup 표시 단계 추가. §14.3 항목 보강 + §14.4 "event-popup 웹/네이티브 공용" 신설(흐름도·파서 공용화·컴포넌트 재사용). §18 FAQ 2건(Profile·event-popup) 추가. §19 문서 이력 v3.1 추가
- 문서 이력 v3.1 에 리팩토링 정리(웹 mbox 백엔드 단일 소스·_run_delivery·targetHttp·_TargetVisitorRequest) 요약 반영

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

120. 2026-06-01 모바일 SDK 경로에서도 event-popup 오퍼 시 웹과 동일한 EventPopup 표시

Purpose: 웹에서 `{ "type":"event-popup", title, body, buttonText }` JSON 오퍼로 띄우던 팝업을, 네이티브 Mobile SDK(retrieveLocationContent) 반환값으로도 동일하게 띄운다(웹 코드 불변·컴포넌트 재사용).

Changes:

- `targetOfferParser.ts`: 단일 오퍼 콘텐츠(문자열/객체)→event-popup 변환 공용 함수 `parseAdobeTargetEventPopupContent` 신설. 기존 `_coerceOfferContent` 의 파싱 코어를 `_coerceContentValue` 로 분리해 웹(offers 항목)·네이티브(단일 콘텐츠)가 공유. 헤더 docstring 갱신
- `app/native-target-test.tsx`: SDK 반환 콘텐츠를 `parseAdobeTargetEventPopupContent` 로 파싱해 웹 `main.tsx` 와 동일한 `@/components/EventPopup` 모달 렌더. eventPopupOffer 상태 추가, onReset 시 함께 초기화. (AT) 주석으로 연동 지점 표시. import 는 `@adobe/utils/targetOfferParser` 별칭 사용
- 검증: tsc·lint·웹 expo export(1140 modules) 통과

Changed files: frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, frontend/app/native-target-test.tsx, docs/log/log.md

119. 2026-06-01 백엔드 요청 모델 공통 베이스(_TargetVisitorRequest)로 Offers/ProfileTest 중복 필드 통합

Purpose: `OffersRequest`·`ProfileTestRequest` 가 거의 동일하게 갖던 방문자 식별자·쿠키·세션·페이지 필드를 공통 베이스로 묶어 중복을 제거한다(동작 불변).

Changes:

- `target_adobe_router.py`: 공통 베이스 `_TargetVisitorRequest`(model_config·page_url·tnt_id·third_party_id·target_cookie·target_location_hint·session_id) 신설. `OffersRequest`(+mbox_name·bootstrap·params)·`ProfileTestRequest`(+mbox_name 기본 offer_mbox_name·profile_params)가 이를 상속하도록 정리. 헤더 docstring 모델 목록 갱신
- 검증: py_compile 통과, Pydantic 상속·별칭(camelCase/snake)·default_factory 격리 테스트 통과, 린트 무오류. (참고: 이 셸의 Python 에는 target_python_sdk 의 pkg_resources 의존이 없어 라우터 전체 import 는 불가 — 운영 venv 와 무관한 환경 이슈)
- `docs/main/04`: profile-test 요청 본문 설명에 공통 베이스 상속 명시

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

118. 2026-06-01 웹 mbox 백엔드 단일 소스(bootstrap 역할)·프론트 fetch 공통화(targetHttp)·백엔드 _run_delivery 중복 제거

Purpose: 웹 offers mbox 이름을 프론트 상수화 대신 백엔드 config.adobe.json 을 단일 소스로 바라보게 하고, 중복·무질서한 코드를 기능 변경 없이 정리한다.

Changes:

- [1단계] 웹 mbox 단일 소스: 백엔드 `OffersRequest` 에 `bootstrap: bool` 추가·`mbox_name` Optional 화, `_resolve_offer_mbox_name()`(본문값>bootstrap_mbox_name>offer_mbox_name) 신설. 프론트 `targetOffersFetch.ts` 의 하드코딩 상수(`WEB_*`)·`getAdobeBootstrapMboxNameForFetch` 제거 → 호출부(`TargetPageBootstrap`·`targetContext.refreshOffers`)는 `{ bootstrap: true }` 만 전달. dedupe 키를 mbox명→역할(offer/bootstrap)로 전환(동작 동일)
- [2단계] 프론트 fetch 공통화: `targetHttp.ts` 신설(targetApiBaseUrl·cookieValue·readSessionTrimmed·stringFromData·persistVisitorSession). `targetOffersFetch`·`targetProfileTest`·`targetRecommendationTest` 의 중복(API URL·쿠키 추출·세션 읽기·응답→세션 저장)을 단일 구현으로 통합
- [3단계] 백엔드 중복 제거: `DeliveryRequest` 조립+디버그 로깅+`get_offers` 삼중 중복을 `_run_delivery()` 공통 헬퍼로 통합(offers·profile·recs 모두 사용, 동작 동일)
- [4단계] 검증: tsc·py_compile·웹 expo export(1140 modules) 통과, 린트 무오류. docs/main/04 흐름도·요청 예시·파일 목록 갱신

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/utils/targetHttp.ts(신규), frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, frontend/adobe_frontend/target_frontend/utils/targetProfileTest.ts, frontend/adobe_frontend/target_frontend/utils/targetRecommendationTest.ts, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/app/TargetPageBootstrap.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

117. 2026-06-01 프론트 mbox 설정을 네이티브 전용 adobe_sdk_mboxes로 분리(웹 경로는 상수화)

Purpose: 프론트 env 의 mbox 선언이 백엔드 웹 SDK(config.adobe.json)와 혼동되지 않도록, 이번 모바일 SDK 용 mbox 를 별도 키로 분리한다.

Changes:

- `config.dev.json`·`config.prd.json`: `adobe_mboxes`(offer_mbox_name·bootstrap_mbox_name) 제거 → `adobe_sdk_mboxes.offer_sdk_mbox_name: "target-msdk-mbox"`(네이티브 전용)로 교체
- `loadConfig.ts`: `AdobeMboxesConfig`→`AdobeSdkMboxesConfig`(offer_sdk_mbox_name), `adobe_mboxes`→`adobe_sdk_mboxes`, 주석 정합
- `app/native-target-test.tsx`: 기본 mbox 를 `config.adobe_sdk_mboxes.offer_sdk_mbox_name`(폴백 `target-msdk-mbox`)로 변경
- `targetOffersFetch.ts`(웹 경로): 프론트 config 의존 제거. 웹 전용 상수 `WEB_OFFER_MBOX_NAME="target-local-mbox"`·`WEB_BOOTSTRAP_MBOX_NAME="target-ready-mbox"` 도입(기존 값과 동일 → 웹 동작 불변). bootstrap_mbox_name 은 웹이 직접 사용했으나 값이 폴백과 같아 프론트 env 에서 제거 가능
- `docs/main/04`: 설정 표·네이티브 시퀀스 예시 mbox 를 새 키로 갱신
- 검증: 린트·tsc 통과

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/utils/loadConfig.ts, frontend/app/native-target-test.tsx, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

116. 2026-06-01 docs/main 04 Adobe Target 가이드 전면 재작성(v3.0·웹/네이티브 분리·모바일 SDK 기술)

Purpose: 기존 04 문서가 빽빽해 따라 읽기 어렵다는 요청에 따라, 초보자도 위→아래로 자연스럽게 이해되도록 전면 재작성하고 이번에 추가한 네이티브 모바일 SDK 연동을 자세히 기술한다.

Changes:

- 구성을 4부로 재편: 1부 개념(용어 5개·두 길 비교) → 2부 웹(서버 프록시) → 3부 네이티브(모바일 SDK) → 4부 운영
- 웹 길: 시퀀스 다이어그램, 방문자 식별 순환 흐름도, 백엔드 알고리즘(설정 로드·클라이언트 싱글톤·요청 조립·3 엔드포인트 단계별·offers_from_execute·예외/디버그) 정리, recommendation-test 재시도 흐름도, HTTP 예시 JSON
- 네이티브 길: 전체 시퀀스, Tags 속성/appId 준비, 설치 패키지·사용 함수표, 코드 구조 트리, 플랫폼 분리(.native.ts/.ts) Metro 선택 흐름도·실측 검증, 초기화/설정/테스트 화면, EAS 빌드 방법
- 운영: 설정 파일 총정리표, 웹/네이티브 체크리스트, 문제 해결 FAQ
- 문서 이력에 v3.0 추가

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

115. 2026-06-01 네이티브 Adobe Target SDK 연동(AEPCore/AEPTarget/AEPAssurance·플랫폼 분리)

Purpose: 기존 웹(프록시) 구현은 그대로 두고, 네이티브 앱에서만 Adobe Experience Platform Mobile SDK로 Target을 직접 호출하도록 연동한다. Data Collection 모바일 속성의 Environment File ID(appId)로 SDK를 초기화한다.

Changes:

- 패키지 추가: `@adobe/react-native-aepcore`·`@adobe/react-native-aeptarget`·`@adobe/react-native-aepassurance`(v7.0.0). EAS prebuild가 네이티브 의존성을 자동 링크
- 플랫폼 분리 모듈 신규: 웹 번들에 네이티브 패키지가 포함되지 않도록 base `.ts`(no-op·웹/타입 소스)와 `.native.ts`(실구현)로 분리. Metro가 네이티브=`.native.ts`, 웹=base `.ts`를 선택
  - `adobe_frontend/target_frontend/native/adobeMobileTarget.types.ts`: 공용 타입(TargetIds)
  - `adobe_frontend/target_frontend/native/adobeMobileTarget.ts`: 웹 no-op(init/retrieve/getIds/reset/assurance)
  - `adobe_frontend/target_frontend/native/adobeMobileTarget.native.ts`: MobileCore.initializeWithAppId(v7 확장 자동 등록)·Target.retrieveLocationContent(콜백→Promise)·getTntId/ThirdPartyId/SessionId·resetExperience·Assurance.startSession
- 초기화 연결: `targetApp.tsx`의 마운트 useEffect에서 `initAdobeMobileTarget(config.adobe_mobile_app_id)` 호출(웹 no-op)
- 설정: `loadConfig.ts`의 `AppConfig`에 `adobe_mobile_app_id?` 추가, `config.dev.json`·`config.prd.json`에 Environment File ID 기입(development 값. 운영용은 추후 production env File ID로 교체)
- 테스트 화면: `app/native-target-test.tsx`(/native-target-test) — mbox 조회·방문자 ID 조회·Assurance 세션·경험 초기화. 웹은 안내 배너만 노출
- 푸터: `AppFooter.tsx`에 `sdk` 탭("SDK 테스트") 추가(5탭)
- 검증: tsc 통과, Android/Web export 모두 성공. 웹 번들 Target SDK 참조 0개(완전 제외)·Android 번들에는 포함 확인

Changed files: frontend/package.json, frontend/package-lock.json, frontend/utils/loadConfig.ts, frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/adobe_frontend/target_frontend/native/adobeMobileTarget.types.ts, frontend/adobe_frontend/target_frontend/native/adobeMobileTarget.ts, frontend/adobe_frontend/target_frontend/native/adobeMobileTarget.native.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/app/native-target-test.tsx, frontend/components/AppFooter.tsx, docs/log/log.md

114. 2026-06-01 스크롤 테스트 페이지 500개·행별 스크롤 퍼센트·중앙 정렬

Purpose: 스크롤 테스트 페이지를 1~500으로 줄이고, 각 숫자가 화면 상단에 올 때의 스크롤 이동 퍼센트를 우측에 표시하며, 목록을 중앙 정렬한다.

Changes:

- `app/scroll-test.tsx`: 개수 1000→500, 행 높이 고정(ROW_HEIGHT)으로 행 위치 산출. 뷰포트 높이(`onLayout`)와 전체 콘텐츠 높이로 `maxScroll` 계산 후 행별 `rowTop/maxScroll` 퍼센트(0~100 클램프)를 숫자 오른쪽에 표시
- 레이아웃: contentContainer `alignItems: center`·행 고정 너비(220)로 목록을 화면 중앙 정렬(숫자 좌·퍼센트 우)

Changed files: frontend/app/scroll-test.tsx, docs/log/log.md

113. 2026-06-01 하단 푸터에 스크롤 테스트 탭 추가

Purpose: 새로 만든 `/at-test/scroll-test` 페이지를 앱 UI에서 바로 이동할 수 있도록 전역 하단 푸터에 탭을 추가한다.

Changes:

- `components/AppFooter.tsx`: `FooterKey`에 `scroll` 추가, `ROUTES`(`/scroll-test`)·`LABELS`("스크롤 테스트")·`activeKeyForPath`·탭 배열(keys)에 반영(메인/프로필/추천/스크롤 4탭)

Changed files: frontend/components/AppFooter.tsx, docs/log/log.md

112. 2026-06-01 스크롤 이벤트 테스트 페이지(/at-test/scroll-test) 추가

Purpose: Adobe Target 스크롤 이벤트 테스트용으로, 화면보다 내용이 길어 상하 스크롤이 발생하는 단순 페이지를 추가한다.

Changes:

- 신규 `app/scroll-test.tsx`: 1~1000 숫자를 fontSize 20으로 세로 나열한 `ScrollView`(`nativeID="scrollTestScrollArea"`). 별도 로직 없이 스크롤만 발생
- 라우트: baseUrl(`/at-test`) 기준 `/at-test/scroll-test`로 접근(Expo Router 파일 기반)

Changed files: frontend/app/scroll-test.tsx, docs/log/log.md

111. 2026-06-01 세션 저장소 웹/네이티브 범용화(sessionStore + AsyncStorage)

Purpose: 기존 `sessionStorage`(웹 전용)에 묶여 있던 Adobe Target 세션 값(tntId·thirdPartyId·쿠키·location hint·session_id·recipient_id)을 웹/네이티브 공통 래퍼로 분리해, 네이티브 빌드에서도 Target SDK 테스트(offers·profile-test·recommendation-test)가 동작하도록 한다.

Changes:

- 신규 `sessionStore.ts`: 동기 API(`sessionGetItem`/`sessionSetItem`/`sessionRemoveItem`). 웹은 `sessionStorage` 위임, 네이티브는 메모리 캐시 + `@react-native-async-storage/async-storage` write-through, 시작 시 `hydrateSessionStore()`로 1회 적재
- `targetSession.ts`·`targetOffersFetch.ts`·`targetProfileTest.ts`·`targetRecommendationTest.ts`·`RecommendationTestPanel.tsx`: 직접 `sessionStorage` 호출을 래퍼로 교체, 플랫폼 가드(`typeof sessionStorage === "undefined"`) 제거
- `targetApp.tsx`: 마운트 시 `hydrateSessionStore()` 호출(웹 no-op)
- 의존성: `@react-native-async-storage/async-storage`(Expo SDK 54 호환 버전) 추가
- 웹 전용 모듈(`clickCookie`·`digitalData`·`CouponTable`)은 기존 `Platform.OS` 가드 유지로 변경 없음

Changed files: frontend/adobe_frontend/target_frontend/utils/sessionStore.ts, frontend/adobe_frontend/target_frontend/utils/targetSession.ts, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, frontend/adobe_frontend/target_frontend/utils/targetProfileTest.ts, frontend/adobe_frontend/target_frontend/utils/targetRecommendationTest.ts, frontend/adobe_frontend/target_frontend/components/RecommendationTestPanel.tsx, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/package.json, frontend/package-lock.json, docs/log/log.md

110. 2026-05-18 메인 ScrollView `nativeID=mainScreenScrollArea`

Purpose: 메인 화면 스크롤 영역에 고정 `nativeID`를 부여해 웹·네이티브에서 셀렉터·자동화·디버깅 시 영역을 식별할 수 있게 한다.

Changes:

- `app/main.tsx`: `ScrollView`에 `nativeID="mainScreenScrollArea"` 추가

Changed files: frontend/app/main.tsx, docs/log/log.md

109. 2026-05-18 메인 라우트 `/main` 분리·루트 `/at-test/` 리다이렉트

Purpose: 메인 URL을 `https://…/at-test/main` 으로 맞추고 `/at-test/` 접근은 `/main` 으로 보낸다.

Changes:

- `app/main.tsx`: 기존 메인 UI 이동
- `app/index.tsx`: `<Redirect href="/main" />`
- `AppFooter`, `digitalData.ts`: `/main` 경로·pageName 매핑

Changed files: frontend/app/main.tsx, frontend/app/index.tsx, frontend/components/AppFooter.tsx, frontend/utils/digitalData.ts, docs/log/log.md

108. 2026-05-18 웹 digitalData 라우트별 pageName 동기화

Purpose: 웹에서 `window.digitalData.page.pageInfo.pageName` 을 `/at-test` 기준 라우트에 맞게 설정·유지한다.

Changes:

- `utils/digitalData.ts`: 경로 정규화·`PAGE_NAME_BY_ROUTE`·`setDigitalDataPageForPathname`
- `components/DigitalDataSync.tsx`: `usePathname` 구독 후 웹에서만 갱신
- `app/_layout.tsx`: `DigitalDataSync` 마운트

Changed files: frontend/utils/digitalData.ts, frontend/components/DigitalDataSync.tsx, frontend/app/_layout.tsx, docs/log/log.md

107. 2026-05-15 Target bootstrap mbox 정리(target-ready-mbox·mbox별 dedupe·preload 제거)

Purpose: 서버 SDK 프록시 전제에 맞춰 location 래퍼·Normalizer·per-location 훅을 제거하고, 첫 웹 로드만 `bootstrap_mbox_name`으로 offers 를 받아 Context에 반영한다.

Changes:

- 삭제: `useTargetLocation.ts`, `TargetLocation.tsx`, `targetOfferNormalizer.ts`
- `targetOffersFetch.ts`: `mbox_name`·params·mbox별 dedupe·`getAdobeBootstrapMboxNameForFetch`
- `TargetOffersPreload` 제거, `TargetPageBootstrap` 단일화, `refreshOffers`는 bootstrap mbox+force
- 백엔드: `AdobeTargetSettings.bootstrap_mbox_name`, `config.adobe*.json` mboxes, offers `page_url` 주석
- 프론트 env: `adobe_mboxes`, `loadConfig` 타입, 문서 02·04 정합

Changed files: (삭제 3) + frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, targetContext.tsx, app/targetApp.tsx, app/TargetPageBootstrap.tsx, utils/targetOfferParser.ts, frontend/utils/loadConfig.ts, frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/app/_layout.tsx, frontend/app/index.tsx, backend/adobe_backend/target_backend/target_config.py, backend/env/config.adobe.json, backend/env/config.adobe.example.json, backend/adobe_backend/target_backend/target_adobe_router.py, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

106. 2026-05-15 Target location 범용 구조(TargetPageBootstrap·useTargetLocation·dedupe offers)

Purpose: offers 응답을 location(mbox_name) 기준으로 재사용 가능하게 소비하고, DOM 준비 시점 부트스트랩·중복 fetch 최소화로 글로벌 mbox 에 가까운 흐름을 만든다.

Changes:

- `targetOffersFetch.ts`: `fetchAdobeTargetOffersResponseDeduped`(실패 시 캐시 해제·`force` 재요청)
- `targetContext.tsx` / `targetApp.tsx`: 프리로드는 dedupe, `refreshOffers` 는 `force`
- 신규: `TargetPageBootstrap.tsx`, `useTargetLocation.ts`, `TargetLocation.tsx`, `targetOfferNormalizer.ts`, `targetOfferParser.ts`(location 탐색·항목 content 파서)
- `app/_layout.tsx`, `app/index.tsx`: 부트스트랩·`TargetLocation` 캐러셀 예시

Changed files: frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, targetContext.tsx, app/targetApp.tsx, utils/targetOfferParser.ts, utils/targetOfferNormalizer.ts, hooks/useTargetLocation.ts, components/TargetLocation.tsx, app/TargetPageBootstrap.tsx, frontend/app/_layout.tsx, frontend/app/index.tsx, docs/log/log.md

105. 2026-05-14 쿠폰 목록: recommendation-test용 recipient_id 추적·복사·초기화

Purpose: 쿠폰 테이블에서 복사한 recipient_id를 `localStorage`(`AT_USED_RECIPIENT_IDS`)에 누적해「사용」열로 표시하고, 추적 기록을 한 번에 비울 수 있게 한다.

Changes:

- `CouponTable.tsx`: recipient_id 왼쪽「사용」열(50px), 복사(📋/1초「복사됨!」)·클립보드 성공 시 Set+localStorage 갱신, CSV 버튼 왼쪽「추적 초기화」(confirm 후 removeItem), 테이블 minWidth 조정, `tdNowrap`를 StyleSheet 밖 `TD_TEXT_NOWRAP`로 분리해 TS 정합

Changed files: frontend/components/CouponTable.tsx, docs/log/log.md

104. 2026-05-14 recommendation-test: content `{meta, items}` 파싱·`recommendations_meta`

Purpose: Recommendations 오퍼 content 가 배열 대신 `{ meta, items }` 객체로 오는 경우를 지원하고, 디버깅용 meta 를 별도 필드로 노출한다.

Changes:

- `_recommendation_test_sync`: dict content 는 `items` 를 `recommendations` 에 확장, `meta` 는 dict 일 때만 `recommendations_meta` 에 병합(여러 오퍼 시 키 충돌은 후행 값 우선). list·기타 타입은 기존·빈 리스트 규칙 유지. `offers` 배열은 변경 없음.

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

103. 2026-05-14 docs/main 03·04: CORS(main)·recommendation categoryId·build_delivery_id 문서 정합

Purpose: `backend/app/main.py`의 CORS(OPTIONS·private network·dev localhost 정규식·`cors_origins` 정규화)와 recommendation-test의 `entity.categoryId`·`build_delivery_id` 시그니처를 문서에 반영하고, 03의 표·§6 요약을 코드와 일치시킨다.

Changes:

- `03_AT_TEST_PAGE_BACKEND_GUIDE.md`: §3.4 CORS 상세, §5.2 recommendation-test 행, §6 CORS 요약
- `04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: §5 설정 문단, §6.1 `build_delivery_id`, §8.4 프론트/서버 categoryId, §9 체크리스트, 문서 이력 v2.3

Changed files: docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

102. 2026-05-14 쿠폰 목록·CSV 컬럼 순서(created→recipient→캠페인→워크플로)
Purpose: 테이블·JSON·CSV에서 `recipient_id`를 `created` 직후에 두고 캠페인·워크플로 라벨을 뒤에 배치한다

Changes:

백엔드: `CouponRowOut` 필드 순서·`_rows_to_response_data`·`_to_csv_text`·dedup SELECT 컬럼 순서 정합
프론트: `CouponTable` 헤더·행 셀 순서 정합
문서: backend README 응답 필드 순서

Changed files: backend/app/schemas.py backend/app/routers/coupons.py backend/app/database.py frontend/components/CouponTable.tsx backend/README.md docs/log/log.md

101. 2026-05-14 CORS dev localhost Origin 정규식·cors_origins 정규화
Purpose: `cors_origins`만 수정해도 브라우저에 `Access-Control-Allow-Origin`이 없다고 나오는 경우(설정 캐시·포트 누락·IPv6 등)를 줄이기 위해 dev에서 localhost 계열 Origin을 정규식으로 추가 허용하고 JSON 배열을 안전히 파싱한다

Changes:

`APP_ENV=dev`일 때 `allow_origin_regex`로 `localhost`·`127.0.0.1`·`[::1]` + 임의 포트 허용, `cors_origins` 문자열/배열 정규화, `allow_methods`에 `OPTIONS` 명시

Changed files: backend/app/main.py docs/log/log.md

100. 2026-05-14 CORS preflight OPTIONS 400(private-network) 완화
Purpose: `cors_origins`를 맞춰도 `OPTIONS /api/target/offers` 가 400이 나는 경우 Starlette CORS가 Private Network Access preflight를 거절하는 경우가 있어 허용 플래그를 켠다

Changes:

`CORSMiddleware`에 `allow_private_network=True` 추가 및 주석으로 400 원인 설명

Changed files: backend/app/main.py docs/log/log.md

99. 2026-05-14 쿠폰 목록·CSV recipient_id당 1행(중복 제거)
Purpose: 동일 수신자에 대한 여러 쿠폰 행 중 목록·페이징·CSV가 한 줄만 나가도록 하고 total_count를 고유 수신자 수와 맞춘다

Changes:

백엔드: `ROW_NUMBER() OVER (PARTITION BY recipient_id ORDER BY created DESC, id DESC)` 랭크 서브쿼 후 `rn=1`만 선택, keyset 필터를 dedup 컬럼에 정합, `total_count`는 `COUNT(DISTINCT recipient_id)`(동일 created 구간)

Changed files: backend/app/database.py backend/app/routers/coupons.py backend/README.md docs/log/log.md

98. 2026-05-14 쿠폰 목록 필터·CSV(현재/전체)·coupon_id 제거
Purpose: 쿠폰 데이터 범위를 created 반개구간으로 제한하고 UI/API에서 coupon_id를 제외하며 CSV를 페이지 단위와 필터 전체로 분리한다

Changes:

백엔드: `coupon_visible_created_filter`(2026-05-01 ≤ created < 2026-05-10), 목록·페이지 CSV는 `_coupon_rows_filtered()` 기준, `GET /api/coupons/csv?scope=all`로 필터 전체보내기, `CouponRowOut`에서 coupon_id 제거, 필터 구간 COUNT TTL 캐시
프론트: 테이블에서 coupon_id 컬럼 제거, `CSV(현재)`·`CSV(전체)` 버튼 및 scope 쿼리
문서: backend README API 설명 정합

Changed files: backend/app/database.py backend/app/routers/coupons.py backend/app/schemas.py frontend/components/CouponTable.tsx backend/README.md docs/log/log.md

97. 2026-05-13 미푸시 작업 일괄 푸시(Adobe·문서·프로필·추천 테스트 UI)

Purpose: README 커밋(`ffc4c75`) 이후 로컬에만 남아 있던 백엔드 Target 라우터·설정 예시·`docs/main`·프론트 테스트 패널·푸터·세션/페치 유틸을 `origin/main`에 반영한다.

Changes:

- `target_adobe_router`·`target_config`·`target_delivery_utils`·`target_client`·`app/main`·`config.adobe.example.json`
- `docs/main` 01~04, `targetSession`·`targetOffersFetch`·`targetOfferParser`·`_layout`
- 신규: `ProfileTestPanel`·`RecommendationTestPanel`·`targetProfileTest`·`targetRecommendationTest`·`profile-test`·`recommendation-test`·`AppFooter`

Changed files: (본 커밋에 포함된 경로 전체; 제외: `backend/env/config.dev.json`)

96. 2026-05-13 README를 docs/main 기준으로 정합(구조·실행·Adobe·디버그)

Purpose: 루트 `env/` 등 구버전 경로를 제거하고 `docs/main` 01~04와 동일한 모노레포 구조·백엔드 실행·Adobe 설정·`AT_DEBUG_DELIVERY` 안내를 README에 반영한다.

Changes:

- README: `docs/main` 표, `frontend/env`·`backend/env`·`backend/requirements.txt`, 세 Target 엔드포인트 요약, 디버그 토글, 배포·원격 링크 정리

Changed files: README.md, docs/log/log.md

95. 2026-05-13 docs/main 04 v2.2 recommendation-test·프론트 정합(문서만)

Purpose: 코드와 일치하도록 04의 recommendation-test 설명(§1·§6.4·§7·§8.4)·문서 이력 v2.2를 갱신하고, 02 §5.3 표에 추천 유틸의 세션·오류 처리 요약을 반영한다.

Changes:

- `04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: `customerIds`·재시도·`Product`/`Order`·응답 `target_location_hint_cookie`, `targetRecommendationTest` 행·§8.4 프론트 규칙 반영
- `02_AT_TEST_PAGE_FRONTEND_GUIDE.md`: §5.3 `targetRecommendationTest` 표 셀에 `AT_RECS_*`·`detail` 요약

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/log/log.md

94. 2026-05-13 recommendation-test: customerIds·Product·build_delivery_id 확장

Purpose: Recommendations 테스트에서 thirdPartyId 유지, Customer Attributes 연동용 customerIds(recipient_id), 공식 product·order·parameters 병행, customerIds 실패 시 thirdPartyId 단독 재시도.

Changes:

- `target_delivery_utils.build_delivery_id`: `customer_ids` 선택 인자·VisitorId 전달, 모듈 설명 갱신
- `_recommendation_test_sync`: `recipient_id` 시 `CustomerId`(integrationCode `recipient_id`, authenticated), `MboxRequest.product`, parameters에 `entity.categoryId` 키 유지(ss·빈 값은 빈 문자열), 예외 시 customerIds 제거 후 1회 재시도

Changed files: backend/adobe_backend/target_backend/target_delivery_utils.py, backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

93. 2026-05-13 docs/main 04 v2.1·02/03 Adobe 링크(연관 문서·저장소·브리지·트랙 제거)

Purpose: `adobe_backend`·`adobe_frontend`·브리지·`config.adobe.example`·API 3종·캐러셀 트랙 제거를 04에 반영하고, 02·03에서 04로 안내 링크를 추가한다.

Changes:

`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: 연관 문서(01~03), §2 저장소·브리지, 섹션 번호 재정렬(3~10), 체크리스트·문서 이력 v2.1

`02_AT_TEST_PAGE_FRONTEND_GUIDE.md`, `03_AT_TEST_PAGE_BACKEND_GUIDE.md`: 상단 04 링크 한 줄

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/log/log.md

92. 2026-05-13 추천 테스트: ss(매장) 제외·entity.categoryId 미전송

Purpose: `categoryId` 가 `ss` 인 엔티티는 장소용이라 Recs 테스트 데이터로 부적합하므로 UI·요청에서 제외하고, API 에도 `ss` 가 category 로 넘어가지 않게 한다.

Changes:

- `RecommendationTestPanel.tsx`: `MENU_ENTITIES` 에서 `ss` 20건 삭제, 섹션은 음료·푸드만.
- `targetRecommendationTest.ts`: `entity_category_id` 는 비어 있지 않고 `ss` 가 아닐 때만 payload 에 실음.
- `target_adobe_router.py`: `entity.categoryId` mbox 파라미터는 값이 있고 `ss` 가 아닐 때만 추가.

Changed files: frontend/adobe_frontend/target_frontend/components/RecommendationTestPanel.tsx, frontend/adobe_frontend/target_frontend/utils/targetRecommendationTest.ts, backend/adobe_backend/target_backend/target_adobe_router.py, docs/main/01_AT_TEST_PAGE_PRD.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

검증:

- `python -m py_compile target_adobe_router.py` 성공.

Purpose: Recommendations 요청에 주문 컨텍스트(`Order`)와 단가(`price`)를 넣어 Target 이 엔티티·구매 맥락을 활용할 수 있게 한다.

Changes:

- `target_adobe_router.py`: `RecommendationTestRequest.price`(기본 1000), `MboxRequest`에 `Order(id=ord_*12, total, purchased_product_ids=[entity_id])`, `parameters`에 항상 `entity.categoryId`(빈 문자열 허용). `delivery_api_client.Order` import.
- `targetRecommendationTest.ts` / `RecommendationTestPanel.tsx`: 요청에 `price` 전달.
- `docs/main/03`, `04`: 계약 설명 갱신.

검증:

- `python -m py_compile target_adobe_router.py` 성공.

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/utils/targetRecommendationTest.ts, frontend/adobe_frontend/target_frontend/components/RecommendationTestPanel.tsx, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

90. 2026-05-13 recs_mbox_name 을 config.adobe.json·target_config 에 반영

Purpose: Recommendations 테스트 mbox 명을 하드코딩 대신 `mboxes.recs_mbox_name` 으로 바꿀 수 있게 한다.

Changes:

- `target_config.py`: `AdobeTargetSettings.recs_mbox_name` 로드(`mboxes.recs_mbox_name`, 기본 `target-recs-mbox`).
- `target_adobe_router.py`: `_recommendation_test_sync` 가 설정값 사용, 상수 `RECS_MBOX_NAME` 제거.
- `config.adobe.example.json`: `recs_mbox_name` 예시 추가.
- `docs/main/03`, `04`: 설정 기반 서술로 수정.

검증:

- `python -m py_compile` 대상: `target_config.py`, `target_adobe_router.py` 성공.

Changed files: backend/adobe_backend/target_backend/target_config.py, target_adobe_router.py, backend/env/config.adobe.example.json, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

89. 2026-05-13 Target 연결 검증·docs/main 전면 갱신·main.py 주석 정합

Purpose: 로그 85~88 반영 후 API·프론트 import·세션 키 연결을 재검증하고, `docs/main` 네 문서를 상호 참조·변경 이력 없이 최신 구조만 서술하도록 갱신한다.

Changes:

- 연결 검증: `POST /api/target/{offers|profile-test|recommendation-test}` ↔ `targetOffersFetch`·`targetProfileTest`·`targetRecommendationTest` URL·필드 정합, `AppFooter` 경로, `ProfileTestPanel`→`EventPopup`·`parseAdobeTargetOffersPayload`, `AT_RECS_*` 키 문자열 유지. `targetOfferParser` 모듈 설명을 profile-test `offers` 파싱에도 맞게 수정.
- `backend/app/main.py`: Adobe 마운트 주석을 세 엔드포인트·CORS `POST /api/target/*` 로 정리.
- `docs/main/01~04*.md`: PRD·프론트·백엔드·Adobe 각각 자립 서술(다른 문서 링크·문서 이력 표 제거), recommendation-test·푸터·event-popup·utils 배치 반영.

Changed files: backend/app/main.py, docs/main/01_AT_TEST_PAGE_PRD.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, docs/log/log.md

88. 2026-05-13 targetRecommendationTest 를 utils 로 이동·AT_RECS_* 를 targetSession 에 구획

Purpose: `services/` 만 다른 Adobe Target 프론트 패턴을 없애고 `targetOffersFetch`·`targetProfileTest` 와 동일하게 `utils/` 에 두며, Recs 전용 sessionStorage 키는 `targetSession` 에 주석 구역으로 모아 혼동을 줄인다.

Changes:

- `utils/targetRecommendationTest.ts` 신설(기존 `services/` 내용 이전), `RecommendationTestPanel` import 경로 수정.
- `targetSession.ts`: `AT_RECS_*` 상수 블록 추가, 모듈 설명 보강.
- `RecommendationTestPanel.tsx`: `AT_RECS_RECIPIENT_ID_KEY` 사용.
- `targetProfileTest.ts`·`targetOffersFetch.ts`: 형제 유틸 위치 안내 1줄.
- 빈 `services/` 폴더 제거.

Changed files: frontend/adobe_frontend/target_frontend/utils/targetRecommendationTest.ts, targetSession.ts, targetProfileTest.ts, targetOffersFetch.ts, components/RecommendationTestPanel.tsx, (삭제) services/targetRecommendationTest.ts, docs/log/log.md

87. 2026-05-13 전역 하단 푸터(AppFooter)·메인·프로필·추천 테스트 이동

Purpose: 모든 화면 하단에서 메인·프로필 테스트·추천 테스트로 빠르게 이동할 수 있도록 공통 푸터를 둔다.

Changes:

- `components/AppFooter.tsx`: `usePathname` 기준 현재 탭 강조, `router.replace` 로 `/`, `/profile-test`, `/recommendation-test` 이동(스택 과다 방지).
- `app/_layout.tsx`: `Stack` 을 `flex:1` 영역에 두고 그 아래 `AppFooter` 고정 배치.

검증:

- ReadLints: `AppFooter.tsx`, `_layout.tsx` 무경고.

Changed files: frontend/components/AppFooter.tsx, frontend/app/_layout.tsx, docs/log/log.md

86. 2026-05-13 profile-test: Alert 제거·EventPopup·event-popup 오퍼 연동

Purpose: profile-test 에서 JSON 오퍼를 `window.alert` 대신 메인과 동일한 `EventPopup`(Modal) 으로 표시하고, Target Activity 오퍼를 `type: event-popup` 포맷으로 맞출 수 있게 한다.

Changes:

- `ProfileTestPanel.tsx`: `findPopupContent`·`showAlert`·`Alert`·`Platform` 제거. `parseAdobeTargetOffersPayload(res.data)` 로 Re-fetch 시 `event-popup` 추출 후 `setPopupOffer`. `EventPopup` 렌더·Send 시 `setPopupOffer(null)` 로 이전 모달 정리·요청 실패 시에도 팝업 초기화.
- Activity JSON 교체는 Target UI 수동 작업(사용자 가이드).

검증:

- `ProfileTestPanel.tsx` 내 `window.alert|Alert.alert|showAlert|_showPopup|findPopupContent` grep 0건.
- ReadLints 해당 파일 무경고.

Changed files: frontend/adobe_frontend/target_frontend/components/ProfileTestPanel.tsx, docs/log/log.md

85. 2026-05-13 Recommendation 테스트 페이지·백엔드 `/api/target/recommendation-test` 추가

Purpose: Adobe Target Recommendations 를 `target-recs-mbox` 로 호출해 entity 기반 추천 오퍼를 검증할 수 있는 전용 화면·API 를 추가한다.

Changes:

- `target_adobe_router.py`: `RecommendationTestRequest`·`_recommendation_test_sync`·`POST /target/recommendation-test` 추가(`RECS_MBOX_NAME=target-recs-mbox`, `parameters` 로 entity.id/categoryId, `offers_from_execute(..., parse_json=True)` 및 `recommendations` 배열 파싱).
- 프론트: `services/targetRecommendationTest.ts`, `components/RecommendationTestPanel.tsx`, `app/recommendation-test.tsx` 추가(60개 메뉴 그리드·recipient_id·Top5 슬롯·세션 키 분리).

검증:

- `python -m py_compile target_adobe_router.py` 성공.
- `npx tsc --noEmit`: 기존 `CouponTable.tsx` 등 프로젝트 전역 오류로 exit 2이나, 신규 Recommendation 관련 경로는 tsc 출력에 미포함.

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/services/targetRecommendationTest.ts, frontend/adobe_frontend/target_frontend/components/RecommendationTestPanel.tsx, frontend/app/recommendation-test.tsx, docs/log/log.md

84. 2026-05-12 profile-test 모델·함수 포맷을 offers 와 1대1 정렬(가독성)

Purpose: `ProfileTestRequest`/`_profile_test_sync` 가 `OffersRequest`/`_get_offers_sync` 와 필드/라인 순서·반환 패턴이 미묘하게 달라 "offers 의 파생"이라는 의도가 코드만으로 드러나지 않았다. 사용자 피드백("기존 offer 모델에서 발전시켜서 만든다는 개념") 에 맞춰 두 쌍을 1대1 미러로 정렬해 차이점(`profile_parameters` 슬롯 사용)만 노출되도록 한다.

Changes:

- `ProfileTestRequest`: `mbox_name` 필드 추가(`OffersRequest` 와 동일 default factory). `profile_params: Dict[..] = Field(default_factory=dict)` → `Optional[Dict[..]] = None`(`OffersRequest.params` 와 동일 타입). 모델 docstring 1줄 추가로 "offers 와 같음 + 슬롯만 다름" 명시.
- `_profile_test_sync`: 죽은 `page_url = ... DEFAULT_PAGE_URL` 라인 + `DEFAULT_PAGE_URL` import 제거. `MboxRequest.name` 을 `body.mbox_name` 으로 전환(`_get_offers_sync` 와 동일 패턴). 반환부를 `result: Dict[str, Any] = { ... }; return result` 구조로 교체. `"mbox": body.mbox_name` 키를 응답에 추가(offers 응답과 동일 위치). 주석을 1~2줄로 축소.
- 키 순서: `mbox` → `status`/`request_id` → `offers` → `response_tokens` → `_id_and_cookies(...)` 스프레드. offers 와 같은 헤더 키부터 노출하고 디버그 키는 그 다음, 마지막에 id/cookies 가 오는 동일 레이아웃.
- 응답 shape 변화: `mbox` 키 추가(additive). 기존 프론트(`targetProfileTest.ts`/`ProfileTestPanel.tsx`)는 raw JSON 만 렌더하므로 영향 없음.

검증:

- `python -m py_compile target_adobe_router.py` 성공. uvicorn 자동 리로드 `Application startup complete`.
- 라이브 호출 1(mbox_name 미지정, `third_party_id=smoke-aligned-001`, `profile_params={testKey:testVal}`): 응답 `mbox=target-local-mbox`, `status=200`, `tntId=...32_0` 정상. wire-format 로그(terminal 1.txt:830-864)에서 `mboxes[0].name='target-local-mbox'`·`profile_parameters={'testKey':'testVal'}`·`parameters=None` 확인 → default factory 가 `config.adobe.json` 값으로 정상 채워짐.
- 라이브 호출 2(mbox_name 명시): 동일 결과(L869-907). 명시·default 경로 모두 동작.
- ReadLints 무경고. `DEFAULT_PAGE_URL` 미사용 import 제거 확인.

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

83. 2026-05-12 profile-test mbox 이름을 config.adobe.json 의 offer_mbox_name 으로 단일화

Purpose: 82 번 작업에서 임시로 `"target-local-mbox"` 를 하드코딩했으나, `OffersRequest.mbox_name` 이 이미 `get_adobe_target_settings().offer_mbox_name` 을 default factory 로 쓰고 있어 단일 진실 출처가 분리되어 있었다. profile-test 도 동일 설정값을 읽도록 일원화해 mbox 명 변경 시 `config.adobe.json` 한 곳만 수정하면 되도록 한다.

Changes:

- `target_adobe_router.py` `_profile_test_sync`: `MboxRequest(name="target-local-mbox", ...)` → `MboxRequest(name=get_adobe_target_settings().offer_mbox_name, ...)`. 주석도 일반화("Activity Location 이 named mbox(config.adobe.json 의 offer_mbox_name)").
- 새 import 불필요(`get_adobe_target_settings` 는 `OffersRequest.mbox_name` default factory 가 이미 사용 중). `get_adobe_target_settings` 는 `lru_cache(maxsize=1)` 로 캐시되므로 호출 비용 없음.

검증:

- `python -m py_compile target_adobe_router.py` 성공. uvicorn `--reload` `Application startup complete`.
- 라이브 호출(`third_party_id=smoke-cfg-001`, `profile_params={testKey:testVal}`) → `status=200`·`tntId` 발급.
- 디버그 요약 로그(terminal 1.txt:869): `mode=mboxes mboxes=['target-local-mbox']` 로 config 값이 정상 해석됨을 확인. wire-format 은 82 번 작업과 동일.

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

82. 2026-05-12 profile-test 를 named mbox(target-local-mbox)로 전환·MboxRequest.profile_parameters 사용

Purpose: 운영 Activity Location 이 named mbox `target-local-mbox` 이고 Profile Script 조건도 동일 mbox 에서만 실행되므로, profile-test 가 `execute.pageLoad` 로 요청하면 매칭이 일어나지 않는다. offers 엔드포인트와 동일하게 `MboxRequest(name="target-local-mbox")` 로 호출하되, mbox 파라미터 슬롯이 아닌 `profile_parameters` 슬롯에 값을 실어 Profile Script 가 user 속성으로 받아쓰게 한다. offers 라인(`/api/target/offers`)·프론트엔드는 무변경.

Changes:

- `target_adobe_router.py` `_profile_test_sync`: `RequestDetails`/`pageLoad` 구성 삭제 → `MboxRequest(name="target-local-mbox", index=0, profile_parameters=body.profile_params or None)` 1건을 `ExecuteRequest(mboxes=[mbox])` 로 전달. `Context(channel=ChannelType.WEB)` 만 사용(주소 없음). `page_url` 로컬은 디버그 보존용으로 남기고 `# noqa: F841` 표시.
- `target_adobe_router.py` imports: `Address`·`RequestDetails` 제거(이 파일에서 더 이상 사용 안 함). `MboxRequest` 는 offers 가 이미 쓰고 있어 그대로.
- `PROFILE_TEST_DEFAULT_PAGE_URL`·`page_load_dict` 는 직전 리팩터에서 이미 제거됨(추가 정리 불필요).

검증:

- `python -m py_compile target_adobe_router.py` 성공. uvicorn `--reload` `Application startup complete`.
- `AT_DEBUG_DELIVERY=1` 활성 상태에서 wire-format 로그(terminal 1.txt:844-851) 확인 — `execute.mboxes[0].name='target-local-mbox'`, `execute.mboxes[0].profile_parameters={'testKey':'testVal'}`, `execute.page_load=None`.
- 라이브 1: `third_party_id` + `profile_params={testKey:testVal}` 첫 호출 → `status=200`·`tntId`(`.32_0` Adobe 발급)·`offers=[]` (신규 방문자, Profile 데이터 미정착 — 정상).
- 라이브 2: 위 tntId 로 빈 profile_params Re-fetch → 동일 `tntId` 매핑 유지 확인. offers 매칭 여부는 Target UI Activity 활성 상태에 의존(코드 범위 외).
- 디버그 로그 요약: `[Adobe Target DEBUG] profile_test request summary: mode=mboxes mboxes=['target-local-mbox']` 로 mode 가 mboxes 로 출력됨(이전 `mode=pageLoad` 에서 전환 확인).

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

81. 2026-05-12 tntId 클라이언트 생성 제거 — thirdPartyId 중심·Adobe 서버 생성 tntId 재활용

Purpose: Adobe 공식 문서 정합 — Delivery API 는 `tntId` 미전송 시 자동 생성·응답 포함. 백엔드 `build_delivery_id` 가 익명 호출에 `{uuid.hex}.28_0` 형 tntId 를 임의로 만들던 동작을 제거하고, Adobe 가 생성한 `.32_0` 형 tntId 를 그대로 받아 클라이언트에 반환 → sessionStorage 저장 → 다음 호출 재사용 흐름으로 단순화.

Changes:

- `target_delivery_utils.py`: `build_delivery_id` 반환 타입 `tuple[VisitorId, Optional[str]]` → `VisitorId`. `uuid` import 삭제. 둘 다 비었으면 `VisitorId()` 반환, 그 외 `VisitorId(tnt_id=t, third_party_id=tr)`. `t`/`tr` 모두 빈 문자열은 `None` 으로 정규화.
- `target_adobe_router.py`: 
  - `_id_and_cookies` 시그니처 `(response, third_fallback=None)` 로 축소 — `tnt_fallback` 파라미터 삭제. tntId 는 Adobe 응답에서만 추출, 없으면 응답 dict 에서 키 자체 생략.
  - `_get_offers_sync` / `_profile_test_sync` 모두 `delivery_id, tnt_sent = build_delivery_id(...)` 언팩 → `delivery_id = build_delivery_id(...)` 로 변경. `_id_and_cookies` 호출에서 `tnt_sent` 인자 제거.
- `targetSession.ts`: 모듈 docstring 보강(클라이언트 tntId 생성 금지 명시), `LEGACY_AT_TNT_STORAGE_KEY` 폴백 삭제, 반환 타입 `Record<string, string>` 로 단일화. `tntId` 는 sessionStorage 에 값이 있을 때만 payload 에 포함. `thirdPartyId` 자동 생성·`session_id` 자동 생성(`getOrCreateSessionId`) 로직은 사용자 명시 제약("session_id 관련 로직은 변경하지 않음") 따라 그대로 유지.
- `targetOffersFetch.ts`·`targetProfileTest.ts`: 수정 없음 — 두 파일 모두 응답에서 받은 tntId 를 `sessionStorage` 에 저장하는 흐름과 조건부 tntId 전송이 이미 본 구조와 일치.

검증:

- `python -m py_compile target_delivery_utils.py target_adobe_router.py` 성공. uvicorn `--reload` `Application startup complete` 확인.
- `npx tsc --noEmit` 본 변경 3개 파일(`targetSession.ts`·기존 2개 fetch 유틸) 오류 0건(전체 588줄은 사전 `CouponTable.tsx` 오류만).
- grep `uuid4.*28_0`·`\.hex.*28_0`·`tnt_sent` → 코드 0건(log.md 700번대 과거 항목만 잔존).
- 라이브 스모크 1: `/api/target/profile-test` 에 `third_party_id` 만 전송 → 응답 `tntId=9fa0a981-...-...32_0` (Adobe 생성 `.32_0` 형), `thirdPartyId` echo back 확인.
- 라이브 스모크 2: 같은 third_party_id + 위 tntId 재전송 → 동일 tntId 반환(매핑 유지).
- 라이브 스모크 3: `/api/target/offers` `third_party_id` 만으로 호출 → `mbox=target-local-mbox`·`tntId=b7ac2efe-...32_0`·`target_cookie` 정상 반환.

Changed files: backend/adobe_backend/target_backend/target_delivery_utils.py, backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/utils/targetSession.ts, docs/log/log.md

80. 2026-05-12 Adobe Target 백엔드 4파일 전면 리팩터(global mbox 분기·중복 헬퍼·배너 주석 제거, 581→334줄)

Purpose: 과잉 주석·중복 분기·헬퍼 이중화를 제거하고 파일별 역할을 명확히 분리. 기능 변경 없이 코드량을 줄이고 가독성을 높인다. 운영 mbox 는 named(target-local-mbox)만 사용하므로 서버사이드 SDK 경로에서 global mbox pageLoad 분기를 삭제(profile-test 의 `RequestDetails(profile_parameters=...)` pageLoad 만 유지).

Changes:

- `target_config.py` (97→60줄): 배너 주석 삭제. `load_adobe_target_settings`→`_load`, `_assert_adobe_target_ascii`→`_assert_ascii`, `_get_str/_get_int`→`_str/_int` 축약. `AdobeTargetSettings` 정의를 `_load` 위로 이동.
- `target_client.py` (30→19줄): docstring 축약, `client_options` 인라인.
- `target_delivery_utils.py` (67→61줄): `TARGET_GLOBAL_MBOX` 상수 삭제. `offers_from_execute_response`→`offers_from_execute(resp, *, parse_json=False)` 로 통합(option 마다 `source`/`mbox_name`/`type`/`content`/`response_tokens?` 포함). `clear_settings_and_target_client_caches`→`clear_caches`, `api_exception_body_text`→`api_exception_body`, `DEFAULT_TARGET_PAGE_LOAD_URL`→`DEFAULT_PAGE_URL` 로 축약.
- `target_adobe_router.py` (387→194줄): 모듈 docstring 1줄. global mbox if/else 분기 삭제. 중복된 try/except 4계층 → `_handle_error(exc, label) -> NoReturn` 단일 함수로 통합. SDK 옵션 빌더 `_sdk_opts(cookie, hint, session)`·응답에서 ID/쿠키 추출 `_id_and_cookies(response, tnt_fallback, third_fallback)` 공통 헬퍼 도입. `_collect_response_tokens` 함수 제거 → `_profile_test_sync` 안에 list comprehension 으로 인라인. `sent_profile_params`·`execute_page_load`·`page_load_dict` 응답 키 삭제. 함수 순서: 헬퍼 → OffersRequest/sync/endpoint → ProfileTestRequest/sync/endpoint.

검증:

- `python -m py_compile` 4파일 모두 성공
- `import` grep: 삭제 대상(`TARGET_GLOBAL_MBOX`/`sent_profile_params`/`_collect_response_tokens`/`offers_from_execute_response`/`clear_settings_and_target_client_caches`/`api_exception_body_text`/`DEFAULT_TARGET_PAGE_LOAD_URL`/`load_adobe_target_settings`/`_assert_adobe_target_ascii`) 백엔드 전역 0건
- 배너 문자(`═══`/`███`/`────`) `backend/adobe_backend` 0건
- uvicorn `--reload` 최종 `Application startup complete`
- OpenAPI 확인: `/api/target/offers`·`/api/target/profile-test` 두 라우트 + `OffersRequest`/`ProfileTestRequest` 스키마(`tntId`/`thirdPartyId` alias 포함) 정상 등록
- 라이브 스모크: `/api/target/offers` `mbox=target-local-mbox`·`tntId`·`target_cookie` 반환. `/api/target/profile-test` `status=200`·`tntId`·`target_cookie` 반환, `sent_profile_params` 키 부재 확인
- 프론트 `targetOfferParser.ts` 영향 검토: `offers[]` 각 항목에 `source`/`mbox_name` 키가 추가되지만 파서는 `content`·`type` 만 사용하므로 무영향(추가 키 무시)
- 라인 수: 581 → 334 (약 42% 감소)

Changed files: backend/adobe_backend/target_backend/target_config.py, backend/adobe_backend/target_backend/target_client.py, backend/adobe_backend/target_backend/target_delivery_utils.py, backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

79. 2026-05-12 profile-test 패널 응답 중심 리팩터·백엔드 sent_profile_params 제거

Purpose: profile-test 화면을 "요청을 보내고 서버 응답을 그대로 보여주는" 단일 책임으로 축소한다. 프론트 가공 코드(요청값 미러링·매칭 결과 박스·offers 추출 안내 등)를 모두 제거하고, Re-fetch 응답의 `popup:true` 오퍼가 있으면 Alert 1회만 띄운다. 백엔드는 응답에 요청값을 굳이 echo back 하지 않도록 `sent_profile_params` 키를 삭제한다.

Changes:

- `ProfileTestPanel.tsx` (전체 교체, 167줄): TextInput·matchResult 상태·`_extractPopupOffer`·`_showPopup` 명명 변경(`findPopupContent`·`showAlert`)·`PROFILE_PARAMS_TEST_*` 상수 인라인화. 버튼 3개(`Send testVal`/`Send testNotVal`/`Re-fetch (매칭 확인)`)는 공통 `send(profileParams, label, checkPopup)` 콜백 1개로 통합. 응답은 `JSON.stringify(res.data, null, 2)` 로만 표시. 파일 상단 한국어 docstring(rule 6)·신규 함수에 `// profile script test` 표식 유지.
- `target_adobe_router.py`: `_profile_test_sync` 반환 dict 에서 `"sent_profile_params"` 항목 1줄 삭제. 다른 키·예외 흐름·`raw_offers` 추출 로직은 무변경.
- 검증: `python -m py_compile target_adobe_router.py` 성공(uvicorn `--reload` `Application startup complete` 확인). `npx tsc --noEmit` 출력 588줄(직전 베이스라인과 동일, 본 변경 파일 오류 0건; 사전 `CouponTable.tsx` 만 잔존).

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/components/ProfileTestPanel.tsx, docs/log/log.md

78. 2026-05-12 profile-test 응답 offers content 원본(dict|str) 유지·response_tokens 옵션별 부착

Purpose: 프론트 `_extractPopupOffer` 가 `content.popup===true` 를 평가하려면 백엔드가 JSON offer 의 dict content 를 그대로 노출해야 한다. 기존 `offers_from_execute_response` 가 dict 인 content 를 그대로 패스하긴 하지만, source/mbox_name/response_tokens 같은 진단 메타가 빠져 있어 profile-test 전용으로는 부족했다. 운영 `/api/target/offers` 와 `targetProfileTest.ts`·UI 코드는 무변경.

Changes:

- `target_adobe_router.py`: `import json` 추가. `_profile_test_sync` 의 offers 추출을 인라인으로 교체 — `page_load.options` 와 `mboxes[].options` 를 순회해 `{source, type, content, response_tokens?, mbox_name?}` 엔트리를 만든다. `content` 가 문자열이면 `json.loads` 시도 후 실패하면 원본 문자열 유지(JSONDecodeError·ValueError 둘 다 흡수). 출력 dict 의 `"offers"` 가 `raw_offers` 로 교체.
- `/api/target/offers` 및 `offers_from_execute_response` import 는 그대로 유지(라인 115 에서 여전히 사용).
- 검증: `python -m py_compile` 성공. uvicorn `--reload` 가 변경 감지 후 `Application startup complete` 출력. 프론트 미수정으로 `tsc --noEmit` 재실행 불필요.

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

77. 2026-05-12 profile-test 패널: testNotVal 버튼·popup 오퍼 감지·매칭 결과 표시

Purpose: profile-test 화면에서 두 종류 profileParam 값(testVal/testNotVal)을 번갈아 저장한 뒤 Re-fetch 응답의 popup 오퍼를 Alert 으로 띄워 Audience 매칭 동작을 시각화한다. 운영 `/api/target/offers` 및 백엔드는 무변경.

Changes:

- `ProfileTestPanel.tsx`: 버튼 3개(Send testVal / Send testNotVal / Re-fetch)로 재구성. `PROFILE_PARAMS_TEST_VAL`·`PROFILE_PARAMS_TEST_NOT_VAL` 상수 분리. `_extractPopupOffer(offers)` 가 offers 의 `content.popup===true` 오퍼를 찾고(`content` 가 문자열이면 JSON.parse 후 평가), `_showPopup` 이 웹은 `window.alert`, 네이티브는 `Alert.alert` 호출. Re-fetch 시 `matched_audience`/`profile_script`/`matched_value`/`message` 를 추출해 별도 "프로필 매칭 결과" 박스에 출력. 신규 함수 상단에 `// profile script test` 표식 유지.
- 검증: `npx tsc --noEmit` 본 변경 파일 오류 0건(`components/CouponTable.tsx` 사전 오류만 잔존).

Changed files: frontend/adobe_frontend/target_frontend/components/ProfileTestPanel.tsx, docs/log/log.md

76. 2026-05-12 profile script test 엔드포인트·프론트 패널·라우트 추가

Purpose: profileParameters 가 Adobe Target 프로필에 저장되는지(=응답 options[].response_tokens 의 `profile.*` / 동일 tntId 재요청 시 오퍼 변동) 검증할 수 있는 독립 테스트 라인을 추가한다. 운영 `/api/target/offers` 와 클릭 쿠키 로직은 건드리지 않는다.

Changes:

- `target_adobe_router.py`: `ProfileTestRequest`, `_collect_response_tokens`, `_profile_test_sync`, `POST /api/target/profile-test` 엔드포인트 추가 (`RequestDetails(profile_parameters=...)`·`build_delivery_id` 재사용·SDK 옵션 전달·HTTPException 분기 동일 패턴). 각 함수 상단에 `# profile script test` 표식.
- `targetProfileTest.ts` (신규): `testProfileParameters(params)` 가 `/api/target/profile-test` 호출 후 응답의 `tntId`·`target_cookie`·`target_location_hint_cookie` 를 sessionStorage 에 갱신.
- `ProfileTestPanel.tsx` (신규): JSON 입력 + `Send profileParams`/`Re-fetch (확인)` 두 버튼 + 응답 JSON 표시 패널.
- `app/profile-test.tsx` (신규): `/profile-test` 라우트로 패널 노출(홈 `/` 비노출).
- 검증: `python -m py_compile backend/adobe_backend/target_backend/target_adobe_router.py` 성공. `npx tsc --noEmit` 실행 시 본 변경 4개 파일에는 오류 0건(기존 `components/CouponTable.tsx` 등 사전 오류만 잔존).

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/utils/targetProfileTest.ts, frontend/adobe_frontend/target_frontend/components/ProfileTestPanel.tsx, frontend/app/profile-test.tsx, docs/log/log.md

75. 2026-05-11 원격 동기화: Adobe 05-11 일괄 반영·`backend/env/config.dev.json` 제외

Purpose: 2026-05-11 작업분(백엔드 Adobe 모듈·프론트 session/offers·docs/main 01~04·README)을 `origin/main`에 반영한다. DB 접속정보가 포함된 `backend/env/config.dev.json`은 커밋에서 제외한다.

Changes:

- Adobe `target_*`·`app/main`·`targetSession`·`targetOffersFetch` 및 문서 일괄 푸시
- 민감 로컬 설정 파일 미추적 유지

Changed files: README.md, backend/adobe_backend/**, backend/app/main.py, docs/main/01_AT_TEST_PAGE_PRD.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, frontend/adobe_frontend/target_frontend/utils/targetSession.ts (제외: backend/env/config.dev.json)

74. 2026-05-11 Adobe offers parameters 단일화(profileParameters 제거)

Purpose: Custom Audience는 `parameters` 기반이므로 `profile_params` 이중 경로를 제거한다.

Changes:

- `target_adobe_router.py`: `OffersRequest.profile_params` 제거, `RequestDetails`/`MboxRequest`에 `parameters`만 전달
- `targetOffersFetch.ts`: 클릭 쿠키를 `params`로 전송
- `target_delivery_utils.py`: Audience/Profile Script 안내 주석
- `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md` v3.0.3
- 검증: `python -m py_compile` 대상 `.py` 성공; `profile_param` 문자열 grep `backend/adobe_backend`·`frontend/adobe_frontend` 0건; 루트 `npx tsc --noEmit`은 기존 `CouponTable.tsx` 등 프로젝트 전역 오류로 실패(본 변경 `targetOffersFetch.ts`와 무관)

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, backend/adobe_backend/target_backend/target_delivery_utils.py, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

73. 2026-05-11 Adobe Phase0: target_cookie·session_id·profileParameters 분리

Purpose: SDK 문서 권장에 맞춰 `get_offers` 옵션 쿠키·sessionId를 순환하고, Delivery `parameters`와 `profileParameters`를 분리한다.

Changes:

- `target_adobe_router.py`: `OffersRequest`에 `target_cookie`·`target_location_hint`·`session_id`, 응답에 쿠키 dict, `RequestDetails`/`MboxRequest`에 parameters·profile_parameters 분리
- `targetSession.ts`·`targetOffersFetch.ts`: 쿠키·hint·session_id 저장/전송, 클릭 쿠키를 `profile_params`로 전송
- `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md` v3.0.2 HTTP 계약 보강

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/utils/targetSession.ts, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

72. 2026-05-11 Adobe target_backend 경량 리팩터(주석·함수 통합·ASCII 검증을 config로)

Purpose: 동작 유지로 주석·배너·과분리 헬퍼를 줄이고, ASCII 검증을 설정 로드 시점으로 옮긴다.

Changes:

- `target_config.py`: `_get_str`/`_get_int` 통합, `AdobeTargetConfigError`·`_assert_adobe_target_ascii` 이전, docstring 압축
- `target_client.py`: SDK 래퍼만 유지, 검증 제거
- `target_delivery_utils.py`: `extract_id_field`, `TARGET_GLOBAL_MBOX`, 주석·docstring 축소, `is_target_global_mbox` 제거
- `target_debug_utils.py`: 내부 함수명 단축·응답 로그 간소화
- `target_adobe_router.py`: docstring·CAUTION·필드 주석 축소, `AdobeTargetConfigError`를 `target_config`에서 import
- `target_main.py`·`__init__.py`·`adobe_backend/__init__.py`: docstring 압축

Changed files: backend/adobe_backend/target_backend/target_config.py, backend/adobe_backend/target_backend/target_client.py, backend/adobe_backend/target_backend/target_delivery_utils.py, backend/adobe_backend/target_backend/target_debug_utils.py, backend/adobe_backend/target_backend/target_adobe_router.py, backend/adobe_backend/target_backend/target_main.py, backend/adobe_backend/target_backend/__init__.py, backend/adobe_backend/__init__.py, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

71. 2026-05-11 target_delivery_utils VisitorId import 주석 요약 보강

Purpose: JSON `id` 키·생성자 인자 `id=`·타입 `VisitorId`·문서에 클래스명이 없을 수 있음을 import 한곳에 압축 정리한다.

Changes:

- `target_delivery_utils.py` VisitorId import 블록 주석 및 [Dependencies] 한 줄 정리

Changed files: backend/adobe_backend/target_backend/target_delivery_utils.py, docs/log/log.md

70. 2026-05-11 docs/main 04 v3.0.1 JSON 키 id vs import VisitorId 설명

Purpose: Adobe 문서의 `id` 키와 Python `import` 줄의 차이를 문서·코드 주석으로 고정한다.

Changes:

- `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md` v3.0.1 §0.3 및 표 보강(`DeliveryRequest` 인자 `id=`)
- `target_delivery_utils.py` import 블록 주석 보강

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, backend/adobe_backend/target_backend/target_delivery_utils.py, docs/log/log.md

69. 2026-05-11 docs/main 04 v3.0·README·02/03 Adobe 교차 참조 및 VisitorId 주석

Purpose: Adobe Target 설명을 저장소 전역에서 동일 기준으로 찾을 수 있게 하고, SDK 클래스명 `VisitorId`가 JSON `VisitorId`가 아님을 문서·코드에 고정한다.

Changes:

- `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md` v3.0 전면 갱신(offers-only·tntId/thirdPartyId·용어 §0)
- `docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md` §6 Adobe·§7 연관 문서에 04 링크
- `docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md` §4.3 Adobe 프록시·§8 연관에 04 링크
- `docs/main/01_AT_TEST_PAGE_PRD.md` 연관 표 04 설명 보강
- `README.md` 경로 표·Adobe Target 절 추가
- `target_delivery_utils.py` import 상단에 `VisitorId` 고정명 설명 주석
- `target_adobe_router.py` 모듈 설명·`_get_offers_sync` 주석에 VisitorId/`id` 정합
- `app/main.py` CORS 주석을 offers-only에 맞게 수정

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/main/01_AT_TEST_PAGE_PRD.md, README.md, backend/adobe_backend/target_backend/target_delivery_utils.py, backend/adobe_backend/target_backend/target_adobe_router.py, backend/app/main.py, docs/log/log.md

68. 2026-05-11 Adobe Delivery `id` 명명(tntId·thirdPartyId) 및 offers 파이프라인

Purpose: Adobe 문서의 Delivery JSON 필드명과 혼동되던 이름을 정리하고, 단일 웹·비로그인이어도 tntId+thirdPartyId 병행을 코드·주석으로 명시한다.

Changes:

- 백엔드 `target_delivery_utils.py`: `build_delivery_id`로 VisitorId 구성(tntId·thirdPartyId), 응답에서 thirdPartyId 추출
- 백엔드 `target_adobe_router.py`: OffersRequest에 `tntId`/`thirdPartyId` 별칭 수신, 응답 키 `tntId`·`thirdPartyId`
- 백엔드 `target_debug_utils.py`: 요약 로그에 thirdPartyId
- 백엔드 `target_backend/__init__.py`: 의존성 설명에서 구 app.config 제거
- 프론트 `targetSession.ts`·`targetOffersFetch.ts`: sessionStorage 및 요청/응답을 동일 필드명으로 맞춤(레거시 tnt_id 읽기 호환)

Changed files: backend/adobe_backend/target_backend/target_delivery_utils.py, backend/adobe_backend/target_backend/target_adobe_router.py, backend/adobe_backend/target_backend/target_debug_utils.py, backend/adobe_backend/target_backend/__init__.py, frontend/adobe_frontend/target_frontend/utils/targetSession.ts, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, docs/log/log.md

67. 2026-05-08 Adobe offers 엔드포인트 함수명 충돌 해소

Purpose: FastAPI 핸들러 함수명이 SDK 메서드(`client.get_offers`)와 동일해 읽는 사람이 혼동하는 문제를 줄이기 위해 엔드포인트 함수명을 역할 중심으로 분리한다.

Changes:

- `target_adobe_router.py` 엔드포인트 함수명 변경: `get_offers` → `get_offers_endpoint`
- 파일 상단 설명의 Main Functions 항목을 새 함수명 기준으로 동기화

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, docs/log/log.md

66. 2026-05-08 Adobe except 로그 메시지 요약(가독성 중심)

Purpose: Adobe 전용 코드의 except/catch 구문에서 출력되는 문자열 로그를 짧고 일관된 형태로 압축해 빠르게 읽히도록 정리한다.

Changes:

- 백엔드 `target_adobe_router.py`: 예외 로그를 `[AT] offers ...` 형태로 축약(`config invalid`, `URL parse fail`, `API 400`, `API error`, `unexpected error`)
- 백엔드 `target_debug_utils.py`: except 구간 로그/플레이스홀더를 `failed` → `fail`로 간소화(`to_str fail`, `to_dict fail`)
- 프론트 `targetContext.tsx`, `targetApp.tsx`: catch/HTTP 실패 warn 메시지를 `[AT] ... fail` 형태로 통일

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, backend/adobe_backend/target_backend/target_debug_utils.py, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, docs/log/log.md

65. 2026-05-08 Adobe 설정 로드 경로 단순화(app.config 경유 제거)

Purpose: Adobe 전용 설정이 일반 `app.config`를 통해 우회 로드되던 구조를 제거하고, Adobe 모듈이 `target_config`를 직접 참조하도록 단순화한다.

Changes:

- `target_config.py`에 `get_adobe_target_settings()` 캐시 엔트리 포인트 추가(`@lru_cache`)
- `target_client.py`가 `app.config.get_settings().adobe_target` 대신 `get_adobe_target_settings()` 직접 사용
- `target_adobe_router.py`의 기본 mbox 해석을 `get_adobe_target_settings().offer_mbox_name`으로 전환
- `target_delivery_utils.py` 캐시 초기화 대상이 `get_settings.cache_clear()`에서 `get_adobe_target_settings.cache_clear()`로 변경
- `app/config.py`에서 Adobe bridge import/필드/로드 제거, 앱 공통 설정은 `raw`/`db`만 유지

Changed files: backend/adobe_backend/target_backend/target_config.py, backend/adobe_backend/target_backend/target_client.py, backend/adobe_backend/target_backend/target_adobe_router.py, backend/adobe_backend/target_backend/target_delivery_utils.py, backend/app/config.py, docs/log/log.md

64. 2026-05-08 Adobe Target 파일 역할 분리 리팩토링(라우터/디버그/유틸/파서)

Purpose: Adobe 전용 코드 파일 안에 섞여 있던 라우팅/디버그 로그 분석/Delivery 유틸/오퍼 파싱 책임을 기능 기준으로 분리해 유지보수성과 가독성을 높인다.

Changes:

- 백엔드 분리: `target_adobe_router.py`에서 디버그 로그 함수를 `target_debug_utils.py`로, Delivery 공통 함수(방문자 ID·오퍼 파싱·예외 본문·캐시 초기화)를 `target_delivery_utils.py`로 분리
- 백엔드 라우터 정리: 라우터 파일은 요청 모델·엔드포인트·동기 실행 본문 중심으로 경량화하고 분리 유틸 import로 재구성
- 프론트 분리: `targetContext.tsx`에 섞여 있던 offers 파싱/타입을 `utils/targetOfferParser.ts`로 분리
- 프론트 참조 정리: `targetApp.tsx`, `targetImageCarousel.tsx`, `EventPopup.tsx`가 새 파서/타입 모듈을 직접 참조하도록 정리
- 검증: refactor 대상 파일 lint 에러 없음, backend 대상 파일 `python -m py_compile` 성공

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, backend/adobe_backend/target_backend/target_debug_utils.py, backend/adobe_backend/target_backend/target_delivery_utils.py, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/utils/targetOfferParser.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/adobe_frontend/target_frontend/components/targetImageCarousel.tsx, frontend/adobe_frontend/target_frontend/components/EventPopup.tsx, docs/log/log.md

63. 2026-05-08 Adobe Target 전수 점검 후 경량 정리(미사용/중복 제거)

Purpose: Adobe Target 코드 전반을 다시 스캔해 실제 사용되지 않거나 의미가 중복된 helper/호환 코드를 제거해 파일을 더 가볍게 유지한다.

Changes:

- 백엔드 `target_adobe_router.py`: `_TARGET_GLOBAL_MBOX_NAME` 상수와 `_is_target_global_mbox` helper 제거 후 `_get_offers_sync` 분기에서 `"target-global-mbox"` 직접 비교로 인라인화
- 프론트 `targetContext.tsx`: 외부 참조가 없는 `parseAdobeTargetOffer` 호환 export 제거
- 백엔드 `target_client.py`: offers-only 구조와 맞지 않는 `send_notifications` 설명 문구 제거

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, backend/adobe_backend/target_backend/target_client.py, docs/log/log.md

62. 2026-05-08 Adobe Target offers-only 리팩토링(notification/track 제거)

Purpose: Adobe Target 연동을 "클릭 시 쿠키 저장 → get_offers 재조회 → offer 수신 시 팝업" 단일 흐름으로 단순화하기 위해 notification/track 레이어와 프론트 Adobe 전용 config 파일을 제거한다.

Changes:

- 백엔드: `target_adobe_router.py`에서 `TrackRequest`·notifications/track 엔드포인트·관련 동기 함수 및 notification 전용 디버그 분기 제거, `OffersRequest`는 `visitor_id` 제거 후 `profile_params` 유지, 응답에서 `visitor_third_party_id` 제거
- 백엔드 설정: `target_config.py`에서 `notif_mbox_name`/`track_mbox_name` 처리 제거, `backend/env/config.adobe*.json`을 `offer_mbox_name`만 남기도록 정리
- 프론트: `targetTrack.ts`, `frontend/env/config.adobe.json`, `frontend/env/config.adobe.example.json`, `frontend/scripts/ensureAdobeEnv.cjs` 삭제 및 `package.json` postinstall 제거
- 프론트 흐름: `ImageGallery` 클릭을 `setClickCookie` + `refreshOffers`로 단순화, `targetImageCarousel` track 호출 제거, `targetOffersFetch`를 offers-only 요청/`tnt_id` 저장으로 정리, `loadConfig`에서 Adobe 별도 config 병합 제거
- 검증: `npx tsc --noEmit` 실행 시 기존 `CouponTable.tsx` 타입 에러만 확인(이번 변경 파일 관련 에러 없음), 실행 중 uvicorn 로그에서 `/api/target/offers` 200 및 재시작 후 startup 오류 없음 확인

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, backend/adobe_backend/target_backend/target_config.py, backend/env/config.adobe.json, backend/env/config.adobe.example.json, backend/app/main.py, frontend/components/ImageGallery.tsx, frontend/adobe_frontend/target_frontend/components/targetImageCarousel.tsx, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, frontend/adobe_frontend/target_frontend/utils/targetSession.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/app/_layout.tsx, frontend/utils/loadConfig.ts, frontend/package.json, docs/log/log.md (deleted: frontend/adobe_frontend/target_frontend/utils/targetTrack.ts, frontend/env/config.adobe.json, frontend/env/config.adobe.example.json, frontend/scripts/ensureAdobeEnv.cjs)

61. 2026-05-08 Target notification 후 `refreshOffers`·`profile_params`·offers fetch 공통화

Purpose: 갤러리 클릭 시 `send_notifications` 로 프로필 파라미터 반영 후 같은 세션에서 `get_offers` 를 이어 호출해 새로고침 없이 event-popup 오퍼를 받을 수 있게 한다.

Changes:

- 백엔드 `TrackRequest.profile_params` → SDK `Notification.profile_parameters`
- 프론트 `sendAdobeTargetTrack` async·`onAfterTrack`·`targetOffersFetch`·Context `refreshOffers`·갤러리 `await` 연결

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, frontend/adobe_frontend/target_frontend/utils/targetTrack.ts, frontend/adobe_frontend/target_frontend/utils/targetOffersFetch.ts, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/components/ImageGallery.tsx, frontend/context/AdobeTargetContext.tsx, docs/log/log.md

60. 2026-05-08 Adobe `notif_mbox_name`·`target-click-mbox`·라우터 `send_notifications` 명명 정합

Purpose: 설정 키를 `track_mbox_name` → `notif_mbox_name`, 기본·샘플 mbox 값을 `target-click-mbox` 로 통일하고, HTTP 핸들러명을 `get_offers` 와 대칭되게 `send_notifications` / `send_notifications_legacy` 로 바꾼다. 구 JSON 키·값은 로더 폴백으로 유지한다.

Changes:

- `AdobeTargetSettings.notif_mbox_name`, `target_config`·`target_adobe_router`·에러 코드 `adobe_target_send_notifications_failed`
- 프론트 `AdobeTargetConfig.notif_mbox_name`, `targetTrack.ts`, 예시·로컬 `config.adobe.json`
- 문서 04 v2.8

Changed files: backend/adobe_backend/target_backend/target_config.py, backend/adobe_backend/target_backend/target_adobe_router.py, backend/env/config.adobe.json, backend/env/config.adobe.example.json, frontend/utils/loadConfig.ts, frontend/adobe_frontend/target_frontend/utils/targetTrack.ts, frontend/adobe_frontend/target_frontend/components/targetImageCarousel.tsx, frontend/env/config.adobe.json, frontend/env/config.adobe.example.json, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

59. 2026-05-08 Target 클릭 API `POST /api/target/notifications` 권장·`/track` 레거시 병행

Purpose: 브라우저가 URL에 `/track` 이 포함된 요청을 광고·프라이버시 필터로 차단하는 사례에 대비해 동일 본문의 `POST /api/target/notifications` 를 두고 프론트는 이 경로로 호출한다.

Changes:

- 백엔드: `_track_click_route` 공유·`/target/notifications`·기존 `/target/track` 유지
- 프론트: `targetTrack.ts` URL 변경·성공/실패 `console` 보강
- 문서 04 v2.7·`app/main.py` 주석

Changed files: backend/adobe_backend/target_backend/target_adobe_router.py, backend/app/main.py, frontend/adobe_frontend/target_frontend/utils/targetTrack.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

58. 2026-05-08 갤러리 썸네일 클릭 시 Target track 전송·`sendAdobeTargetTrack` 공통화

Purpose: track 은 기존에 캐러셀 `goNext` 에만 있어 갤러리만 클릭하면 `click-tracking-mbox` 요청이 없었다. 갤러리에서도 동일 API를 호출하고 fetch 본문은 유틸로 통일한다.

Changes:

- `utils/targetTrack.ts` 의 `sendAdobeTargetTrack`
- `targetImageCarousel` 은 유틸 호출로 전환
- `ImageGallery` 웹에서 `clickSource=gallery-thumb`, `gallerySlot` 과 함께 track

Changed files: frontend/adobe_frontend/target_frontend/utils/targetTrack.ts, frontend/adobe_frontend/target_frontend/components/targetImageCarousel.tsx, frontend/components/ImageGallery.tsx, docs/log/log.md

57. 2026-05-08 Target offers/track에 `clickEvent*` 쿠키 평탄 params 전달

Purpose: 브라우저 `document.cookie`의 `clickEvent{n}` 을 서버 프록시 Target 요청 `parameters`에 실어 Audience·프로필 평가에 활용 가능하게 한다.

Changes:

- `getClickEventCookieParams()` 추가(이름 패턴 `clickEvent`+숫자, 값은 문자열)
- `TargetOffersPreload` offers 본문에 `params` 병합(쿠키 있을 때만)
- `targetImageCarousel` track `params`에 `clickButton`과 병합

Changed files: frontend/adobe_frontend/target_frontend/utils/clickCookie.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/adobe_frontend/target_frontend/components/targetImageCarousel.tsx, docs/log/log.md

56. 2026-05-08 Adobe Target event-popup·click 쿠키(실행기-only)·팝업 Context

Purpose: Target Audience가 쿠키·오퍼를 판단하고, 프론트는 `clickEvent*` 저장·offers 파싱·`event-popup` Modal 렌더만 수행한다.

Changes:

- `clickCookie.ts`, `EventPopup.tsx`, `targetContext`(event-popup state·`parseAdobeTargetOffersPayload`·`useAdobeTargetEventPopup`)
- `targetApp` 프리로드에서 캐러셀·팝업 오퍼 동시 반영 및 디버그 로그
- `ImageGallery` 클릭 시 `setClickCookie(index+1)`; `index.tsx`에서 팝업 연결
- 브리지 `@/components/EventPopup`; Context는 기존 `export *`로 훅 재노출

Changed files: frontend/adobe_frontend/target_frontend/utils/clickCookie.ts, frontend/adobe_frontend/target_frontend/components/EventPopup.tsx, frontend/adobe_frontend/target_frontend/context/targetContext.tsx, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/components/EventPopup.tsx, frontend/components/ImageGallery.tsx, frontend/app/index.tsx, docs/log/log.md

55. 2026-05-08 Adobe `config.adobe.json` Git 제외·example 템플릿·프론트 postinstall

Purpose: 저장소에는 Adobe 자격·mbox 민감 설정을 올리지 않고 `config.adobe.example.json` 만 유지한다. 런타임 `config.adobe.json` 은 로컬·서버에서 생성한다.

Changes:

- `.gitignore`: `backend/env/config.adobe.json`, `frontend/env/config.adobe.json` 추가
- `backend/env/config.adobe.example.json`, `frontend/env/config.adobe.example.json` 추가(플레이스홀더)
- `frontend/scripts/ensureAdobeEnv.cjs`, `package.json` postinstall
- `target_config` 예외 메시지·문서 04 v2.6·코드 주석 정합

Changed files: .gitignore, backend/env/config.adobe.example.json, frontend/env/config.adobe.example.json, frontend/scripts/ensureAdobeEnv.cjs, frontend/package.json, frontend/package-lock.json, backend/adobe_backend/target_backend/target_config.py, target_client.py, target_adobe_router.py, __init__.py, backend/app/config.py, frontend/utils/loadConfig.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md (Git 추적 해제: backend·frontend `env/config.adobe.json`; push `origin/main` 4bb8bb4)

54. 2026-05-07 Adobe config.adobe.json 중첩(administration/mboxes) 로드 수정·프론트 mboxes 정규화

Purpose: `backend/env/config.adobe.json` 을 `administration`·`mboxes` 로 나눈 경우에도 SDK 자격·mbox 기본값이 채워지게 한다. 프론트 `frontend/env/config.adobe.json` 이 `mboxes` 만 가질 때 `config.adobe_target.*` 이 비지 않게 한다.

Changes:

- backend/adobe_backend/target_backend/target_config.py: `_str_admin_or_root`, `_str_mboxes_or_root`, `_int_timeout_ms` 및 `load_adobe_target_settings` 반영
- frontend/utils/loadConfig.ts: `normalizeAdobeTarget`
- docs/main/04 v2.5, docs/log

Changed files: backend/adobe_backend/target_backend/target_config.py, frontend/utils/loadConfig.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

53. 2026-05-07 Adobe 설정 경로 명시·프론트 BRIDGE 주석 통일(backend/env·frontend/env config.adobe.json)

Purpose: 로더·에러·로그에 `backend/env/config.adobe.json`·`frontend/env/config.adobe.json` 경로를 일관되게 박고, 앱 일반 파일(`app/`, `utils/loadConfig`, 브리지)에서 어도비 패키지·설정 주입 구간을 `[BRIDGE · Adobe]` 구분선으로 명확히 한다.

Changes:

- backend: `target_config._adobe_config_path` 주석·예외 메시지, `target_client`·`target_adobe_router` 경로 안내
- frontend: `loadConfig.ts`, `app/_layout.tsx`, `app/index.tsx`, 브리지 3종, `targetApp.tsx`, `targetImageCarousel.tsx` 주석 보강

Changed files: backend/adobe_backend/target_backend/target_config.py, target_client.py, target_adobe_router.py, frontend/utils/loadConfig.ts, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/components/ImageCarousel.tsx, frontend/context/AdobeTargetContext.tsx, frontend/utils/adobeTargetSession.ts, frontend/adobe_frontend/target_frontend/app/targetApp.tsx, frontend/adobe_frontend/target_frontend/components/targetImageCarousel.tsx, docs/log/log.md

52. 2026-05-07 app/config·main 어도비 BRIDGE 주석 보강(위치·구분선)

Purpose: `app/` 는 앱 코어로 두고, `adobe_backend` 패키지를 쓰는 임포트·필드·함수 호출·CORS·라우터 등록 구간에 [BRIDGE · Adobe] 구분선과 파일 경로·심볼·효과를 명시한다.

Changes:

- backend/app/config.py: 임포트 블록 전후 구분선, Settings.adobe_target 필드, load_adobe_target_settings() 호출 주석
- backend/app/main.py: 임포트·register_target_routes·POST CORS 주석, 모듈 설명 정리

Changed files: backend/app/config.py, backend/app/main.py, docs/log/log.md

51. 2026-05-07 Adobe config.adobe.json 을 backend/env·frontend/env 로 이동

Purpose: Adobe 공통 설정 파일을 프로젝트 루트가 아닌 각 `env` 폴더에 두어 `config.dev.json` / `config.prd.json` 과 같은 위치에서 관리한다.

Changes:

- backend: `config.adobe.json` → `backend/env/config.adobe.json`, `target_config._adobe_config_path` 및 관련 문서·에러 메시지 경로 갱신
- frontend: `config.adobe.json` → `frontend/env/config.adobe.json`, `loadConfig.ts` 임포트 및 주석 갱신
- docs/main/04 v2.4, docs/log

Changed files: backend/env/config.adobe.json (신규 위치), backend/adobe_backend/target_backend/target_config.py, target_client.py, target_adobe_router.py, target_backend/__init__.py, backend/app/config.py (삭제: backend/config.adobe.json), frontend/env/config.adobe.json (신규 위치), frontend/utils/loadConfig.ts (삭제: frontend/config.adobe.json), docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

50. 2026-05-07 Adobe Target 백·프 패키지 통합 및 config.adobe.json 분리

Purpose: Adobe Target 관련 백엔드·프론트 코드를 전용 패키지로 모으고, dev/prd와 무관한 Adobe 설정은 `config.adobe.json` 한 곳에서 관리한다. 기존 `@/context`·`@/components/ImageCarousel` 등 경로는 브리지 파일로 유지한다.

Changes:

- backend: `adobe_backend/target_backend/` 에 `target_adobe_router.py`, `target_client.py`, `target_config.py`, `target_main.py` 추가. `backend/config.adobe.json` 신설, `backend/env` 에서 `adobe_target` 제거. `app/main.py`·`app/config.py` 는 브리지 주석과 함께 패키지를 호출.
- frontend: `adobe_frontend/target_frontend/` 에 `app/targetApp.tsx`, `context/targetContext.tsx`, `utils/targetSession.ts`, `components/targetImageCarousel.tsx` 추가. `frontend/config.adobe.json` 신설, `frontend/env` 에서 `adobe_target` 제거. `loadConfig` 병합. `tsconfig` 에 `@adobe/*` 별칭. 레거시 `ImageCarousel`·`AdobeTargetContext`·`adobeTargetSession` 은 재노출 브리지.
- docs/main/04 v2.3, docs/log 갱신

Changed files: backend/adobe_backend/**, backend/config.adobe.json, backend/app/config.py, backend/app/main.py, backend/env/config.dev.json, backend/env/config.prd.json (삭제: backend/app/routers/target_adobe.py, backend/app/target_client_adobe.py), frontend/adobe_frontend/**, frontend/config.adobe.json, frontend/utils/loadConfig.ts, frontend/tsconfig.json, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/components/ImageCarousel.tsx, frontend/context/AdobeTargetContext.tsx, frontend/utils/adobeTargetSession.ts, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

49. 2026-05-07 Adobe Target 백엔드 mbox 기본값 config 정합(offer_mbox_name·track_mbox_name·Pydantic Field)

Purpose: 프론트 `frontend/env` 의 `adobe_target.offer_mbox_name`·`track_mbox_name` 과 동일 키를 백엔드 `backend/env` 에 두고, API 요청 JSON 에서 `mbox_name` 을 생략할 때도 동일 기본값이 쓰이도록 한다. 라우터 Pydantic 모델의 하드코딩 기본값을 제거하고 `Field(default_factory=...)` 로 `get_settings().adobe_target` 을 참조한다.

Changes:

- backend/app/config.py: `AdobeTargetSettings` 에 `offer_mbox_name`·`track_mbox_name` 필드 추가. `load_app_config` 에서 `_adobe_target_str` 후 빈 문자열이면 각각 `target-global-mbox`·`click-tracking-mbox` 폴백.
- backend/env/config.dev.json, backend/env/config.prd.json: `adobe_target` 에 `offer_mbox_name`·`track_mbox_name` 추가(현행 프론트와 동일: target-local-mbox + click-tracking-mbox).
- backend/app/routers/target_adobe.py: `_default_offer_mbox_name_from_settings` / `_default_track_mbox_name_from_settings` 및 `OffersRequest`·`TrackRequest` 의 `mbox_name` 을 `Field(default_factory=...)` 로 변경. 모듈 docstring 보강.
- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: v2.2 — §4.1·§5.1·§7·§9·문서 이력 갱신.
- docs/log/log.md 업데이트

Changed files: backend/app/config.py, backend/env/config.dev.json, backend/env/config.prd.json, backend/app/routers/target_adobe.py, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

48. 2026-05-07 Adobe Target 1차 리팩토링(04 v2.1 런타임·track 응답, 진단 parse_execute 분기)

Purpose: 실제 진단 로그 기준으로 런타임 6단계를 문서에 고정하고, `send_notifications` 응답에서 `execute` 가 비는 것이 정상임을 명시한다. `AT_DEBUG_DELIVERY` 출력에서 track 경로가 `execute is None` WARNING 으로 오해되지 않게 `_at_debug_log_response(..., parse_execute=False)` 분기로 정리한다.

Changes:

- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: §2.4 런타임 순서·§2.5 offers/track Delivery 형태·§5.5 진단 로그 분기·문서 이력 v2.1
- backend/app/routers/target_adobe.py: `_at_debug_log_response` 에 `parse_execute` 키워드 인자, `track_click` 에서 `False` 전달, 응답 첫 줄에 `edge_host`, 진단 주석·중복 import 정리
- docs/log/log.md 업데이트

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, backend/app/routers/target_adobe.py, docs/log/log.md

47. 2026-05-07 docs/main 04 v2.0 Adobe Target 가이드 재작성·PRD 연관 문서(04) 행 추가

Purpose: 히스토리·로그 대응표·코드 배너 규칙 장문 등 운영 설명에 불필요한 부분을 줄이고, 01~03과 같이 번호·단락 중심으로 읽기 쉽게 정리한다. PRD 연관 문서 표에 04를 넣어 찾기 쉽게 한다.

Changes:

`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: §0·§7(로그표)·§9(버전 누적) 제거, mermaid·설정·백엔드·프론트·HTTP·클릭 필드 용도·체크리스트·연관 문서로 재구성(v2.0)

`01_AT_TEST_PAGE_PRD.md`: §7 연관 문서에 04 한 줄, 변경 이력 1.3

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/main/01_AT_TEST_PAGE_PRD.md, docs/log/log.md

46. 2026-05-07 docs/main 04 v1.6 Delivery 클릭 알림 용도(6.3)·tokens 한계(6.4)·로그 40~45·코드 정합

Purpose: `AT_DEBUG_DELIVERY`·ApiClient CAUTION·프론트 `adobe_target` mbox 설정 등 누락된 구현을 04에 반영하고, Adobe에 클릭을 알릴 때의 요청/응답 필드 용도와 `tokens`/eventToken 이슈를 이식 문서에 포함한다.

Changes:

04: §2.2 OpenAPI 주의, §3.2 프론트 `adobe_target`, §4.2 진단 행, §5.3·5.5·5.6·§6.1 정합, §6.3~6.4 신설(클릭 알림 용도 표·tokens 개선안), §7 로그 40~45, §8 체크리스트 15~18, v1.6

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

45. 2026-05-07 Adobe Target mbox 이름 frontend/env config 로 분리(offer=target-local-mbox·track=click-tracking-mbox)

Purpose: 프론트의 mbox 이름 하드코딩을 사용자 룰 #2.3.4(상수·설정 분리) 에 맞춰 환경별 JSON 설정으로 옮긴다. offers 는 named mbox(`target-local-mbox`)로, track 은 현행 `click-tracking-mbox` 분리 유지(사용자 선택 split). 백엔드 라우터의 `_is_target_global_mbox` 분기가 이미 자동 라우팅하므로 백엔드 코드 변경은 없음(`target-global-mbox`만 pageLoad 로 강제, 그 외는 execute.mboxes 로 송신).

⚠ Adobe 어드민 선행 작업: `target-local-mbox` 이름의 location 에 Activity 를 매칭(Form-based)하고 Live 로 발행해야 응답 옵션이 채워진다. 어드민에 해당 mbox 가 없거나 Activity 가 Draft/Inactive 면 응답은 200 OK + `execute.mboxes count=0` 또는 `options_count=0` 으로 떨어진다(43/44번 진단 로그로 확인 가능).

Changes:

- frontend/env/config.dev.json, frontend/env/config.prd.json: `adobe_target` 블록 추가 — `offer_mbox_name`, `track_mbox_name` 두 키. dev/prd 모두 같은 값으로 시작하되 환경별 변경 여지 확보.
- frontend/utils/loadConfig.ts: `AdobeTargetConfig` 인터페이스 추가(BEGIN/END 배너), `AppConfig.adobe_target: AdobeTargetConfig` 필수 필드로 추가, 파일 docstring에 AT 키 안내 추가.
- frontend/app/_layout.tsx: offers fetch 의 `mbox_name` 을 `config.adobe_target.offer_mbox_name` 로 변경. BEGIN 배너 주석 갱신(글로벌→named mbox 전환 시 백엔드 자동 라우팅 명시).
- frontend/components/ImageCarousel.tsx: track fetch 의 `mbox_name` 을 `config.adobe_target.track_mbox_name` 로 변경. BEGIN 배너 주석 갱신.
- 백엔드 라우터/모델 변경 없음(현행 분기 그대로 동작).
- docs/log/log.md 업데이트

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, frontend/utils/loadConfig.ts, frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, docs/log/log.md

44. 2026-05-07 Adobe Target 진단 로그 보강(request 요약 1줄·response.to_dict() 분할 덤프·track 엔드포인트 동일 적용)

Purpose: named mbox 실험(`target-global-mbox` 외 임의 이름)·track 디버깅 시 한눈에 보이도록 진단 로그를 보강한다. 사용자 룰을 따라 ApiClient/Configuration 직접 인스턴스화는 일체 사용하지 않고(42번 함정 회피), `delivery_request.to_str()`/`resp_obj.to_dict()` 인스턴스 메서드만 사용한다.

배경 정리:
- `target-global-mbox` 만 Adobe 예약어이고 `execute.mboxes` 배열 입력 금지(36번 NoGlobalMbox 400). 임의의 named mbox 이름(`target-local-mbox`, `at-hero-mbox` 등)은 자유롭게 사용 가능하며, 어드민에서 그 이름의 mbox에 Activity가 매칭되어 있어야만 응답 옵션이 채워진다.
- 우리 라우터(`_get_offers_sync`)는 이미 `_is_target_global_mbox` 분기로 `pageLoad`/`mboxes` 자동 라우팅 중이므로, 프론트의 `mbox_name`만 바꿔 named mbox 실험 가능(코드 변경 0줄).

Changes:

- backend/app/routers/target_adobe.py:
  - `_at_debug_request_summary(delivery_request)` 추가 — 전송 모드(`pageLoad`/`mboxes`/`notifications`)·mbox 이름(s)·page_url·tntId/thirdPartyId·property_token을 한 줄로 추출
  - `_at_debug_log_chunked(label, kind, full_str)` 분할 출력 공용 헬퍼 도입(중복 제거)
  - `_at_debug_log_request` 시작에 요약 1줄 출력 후 `to_str()` 분할
  - `_at_debug_log_response` 끝에 `resp_obj.to_dict()` 전체 분할 출력 추가(meta·edge_host·client·trace 등 추가 단서 확보)
  - `_track_click_sync` 의 SDK 호출 직전·직후에도 `_at_debug_log_request("track_click", ...)` / `_at_debug_log_response("track_click", ...)` 호출 추가
  - 환경변수 토글(`AT_DEBUG_DELIVERY=1`) 동작 유지
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

43. 2026-05-07 Adobe Target offers 빈 배열 진단 로그 재도입(요청 to_str 분할·응답 page_load.options/mboxes 풀이)

Purpose: `LocationParseError`가 사라진 뒤에도 `/api/target/offers` 응답의 `offers`가 빈 배열로 들어와, 요청·응답 본문을 코드 근거로 진단할 수 있게 토글 가능한 임시 로그를 다시 둔다. 단, 42번에서 잡았던 함정(`ApiClient()`/`Configuration()` 무인자 인스턴스화 → `TypeWithDefault._default` 잠김 → urllib3 호스트 파싱 실패)은 절대 재발하지 않게 ApiClient/Configuration 직접 사용 없이 인스턴스 메서드(`to_str()`)와 SDK가 돌려준 응답 객체의 속성 접근만 사용한다.

진단 포인트(우리 라우터 특성 반영):
- 우리는 `mbox_name == "target-global-mbox"` 일 때 `execute.pageLoad`(RequestDetails+url)로 보낸다(36번 NoGlobalMbox 회피). 따라서 응답 오퍼는 `response.execute.page_load.options` 에 실린다. `execute.mboxes` 가 비어 있는 것은 정상이며 그것만 보면 오진하기 쉽다.
- 글로벌 mbox 외 케이스에서는 `execute.mboxes[*].options` 에 실린다.
- 두 경우 모두 옵션이 0이면 (1) Activity 미활성, (2) Audience 미일치, (3) at.js property/Workspace 권한 분리, (4) 프리뷰 토큰 없음/만료, (5) `target-global-mbox` 가 활성화 mbox 가 아닌 환경 등 가능성이 있다.

Changes:

- backend/app/routers/target_adobe.py:
  - `_at_debug_log_request(label, delivery_request)` 추가 — `delivery_request.to_str()`을 3000자씩 분할 로깅(요청 mbox·params·visitorId·_property 등 한 번에 확인).
  - `_at_debug_log_response(label, sdk_response)` 추가 — `response.status`/`request_id`/`client`, `execute.page_load.options`(글로벌 mbox), `execute.mboxes[*].options`(그 외), `prefetch` 존재 여부를 풀어서 로깅. 옵션은 처음 3~5개 미리보기로 잘라 출력.
  - `_get_offers_sync` 의 SDK 호출 직전·직후 두 곳에 호출 추가. 환경변수 `AT_DEBUG_DELIVERY=1` 일 때만 출력(기본 OFF).
  - `logger`/`router` 정의를 디버그 헬퍼 위로 이동(가독성).
- 42번 CAUTION 주석 유지(인자 없는 ApiClient/Configuration 직접 인스턴스화 금지). 본 진단은 그 규칙을 준수.
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

42. 2026-05-07 Adobe Target LocationParseError 원인(ApiClient TypeWithDefault 메타클래스) 진단 및 디버그 코드 제거

Purpose: 41번에서 추가한 디버그 코드(`_AtDebugApiClient().sanitize_for_serialization(...)`)가 도리어 `urllib3.exceptions.LocationParseError: Failed to parse: '.tt.omtrdc.net', label empty or too long` 를 유발한다는 사실을 정확히 파악해 제거한다. 디버그 출력 자체에서 `_property` → `"property"` JSON 키 매핑은 정상으로 확인되었으므로 진단 목적은 달성됐다.

원인(코드 근거):
- `delivery_api_client/configuration.py` 의 `Configuration` 은 메타클래스 `TypeWithDefault` 사용. `__call__` 이 `cls._default is None` 일 때만 kwargs로 인스턴스화하고, 이후 호출은 무조건 `copy.copy(cls._default)` 를 반환(=새 kwargs 무시).
- `Configuration.__init__` 의 디폴트 host 시그니처가 `host="https://.tt.omtrdc.net"`(빈 client 자리). 즉 인자 없이 `Configuration()`을 처음 만든 측이 잠긴다.
- 우리가 추가한 `_AtDebugApiClient()` 가 인자 없이 `ApiClient()` → `Configuration()` 을 호출 → 위 디폴트 host로 `cls._default` 가 잠김.
- 이후 SDK가 정상 host로 `Configuration(host="https://<client>.tt.omtrdc.net")` 을 호출해도 메타클래스가 kwargs를 무시 → host=`https://.tt.omtrdc.net` → urllib3 idna에서 첫 라벨 빈 호스트 거부.
- 디버그 추가 이전에는 Adobe API에서 정상적으로 400(`global mbox not allowed`/`visitorId required`)이 돌아왔다는 사실이 본 가설과 정합.

Changes:

- backend/app/routers/target_adobe.py: 41번에서 추가한 디버그 블록 전체 제거 — `_at_debug_log_delivery` 헬퍼·`_at_debug_enabled`·`_AT_DEBUG_ENV`·`_at_debug_os` import·`_at_debug_json` import·`_AtDebugApiClient` import 모두 삭제. `_get_offers_sync`/`_track_click_sync` 내 호출부 2곳 제거. 동일 함정 재발 방지용 CAUTION 주석 추가(인자 없는 `ApiClient()`/`Configuration()` 직접 인스턴스화 금지·직렬화 검증은 `delivery_request.to_dict()` 인스턴스 메서드 사용)
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

41. 2026-05-07 Adobe Target DeliveryRequest.property 직렬화 검증용 디버그(AT_DEBUG_DELIVERY 토글)

Purpose: `DeliveryRequest(_property=ModelProperty(...))` 매핑 의심을 코드 근거로 검증할 수 있게 임시 디버그 로그를 추가한다. delivery_api_client 소스 검증 결과(attribute_map['_property']='property', api_client.sanitize_for_serialization 가 attribute_map[attr]을 JSON 키로 사용) `_property` 키워드는 정상 매핑이지만, `to_str()`은 to_dict()를 통해 raw attr 키(`_property`)를 노출하므로 오인 소지가 있다. 이를 분리해 보여주는 헬퍼를 둔다.

Changes:

- backend/app/routers/target_adobe.py: 임시 디버그 헬퍼 `_at_debug_log_delivery(label, delivery_request)` 추가. 환경변수 `AT_DEBUG_DELIVERY=1` 일 때만 출력. (1) `delivery_request._property` 값, (2) `to_str()`(raw attr keys), (3) `ApiClient().sanitize_for_serialization(...)` JSON(실제 POST body, `property` 키)을 함께 로깅. `_get_offers_sync` / `_track_click_sync` 의 SDK 호출 직전에 호출.
- 신규 import: `json`(별칭 `_at_debug_json`), `delivery_api_client.api_client.ApiClient`(별칭 `_AtDebugApiClient`), `os`(별칭 `_at_debug_os`, `noqa: E402`)
- 필요 시 환경변수 unset 또는 헬퍼/호출부 제거로 손쉽게 원복 가능
- docs/log/log.md 업데이트

Changed files: backend/app/routers/target_adobe.py, docs/log/log.md

40. 2026-05-07 Adobe Target autoPlay 미동작 수정(파서 lenient·진단 로그·MIN 가드 제거)

Purpose: 사용자가 Adobe Target 어드민에서 오퍼를 적용했지만 자동 재생이 동작하지 않는 이슈를 잡는다. 원인은 (1) parseAdobeTargetOffer가 `autoPlayMs`를 number 타입만 수용해 어드민에서 흔히 들어오는 문자열 숫자(`"3000"`)를 거름, (2) 컴포넌트에 `MIN_AUTO_PLAY_MS=500` 하한이 있어 짧은 주기를 무시함, (3) 자동 재생 등록·스킵 여부를 콘솔에서 확인할 수 없어 디버깅이 어려움 — 세 가지였다.

Changes:

- frontend/context/AdobeTargetContext.tsx: parseAdobeTargetOffer/_coerceOfferContent 강화 — _toPositiveNumber/_toNonEmptyString 헬퍼로 숫자/문자형 모두 수용, content가 이중 인코딩 JSON 문자열인 경우도 한 단계 더 안전 파싱
- frontend/components/ImageCarousel.tsx: autoPlay useEffect를 사용자 요청 시그니처(`if (!ms || ms <= 0) return; setInterval(() => { if (!isAnimating) goNext(); }, ms)`, deps: `[adobeOffer?.autoPlayMs, adobeOffer, isAnimating, goNext]`)로 교체. ref 스캐폴딩(`goNextRef`/`isAnimatingRef`)·`MIN_AUTO_PLAY_MS` 상수·`useRef` import 제거. 등록/스킵 시점 진단 console.log 추가
- docs/log/log.md 업데이트

Changed files: frontend/context/AdobeTargetContext.tsx, frontend/components/ImageCarousel.tsx, docs/log/log.md

39. 2026-05-07 Adobe Target 코드 시각 구분(전용/혼합 배너)·파일명 접두사 미적용 정책

Purpose: Adobe Target 관련 코드가 어디에 들어가 있는지 한눈에 보이도록 시각 표기 규칙을 통일한다. 사용자 요청의 `at_1_`/`at_2_` 접두사는 Expo Router(`_layout.tsx`/`index.tsx`)·uvicorn 엔트리(`main.py`)·env 로더(`config.{APP_ENV}.json`) 등 프레임워크/규약 때문에 적용 시 동작이 깨지므로, 접두사 변경 대신 코드 내 굵은 BEGIN/END 배너 + 전용 파일 상단 배너로 시각 구분을 대체한다.

Changes:

- 전용 파일 상단 배너 1줄 추가(파일 docstring 직후): backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, frontend/utils/adobeTargetSession.ts, frontend/context/AdobeTargetContext.tsx
- 혼합 파일 AT 블록을 ▼▼▼ ADOBE TARGET — BEGIN: <설명> ▼▼▼ / ▲▲▲ ADOBE TARGET — END: <설명> ▲▲▲ 배너로 감쌈: backend/app/main.py(라우터 import·router include·CORS POST 인라인 주석), backend/app/config.py(_adobe_target_str·AdobeTargetSettings·load_app_config AT 매핑·Settings.adobe_target 인라인 주석), frontend/app/_layout.tsx(imports·Provider·오퍼 fetch), frontend/app/index.tsx(Context import·useAdobeTargetOffer·ImageCarousel adobeOffer prop), frontend/components/ImageCarousel.tsx(imports·상수·prop·트래킹 fetch·autoPlay·버튼 라벨)
- 각 적용 파일 docstring에 "Adobe Target 관련 코드 블록은 ▼▼▼/▲▲▲ 배너로 명시한다" 안내 문구 추가
- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: 0절 신설(파일 분류·표기 규칙·현재 적용 현황·파일명 접두사 미적용 정책), 7절 대응표 39행, 9절 v1.5
- 파일명 접두사(at_1_/at_2_)는 적용하지 않음(Expo Router·uvicorn·env 로더 규약 보호)

Changed files: backend/app/main.py, backend/app/config.py, backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/components/ImageCarousel.tsx, frontend/utils/adobeTargetSession.ts, frontend/context/AdobeTargetContext.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

38. 2026-05-07 Adobe Target 오퍼 Context·ImageCarousel adobeOffer prop·autoPlay

Purpose: `_layout`이 받아온 Adobe Target 오퍼를 React Context로 묶어 `app/index.tsx`가 읽고, `ImageCarousel`이 `adobeOffer` prop으로 버튼 라벨·자동 재생을 동적으로 적용하게 만든다. 응답 `offers[].content`(객체 또는 JSON 문자열)는 `parseAdobeTargetOffer`에서 안전 파싱한다.

Changes:

- frontend/context/AdobeTargetContext.tsx (신규): `AdobeTargetOffer`·`AdobeTargetProvider`·`useAdobeTargetOffer`·`useAdobeTargetSetOffer`·`parseAdobeTargetOffer` (offers[].content 객체/JSON 문자열 안전 파싱)
- frontend/app/_layout.tsx: `RootLayout`을 `AdobeTargetProvider`로 감싸고 `RootLayoutInner`에서 fetch — 성공 시 `parseAdobeTargetOffer` 결과를 `setAdobeTargetOffer`로 Context 저장, sessionStorage(tnt_id/visitor_third_party_id)는 기존 동작 유지
- frontend/app/index.tsx: `useAdobeTargetOffer()`로 오퍼 읽어 `<ImageCarousel adobeOffer={...} />` prop drilling 한 단계
- frontend/components/ImageCarousel.tsx: `adobeOffer?: AdobeTargetOffer | null` prop 추가, 버튼 라벨 `adobeOffer?.buttonText ?? "▶ 다음 이미지"`, `adobeOffer?.autoPlayMs >= 500`일 때 `setInterval`로 자동 재생(`isAnimatingRef` 가드·cleanup `clearInterval`·`goNextRef`로 최신 함수 호출)
- docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: 다이어그램에 Context 노드 추가, 5.2~5.5절 매핑 신설/재번호, 7절 대응표 38행, 8절 체크리스트 13~15 추가, 9절 v1.4

Changed files: frontend/context/AdobeTargetContext.tsx, frontend/app/_layout.tsx, frontend/app/index.tsx, frontend/components/ImageCarousel.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

37. 2026-05-07 docs/main 04 Adobe Target 가이드 v1.3(로그 31~36·코드 정합)

Purpose: visitor·tntId·pageLoad·ApiException·LocationParseError·config strip·adobeTargetSession·LogBox 등 추가 개발분을 `04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`에 반영해 이식 문서와 현재 구현을 일치시킨다.

Changes:

04: §2.2 Delivery 예외·URL 파싱, §3.1 `_adobe_target_str`, §4.2 헬퍼·에러 매트릭스·`DeliveryRequest.id`, §4.3 캐시·strip, §5.1 키·페이로드 우선순위, §5.2 LogBox·page_url, §6.1 pageLoad/NoGlobalMbox, §7 로그 30~36 행, §8 체크리스트 9~12, 변경 이력 v1.3

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

36. 2026-05-07 Adobe Target 글로벌 mbox pageLoad 전환(NoGlobalMbox 400)

Purpose: Delivery API가 `execute.mboxes`에 `target-global-mbox`를 허용하지 않아 400이 나므로, 동일 이름 요청은 `execute.pageLoad`+`page_url`로 보내고 응답은 `page_load.options`와 `mboxes` 모두에서 오퍼를 수집한다.

Changes:

`target_adobe.py`: `OffersRequest.page_url`, `_is_target_global_mbox`, `_offers_from_execute_response`, `Address`·`RequestDetails` import

`_layout.tsx`: `page_url`에 `window.location.href` 전달

`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: HTTP 계약·4.2절 보강

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

35. 2026-05-07 Adobe Target 검증: track·offers 방문자 정합(adobeTargetSession)·docs/main 04 갱신

Purpose: 전체 검토 시 `ImageCarousel` track이 sessionStorage의 `tnt_id`를 보내지 않아 오퍼와 다른 익명 방문자로 기록되던 문제를 제거하고, `docs/main/04` HTTP 계약·프론트 매핑을 현재 코드와 맞춘다.

Changes:

`adobeTargetSession.ts`: sessionStorage 키·`getAdobeTargetVisitorPayload` 신설

`_layout.tsx`·`ImageCarousel.tsx`: 공통 페이로드 사용

`04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md`: v1.1, 요청·응답·체크리스트 갱신

Changed files: frontend/utils/adobeTargetSession.ts, frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

34. 2026-05-07 Adobe Target tntId(hex.28_0)·OffersRequest.tnt_id·응답 tntId 재사용

Purpose: 조언대로 Python SDK는 visitorId를 자동 생성하지 않으며, 익명 호출에는 `{uuid.hex}.28_0` 형 `tntId`가 관례이다. `OffersRequest`·`TrackRequest`에 `tnt_id`를 추가하고, Delivery 응답의 `id.tntId`가 있으면 클라이언트에 돌려 다음 요청에 재사용한다. `VisitorId`는 `delivery_api_client.Model`만 사용한다.

Changes:

`target_adobe.py`: `_new_client_tnt_id`, `_build_delivery_visitor_id`, `_tnt_id_from_delivery_response`, offers/track 응답에 `tnt_id` 우선

`_layout.tsx`: sessionStorage `at_tnt_id` 우선 전달

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/log/log.md

33. 2026-05-07 Adobe Target Delivery visitorId(thirdPartyId) 필수 반영·ApiException 400

Purpose: Adobe Delivery API가 `visitorId`에 tntId·thirdPartyId·marketingCloudVisitorId 중 하나를 요구하는데, 기존에는 `customer_ids`만 전달되어 400이 났다. `DeliveryRequest.id`(VisitorId)에 thirdPartyId를 넣고, Adobe `ApiException` 400은 그대로 HTTP 400으로 돌린다.

Changes:

`target_adobe.py`: `_third_party_id_for_target`, offers/track에 `VisitorId(third_party_id=…)`, 응답에 `visitor_third_party_id`, `ApiException` 분기

`_layout.tsx`: sessionStorage에 `visitor_third_party_id` 저장 후 다음 프리로드에 `visitor_id`로 전달

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/log/log.md

32. 2026-05-07 Adobe Target URL 파싱 오류 400·502 상세·웹 pointerEvents LogBox

Purpose: urllib3 `LocationParseError`(비ASCII 호스트 등)가 502로만 보이던 문제를 400과 캐시 무효화로 완화하고, 기타 Target 실패 시 응답에 예외 유형·메시지를 담는다. Expo 웹에서 RN Web의 pointerEvents deprecation 경고를 LogBox로 숨긴다.

Changes:

`target_adobe.py`: `LocationParseError` 시 `get_settings`·`get_target_client` 캐시 clear 후 HTTP 400, 일반 예외 시 502 detail에 code·reason·message

`_layout.tsx`: 웹에서 `LogBox.ignoreLogs`로 pointerEvents deprecation 한 줄 무시

Changed files: backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, docs/log/log.md

31. 2026-05-07 Adobe Target 설정 문자열 strip 및 설정 캐시 안내

Purpose: `adobe_target` JSON 값의 앞뒤 공백으로 인한 설정 오인식을 줄이고, `get_settings`가 `@lru_cache`이므로 `config.*.json` 수정 후에는 백엔드 재시작이 필요함을 코드 주석으로 남긴다.

Changes:

`config.py`: `_adobe_target_str`로 client·organization_id·property_token을 strip 후 `AdobeTargetSettings`에 반영, 모듈·함수 주석 정리

Changed files: backend/app/config.py, docs/log/log.md

30. 2026-05-07 docs/main 04 Adobe Target 연동 가이드 작성

Purpose: Adobe Target이 백엔드·프론트·env·의존성·외부 API에 어떻게 적용되었는지와 타 시스템 이식 절차를 한 문서로 정리한다.

Changes:

docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md: 아키텍처, 기술 스택, HTTP 계약, 파일·함수 매핑, log 22~29 대응표, 이식 체크리스트

Changed files: docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md, docs/log/log.md

29. 2026-05-07 Adobe Target 라우터 to_thread·웹 카드 boxShadow 분기

Purpose: 동기 Target SDK가 async 엔드포인트에서 이벤트 루프를 막을 수 있어 `asyncio.to_thread`로 오프로딩한다. RN Web `shadow*` 경고는 프로젝트 카드 스타일에서 웹만 `boxShadow`로 분기한다.

Changes:

`target_adobe.py`: `_get_offers_sync`·`_track_click_sync` + `await asyncio.to_thread(...)`

`CouponTable.tsx`·`ImageGallery.tsx`: `Platform.OS === "web"`일 때 `boxShadow`, 그 외 `shadow*`

Changed files: backend/app/routers/target_adobe.py, frontend/components/CouponTable.tsx, frontend/components/ImageGallery.tsx, docs/log/log.md

28. 2026-05-07 Adobe Target 설정 ASCII 검증 및 ConfigError 시 HTTP 400

Purpose: 한글 플레이스홀더가 `client`·`organization_id`에 있을 때 urllib3 `LocationParseError`로 502만 나오던 것을, SDK 호출 전에 막고 메시지로 원인을 드러낸다.

Changes:

`target_client_adobe.py`: `AdobeTargetConfigError`, `_assert_adobe_target_ascii`, `get_target_client`에서 호출

`target_adobe.py`: `AdobeTargetConfigError` 시 400·detail 문자열, 그 외는 기존 502

Changed files: backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, docs/log/log.md

27. 2026-05-07 Adobe Target 오퍼 프리로드 응답 로그 res.ok 분기

Purpose: 502 등 비정상 응답도 `res.json()` 후 `offers loaded`로 찍혀 혼동되는 문제를 제거한다.

Changes:

`_layout.tsx`: `fetch` 후 `res.ok`가 아니면 `console.warn`으로 상태 코드·본문 출력, 성공 시에만 `offers loaded` 로그

Changed files: frontend/app/_layout.tsx, docs/log/log.md

26. 2026-05-07 Adobe Target 프론트 API 베이스 URL을 api_url(8010)과 정합

Purpose: 웹 콘솔 `POST ...:8000/... net::ERR_CONNECTION_REFUSED`를 제거한다. Adobe 호출 기본값이 백엔드 포트와 불일치했음.

Changes:

`_layout.tsx`·`ImageCarousel.tsx`: `API_BASE_URL`을 `config.api_base_url ?? config.api_url ?? http://localhost:8010`으로 변경해 `frontend/env`의 `api_url`과 동일 백엔드를 사용

`loadConfig.ts`: 주석 보강

Changed files: frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, frontend/utils/loadConfig.ts, docs/log/log.md

25. 2026-05-07 Adobe Target 백엔드 의존성·Delivery API 모델 정합

Purpose: uvicorn 기동 시 `delivery_api_client`·`target-python-sdk` 임포트 실패를 제거하고, 생성된 클라이언트의 `Property`/`property` 명명과 맞춘다.

Changes:

venv: `six`, `python-dateutil`, `urllib3`, `certifi`, `tzlocal`, `requests`, `tld`, `user-agents`, `json-logic` 설치; Python 3.13에서 `pkg_resources` 복구를 위해 `setuptools`를 69.x로 고정

`target_adobe.py`: `Property` 제거·`ModelProperty` 및 `DeliveryRequest(..., _property=...)`로 수정

`requirements.txt`: 위 전이 의존성 및 `target-python-sdk`, `setuptools<70` 명시

검증: `backend\.venv\Scripts\python.exe -c "import app.main"` 성공

Changed files: backend/app/routers/target_adobe.py, backend/requirements.txt, docs/log/log.md

24. 2026-05-06 Adobe Target Python SDK 백엔드·Expo 연동

Purpose: FastAPI 백엔드에 Adobe Target Python SDK 프록시 API를 추가하고, Expo 웹 프론트에서 오퍼 조회/클릭 트래킹을 백엔드 호출 방식으로 연결한다.

Changes:

backend: `target_client_adobe.py`(SDK 싱글톤)·`routers/target_adobe.py`(offers/track 엔드포인트) 신규 추가, `config.py` Adobe 설정 로드 확장, `main.py` 라우터 등록 및 CORS POST 허용

env: `backend/env/config.dev.json`, `backend/env/config.prd.json`에 `adobe_target` 블록 추가

frontend: `_layout.tsx` Launch 스크립트 제거 후 `/api/target/offers` 프리로드 호출로 교체, `ImageCarousel.tsx`의 다음 이미지 클릭 시 `/api/target/track` fire-and-forget 전송 추가, `loadConfig.ts`에 `api_base_url` 선택 필드 추가

infra: `pip install target-python-sdk` 설치 완료

검증: Python 3.13 환경에서 SDK import 시 `pkg_resources` 누락 오류가 남아 추가 의존성(`tld`, `user-agents`, `json-logic`, `setuptools`) 설치 후에도 완전 해소되지 않음을 확인

Changed files: backend/env/config.dev.json, backend/env/config.prd.json, backend/app/config.py, backend/app/main.py, backend/app/target_client_adobe.py, backend/app/routers/target_adobe.py, frontend/app/_layout.tsx, frontend/components/ImageCarousel.tsx, frontend/utils/loadConfig.ts, docs/log/log.md

23. 2026-05-06 Adobe RN SDK 제거 및 Python SDK 전환 준비

Purpose: 잘못 추가된 React Native Adobe 패키지를 제거하고, Python 기반 SDK(`target-python-sdk`) 설치 경로로 전환한다.

Changes:

frontend: `@adobe/react-native-aepcore`, `@adobe/react-native-aepedge`, `@adobe/react-native-aeptarget` 제거

검증: `npm ls @adobe/react-native-aepcore @adobe/react-native-aepedge @adobe/react-native-aeptarget` 결과 `(empty)` 확인

Changed files: frontend/package.json, frontend/package-lock.json, docs/log/log.md

22. 2026-05-06 dev CORS에 Expo 웹 출처(8081) 추가

Purpose: `expo start --web` 기본 출처(`http://localhost:8081`)에서 API 호출 시 CORS로 차단되던 문제를 `cors_origins`에 허용 목록을 추가해 해소한다.

Changes:

`backend/env/config.dev.json`: `http://localhost:8081`, `http://127.0.0.1:8081` 허용(기존 3010 유지)

Changed files: backend/env/config.dev.json, docs/log/log.md

21. 2026-05-06 쿠폰 목록 recipient_id·테이블 가로 스크롤

Purpose: 쿠폰 조회 테이블에 `recipient_id`를 노출하고, 페이징 영역은 그대로 두고 테이블 블록만 가로 스크롤해 한 줄 표시로 줄바꿈을 막는다.

Changes:

backend: base SELECT·`CouponRowOut`·CSV에 `recipient_id` 포함, 목록 직렬화 반영

frontend: `CouponTable`에 `recipient_id` 컬럼, `ScrollView` horizontal + 고정 열 너비·`nowrap`(웹)로 테이블만 스크롤

Changed files: backend/app/database.py, backend/app/schemas.py, backend/app/routers/coupons.py, frontend/components/CouponTable.tsx, docs/log/log.md

20. 2026-05-06 git pull 및 손상 원격 ref 정리

Purpose: 원격 WhatDoThis/AT_TEST_PAGE의 main을 로컬에 반영한다. pull 실패 원인이 된 잘못된 경로 `refs/remotes/origin - 복사본/main` 하위 디렉터리를 제거한 뒤 pull을 완료했다.

Changes:

.git: 손상·비표준 원격 추적 ref 디렉터리 제거 후 `git pull` 성공, `e318c4a..126f145` fast-forward

원격 반영: `.gitignore` 보강, `frontend/app/_layout.tsx` 변경

Changed files: .gitignore, frontend/app/_layout.tsx, docs/log/log.md

19. 2026-04-28 CouponTable 페이징 반응형(밀도·줄바꿈)

Purpose: 좁은 화면에서 맨앞·이전·다음·맨뒤 버튼이 과도하게 커 레이아웃이 깨지는 문제를 카드 너비 기준 밀도·flexWrap으로 완화한다.

Changes:

CouponTable: pagerDensity(comfortable|compact|tiny)로 패딩·폰트·입력칸 크기 조절, 좁을 때 flexWrap·중앙 정렬 및 페이지 입력 행 전폭 줄바꿈

Changed files: frontend/components/CouponTable.tsx, docs/log/log.md

18. 2026-04-28 docs/main 아키 변경 반영(env 분리·CORS 설정화)

Purpose: 아키텍처 변경 후 문서 불일치를 해소하기 위해 docs/main 01~03을 실제 코드·로그 기준으로 최신 상태로 맞춘다.

Changes:

docs/main 01: 설정 경로를 frontend/env·backend/env 분리 구조로 수정하고 cors_origins 항목을 PRD 설명에 추가

docs/main 02: 프론트 설정 파일 경로를 frontend/env로 교체하고 __DEV__ 기반 dev/prd 선택 규칙을 명시

docs/main 03: backend/env 디렉터리 및 config.prd.example 포함 구조 반영, APP_ENV 경로·주요 키(api_port, cors_origins)·CORS 정책 설명 보강

Changed files: docs/main/01_AT_TEST_PAGE_PRD.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/log/log.md

17. 2026-04-28 env 프론트·백엔드 분리 및 설정 경로 전환

Purpose: 프론트에 DB 민감정보가 포함되지 않도록 설정 파일을 frontend/env와 backend/env로 분리하고 배포 의존성을 단순화한다.

Changes:

frontend/env, backend/env 신규 생성 및 역할별 config.dev/prd 분리, backend/env/config.prd.example 추가

backend config 경로를 backend/env 기준으로 전환하고 CORS allow_origins를 설정 파일(cors_origins)에서 로드

deploy.sh의 env 복사 단계 제거, .gitignore를 backend/env/config.prd.json만 제외하도록 정리

루트 env/config.dev.json, env/config.prd.json, env/config.prd.example.json 삭제

Changed files: frontend/env/config.dev.json, frontend/env/config.prd.json, backend/env/config.dev.json, backend/env/config.prd.json, backend/env/config.prd.example.json, frontend/utils/loadConfig.ts, backend/app/config.py, backend/app/main.py, deploy.sh, .gitignore, docs/log/log.md

16. 2026-04-28 docs/main 01~03 고객용 문서 정비

Purpose: 레퍼런스 문서 형식과 현재 코드 기준을 반영해 docs/main 문서를 고객이 이해하기 쉬운 구조로 재정리한다.

Changes:

docs/main: 01_AT_TEST_PAGE_PRD를 v1.1 기준으로 업데이트하고 제품 요약·범위·수용 기준·연관 문서 체계를 정리

docs/main: 02_AT_TEST_PAGE_FRONTEND_GUIDE 신규 작성(화면 구조, 컴포넌트 책임, 설정 연동, 웹 쿠폰 테이블 동작)

docs/main: 03_AT_TEST_PAGE_BACKEND_GUIDE 신규 작성(API 파라미터, 페이징 방식, DB 연동, 에러 정책)

Changed files: docs/main/01_AT_TEST_PAGE_PRD.md, docs/main/02_AT_TEST_PAGE_FRONTEND_GUIDE.md, docs/main/03_AT_TEST_PAGE_BACKEND_GUIDE.md, docs/log/log.md

15. 2026-04-28 CouponTable 페이지 직접 입력 점프(Enter/blur) 추가

Purpose: 이전/다음은 keyset으로 유지하면서, 드물게 필요한 특정 페이지 점프를 OFFSET(page) 입력으로 지원한다.

Changes:

frontend: pageInfo 텍스트를 TextInput(숫자)로 교체하고 Enter/blur 시에만 유효성 검사 후 fetchPage(page) 호출

frontend: 입력 중에는 요청하지 않고, 범위(1~totalPages) 밖 값은 현재 페이지로 롤백

frontend: 페이지 입력 UI 스타일(너비 72px, 중앙정렬, 테두리) 추가

Changed files: frontend/components/CouponTable.tsx, docs/log/log.md

14. 2026-04-28 쿠폰 keyset 페이징 전환·cursor CSV·맨뒤 최적화

Purpose: 대용량(수천만 건)에서 OFFSET 비용을 줄이기 위해 이전/다음을 keyset 기반으로 전환하고, CSV도 동일 cursor 파라미터를 지원한다.

Changes:

backend: /api/coupons에 cursor_created/cursor_id/direction(next|prev|last) 추가, page 호환 유지, next_cursor/prev_cursor 응답 추가

backend: /api/coupons/csv도 page·cursor·last 공통 파라미터 지원, direction=last 시 ASC 조회 후 역정렬

database/schemas: 정렬키를 created DESC,id DESC로 강화하고 PaginationOut에 cursor 필드 추가

frontend: 이전/다음은 keyset 호출로 변경, 맨앞/맨뒤는 점프 호출 유지, CSV는 현재 조회 쿼리(downloadQuery) 그대로 서버 호출

README: keyset API 사용법 및 (created DESC, id DESC) 복합 인덱스 검토 가이드 추가

Changed files: backend/app/database.py, backend/app/schemas.py, backend/app/routers/coupons.py, backend/README.md, frontend/components/CouponTable.tsx, docs/log/log.md

13. 2026-04-28 coupons CSV API 추가·CouponTable 서버 다운로드 전환·맨앞/맨뒤 버튼

Purpose: CSV를 클라이언트 생성이 아닌 백엔드 다운로드 엔드포인트로 통일하고, 페이지 이동 UX를 보강한다.

Changes:

backend: /api/coupons/csv 추가(UTF-8 BOM + 헤더 + 이스케이프 + Content-Disposition 파일명)

frontend: CouponTable에서 buildCsv/downloadCsvWeb 제거, CSV 버튼을 서버 URL window.open 호출로 전환

frontend: 페이징에 맨앞/맨뒤 버튼 추가

Changed files: backend/app/routers/coupons.py, frontend/components/CouponTable.tsx, docs/log/log.md

1. 2026-04-28 백엔드·CouponTable 점검 반영(reltuples 0 폴백·ORM NOT NULL·CSV BOM)

Purpose: 서버 운영 시 reltuples=0 오판·ORM nullable 표기·CSV BOM 처리 등 점검 피드백을 반영한다.

Changes:

database: created/last_modified/coupon_date NOT NULL 매핑, _BASE_COUPON_SELECT 모듈 캐시

coupons: estimate>0일 때만 추정 사용·행 매핑 단순화

CouponTable: BOM을 Blob 생성 시점에 부착

Changed files: backend/app/database.py, backend/app/routers/coupons.py, frontend/components/CouponTable.tsx, docs/log/log.md

2. 2026-04-28 FastAPI 쿠폰 API·웹 CouponTable·deploy·gitignore

Purpose: PostgreSQL 대용량 쿠폰 테이블 조회 API(8010)·웹 전용 테이블·CSV(현재 페이지)·배포 스크립트를 추가한다.

Changes:

backend: FastAPI+async SQLAlchemy GET /api/coupons, pg_class 추정 total, 503 처리, README·requirements

env: api_url·api_port·db 블록 추가(prd 비밀번호는 서버에서만 설정)

frontend: CouponTable·index 배치, loadConfig api_port 선택 필드

deploy.sh: env→frontend 복사, 백엔드 venv pip, pm2 at-test-api(APP_ENV=prd)

.gitignore: env/config.prd.json, backend venv/__pycache__, frontend/env/

Changed files: backend/app/main.py, backend/app/config.py, backend/app/database.py, backend/app/schemas.py, backend/app/routers/coupons.py, backend/app/routers/__init__.py, backend/app/__init__.py, backend/requirements.txt, backend/README.md, env/config.dev.json, env/config.prd.json, frontend/app/index.tsx, frontend/components/CouponTable.tsx, frontend/utils/loadConfig.ts, deploy.sh, .gitignore, docs/log/log.md

3. 2026-04-27 env 이미지 라벨 LGU·KT·SKT

Purpose: 갤러리·설정 기반 라벨을 통신사명으로 표시한다.

Changes:

config.dev.json·config.prd.json images[].label을 LGU, KT, SKT로 변경

Changed files: env/config.dev.json, env/config.prd.json, docs/log/log.md

4. 2026-04-27 README Windows venv pip 명령 정리

Purpose: Windows venv에서 pip 자기 업그레이드 오류를 피하도록 python -m pip 안내를 문서에 반영한다.

Changes:

README venv 절차를 python -m pip로 통일, REQUIREMENTS에 한 줄 보강

Changed files: README.md, REQUIREMENTS.md, docs/log/log.md

5. 2026-04-27 Python venv·requirements.txt·gitignore 문서화

Purpose: 백엔드·스크립트용 Python 가상환경(venv) 사용을 위해 루트 requirements와 문서·gitignore를 맞춘다.

Changes:

.gitignore에 venv·.venv·__pycache__ 등 Python 관련 제외 추가

requirements.txt 신규(플레이스홀더), README·REQUIREMENTS에 venv 생성·활성화 절차 및 Python 버전 권장 추가

Changed files: .gitignore, requirements.txt, README.md, REQUIREMENTS.md, docs/log/log.md

6. 2026-04-27 환경별 config __DEV__ 분기·deploy.sh·README·REQUIREMENTS

Purpose: EXPO_PUBLIC 대신 __DEV__로 dev/prd JSON을 고르고, 리눅스 배포 스크립트와 루트 문서를 추가한다.

Changes:

loadConfig: __DEV__ ? devConfig : prdConfig, AppConfig.api_url 필수

deploy.sh: monorepo 기준 frontend에서 expo export 후 serve로 dist 서빙, APP_DIR/PORT 환경변수 지원

README.md, REQUIREMENTS.md 신규, env/config.prd.json 포맷 정리

Changed files: frontend/utils/loadConfig.ts, env/config.prd.json, deploy.sh, README.md, REQUIREMENTS.md, docs/log/log.md

7. 2026-04-27 GitHub main 초기 푸시 및 loadConfig dev/prd 분기

Purpose: 원격 WhatDoThis/AT_TEST_PAGE에 초기 커밋을 푸시하고, env의 dev/prd JSON을 앱에서 로드하도록 맞춘다.

Changes:

git add·commit·main 브랜치·origin push

loadConfig: config.json 제거에 맞춰 config.dev.json 기본, EXPO_PUBLIC_CONFIG_PROFILE=prd 시 config.prd.json, AppConfig에 api_url 선택 필드

Changed files: frontend/utils/loadConfig.ts, docs/log/log.md

8. 2026-04-27 프로젝트 폴더 git init 및 GitHub origin 연결

Purpose: 워크스페이스 루트에 독립 저장소를 두고 원격 WhatDoThis/AT_TEST_PAGE와 연결한다.

Changes:

Target_Test_Web_Android에 git init 수행, remote origin을 https://github.com/WhatDoThis/AT_TEST_PAGE.git 로 등록

Changed files: .git/ (신규), docs/log/log.md

9. 2026-04-27 갤러리 한 줄·번호 선택·기본 숨김 UI 수정

Purpose: 갤러리 줄바꿈 제거, 셀 전체 파란 배경 대신 번호만 선택 표시, 이미지 목록 기본 감춤.

Changes:

ImageGallery: 카드 padding 반영 innerWidth로 itemWidth 계산, flexWrap nowrap, 선택 스타일을 number에만 적용

app/index: galleryOpen 초기값 false

Changed files: frontend/components/ImageGallery.tsx, frontend/app/index.tsx, docs/log/log.md

10. 2026-04-27 frontend 폴더로 Expo 앱 이전 (모노레포)

Purpose: docs·env를 루트에 두고 프론트엔드(Expo) 구성요소를 frontend/로 이동해 이후 backend 추가가 가능한 구조로 만든다.

Changes:

app·components·assets·utils·Expo 설정·node_modules·dist·.expo를 frontend/로 이동, 루트에 스크립트 위임용 package.json 추가

loadConfig가 ../../env/config.json을 참조하도록 수정, Metro watchFolders로 모노레포 루트 감시, .gitignore 경로 갱신

Changed files: frontend/** (이동·신규 metro.config.js·수정 tsconfig/loadConfig), package.json(루트), .gitignore, docs/log/log.md

11. 2026-04-27 AT_TEST_PAGE Expo 풀 코드 구현 (PRD 정합)

Purpose: PRD 및 제공 계획서에 맞춰 Expo Router 단일 페이지 앱(캐러셀·갤러리·토글·config)을 워크스페이스 루트에 구현한다.

Changes:

Expo SDK 54 기반 package.json·babel·tsconfig·app.json 구성, app/_layout·index 및 components·utils·env 추가

갤러리 선택과 캐러셀 인덱스 동기화(PR FR-06), 기본 이미지 3종(Expo 에셋 복사), 웹 export(dist) 빌드 검증

Changed files: (이후 frontend/로 이전됨) package.json, package-lock.json, babel.config.js, tsconfig.json, app.json, expo-env.d.ts, .gitignore, env/config.json, utils/*, components/*, app/*, assets/images/*, docs/log/log.md

12. 2026-04-27 docs/main AT_TEST_PAGE PRD v1.0 작성

Purpose: 개발 계획서 v1.0을 바탕으로 제품 요구사항 명세서(PRD)를 완성해 docs/main에 반영한다.

Changes:

docs/main에 PRD v1.0 문서 추가(기술 스택, 아키텍처, config 명세, 화면·컴포넌트, FR/NFR, 수용 기준, 로드맵, 리스크)

Changed files: docs/main/01_AT_TEST_PAGE_PRD.md, docs/log/log.md
