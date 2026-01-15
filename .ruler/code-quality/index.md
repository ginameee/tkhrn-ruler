# Code Quality Principles

Frontend Fundamentals 기반 코드 품질 4대 원칙.

---

## Overview

"좋은 코드는 쉽게 수정할 수 있는 코드다"

이 문서는 Toss의 [Frontend Fundamentals](https://frontend-fundamentals.com/code-quality/code/)에서 제시하는 4가지 코드 품질 원칙을 상세히 다룹니다.

### 4대 원칙

| 원칙 | 핵심 | 상세 문서 |
|------|------|-----------|
| **Readability** (가독성) | 한 번에 고려할 맥락 최소화 | [→ readability.md](./readability.md) |
| **Predictability** (예측 가능성) | 이름만으로 동작 예측 가능 | [→ predictability.md](./predictability.md) |
| **Cohesion** (응집도) | 함께 수정되는 코드는 함께 배치 | [→ cohesion.md](./cohesion.md) |
| **Low Coupling** (낮은 결합도) | 변경 시 영향 범위 최소화 | [→ low-coupling.md](./low-coupling.md) |

---

## Quick Reference

### 1. Readability (가독성)

**핵심 철학**: 인간의 인지 능력은 제한적이다. 읽기 쉬운 코드는 동시에 고려해야 할 맥락을 최소화한다.

**주요 패턴**:
- 동시 실행되지 않는 코드 분리
- 복잡한 조건식 명명
- Magic numbers 제거
- 로직 타입별 조직화 지양

**상세**: [readability.md](./readability.md)

---

### 2. Predictability (예측 가능성)

**핵심 철학**: 함수명, 파라미터, 반환값만 보고도 동작을 예측할 수 있어야 한다.

**주요 패턴**:
- 일관된 반환 타입 (discriminated unions)
- 숨겨진 부작용 제거
- 고유한 동작에 고유한 이름
- 단일 책임 원칙

**상세**: [predictability.md](./predictability.md)

---

### 3. Cohesion (응집도)

**핵심 철학**: 함께 수정되는 코드는 함께 배치하여 동기화 실패를 방지한다.

**주요 패턴**:
- Feature-based 조직화 (타입 기반 X)
- Magic numbers의 단일 진실 공급원
- 관련 validation/form 로직 코로케이션
- 테스트 파일 코로케이션

**상세**: [cohesion.md](./cohesion.md)

---

### 4. Low Coupling (낮은 결합도)

**핵심 철학**: 변경 시 영향 범위 (scope of impact)를 최소화한다.

**주요 패턴**:
- 중복이 추상화보다 나은 경우 인정
- Composition over props drilling
- 범위화된 상태 (scoped state)
- Two-Question 추상화 프레임워크

**상세**: [low-coupling.md](./low-coupling.md)

---

## Trade-offs Between Principles

이 4가지 원칙은 **모두 동시에 만족하기 어렵습니다**. 상황에 따라 우선순위를 정해야 합니다.

### 주요 충돌 지점

**Readability ↔ Cohesion**
- 추상화는 응집도를 높이지만 가독성을 떨어뜨릴 수 있음
- 균형: 인지 부하를 실제로 줄이는 추상화만 적용

**Cohesion ↔ Low Coupling**
- 중복을 제거하면 응집도는 높아지지만 결합도도 높아질 수 있음
- 균형: 기능 간 중복은 허용, 기능 내 중복은 제거

**Predictability ↔ Flexibility**
- 예측 가능한 코드는 유연성이 떨어질 수 있음
- 균형: 핵심 비즈니스 로직은 예측 가능성 우선

### 우선순위 결정 가이드

**Cohesion 우선:**
- 변경 리스크가 높은 경우 (결제, 보안)
- 팀원들이 관련 업데이트를 자주 누락하는 경우

**Low Coupling 우선:**
- 다른 팀이 소유한 기능 간 경계
- 코드 진화 속도가 다른 경우

**Readability 우선:**
- 자주 수정되는 코드
- 여러 개발자가 동시에 작업하는 코드

**Predictability 우선:**
- 공개 API, 라이브러리 인터페이스
- 핵심 비즈니스 로직 (결제, 인증, 데이터 무결성)

---

## Anti-Patterns Quick Check

| Anti-Pattern | 위반 원칙 | 해결책 |
|--------------|----------|--------|
| Magic Numbers | Readability, Cohesion | 명명된 상수 사용 |
| Nested Ternaries | Readability | if/else 또는 switch |
| Props Drilling (4+ layers) | Low Coupling | Composition 또는 context |
| God Components | Predictability, Low Coupling | 책임 분리 |
| Inconsistent Return Types | Predictability | Discriminated unions |
| Hidden Side Effects | Predictability | 명시적 함수명 |
| Premature Abstraction | Low Coupling | 패턴 확립 전까지 중복 허용 |
| Type-based Organization | Cohesion | Feature-based 구조 |

---

## Usage in Subagents

이 원칙들은 다음 subagents에서 참조됩니다:

- **refactor**: 코드 품질 개선 및 규칙 준수 체크
- **review**: 코드 리뷰 시 품질 기준 적용
- **implement**: 새로운 기능 구현 시 원칙 적용

각 subagent는 필요에 따라 특정 원칙 파일을 참조합니다:
- `@code-quality/readability`: 가독성 분석
- `@code-quality/predictability`: 예측 가능성 분석
- `@code-quality/cohesion`: 응집도 분석
- `@code-quality/low-coupling`: 결합도 분석

---

## Validation Checklist

코드 작성 또는 리뷰 시 체크리스트:

### Readability
- [ ] Magic numbers가 명명되었는가?
- [ ] 복잡한 조건이 변수로 추출되었는가?
- [ ] 동시 실행되지 않는 코드가 분리되었는가?
- [ ] 로직 타입별 조직화를 피했는가?

### Predictability
- [ ] 반환 타입이 일관적인가?
- [ ] 숨겨진 부작용이 없는가?
- [ ] 함수명이 실제 동작과 일치하는가?
- [ ] 단일 책임을 유지하는가?

### Cohesion
- [ ] 관련 파일이 같은 디렉토리에 있는가?
- [ ] Magic numbers가 단일 진실 공급원을 가지는가?
- [ ] Feature-based 조직화를 따르는가?
- [ ] 테스트 파일이 소스 파일과 함께 있는가?

### Low Coupling
- [ ] Props drilling이 3 layers 이하인가?
- [ ] 불필요한 추상화가 없는가?
- [ ] 상태가 적절히 범위화되었는가?
- [ ] 변경 시 영향 범위가 제한적인가?

---

## References

- [Frontend Fundamentals - Code Quality](https://frontend-fundamentals.com/code-quality/code/)
- [Frontend Fundamentals - Readability](https://frontend-fundamentals.com/code-quality/code/readability/)
- [Frontend Fundamentals - Predictability](https://frontend-fundamentals.com/code-quality/code/predictability/)
- [Frontend Fundamentals - Cohesion](https://frontend-fundamentals.com/code-quality/code/cohesion/)
- [Frontend Fundamentals - Coupling](https://frontend-fundamentals.com/code-quality/code/coupling/)
