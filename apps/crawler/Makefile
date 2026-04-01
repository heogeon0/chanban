.PHONY: run crawl discuss discuss-post setup test lint

# 전체 파이프라인 (크롤링 + 글작성 + 토론)
run:
	.venv/bin/python -m src.main all --limit 5

# 1단계: 크롤링 → 글작성만
crawl:
	.venv/bin/python -m src.main crawl --limit 5

# 2단계: 토론만 (crawl 먼저 실행 필요)
discuss:
	.venv/bin/python -m src.main discuss

# 특정 게시글 ID로 토론 실행 (예: make discuss-post id=abc123)
discuss-post:
	@test -n "$(id)" || (echo "사용법: make discuss-post id=<게시글_ID>"; exit 1)
	.venv/bin/python -m src.main discuss --post-id $(id)

# 환경 세팅 (최초 1회)
setup:
	python3 -m venv .venv
	.venv/bin/pip install --upgrade pip
	.venv/bin/pip install -e ".[dev]"

# 테스트
test:
	.venv/bin/python -m pytest tests/

# 린트
lint:
	.venv/bin/ruff check src/
