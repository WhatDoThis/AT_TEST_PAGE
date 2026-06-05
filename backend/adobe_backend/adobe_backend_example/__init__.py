"""
adobe_backend_example (Adobe Target 서버사이드 Python SDK 예시 패키지)
================================================================================
실제 운영 코드가 아니라, **새 시스템에 그대로 가져다 쓸 수 있는 "최소 SDK 구성 예시"** 다.
Web(서버사이드) Adobe Target 연동을 Python SDK(`target-python-sdk`) 기준으로,
초기화 → Adobe 객체 조립 → Delivery 호출(get_offers) 의 3단계만 담는다.

[구성 파일]
===========
- client_python_sdk : 설정값 + TargetClient 싱글톤 생성(초기화)
- base_model_python_sdk : Adobe Delivery 객체(요청 바디) 빌더 모음
- delivery_python_sdk : get_offers 호출 + 응답(오퍼) 파싱 + 요청/반환 예시(주석)

[사용 범위]
===========
- 다른 내부 모듈에 의존하지 않는 자기완결형 예시(임포트는 SDK·표준 라이브러리만).
- 페이지별 다양한 구성이 아니라 "SDK 적용 최소 형태" 만 보여준다.
- API 콜·요청/반환 형태는 각 파일 주석으로 설명한다.

[Dependencies]
=========
- target-python-sdk (TargetClient)
- delivery-api-client (DeliveryRequest 등 Adobe 객체) — target-python-sdk 에 포함
"""
