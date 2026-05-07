"""
adobe_backend.target_backend (Adobe Target 백엔드 하위 패키지)
================================================================================
Target Delivery 프록시 라우터, SDK 클라이언트, env/config.adobe.json 로더를 포함한다.

[Main Functions]
===========
- target_adobe_router: FastAPI 라우터
- target_client: TargetClient 싱글톤
- target_config: AdobeTargetSettings 로드
- target_main: register_target_routes

[Endpoints/Classes/Functions]
=======================
- target_main.register_target_routes

[Dependencies]
=========
- fastapi, target-python-sdk, delivery_api_client, app.config
"""
