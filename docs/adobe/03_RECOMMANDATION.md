# Adobe Target 추천(Recommendations) 세팅 가이드

> **목적:** 아무것도 없는 상태 → 추천 게시·조회까지, 처음 접하는 사람도 따라오게.
> **범위:** Adobe Target 관리 화면(Target UI) 세팅 중심. 실제 코드 연동은 `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md §15`.

**한 줄 핵심**

```text
상품정보(카탈로그) + 행동데이터(조회·구매)  →  Adobe에 쌓기
        ↓
Criteria(알고리즘)  후보 고름  →  Design(템플릿)  모양 입힘  →  Activity  mbox에 묶어 게시
```

---

## 0. 전체 흐름 (Zero → Live)

- 추천은 **순서가 있는** 기능. 위 → 아래 6단계.
- 좌측 박스 = **한 번 만드는 구성요소**, 우측 = **계속 쌓이는 데이터**.

```text
   [계속 쌓이는 데이터] 조회·구매 행동(entity.* + order) ──── 알고리즘 학습 재료 ──┐
                                                                              (③에 반영)
   ┌──────────────────────────┐
   │ ① 카탈로그(Entities) 주입 │  상품을 Adobe에 "알림"
   └────────────┬─────────────┘
   ┌────────────▼─────────────┐
   │ ② Collection             │  추천 "후보" 묶음 (예: 음료/푸드)
   └────────────┬─────────────┘
   ┌────────────▼─────────────┐
   │ ③ Criteria(알고리즘)     │  어떤 규칙으로 고를지   ◄── 행동 데이터로 학습
   └────────────┬─────────────┘
   ┌────────────▼─────────────┐
   │ ④ Design(출력 템플릿)    │  결과 모양(JSON/HTML)
   └────────────┬─────────────┘
   ┌────────────▼─────────────┐
   │ ⑤ Activity 생성·게시     │  mbox + Criteria + Design + Audience
   └────────────┬─────────────┘
   ┌────────────▼─────────────┐
   │ ⑥ 조회·검증              │  앱/페이지가 mbox 호출 → 확인
   └──────────────────────────┘
```

| 단계 | 할 일 | Target UI 위치 | 절 |
|------|-------|----------------|----|
| 1 | 상품(Entity) 주입 | Recommendations > Feeds / mbox / API | §2 |
| 2 | Collection 생성 | Recommendations > Collections | §3 |
| 3 | Criteria 생성 | Recommendations > Criteria | §4 |
| 4 | Design 생성 | Recommendations > Designs | §5 |
| 5 | Activity 생성·게시 | Activities > Create Activity | §6 |
| 6 | mbox 호출로 조회 | 앱/페이지 (+Assurance) | §7 |

> ⚠️ **데이터가 충분히 쌓여야** 결과가 의미 있음. 특히 "구매 기반(Bought)"은 학습이 늦음 → 초기엔 백업(인기)만 나올 수 있음(§4.4).

---

## 1. 핵심 개념 (용어 7개)

| 용어 | 한 줄 | 비유 |
|------|-------|------|
| **Entity(엔티티)** | 추천 대상 1개. 핵심키 `entity.id` | 상품 1개 |
| **Catalog(카탈로그)** | 전체 엔티티 집합 | 전체 창고 |
| **Collection(컬렉션)** | 카탈로그를 조건으로 나눈 후보 묶음 | 창고 속 진열대 |
| **Criteria(기준)** | 어떤 알고리즘·규칙으로 고를지 | 추천 레시피 |
| **Design(디자인)** | 결과를 내보낼 템플릿(모양) | 포장 양식 |
| **Activity(액티비티)** | 위 요소 + mbox + Audience를 묶어 **게시**한 단위 | 운영 캠페인 |
| **mbox / Location** | 추천을 요청하는 "위치 이름" | 진열 위치 |

> **Key(키 상품)** = "이 상품을 본/산 사람에게"의 기준 상품. 디자인에서 `$key.id`, `$key.name`.

---

## 2. 1단계 — 카탈로그(Entities) 주입

**Adobe가 먼저 "어떤 상품이 있는지"를 알아야 추천 가능.**

### 2.1 `entity.id` 규칙 (가장 중요)

- **필수**, 모든 Adobe 제품(Analytics 포함)에서 **동일 값**.
- **금지 문자:** 공백 `/ & ? % ,` 등(URL 인코딩 필요 문자). **하이픈 `-`·언더스코어 `_` OK.**
- **최대 50자.**
- **61일 후 만료** → **월 1회 이상** 재전송해야 유지.
  - └ 왜? Adobe가 오래된 상품정보를 자동 폐기 → "살아있다"는 신호를 주기적으로 보내야 후보에서 안 빠짐.

### 2.2 자주 쓰는 엔티티 속성

| 속성 | 의미 |
|------|------|
| `entity.id` | 식별자(필수) |
| `entity.name` | 상품명(표시용) |
| `entity.categoryId` | 카테고리(콤마 다중, 누적 250자) |
| `entity.value` | 가격(숫자 비교·가격규칙) |
| `entity.inventory` | 재고(재고 필터) |
| `entity.pageUrl` / `entity.thumbnailUrl` | 상세/썸네일 URL(상대경로 권장) |
| `entity.message` | 배지 문구("세일" 등) |
| `entity.brand` | 브랜드 |
| `entity.<custom>` | 커스텀 최대 100개(예: `entity.genre`) |

> 💡 `categoryId`는 **디자인에 직접 표시 불가**(다중값). 표시용은 `entity.displayCategory` 같은 **커스텀 속성**으로 별도 전송.

### 2.3 주입 방법 3가지 (상품 = Entity 평면)

| 방법 | 언제 | 특징 |
|------|------|------|
| **Feed(피드)** | 다수 상품 정기(보통 매일) | CSV(Adobe 양식)·Google Product Feed·Analytics Classifications. `Recommendations > Feeds`. **대부분 최소 1개 권장.** |
| **Entities API** | 자주 바뀌는 1건 실시간 | Save/Get/Delete API(가격·재고) |
| **페이지/앱 mbox 파라미터** | 사용자가 보는 즉시 | mbox에 `entity.*` 동봉 |

```text
  Feed (CSV / Google / Analytics)  ─┐   일괄·정기
  Entities API (1건 실시간)         ─┼──►  [ Recommendations 카탈로그 ]
  mbox 파라미터 entity.*            ─┘   실시간
```

> **본 프로젝트:** ③ mbox + ① Feed 병행.
> - **Feed** = 주기 변경 적은 **상품마스터(sb·sf 등 카테고리)** → Collection에서 활용. (수기 업로드 불가하니 피드 등록.)
> - **앱 mbox 파라미터** = 적재 루프에서 `entity.id/name/categoryId` + 구매(order) 실시간 전송 → 학습용. 상세 `04 §15.4`.

### 2.4 고객(Customer) 데이터 평면 — Customer Attributes ★

> ⚠️ **상품 평면(§2.1~2.3)과 완전히 별개.** 추천 후보(Collection)는 항상 Entity(상품)로 정의. **고객 속성은 "누구에게/프로필 비교"에만 관여** (Collection 정의에 안 쓰임).

- **무엇:** CRM/고객 데이터(예: `recipient_id` 등)를 **Customer Attributes 데이터 소스**로 업로드 → 방문자 **Target 프로필**에 부착(`crs.*` 접두어).
- **어디에 쓰나:** ① **Audience** 타게팅, ② Criteria의 **Profile Attribute Matching**(§4.5). **Collection ✗.**
- **본 프로젝트:** Customer Attributes로 recipient 정보 주입(FTP 배치 미설정이나, 주기적 갱신 가능 구조). = 타 운영 현장 표준 패턴.

**본 프로젝트 실제 구성 (간단)**

- 업로드: **CSV 드래그&드롭** → 다음 Configure 페이지에서 **Target 선택** → 속성 체크 → Activate. (드래그 업로드라 **`.fin` 불필요**.)
- Target 구독 속성 3개 → `crs.` 접두어로 프로필 부착:

| CSV 속성 | Target에서 | 비고 |
|----------|-----------|------|
| `campaign_label` | `crs.campaign_label` | 캠페인 라벨 |
| `workflow_label` | `crs.workflow_label` | 워크플로우 라벨 |
| `recipient_id` | `crs.recipient_id` | 수신자 ID(조인 키로도 사용) |

> 3개는 **Standard 한도(5)** 내. `recipient_id`는 **키 컬럼**이자 속성으로도 구독 → `crs.recipient_id`로 매칭 확인까지 가능.

**조인 메커니즘 (recipient_id = 연결 키)**

```text
[Customer Attributes CSV]  첫 컬럼 = customer ID(= recipient_id)
        │  FTP 업로드 시 .csv + 동일이름 .fin 필요(드래그업로드는 .fin 불필요)
        ▼
[데이터 소스]  Alias ID 지정 → Target 구독(Subscription) → Activate
        │   매칭 키 = mbox3rdPartyId (= setCustomerIDs / 네이티브 setThirdPartyId)
        ▼
[방문자 Target 프로필]  업로드 속성이 crs.* 로 부착
        ▼
Audience 빌더 / Profile Attribute Matching 에서 crs.<속성> 사용
```

- 앱의 `setTargetVisitor(recipient_id)` → `Target.setThirdPartyId(recipient_id)` = **mbox3rdPartyId 역할**.
- 이 값이 **CSV 첫 컬럼(customer ID)과 일치**해야 해당 recipient 속성이 프로필에 붙음.

**조인 동작 필수 3조건**

1. 데이터 소스 **Target 구독 + Activate**.
2. CSV **customer ID 컬럼 = recipient_id**.
3. 앱이 **동일 recipient_id를 setThirdPartyId로 전송**.
   → 하나라도 어긋나면 `crs.*` 빈값.

**제약(공식)**

- 구독 속성 수: **Standard 5 / Premium 200**.
- FTP: `.fin` 별도 업로드 시 약 1분 내 처리.
- 속성명에 **공백·`< , > ' "` 포함 시 Target이 무시**.

---

## 3. 2단계 — Collection(컬렉션) 만들기

**Collection = 추천 후보를 한정하는 묶음.** "이 활동은 이 묶음 안에서만 추천"하도록 범위 축소.

### 3.1 만드는 순서

1. `Recommendations > Collections`.
2. **Create Collection**.
3. **Name**(필수) + Description(선택).
4. (선택) **Environment** — 환경별 포함 상품 수 미리보기.
5. **Rules** — 엔티티 속성 조건으로 후보 정의.
   - 예: `category = sb`(음료), `value < 5000`, `brand = X`.
   - **규칙 여러 개 = AND**(모두 만족해야 포함).
6. **Create**.

> "Number of Items" = 기본 host group(환경)에서 규칙 매칭 수. **0이면** 규칙이 너무 좁거나 카탈로그 미주입.

### 3.2 부가설명

- **Catalog vs Collection:** 카탈로그=전체 창고 / 컬렉션=진열대. 한 카탈로그에 여러 컬렉션 가능.
- 컬렉션 안 쓰면 카탈로그 전체에서 추천. "음료 페이지엔 음료만" 통제용.
- **우리 예시:** Test Woo Star Product 02 (sb, sf) — 음료/푸드.

> ⚠️ **오해 정리 — "컬렉션 = Customer Attribute 주입"?** ✗
> - **컬렉션 = Entity 속성(`entity.*`)으로 정의.** 주입 경로 = §2.3(Feed/API/mbox). (공식: "collection rules ... affect only Entity Recommendations")
> - **Customer/Profile 속성(`profile.*`, `crs.*`)** = 방문자 단위 → **Audience** / **Profile Attribute Matching**(§4.5)에서만.
> - 한 문장: **후보 정의 = Entity(컬렉션) / 누구·프로필 비교 = Customer·Profile(§2.4, §4.5).**

---

## 4. 3단계 — Criteria(기준) 만들기

**Criteria = 어떤 알고리즘으로 무엇을 추천할지. 추천의 핵심.**

### 4.1 만드는 순서

1. `Recommendations > Criteria > Create Criteria`(또는 활동 생성 중 생성).
2. 기본 정보(이름·Industry Vertical·Page Type).
3. **Algorithm** 선택(§4.2).
4. **Backup Content**(부족 시) 설정(§4.3~4.4).
5. **Inclusion Rules**(필터) 설정(§4.5).
6. **Attribute Weighting**(가중치) 설정(§4.6).
7. 저장(재사용하려면 "Save criteria for later").

### 4.2 Algorithm Type 요약

| 유형 | 추천 근거 | 예 |
|------|-----------|-----|
| **Item-Based** | 특정 상품(key)과의 관계 | Bought This Bought That / Viewed This Viewed That |
| **People-Based** | 방문자 행동 이력 | Recommended For You |
| **Popularity-Based** | 전체 인기 | Top Sellers / Most Viewed |
| **Custom / Content-Based** | 커스텀·속성 유사도 | — |

> **우리:** Item-Based · `BOUGHT_CF based on Most Viewed Item` = "가장 많이 본 상품(key)을 산 사람들이 **함께 산** 상품". → **구매(order) 데이터로 학습.**

### 4.3 Recommendation Key

- "무엇을 기준(this)으로 추천할지".
- **Most Viewed Item** = 그 사용자가 가장 많이 본 상품(요청 시 자동). **Current Item** = 지금 보는 상품(mbox `entity.id`).

### 4.4 Backup Content(결과 부족 시) — "기본으로 보여줄 것"

알고리즘이 슬롯 수보다 **적게** 줄 때 동작. **여기서 "기본값" 결정.**

| 옵션 | 동작 |
|------|------|
| **Partial Design Rendering** | 부족 슬롯 **빈칸** |
| **Show Backup Recommendations** | 빈 슬롯을 **인기상품(최근 1주, 최다조회 top 500)** 자동 채움 |
| (둘 다 OFF + 부족) | 템플릿 대신 **Default Content** 표시 |
| **Apply inclusion rules to backup** | 백업에도 §4.5 필터 적용 |

```text
  추천 N개 필요
       ▼
  알고리즘 결과 충분?
       ├─ 예 ──────────────► 알고리즘 결과로 채움
       └─ 아니오 → Backup 설정?
                   ├─ Show Backup Recs  ─► 인기상품으로 채움
                   ├─ Partial Rendering ─► 부족분 빈칸
                   └─ 둘 다 OFF         ─► Default Content
```

> ❓ **"룰은 따르되 기본 디폴트를 정할 수 있나? 시스템 구현인가?"**
> → **Target에서 가능(권장) + 앱 마지막 안전망.** 3개 층:
> 1) **Criteria 알고리즘**(우선) 2) **Backup Content**(부족분 자동 — Target) 3) **Default Content / 앱 폴백**(전혀 못 줄 때).
> 우리 criteria는 `Show backup = Yes` → **부족 시 Adobe가 인기상품으로 자동(앱 구현 불필요).**
> "부족 시 다른 알고리즘으로 채우기" 원하면 → **Criteria Sequence**(최대 5개 순차).

### 4.5 Inclusion Rules(포함/필터)

알고리즘 결과 중 **조건 맞는 것만 남김.** "어디에"가 아니라 **"무엇을"** 만 제어. (규칙 간 **AND**, 한 규칙 내 다중값 **OR**)

| 항목 | 의미 |
|------|------|
| **Allow recently purchased items?** | `productPurchasedId`(=`entity.id`) 기준. 기본 OFF(산 건 추천 안 함). **ON = 반복구매(커피·샴푸)** |
| **Choose price rule** | 가격 조건(key 대비 비슷/저렴). 사전 정의 rule 선택 |
| **재고 제한 체크박스** | 재고 < 입력값 상품 제외 |
| **Add Filtering Rule** | 속성 포함/제외(예: `category = sb`). **Static**(고정) / **Dynamic**(상품·프로필 동적) |

> 💡 **Dynamic 중 "Profile Attribute Matching"** = **Customer/Profile 속성(`profile.*`, §2.4의 `crs.*`)** 활용 지점. 엔티티 속성을 방문자 프로필과 **비교**해 거름.
> 예: `entity.brand = profile.favoritebrand`(선호 브랜드만), `jobCity = profile.usersCity`(거주 도시 공고만).
> 또 **Entity Attribute Matching** = 현재 보는 상품 속성과 비교(예: 페이지의 `entity.brand`와 같은 브랜드만).

> ⚠️ **주의(공식):** 너무 좁히면 좋은 후보를 막아 **추천 효과(lift) 하락**. 꼭 필요한 규칙만.

### 4.6 Attribute Weighting(속성 가중치)

필터(제외) ✗ → **순위/노출 빈도 조정 "넛지".** 가중 준 상품이 더 자주 위로, 단 **완전 배제는 아님.**

1. **Value** — 기준 속성(예: Category)
2. **Evaluator** — contains / equals 등
3. **Keyword** — 값(예: "Category contains shoes")
4. **Weight** — **0~100, 25단위**(0/25/50/75/100)
5. 규칙 다중 추가 가능(트래픽 분할 테스트도)

> 예: "세일 상품" weight 75 → 더 자주 추천, 비세일도 가끔 노출.

### 4.7 우리 criteria 매핑

| 항목 | 값 |
|------|----|
| Algorithm Type | Item-Based |
| Algorithm | Bought This Bought That (`BOUGHT_CF`) |
| Recommendation Key | Most Viewed Item |
| Partial design rendering | Yes |
| Show backup recommendations | Yes |
| Apply inclusion rules to backup | Yes |
| Recommend previously purchased items | **Yes** |
| Lookback Window | 2 days |
| Inclusion Rules / Attribute Weighting | **No rule**(필터·가중 없음) |

---

## 5. 4단계 — Design(디자인) 만들기

**Design = 결과를 담아 내보낼 템플릿.** Adobe가 결과를 디자인이 정한 **모양(HTML/JSON)** 으로 렌더. 언어 = **Apache Velocity(1.7)**.

### 5.1 만드는 순서

1. `Recommendations > Designs` → **Create Design**(또는 기본 디자인 **Copy**).
2. **Name** + (선택) 미리보기 이미지.
3. **코드(템플릿)** 입력 — 우측 패널의 **display 변수** 참조.
4. 저장 → 활동에서 선택.

> 💡 **Velocity란?** 결과를 끼워 넣는 틀. `$entity1.name`처럼 `$`변수 → Adobe가 1순위 상품명으로 치환. (사이트=HTML, 앱=JSON.)

### 5.2 자주 쓰는 디자인 변수

| 변수 | 의미 |
|------|------|
| `$entity1.id` … `$entityN.id` | N순위 상품 id(최대 99) |
| `$entity1.name` / `.value` / `.pageUrl` / `.thumbnailUrl` / `.message` | N순위 속성 |
| `$entity1.<custom>` | 커스텀(예: `$entity1.stCode`) |
| `$key.id` / `$key.name` / `$key.thumbnailURL` | 기준(key) 상품 |
| `$algorithm.name` / `$algorithm.dayCount` / `$criteria.title` | 알고리즘·기준 메타 |

### 5.3 우리 디자인(JSON) — "Test Woo Start Product - Json"

```json
{
  "meta": {
    "algorithmName": "$algorithm.name",
    "dayCount": "$algorithm.dayCount",
    "criteriaTitle": "$criteria.title",
    "keyId": "$key.id",
    "keyName": "$key.name"
  },
  "items": [
    { "entityId": "$entity1.id", "name": "$entity1.name", "categoryId": "$entity1.category", "stCode": "$entity1.stCode" },
    { "entityId": "$entity2.id", "name": "$entity2.name", "categoryId": "$entity2.category", "stCode": "$entity2.stCode" },
    { "entityId": "$entity3.id", "name": "$entity3.name", "categoryId": "$entity3.category", "stCode": "$entity3.stCode" },
    { "entityId": "$entity4.id", "name": "$entity4.name", "categoryId": "$entity4.category", "stCode": "$entity4.stCode" },
    { "entityId": "$entity5.id", "name": "$entity5.name", "categoryId": "$entity5.category", "stCode": "$entity5.stCode" }
  ]
}
```

- 5개 못 채우면 `$entity5.id` 같은 **미해결 토큰** 그대로 올 수 있음 → 앱(`parseRecommendations`)이 토큰·빈슬롯 필터. (또는 §4.4 백업으로 채움.)

### 5.4 자주 막히는 부분

- **숫자 표시:** Velocity는 값을 문자열로 다룸. `$entity1.value`의 `35.00`이 `35`로 보일 수 있음 → 표시는 커스텀 속성(`entity.displayValue` 문자열), 계산은 `parseInt`/`parseDouble`.
- **카테고리 표시 불가:** `categoryId` 다중값 → 커스텀 속성 사용.
- **디자인 즉시 반영:** 사용 중 디자인 수정은 반영 느림 → **새 디자인 만들어 활동에서 교체**하면 즉시.

---

## 6. 5단계 — Activity 만들고 게시

구성요소(카탈로그·Collection·Criteria·Design) 준비 후, **하나의 활동으로 묶어 mbox에 게시.** (Form-Based 기준)

1. `Activities > Create Activity > Recommendations`.
2. Experience Composer **Form** 선택 → Next.(Workspace 선택 가능)
3. **Location** = mbox 이름. **우리: `target-msdk-mbox`.**
4. **Default Content** → **Add Recommendation**.
5. **Page Type** 선택 → 이후 Criteria 필터 기준.
6. **Criteria 선택**(1+). 여러 개면 트래픽 균등 분할(자동 experience).
7. **Design 선택** → Next.
8. (선택) **Collection / Promotion** — 후보 범위·강제 노출.
9. **Audience** — 기본 All Visitors 또는 세그먼트.
10. **Goals & Settings** — 이름(필수)·목표·우선순위·기간.
11. 우측 상단 **Inactive → Activate**(게시).

```text
  Create Activity (Recommendations · Form)
    → Location = target-msdk-mbox → Page Type → Criteria → Design
    → (선택) Collection / Promotion → Audience → Goals & Settings → Activate
```

> 💡 **부가**
> - **Page Type / Compatible:** Criteria마다 필요한 입력(`entity.id`/`categoryId`)이 다름. "Compatible"은 현재 위치가 그 입력을 주는 Criteria만 노출.
> - **게시 안 하면** default/빈 응답만.
> - 게시 후 **sample request**로 디자인 JSON 응답 확인 가능.

---

## 7. 6단계 — 조회·검증

게시 후 앱/페이지가 mbox 호출 → 결과 수신.

### 7.1 본 프로젝트(네이티브 SDK) 흐름

1. `setThirdPartyId(수신자)` — 누구 기준으로 받을지.
2. `retrieveLocationContent("target-msdk-mbox")` — 조회.
3. 응답 = §5.3 Design JSON → 앱이 `parseRecommendations`로 Top5 추출.

| 기능 | 파일 |
|------|------|
| 화면(적재 루프 + 조회) | `frontend/adobe_frontend/target-native-frontend/RecommendationScreen.tsx` |
| 데이터·파서 | `.../recommendationData.ts` |
| SDK 전송/방문자 | `.../native/adobeMobileTarget(.native).ts` |

### 7.2 검증 팁

- **데이터 누적이 먼저.** "추천 데이터 보내기"로 구매 충분히 쌓은 뒤 조회.
- 빈 결과/인기상품만 → 학습 부족(정상) 또는 미게시·mbox 불일치(§9).
- **Assurance**로 실기기 요청/응답 실시간 확인.

---

## 8. 부가 세팅(옵션)

| 기능 | 위치 | 용도 |
|------|------|------|
| **Exclusions** | Recommendations > Entities | 특정 상품 영구 제외(품절·단종) |
| **Promotions** | 활동/Criteria | 특정 상품 **강제 상위 노출** |
| **Criteria Sequence** | Recommendations > Criteria | 최대 5개 기준 **순차** 적용(부족분을 다른 기준으로). ※ 백업은 **마지막 기준** 설정 따름 |
| **Feeds 스케줄** | Recommendations > Feeds | 카탈로그 정기 동기화(매일) |
| **Settings** | Recommendations > Settings | 기본 host group, Industry Vertical, **Custom Global Mbox**, 호환 Criteria 필터, API 토큰 |

---

## 9. 가드레일 · 자주 막히는 점

| 항목 | 제한 / 주의 |
|------|-------------|
| `purchasedProductIds` | 개당 **50자**, 콤마 연결 **총 250자**(초과 시 400) |
| `entity.id` 문자 | 공백·`/ & ? % ,` 금지(`-`·`_` OK), 최대 50자 |
| 엔티티 만료 | **61일** → 월 1회 이상 재전송 |
| mbox 파라미터 | 표준 500개(모바일 Batch 50개) |
| Customer Attributes | 구독 속성 Standard 5 / Premium 200, FTP는 `.fin` 필요(§2.4) |
| 학습 시간 | 구매 기반 희소 → 초기엔 백업(인기)만 |
| `categoryId` | 디자인 직접 표시 불가(커스텀 속성) |

**증상별 점검**

| 증상 | 원인/조치 |
|------|-----------|
| 빈 결과/인기만 | 학습 부족 → 더 쌓기. 백업=Yes면 인기로 채움 |
| `$entity5.id` 토큰 그대로 | 추천 < 슬롯 → 앱 필터링 또는 백업 |
| 아무것도 안 옴 | 미게시 / mbox 불일치 / Collection 0건 |
| `crs.*`(고객속성) 빈값 | §2.4 3조건 점검(구독·Activate / CSV키 / setThirdPartyId 일치) |
| 디자인 수정 미반영 | 새 디자인 만들어 교체 |

---

## 10. 본 프로젝트 적용 요약

| 구성 | 값 |
|------|----|
| mbox(Location) | `target-msdk-mbox`(= offer mbox, `config.mobile_env.adobe_sdk_mboxes`) |
| 상품 주입 | **Feed**(상품마스터 sb·sf) + **앱 mbox 파라미터**(`entity.*` + order, 메뉴 60개 `entity.id`=21~60) |
| 고객 주입 | **Customer Attributes**(CSV 드래그업로드→Target 구독: `campaign_label`·`workflow_label`·`recipient_id`), 조인키 `recipient_id`=`setThirdPartyId`(§2.4) |
| Collection | Test Woo Star Product 02 (sb, sf) |
| Criteria | Item-Based · BOUGHT_CF · Most Viewed Item (§4.7) |
| Design | Test Woo Start Product - Json (§5.3) |
| 조회/검증 | RecommendationScreen(적재 루프 + 추천 가져오기) |

> 구현 코드·SDK 동작 → `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md §15`.

---

## 부록. 공식 문서 링크

- 추천 개요: https://experienceleague.adobe.com/en/docs/target/using/recommendations/recommendations
- 엔티티 속성: https://experienceleague.adobe.com/en/docs/target/using/recommendations/entities/entity-attributes
- 피드: https://experienceleague.adobe.com/en/docs/target/using/recommendations/entities/feeds
- 컬렉션: https://experienceleague.adobe.com/en/docs/target/using/recommendations/entities/collections
- Criteria 생성(백업/포함/가중치): https://experienceleague.adobe.com/en/docs/target/using/recommendations/criteria/create-new-algorithm
- 백업 추천: https://experienceleague.adobe.com/en/docs/target/using/recommendations/criteria/backup-recs
- Criteria Sequence: https://experienceleague.adobe.com/en/docs/target/using/recommendations/criteria/create-criteria-sequence
- Profile Attribute Matching(동적, profile.*): https://experienceleague.adobe.com/en/docs/target/using/recommendations/criteria/dynamic-static/profile-attribute-matching
- Entity Attribute Matching: https://experienceleague.adobe.com/en/docs/target/using/recommendations/criteria/dynamic-static/entity-attribute-matching
- Customer Attributes(개요): https://experienceleague.adobe.com/en/docs/target/using/audiences/visitor-profiles/working-with-customer-attributes
- Customer Attributes(파일·FTP): https://experienceleague.adobe.com/en/docs/core-services/interface/services/customer-attributes/crs-data-file
- 디자인 생성: https://experienceleague.adobe.com/en/docs/target/using/recommendations/recommendations-design/create-design
- 디자인(Velocity) 커스터마이즈: https://experienceleague.adobe.com/en/docs/target/using/recommendations/recommendations-design/customizing-a-template
- 활동 생성: https://experienceleague.adobe.com/en/docs/target/using/recommendations/recommendations-activity/create-recs-activity
- 제한(limits): https://experienceleague.adobe.com/en/docs/target/using/troubleshoot/target-limits

---

## 문서 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 1.0 | 2026-06-04 | 최초 작성 — Zero→Live 흐름, 카탈로그·Collection·Criteria(백업/포함/가중치)·Design(Velocity)·Activity·조회·부가옵션·가드레일·본 프로젝트 매핑 |
| 1.1 | 2026-06-04 | 필기노트 스타일 전면 재정리(내용 보존). §2.4 고객 데이터 평면(Customer Attributes · recipient_id 조인) 추가, Entity/Profile 매칭 보강, 가드레일·증상·요약·링크 갱신 |
| 1.2 | 2026-06-04 | §2.4·§10에 본 프로젝트 실제 Customer Attributes 구성 반영(드래그업로드·.fin 불필요, 구독 속성 campaign_label/workflow_label/recipient_id) |
