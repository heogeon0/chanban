# chanban-crawler

네이버 뉴스 랭킹 크롤링 → LangChain 분석 → 찬반 토론 주제 자동 생성 파이프라인

## 설치

```bash
cd apps/crawler
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## 환경변수 설정

```bash
cp .env.example .env
# .env 파일에 실제 값 입력
```

## 실행

```bash
python -m src.main
```

## 테스트

```bash
pytest
```
