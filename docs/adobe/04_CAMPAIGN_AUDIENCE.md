# 외부 세그먼트(Adobe Campaign) → Target 오디언스 연동 가이드

> **상황:** 세그먼트(대상자)는 **Adobe Campaign**에서 만든다. 이 대상자를 **Target 오디언스**로 받아 활동(XT/AB)에 매핑하고 싶다.
> **제약:** ① 가입(원천) 시스템은 우리 관할이 아님 → 가입 즉시 API 호출에 의존 못 함. ② 세그 소속은 가입 시점에 안 정해질 수 있음(나중에 계산). ③ 세그는 Campaign에서 운영.
> **목적:** "Campaign이 만든 대상 → Target에서 타게팅"의 경로·지연·식별자 조건을 한눈에.

**한 줄 핵심**

```text
누가(대상)는 Campaign이 계산  →  그 결과를 Target에 "명단" 또는 "속성"으로 전달  →  Target 오디언스 규칙이 매칭 → 활동 적용
                                          (가입 시스템 무관 · 주기적/이벤트 전달)
```

---

## 0. 전체 그림 (한 장)

```text
            [Adobe Campaign]  세그먼트 계산 (예: 요금제 80,000원 = seg_1)
                    │
        ┌───────────┴────────────────────────────┐
        │ 전달 방식 2계열                          │
        ▼                                          ▼
   (A) 명단으로 공유                          (B) 속성으로 적재
   Experience Cloud 공유 오디언스            recipient_id + 플래그 추출
   (Campaign 워크플로)                       → Target 프로필(crs.* / profile.*)
        │  지연 24~36h, ECID/Declared ID          │  지연 통제가능, 키=recipient_id
        ▼                                          ▼
                    [Adobe Target]
        오디언스 = (A)공유오디언스 선택  또는  (B)규칙 profile.seg=="seg_1"
                    │
                    ▼
        활동(XT/AB)에 오디언스 매핑 → 방문자 요청 시 평가 → 콘텐츠 전달
        (앱: setThirdPartyId(recipient_id) 로 자기 신원을 같은 키로 식별)
```

- **핵심 분기:** Campaign 결과를 **"명단(list)"** 으로 줄지, **"속성(attribute flag)"** 으로 줄지.
- 둘 다 **가입 시스템을 건드리지 않는다.** 공급자는 Campaign(또는 데이터팀)이다.

---

## 1. 경로 비교 (3택)

| 경로 | 동작 | 지연 | 식별자(조인 키) | 비고 |
|------|------|------|----------------|------|
| **① 공유 오디언스** (Campaign→Experience Cloud→Target) | Campaign 워크플로 *Update shared audience* → Target에서 오디언스로 선택 | **24~36h(느림)** | **ECID** 또는 **Declared ID** | 커스텀 개발 최소·마케터 운영, 단 느림·앱 정합 까다로움 |
| **② 속성 적재** (Campaign 추출 → CRS / Profile API) | `recipient_id+플래그`만 추출 → Target 프로필에 적재, 오디언스는 **규칙** | **통제 가능**(배치 주기) / Single은 초 단위 | **recipient_id(=thirdPartyId)** | 앱 친화·지연 통제·복합 규칙. 추출 파이프라인 필요 |
| **③ RT-CDP(AEP)→Target** | AEP에서 세그 활성화 → Target 전용 destination | 준실시간(스트리밍) | ECID/AEP ID | 가장 현대적, 단 AEP 라이선스 필요 |

> 우리 시스템은 앱이 이미 `thirdPartyId = recipient_id`로 식별 중 → **②가 가장 잘 맞는다.** ①은 "느림+ECID 정합" 때문에 앱 환경에서 불리, ③은 AEP 보유 시 전략적 최선.

---

## 2. 왜 ②(속성 적재)가 기본인가

| 관점 | ① 공유 오디언스 | **② 속성 적재** |
|------|----------------|----------------|
| 지연 | 24~36h 고정 | **배치 주기 우리가 통제**(시간 단위 가능) + 긴급은 Single API 초 단위 |
| 식별자 | ECID/Declared ID 정합(쿠키·앱서 까다로움) | **recipient_id 직접**(이미 쓰는 키, 추가 정합 불필요) |
| 오디언스 형태 | 고정 "명단" | **규칙**(`profile.seg AND profile.planPrice…` 복합 자유) |
| 정합성 | 명단 동기화 → drift 가능 | 플래그 속성만 갱신 → drift 적음 |

→ **결론: ②를 기본**, 마케터 셀프서비스가 더 중요하고 24~36h를 감내할 수 있으면 ①, 향후 AEP면 ③.

---

## 3. 권장 아키텍처 (②) — 알고리즘/흐름

### 3.1 데이터 흐름

```text
[Adobe Campaign]
   │  ① 세그먼트 계산 (seg_1 = 요금제 80,000원 대상)
   │  ② 워크플로로 추출:  recipient_id, seg 플래그  (CSV/파일 또는 API용 레코드)
   ▼
[중계/배치 잡]  (우리 백엔드 or 미들웨어)
   │  ③ 대량  → Bulk Profile Update API   (key=thirdPartyId=recipient_id, profile.seg=seg_1)
   │  ③' 긴급 1건 → Single Profile Update API (초 단위)
   ▼
[Adobe Target]
   │  ④ 오디언스 규칙:  profile.seg == "seg_1"
   │  ⑤ 활동(XT/AB)에 그 오디언스 매핑
   ▼
[앱/웹]  setThirdPartyId(recipient_id) → 요청 시 프로필 매칭 → 콘텐츠 전달
```

### 3.2 적용 알고리즘 (의사코드)

```text
# 주기 배치 (예: 매시)
campaign.export(seg_1) -> rows[ {recipient_id, seg="seg_1"} ... ]
for chunk in batches(rows, size=N):          # 대량 → Bulk
    target.bulkProfileUpdate(key="mbox3rdPartyId",
                             attrs={"profile.seg": "seg_1"})

# 이벤트(긴급) — 방금 자격이 생긴 1명
on_segment_change(recipient_id, "seg_1"):    # 단건 → Single
    target.singleProfileUpdate(recipient_id, {"profile.seg": "seg_1"})

# 런타임 (앱/웹)
on_screen_enter():
    setThirdPartyId(recipient_id)            # 같은 키로 자기 신원 선언
    content = retrieveLocationContent(mbox)  # Target이 profile.seg 평가 → 매칭 시 콘텐츠
    render(content or default)
```

### 3.3 식별자 정합 (가장 중요한 한 줄)

```text
Campaign이 키로 쓰는 recipient_id  ==  앱이 setThirdPartyId로 선언하는 값  ==  Target 프로필 key
```

- 세 곳의 **키가 같아야** 적재된 세그가 방문자에게 붙는다.
- ②(Profile API)는 키가 **recipient_id(thirdPartyId)** 로 단순 → 앱에 이미 있음.
- ①(공유 오디언스)은 **ECID** 매칭이 기본이라, 앱에선 **Declared ID(recipient_id 정합키)** 설계가 추가로 필요.

---

## 4. 지연(latency)으로 갈리는 선택

| 요구 | 수단 | 반영 시점 |
|------|------|----------|
| 대량·안정 속성(요금제·약정 등) | **Bulk Profile Update API** | 배치 주기(시간 단위 가능) |
| 방금 발생한 이벤트(가입·요금제 변경) | **Single Profile Update API** | 초 단위 |
| 그 호출에서 이미 아는 값 | **요청 시 profile 파라미터** | **0(같은 호출)** |
| 명단 단위로 통째 공유 | **① 공유 오디언스** | **24~36h** |
| 준실시간 대량 | **③ RT-CDP** | 스트리밍 |

> **세그가 가입 시점에 안 정해진다**(제약 ②) → 보통 "가입 즉시"가 필요 없음 → **배치/주기 전달이면 충분.** 진짜 즉시가 필요한 소수만 Single API로 보완.

---

## 5. 가드레일 · 자주 막히는 점

| 증상/주제 | 원인 / 조치 |
|-----------|-------------|
| 세그가 방문자에 안 붙음 | 3.3의 **키 불일치** — Campaign recipient_id ↔ 앱 `setThirdPartyId` ↔ Target key 점검 |
| 반영이 너무 느림 | ① 공유 오디언스는 24~36h 고정 → 빠르면 ②(Bulk 주기↑) / 긴급 Single |
| CRS로 했더니 첫 방문에 안 맞음 | Customer Attributes는 첫 방문 후 ~20분 지연 + 속성 수 제한 → 실시간엔 **Profile API** 권장 |
| 오디언스가 명단인데 규칙 조합이 안 됨 | ①(명단)은 조합 제약 → 복합 조건 필요하면 ②(규칙 `profile.*`) |
| 프로필 적재 한도 | 프로필 외부데이터 총 64KB, `thirdPartyId`에 `+`,`/` 금지 |
| 공유 오디언스가 Target에서 안 지워짐 | 원천(AAM/Campaign)에서 삭제해야 함(Target 단독 삭제 불가) |

---

## 6. U+ 맥락 정리 (제약 3개에 대한 답)

| 제약 | 답 |
|------|----|
| ① 가입 시스템 관할 밖 | ①·②·③ **모두 가입 시스템 불필요** — 공급자는 Campaign/데이터팀 |
| ② 세그가 가입 시점 미확정 | 가입 즉시 API 불필요 → **Campaign이 나중에 계산 → 주기 전달**이 자연스러움 |
| ③ Campaign에서 만들어 Target에 매핑 | 정확히 ①(명단) 또는 ②(속성)의 시나리오. **앱·정합성·지연 고려 시 ② 권장** |

> 기존 외부 솔루션에 "명단을 쏴주는" 구조(정합성 문제 원천)를 버리고, **Campaign 워크플로로 `recipient_id+플래그`만 추출 → Profile API로 Target에 적재 → `profile.seg` 규칙**으로 가는 것이 정합성·민감정보·운영 면에서 가장 안전.

---

## 부록. 공식 문서 링크

- Campaign 오디언스 공유: https://experienceleague.adobe.com/en/docs/campaign-classic/using/integrating-with-adobe-experience-cloud/audience-sharing/sharing-audiences-with-adobe-experience-cloud
- Campaign 오디언스 가져오기/내보내기(24~36h): https://experienceleague.adobe.com/en/docs/campaign-classic/using/integrating-with-adobe-experience-cloud/audience-sharing/importing-and-exporting-audiences
- Experience Cloud 오디언스(People Core Service): https://experienceleague.adobe.com/en/docs/core-services/interface/services/audiences/overview
- AAM → Target 자동 공유(서버사이드·과금): https://experienceleague.adobe.com/en/docs/experience-cloud-kcs/kbarticles/ka-20675
- RT-CDP → Target 등 전용 destination: https://experienceleague.adobe.com/en/docs/experience-platform/destinations/catalog/adobe/experience-cloud-audiences
- Target Profile API(Bulk/Single) 개요: https://experienceleague.adobe.com/en/docs/target-dev/developer/api/profile-apis/profile-api-overview

> 식별자(thirdPartyId·ECID)·하이브리드 적재 상세 → `docs/main/04_AT_TEST_PAGE_ADOBE_TARGET_INTEGRATION.md 부록 B`.

---

## 문서 이력

| 버전 | 일자 | 요약 |
|------|------|------|
| 1.0 | 2026-06-09 | 최초 작성 — Campaign 세그먼트→Target 오디언스 3경로(공유 오디언스/속성 적재/RT-CDP) 비교, 권장 아키텍처(②)·흐름·의사코드·식별자 정합·지연별 수단·가드레일·U+ 맥락 |
